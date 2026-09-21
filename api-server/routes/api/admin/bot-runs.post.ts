export default async function handler(event:{req:Request}) {
 const {requireAdmin,adminErrorResponse}=await import("../../../../src/lib/admin-auth.server");
 let actor; try {actor=await requireAdmin(event.req);}catch(e){const r=adminErrorResponse(e);r.headers.set('Cache-Control','private, no-store');return r;}
 try {const {requireLeadOrigin,readLeadBody}=await import("../../../../src/lib/control-leads");
 requireLeadOrigin(event.req);
 const input=await readLeadBody(event.req);
 const {getSql}=await import("../../../../src/lib/db");
 const {runHosted}=await import("../../../../src/lib/hosted-bots");
 return Response.json(await runHosted(await getSql(),input,actor.id),{headers:{"Cache-Control":"private, no-store"}});}catch(e){const {leadErrorResponse}=await import("../../../../src/lib/control-leads");return leadErrorResponse(e);}
}
