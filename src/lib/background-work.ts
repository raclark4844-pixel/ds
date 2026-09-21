/** Vercel's request-context bridge, as used by @vercel/functions waitUntil.
 * https://github.com/vercel/vercel/blob/main/packages/functions/src/get-context.ts
 * Await synchronously when no lifecycle extension is available (e.g. local tests).
 */
export async function retainBackgroundWork(task:Promise<unknown>){
 const runtime=globalThis as typeof globalThis & {[key:symbol]:{get?:()=>{waitUntil?:(p:Promise<unknown>)=>void}}|undefined};
 const context=runtime[Symbol.for('@vercel/request-context')]?.get?.();
 if(context?.waitUntil){context.waitUntil(task);return;}
 await task;
}
