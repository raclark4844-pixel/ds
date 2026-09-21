import assert from 'node:assert/strict';
import {test} from 'node:test';
import {visitorWebsiteContext,visitorWebsite} from './visitor-website-context.ts';
import {resolveIndustry} from './website-review/industry.ts';
import {industryContext} from './industry-selection.ts';
test('Other uses website evidence rather than suppressing detection',()=>{
 const p=resolveIndustry('Other',[{url:'https://example.com',html:'<h1>Dental clinic</h1><p>Patient appointments with a dentist</p>'}]);
 assert.equal(p.id,'healthcare'); assert.equal(p.source,'Suggested from website');
});
test('multiple industries retain both sets of useful capabilities',()=>{
 const p=resolveIndustry('Contractors | Landscaping',[]);
 assert.equal(p.id,'multiple'); assert.ok(p.capabilities.some(c=>c.id==='estimate'));assert.ok(p.capabilities.some(c=>c.id==='season'));
 assert.match(industryContext(['Other']),/supplied website and conversation/);
});
test('website field and explicit chat URL inform chat without a PDF',async()=>{
 assert.equal(visitorWebsite('https://old.example','Review https://new.example/.'),'https://new.example/');
 const text=await visitorWebsiteContext('https://example.com','I sell courses',async()=>({url:'https://example.com',html:'<h1>Online learning</h1><script>secret()</script>'}));
 assert.match(text,/Online learning/);assert.match(text,/untrusted/);assert.doesNotMatch(text,/secret/);
});
test('failed website reading is disclosed without fabricated findings',async()=>{
 const text=await visitorWebsiteContext('http://127.0.0.1','',async()=>{throw new Error('blocked')});
 assert.match(text,/could not be read/);
 assert.equal(await visitorWebsiteContext('','What can you build?'),'');
});
