import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import type {Sql} from './db';
import {routeNewLeads} from './automatic-lead-routing.ts';
test('routing assigns both sites once, preserves human decisions and audits atomically',async()=>{
 const db=new PGlite();
 const sql:Pick<Sql,'query'>={query:async<T>(q:string,p?:unknown[])=>(await db.query<T>(q,p)).rows};
 try {
  await db.exec(readFileSync(new URL('../../migrations/0006_control_leads.sql',import.meta.url),'utf8'));
  for (const [id,site,stage,version] of [['one','demore','new',1],['two','demore-technology','new',1],['human','demore','new',2],['contacted','demore','contacted',1]]) {
   await sql.query(`insert into dts_control_leads(id,site_id,source,source_record_id,request_hash,name,email,phone,phone_key,interest,stage,version) values($1,$2,'manual',$1,'hash','Fixture','fixture@example.invalid','','','',$3,$4)`,[id,site,stage,version]);
  }
  const results=await Promise.all([routeNewLeads(sql),routeNewLeads(sql)]);
  assert.equal(results.reduce((sum,r)=>sum+r.assigned,0),2);
  assert.equal((await routeNewLeads(sql)).assigned,0);
  const rows=await sql.query<{id:string;owner:string;stage:string}>('select id,owner,stage from dts_control_leads');
  for(const row of rows) assert.equal(row.owner,['one','two'].includes(row.id)?'ryan':'unassigned');
  assert.equal(rows.find(r=>r.id==='contacted')?.stage,'contacted');
  const events=await sql.query<{actor:string;details:{rule:string}}>('select actor,details from dts_control_lead_events');
  assert.equal(events.length,2); assert(events.every(e=>e.actor==='bot:crm-routing-v1'&&e.details.rule==='first-assignment-v1'));
 } finally {await db.close();}
});
