import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import type {Sql} from './db';
import {triageQueue,runAutomation,automaticRunId} from './workspace-automation.ts';
import {retainBackgroundWork} from './background-work.ts';
test('triage captures and routes inquiries once, preserves manual state and avoids duplicate scheduler work',async()=>{
 const db=new PGlite();const sql:Pick<Sql,'query'>={query:async<T>(q:string,p?:unknown[])=>(await db.query<T>(q,p)).rows};
 const oldOpen=process.env.OPENAI_API_KEY;delete process.env.OPENAI_API_KEY;
 try{
  for(const name of ['0002_comparison_admin','0003_comparison_handoff','0006_control_leads','0007_inbox_health','0011_workspace_automation'])await db.exec(readFileSync(new URL('../../migrations/'+name+'.sql',import.meta.url),'utf8'));
  const report={website:'https://example.com',contactName:'Sample owner',contactEmail:'sample@example.invalid',recommendations:[{action:'Improve quote capture'}],competitors:[]};
  await sql.query(`insert into comparison_reports(id,token_hash,report,internal_notes) values('DTS-TEST0001','hash',$1::jsonb,'Human note')`,[JSON.stringify(report)]);
  assert.equal((await triageQueue(sql)).reviewed,1);assert.equal((await triageQueue(sql)).reviewed,0);
  const getCount=async(table:string)=>(await sql.query<{n:number}>(`select count(*)::int as n from ${table}`))[0].n;
  assert.equal(await getCount('dts_control_leads'),1);
  let requests=0;const fetcher=(async()=>{requests++;return new Response('',{status:200});}) as typeof fetch;
  const date=new Date('2026-09-21T20:00:00Z');await runAutomation(sql,fetcher,date);await runAutomation(sql,fetcher,date);
  assert.equal(requests,2);assert.equal(await getCount('dts_automation_jobs'),3);
  const lead=(await sql.query<{owner:string}>('select owner from dts_control_leads'))[0];assert.equal(lead.owner,'ryan');
  const saved=(await sql.query<{internal_notes:string;admin_status:string}>('select internal_notes,admin_status from comparison_reports'))[0];assert.equal(saved.internal_notes,'Human note');assert.equal(saved.admin_status,'new');
  await sql.query("update comparison_reports set pdf_status='failed'");await triageQueue(sql);
  const triage=(await sql.query<{priority:string;draft:string}>('select priority,draft from dts_comparison_triage'))[0];assert.equal(triage.priority,'needs_attention');assert.match(triage.draft,/Draft only/);assert.equal(await getCount('dts_control_leads'),1);
  await sql.query('update dts_automation_settings set enabled=false');assert.deepEqual(await runAutomation(sql,fetcher,new Date('2026-09-22')),{paused:true});assert.equal(requests,2);
 }finally{if(oldOpen===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=oldOpen;await db.close();}
});
test('stable paid-task identity prevents retry charges for one schedule slot',()=>{assert.equal(automaticRunId('same'),automaticRunId('same'));assert.notEqual(automaticRunId('same'),automaticRunId('other'));assert.match(automaticRunId('same'),/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-8[\da-f]{3}-[\da-f]{12}$/);});
test('background fallback awaits work when no Vercel request context exists',async()=>{let done=false;await retainBackgroundWork(Promise.resolve().then(()=>{done=true}));assert.equal(done,true);});
