export default async function handler(event:{req:Request}){
 const {requireAdmin,adminErrorResponse}=await import('../../../../src/lib/admin-auth.server');
 try{await requireAdmin(event.req);const {getSql}=await import('../../../../src/lib/db');const {automationStatus}=await import('../../../../src/lib/workspace-automation');return Response.json(await automationStatus(await getSql()),{headers:{'Cache-Control':'private, no-store'}});}catch(e){return adminErrorResponse(e);}
}
