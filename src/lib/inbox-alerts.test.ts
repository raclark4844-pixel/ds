import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import type {Sql} from './db';
import {queueInboxAlert,deliverInboxAlert,ALERT_TO} from './inbox-alerts.ts';
test('alerts persist, exclude private content, deduplicate and retry identical payloads',async()=>{
 const db=new PGlite();
 const sql:Pick<Sql,'query'>={query:async<T>(q:string,p?:unknown[])=>(await db.query<T>(q,p)).rows};
 try {
  for(const file of ['0006_control_leads.sql','0007_inbox_health.sql','0008_inbox_alerts.sql']) await db.exec(readFileSync(new URL('../../migrations/'+file,import.meta.url),'utf8'));
  assert.equal(await queueInboxAlert(sql,'verified@example.invalid'),null);
  await db.exec(`insert into dts_control_leads(id,site_id,source,source_record_id,request_hash,name,email,phone,phone_key,interest) values('fixture','demore','manual','fixture-1','hash','Private customer','private@example.invalid','','','Sensitive inquiry')`);
  const id=await queueInboxAlert(sql,'verified@example.invalid');
  assert.equal(await queueInboxAlert(sql,'verified@example.invalid'),id);
  assert.equal((await sql.query('select * from dts_inbox_alerts')).length,1);
  let sent=''; let key='';
  const transient:typeof fetch=async(_url,init)=>{sent=String(init?.body);key=(init?.headers as Record<string,string>)['Idempotency-Key'];return new Response('{}',{status:503});};
  assert.equal((await deliverInboxAlert(sql,'fake-key',transient)).status,'retry');
  const payload=JSON.parse(sent);
  assert.deepEqual(payload.to,ALERT_TO);
  assert(!sent.includes('Private customer'));assert(!sent.includes('private@example.invalid'));assert(!sent.includes('Sensitive inquiry'));
  assert(payload.text.includes('Opening this link does not authorize'));
  await sql.query("update dts_inbox_alerts set next_attempt_at=now()-interval '1 minute'");
  const accepted:typeof fetch=async(_url,init)=>{assert.equal(init?.body,sent);assert.equal((init?.headers as Record<string,string>)['Idempotency-Key'],key);return Response.json({id:'provider-test'});};
  assert.equal((await deliverInboxAlert(sql,'fake-key',accepted)).status,'accepted');
  assert.equal((await deliverInboxAlert(sql,'fake-key',accepted)).status,'idle');
  await sql.query("update dts_inbox_alerts set status='pending',created_at=now()-interval '25 hours'");
  assert.equal((await deliverInboxAlert(sql,'fake-key',accepted)).status,'idle');
  assert.equal((await sql.query<{status:string}>('select status from dts_inbox_alerts'))[0].status,'failed');
 } finally {await db.close();}
});
