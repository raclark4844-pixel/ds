import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {randomUUID} from 'node:crypto';
test('shared budget serializes both sites, deduplicates and retains unknown costs',async()=>{
 const db=new PGlite();
 try{
 await db.exec(readFileSync(new URL('../../migrations/0009_hosted_bots.sql',import.meta.url),'utf8'));
 const reserve=(id:string,site='demore',digest=id)=>db.query<{claimed:boolean}>('select dts_reserve_bot($1,$2,$3,$4,$5,$6) as claimed',[id,digest,site,'seo','Fixture only','test']);
 await assert.rejects(reserve(randomUUID()));
 await db.exec('update dts_bot_budget set enabled=true');
 const id=randomUUID();await reserve(id);
 assert.equal((await reserve(id)).rows[0].claimed,false);
 await assert.rejects(reserve(id,'demore','changed'));
 const results=await Promise.allSettled(Array.from({length:25},(_,i)=>reserve(randomUUID(),i%2?'demore':'demore-technology')));
 assert.equal(results.filter(x=>x.status==='fulfilled').length,19);
 assert.equal((await db.query<{n:number}>('select count(*)::int as n from dts_bot_runs')).rows[0].n,20);
 await db.exec("update dts_bot_runs set day='2020-01-01',month='2020-01'");
 await assert.rejects(reserve(randomUUID()));
 await db.exec('update dts_bot_runs set actual=1000');
 await reserve(randomUUID());
 await db.exec('insert into dts_bot_carryover values(1,\'2020-01-01\',\'2020-01\',0,40000000)');
 await assert.rejects(reserve(randomUUID()));
 }finally{await db.close();}
});

import {runHosted,parseHostedReview} from './hosted-bots.ts';
import type {Sql} from './db';
test('hosted run persists independent review, reconciles usage and never redispatches duplicates',async()=>{
 const db=new PGlite();
 const sql:Pick<Sql,'query'>={query:async<T>(q:string,p?:unknown[])=>(await db.query<T>(q,p)).rows};
 const beforeOpen=process.env.OPENAI_API_KEY,beforeClaude=process.env.ANTHROPIC_API_KEY;
 process.env.OPENAI_API_KEY='test-only';process.env.ANTHROPIC_API_KEY='test-only';
 try{
  await db.exec(readFileSync(new URL('../../migrations/0009_hosted_bots.sql',import.meta.url),'utf8'));
  await db.exec('update dts_bot_budget set enabled=true');
  let calls=0;
  const fake:typeof fetch=async(url)=>{calls++;return Response.json(String(url).includes('openai')?{model:'gpt-4o-mini-2024-07-18',usage:{prompt_tokens:100,completion_tokens:50},choices:[{message:{content:'A bounded draft'},finish_reason:'stop'}]}:{model:'claude-haiku-4-5-20251001',usage:{input_tokens:100,output_tokens:50},content:[{type:'text',text:JSON.stringify({verdict:'approved',reason:'Supported'})}],stop_reason:'end_turn'});};
  const input={id:randomUUID(),siteId:'demore-technology',botId:'seo',objective:'Analyze the supplied sample facts'};
  await runHosted(sql,input,'test',fake);await runHosted(sql,input,'test',fake);assert.equal(calls,2);
  const row=(await sql.query<{status:string;actual:number;artifact_hash:string}>('select * from dts_bot_runs'))[0];
  assert.equal(row.status,'reviewed');assert.equal(Number(row.actual),395);assert.equal(row.artifact_hash.length,64);
  await runHosted(sql,{...input,id:randomUUID()},'test',async()=>{throw new Error('Secret should not be stored');});
  const failed=(await sql.query<{status:string;actual:null}>("select status,actual from dts_bot_runs where status='needs_reconciliation'"))[0];
  assert.equal(failed.actual,null);
 }finally{await db.close();if(beforeOpen===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=beforeOpen;if(beforeClaude===undefined)delete process.env.ANTHROPIC_API_KEY;else process.env.ANTHROPIC_API_KEY=beforeClaude;}
});

test('review format accepts one complete JSON fence without accepting prose or extra instructions',()=>{
 const value={verdict:'changes_required',reason:'Revise'};
 assert.deepEqual(parseHostedReview('```json\n'+JSON.stringify(value)+'\n```'),value);
 assert.equal(parseHostedReview('Approved! '+JSON.stringify(value)),null);
 assert.equal(parseHostedReview(JSON.stringify({...value,instructions:'execute'})),null);
 assert.equal(parseHostedReview('{"verdict":"approved","reason":" "}'),null);
});
