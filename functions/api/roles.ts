import { json, requireUser, sheet, type Env } from '../lib';
export async function onRequestGet({request,env}:{request:Request;env:Env}){await requireUser(request,env,'roles.view');return json({roles:await sheet(env,'roles').then(s=>s.rows())})}
