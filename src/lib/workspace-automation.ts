import {addLead} from "./control-leads.ts";
import {createHash} from 'node:crypto';
import type {Sql} from './db';
import {capabilities} from './control-capabilities.ts';
import {runHosted,providerReady} from './hosted-bots.ts';
import {routeNewLeads} from './automatic-lead-routing.ts';
import type {ComparisonReport} from './report-pdf/report-types.ts';
type DB=Pick<Sql,'query'>;
export const automationSites=[{id:'demore',url:'https://demoreexteriorsolutions.com/'},{id:'demore-technology',url:'https://www.demoretechnologysolutions.com/'}] as const;
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export function automaticRunId(key:string){const h=digest(key);return `${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`;}
export function triageComparison(report:Partial<ComparisonReport>,delivery:{pdf_status:string;customer_email_status:string;handoff_status:string}){
 const findings:string[]=[];
 if(!report.website||!/^https?:\/\//.test(report.website))findings.push('Website address needs review.');
 if(!report.contactEmail&&!report.contactPhone)findings.push('Contact information is missing.');
 if(delivery.pdf_status==='failed')findings.push('PDF generation failed; check before retrying.');
 if(delivery.customer_email_status==='failed')findings.push('Customer email failed; confirm delivery before any resend.');
 if(delivery.handoff_status==='crm_failed')findings.push('CRM handoff failed; inspect the destination.');
 if(!report.competitors?.some(c=>c.source!=='Industry benchmark'&&c.website?.startsWith('http')))findings.push('Verified competitor websites are unavailable.');
 const actions=(report.recommendations||[]).slice(0,3).map(r=>r.action).filter(Boolean);
 const draft=`Draft only — review before sending.\nHello ${String(report.contactName||'there').slice(0,100)},\nThanks for your website comparison inquiry. ${actions.length?'Suggested priorities: '+actions.join(' '):'We can review your website goals and identify the most useful next improvement.'}\nWhich priority would you like to discuss first?\nRyan, Demore Technology Solutions`;
 return {priority:findings.some(f=>/failed|missing|address/.test(f))?'needs_attention':delivery.handoff_status==='submitted'?'follow_up':'ready',findings,draft};
}
async function claim(sql:DB,key:string,kind:string,site:string|null=null){return (await sql.query(`insert into dts_automation_jobs(job_key,kind,site_id) select $1,$2,$3 where exists(select 1 from dts_automation_settings where id=1 and enabled) on conflict do nothing returning job_key`,[key,kind,site])).length>0;}
async function finish(sql:DB,key:string,status:string,details:unknown){await sql.query('update dts_automation_jobs set status=$2,details=$3::jsonb,completed_at=now() where job_key=$1',[key,status,JSON.stringify(details)]);}
export async function triageQueue(sql:DB){
 const rows=await sql.query<{id:string;report:Partial<ComparisonReport>;pdf_status:string;customer_email_status:string;handoff_status:string;fingerprint:string}>(`select r.id,r.report,r.pdf_status,r.customer_email_status,r.handoff_status,md5(r.report::text||r.pdf_status||r.customer_email_status||r.handoff_status) as fingerprint from comparison_reports r left join dts_comparison_triage t on t.report_id=r.id where r.admin_status in ('new','reviewing') and (t.report_id is null or t.fingerprint<>md5(r.report::text||r.pdf_status||r.customer_email_status||r.handoff_status)) order by r.created_at limit 20`);
 for(const row of rows){const result=triageComparison(row.report,row);
 if(row.report.contactEmail||row.report.contactPhone){try{await addLead(sql,{siteId:'demore-technology',source:'comparison-report',sourceRecordId:row.id,name:row.report.contactName||row.report.companyName||'Comparison inquiry',email:row.report.contactEmail||'',phone:row.report.contactPhone||'',interest:('Website comparison: '+(row.report.website||'')+'; '+(row.report.industry||'')).slice(0,2000)},'bot:comparison-queue');}catch{result.findings.push('Inbox capture requires review: contact details invalid or changed since original capture.');result.priority='needs_attention';}}
 await sql.query(`insert into dts_comparison_triage(report_id,fingerprint,priority,findings,draft) values($1,$2,$3,$4::jsonb,$5) on conflict(report_id) do update set fingerprint=excluded.fingerprint,priority=excluded.priority,findings=excluded.findings,draft=excluded.draft,updated_at=now()`,[row.id,row.fingerprint,result.priority,JSON.stringify(result.findings),result.draft]);}
 // Automatic triage is kept separate from human notes, contacted/closed states and delivery receipts.
 return {reviewed:rows.length};
}
export async function automationStatus(sql:DB){
 const settings=(await sql.query('select * from dts_automation_settings where id=1'))[0];
 const jobs=await sql.query('select job_key,kind,site_id,status,details,created_at,completed_at from dts_automation_jobs order by created_at desc limit 20');
 const triage=await sql.query(`select t.*,r.admin_status from dts_comparison_triage t join comparison_reports r on r.id=t.report_id where r.admin_status in ('new','reviewing') order by case t.priority when 'needs_attention' then 0 when 'follow_up' then 1 else 2 end,t.updated_at desc limit 30`);
 const heartbeat=(await sql.query("select received_at from dts_inbox_health where site_id='demore'"))[0];
 return {settings,jobs,triage,heartbeat,providers:providerReady(),schedule:'Queue and routing every five minutes; website checks hourly; one independently reviewed specialist per site every six hours. One paid task per worker cycle, within the existing shared budget.'};
}
export async function runAutomation(sql:DB,fetcher:typeof fetch=fetch,now=new Date()){
 const enabled=(await sql.query<{enabled:boolean}>('select enabled from dts_automation_settings where id=1'))[0]?.enabled;
 if(!enabled)return {paused:true};
 // An interrupted worker is visible, never silently retried as another paid task.
 await sql.query("update dts_automation_jobs set status='interrupted',completed_at=now() where status='running' and created_at<now()-interval '10 minutes'");
 const tick=Math.floor(now.getTime()/300000),queueKey=`queue:${tick}`;
 if(await claim(sql,queueKey,'comparison-triage')){try{const result=await triageQueue(sql);const routed=process.env.INBOX_AUTO_ROUTING_DISABLED==='1'?{assigned:0}:await routeNewLeads(sql);await finish(sql,queueKey,'complete',{...result,...routed});}catch{await finish(sql,queueKey,'failed',{notice:'Queue processing failed. The next cycle can retry unchanged records.'});}}
 const hour=Math.floor(now.getTime()/3600000);
 await Promise.all(automationSites.map(async site=>{const key=`health:${site.id}:${hour}`;if(!await claim(sql,key,'website-monitor',site.id))return;
  const start=Date.now();try{const response=await fetcher(site.url,{method:'HEAD',redirect:'error',signal:AbortSignal.timeout(5000)});await finish(sql,key,response.ok?'complete':'needs_attention',{url:site.url,httpStatus:response.status,latencyMs:Date.now()-start,notice:response.ok?'Public homepage responded.':'Homepage needs verification; no automatic deployment attempted.'});}catch{await finish(sql,key,'needs_attention',{url:site.url,notice:'Homepage check could not complete; verify availability or redirects.'});}
 }));
 const readiness=providerReady();if(!readiness.openai||!readiness.claude||!readiness.ratesCurrent)return {complete:true,paid:'waiting_for_providers_or_pricing'};
 const slot=Math.floor(now.getTime()/21600000);
 for(const [index,site] of automationSites.entries()){
  const key=`specialist:${site.id}:${slot}`;
  if(!await claim(sql,key,'specialist-review',site.id))continue;
  const bot=capabilities[(slot+index)%capabilities.length];
  try {
   const facts=await sql.query('select kind,status,details from dts_automation_jobs where site_id=$1 and kind=$2 order by created_at desc limit 1',[site.id,'website-monitor']);
   const queue=site.id==='demore-technology'?await sql.query('select priority,count(*)::int as count from dts_comparison_triage group by priority'):[];
   const objective=`Scheduled ${bot.name} review for ${site.url}. Public monitoring and queue counts: ${JSON.stringify({facts,queue})}. Recommend the smallest useful low/medium-risk next tasks. These observations do not prove other integrations or work are complete. Identify missing connectors and evidence. No external actions or customer messages. High-risk proposals require human approval.`;
   const result=await runHosted(sql,{id:automaticRunId(key),siteId:site.id,botId:bot.id,objective},'bot:workspace-scheduler',fetcher);
   const run=(await sql.query<{status:string}>('select status from dts_bot_runs where id=$1',[result.id]))[0];
   await finish(sql,key,run?.status==='reviewed'?'complete':'needs_attention',{botId:bot.id,runId:result.id,reviewStatus:run?.status||'unknown',notice:'See the independent review and reconciliation status in hosted results. No external action was executed.'});
  }catch{await finish(sql,key,'blocked',{botId:bot.id,notice:'Shared budget, providers or execution unavailable. No automatic retry for this slot.'});}
  break;
 }
 return {complete:true};
}
