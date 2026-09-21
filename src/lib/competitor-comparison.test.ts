import {test} from 'node:test';
import assert from 'node:assert/strict';
import {topCompetitors,comparisonMatrix} from './competitor-comparison.ts';
import type {ComparisonReport,CompetitorRow} from './report-pdf/report-types.ts';
const cats={seo:10,geo:8,aeo:5,conversion:9,technical:8,ux:5,trust:4,leadgen:2};
const row=(website:string,mapsRank?:number,evidence:CompetitorRow['evidence']='Publicly detected'):CompetitorRow=>({name:website,website,mapsRank,evidence,total:51,categories:cats,note:'Fixture'});
test('selects two ranked distinct external websites without benchmarks or own site',()=>{
 const got=topCompetitors({website:'https://own.example',competitors:[row('https://own.example',1),row('benchmark'),row('https://third.example',3),row('https://first.example',1),row('https://www.first.example',1),row('https://second.example',2)]});
 assert.deepEqual(got.map(c=>c.mapsRank),[1,2]);
});
test('missing or failed competitors remain unavailable and proposals are text',()=>{
 const report={website:'https://own.example',competitors:[row('https://failed.example',1,'Estimated')],categories:cats} as ComparisonReport;
 const matrix=comparisonMatrix(report);assert.deepEqual(matrix.rows[0].competitorValues,['Unavailable','Unavailable']);assert.match(matrix.rows[0].solution,/service pages/);
});
test('excludes internal references and unsafe website links',()=>{
 assert.equal(topCompetitors({website:'https://own.example',competitors:[row('javascript:alert(1)'),row('https://user:pass@example.com'),row('https://demoreexteriorsolutions.com')]}).length,0);
});
import {websiteMarket} from './website-review/competitors.server.ts';
test('uses a published structured address and does not guess a market',()=>{
 assert.equal(websiteMarket('<h1>Serving everywhere</h1>'),'');
 assert.equal(websiteMarket('<script type="application/ld+json">{"@graph":[{"address":{"addressLocality":"Mentor","addressRegion":"OH"}}]}</script>'),'Mentor, OH');
 assert.equal(websiteMarket('<script type="application/ld+json">invalid</script>'),'');
});
