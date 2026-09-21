import test from 'node:test';
import assert from 'node:assert/strict';
import {applyPriorities} from './personalize.ts';
import {analyzePage,makeReport} from './analyze.ts';
import {resolveIndustry} from './industry.ts';
function fixture() {
 const page=analyzePage({url:'https://example.com',html:'<title>Sample landscaping</title><h1>Landscaping estimates</h1>'});
 return {...makeReport(page,page,'DTS-TEST01',resolveIndustry('Landscaping',[])),conversation:[{role:'user',content:'RAW CHAT SHOULD NEVER PRINT'}]};
}
test('personalization keeps verified findings and removes raw conversation',()=>{
 const source=fixture();
 const output=applyPriorities(source,{priorities:[{id:source.current.checks[0].id,reason:'Prioritize qualified estimates.',action:'Build a service-area estimate intake.'}]});
 assert.deepEqual(output.current,source.current);
 assert.equal(output.tailoredPriorities?.length,1);
 assert.equal('conversation' in output,false);
 assert.equal(source.conversation.length,1);
});
test('irrelevant session can yield no tailored priorities',()=>assert.deepEqual(applyPriorities(fixture(),{priorities:[]}).tailoredPriorities,[]));
test('unrecognized and duplicate capability IDs fail closed',()=>{
 const source=fixture(); const item={id:source.current.checks[0].id,reason:'Goal',action:'Action'};
 assert.throws(()=>applyPriorities(source,{priorities:[{...item,id:'invented'}]}));
 assert.throws(()=>applyPriorities(source,{priorities:[item,item]}));
});
