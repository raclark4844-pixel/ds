import type {ComparisonReport,CompetitorRow,CategoryScores} from './report-pdf/report-types.ts';
import {DEFAULT_WEIGHTS} from './comparison.ts';
function host(value:string){try{const u=new URL(value);return /^https?:$/.test(u.protocol)&&!u.username&&!u.password?u.hostname.toLowerCase().replace(/^www\./,''):'';}catch{return '';}}
const rank=(n?:number)=>n&&n>0?n:Infinity;
export function topCompetitors(report:Pick<ComparisonReport,'website'|'competitors'>){
 const own=host(report.website);const seen=new Set<string>();
 return report.competitors.filter(c=>c.source!=='Industry benchmark'&&host(c.website))
 .sort((a,b)=>rank(a.mapsRank)-rank(b.mapsRank)||rank(a.organicRank)-rank(b.organicRank))
 .filter(c=>{const h=host(c.website);if(h===own||h.endsWith('.'+own)||['demoreexteriorsolutions.com','demoretechnologysolutions.com'].includes(h)||seen.has(h))return false;seen.add(h);return true;}).slice(0,2);
}
export const comparisonDimensions:Array<{key:keyof CategoryScores;label:string;solution:string}>=[
 {key:'seo',label:'Search visibility',solution:'Relevant service pages, metadata, internal links and crawlability improvements.'},
 {key:'geo',label:'Local / AI visibility',solution:'Consistent business facts, service-area content and accurate structured data.'},
 {key:'aeo',label:'Answer visibility',solution:'Clear answers and FAQs grounded in the business and its customer questions.'},
 {key:'conversion',label:'Conversions',solution:'Improve calls to action, inquiry forms and booking or purchase handoffs.'},
 {key:'technical',label:'Technical performance',solution:'Prioritize speed, reliability, mobile performance and verified deployment checks.'},
 {key:'ux',label:'User experience',solution:'Simplify navigation, accessibility and the visitor’s primary task.'},
 {key:'trust',label:'Trust signals',solution:'Publish accurate service details, authentic reviews and relevant proof.'},
 {key:'leadgen',label:'Lead generation',solution:'Connect qualification, source tracking, CRM routing and consent-aware follow-up.'},
];
export function comparisonMatrix(report:ComparisonReport){
 const competitors=topCompetitors(report);
 const points=(value:number|undefined,max:number)=>Number.isFinite(value)?`${value} / ${max}`:'Unavailable';
 const competitorPoints=(c:CompetitorRow|undefined,key:keyof CategoryScores,max:number)=>!c||c.evidence==='Estimated'||c.evidence==='Unknown'? 'Unavailable':points(c.categories[key],max);
 return {competitors,rows:comparisonDimensions.map(d=>{const max=report.scoringWeights?.[d.key]??DEFAULT_WEIGHTS[d.key];return {...d,current:points(report.categories[d.key],max),competitorValues:[0,1].map(i=>competitorPoints(competitors[i],d.key,max))};}), note:'Top two available competitors are selected by Google Maps position, then organic position, for the report’s market and query. Customer-supplied sites retain their supplied order when search positions are unavailable; their top-two market status is unverified. Scores describe detected public website capabilities, not rankings, traffic or revenue. Proposed improvements require validation and setup; outcomes are not guaranteed.'};
}
