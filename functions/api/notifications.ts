import { json, requireUser, sheet, type Env } from '../lib';
export async function onRequestGet({request,env}:{request:Request;env:Env}){const user=await requireUser(request,env);const rows=await sheet(env,'notifications').then(s=>s.rows());return json({notifications:rows.filter((n:any)=>n.user_id===user.id)})}
