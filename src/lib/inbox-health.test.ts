import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { saveHealth, readHealth } from './inbox-health.ts';
import type { Sql } from './db';
test('health rejects private data and preserves newest report', async () => {
 const db = new PGlite();
 const sql: Pick<Sql,'query'> = {query: async <T>(q:string,p?:unknown[]) => (await db.query<T>(q,p)).rows};
 try {
  await db.exec(readFileSync(new URL('../../migrations/0007_inbox_health.sql',import.meta.url),'utf8'));
  assert.equal((await readHealth(sql)).health,null);
  const report={observedAt:'2026-09-21T18:00:00.000Z',lastRunAt:'2026-09-21T18:00:00.000Z',enabled:true,runFailed:false,pending:0,retry:2,failed:1};
  await saveHealth(sql,report);
  await saveHealth(sql,{...report,observedAt:'2026-09-21T17:00:00.000Z',retry:0});
  assert.equal(((await readHealth(sql)).health as any).report.retry,2);
  await assert.rejects(saveHealth(sql,{...report,email:'private@example.invalid'}));
  await assert.rejects(saveHealth(sql,{...report,siteId:'demore-technology'}));
  await assert.rejects(saveHealth(sql,{...report,failed:-1}));
 } finally {await db.close();}
});
