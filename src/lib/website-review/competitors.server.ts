import {discoverCompetitors} from '../dataforseo.server.ts';
import {fetchPublicPage} from './fetch-public.ts';
import {analyzePage} from './analyze.ts';
import type {ReviewIndustry,ReviewPage} from './types.ts';
export function websiteMarket(html:string){
 for(const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
  try{const stack:unknown[]=[JSON.parse(match[1])];let count=0;while(stack.length&&count++<100){const item=stack.pop();if(!item||typeof item!=='object')continue;if(Array.isArray(item)){stack.push(...item);continue;}const o=item as Record<string,unknown>;const a=o.address as Record<string,unknown>|undefined;if(a&&typeof a.addressLocality==='string')return [a.addressLocality,typeof a.addressRegion==='string'?a.addressRegion:''].filter(Boolean).join(', ').slice(0,150);if(o['@graph'])stack.push(o['@graph']);}}catch{/* Ignore invalid structured data. */}
 }
 return '';
}
export async function reviewCompetitors(current:ReviewPage,industry:ReviewIndustry,market:string){
 if(!market) return {pages:[] as ReviewPage[],note:'Competitor discovery needs a target city/region or a published business address. Enter the optional market to compare two relevant websites.'};
 if(industry.id==='general')return {pages:[] as ReviewPage[],note:'Confirm your business industry before selecting relevant competitors for this market.'};
 const discovery=await discoverCompetitors({website:current.url,industry:industry.name,market});
 const selected=discovery.competitors.filter(c=>!/(^|\.)demore(?:exterior|technology)solutions\.com$/i.test(new URL(c.website).hostname)).slice(0,2);
 const pages=await Promise.all(selected.map(async c=>{try{const page=analyzePage(await fetchPublicPage(c.website,AbortSignal.timeout(10000))); page.checks=page.checks.map(check=>["robots","sitemap","llms"].includes(check.id)?{...check,status:"Unavailable",evidence:"This competitor scan checks its public homepage only; auxiliary files were not fetched."}:check);return {...page,title:c.name};}catch{return {url:c.website,title:c.name,checks:[],unavailable:true};}}));
 return {pages,note:`${discovery.note} Market: ${market}. Selection uses Google Maps position, then organic position. These are public-page signals, not a guarantee of market leadership.`};
}
