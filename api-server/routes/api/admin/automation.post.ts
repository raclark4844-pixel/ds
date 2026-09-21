import {z} from 'zod';
export default async function handler(event:{req:Request;waitUntil?:(promise:Promise<unknown>)=>void}){
 const {requireAdmin,adminErrorResponse}=await import('../../../../src/lib/admin-auth.server');
 try{const actor=await requireAdmin(event.req);const {requireLeadOrigin,readLeadBody}=await import('../../../../src/lib/control-leads');requireLeadOrigin(event.req);
 const {action}=z.object({action:z.enum(['pause','resume','run'])}).strict().parse(await readLeadBody(event.req));
 const {getSql}=await import('../../../../src/lib/db');const sql=await getSql();
 if(action!=='run')await sql.query('update dts_automation_settings set enabled=$1,updated_at=now(),updated_by=$2 where id=1',[action==='resume',actor.id]);
 if(action==='run'){const {runAutomation}=await import('../../../../src/lib/workspace-automation');const task=runAutomation(sql).catch(()=>console.error('[automation] Worker failed'));const {retainBackgroundWork}=await import("../../../../src/lib/background-work");await retainBackgroundWork(task);}
 return Response.json({ok:true,notice:action==='run'?'Due work queued; refresh shortly. Running the worker again does not duplicate scheduled work.':action==='pause'?'Automation paused. Work already in progress may finish.':'Automation resumed.'},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return adminErrorResponse(e);}
}
