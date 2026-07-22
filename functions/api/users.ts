import { json, requireUser, sheet, type Env } from '../lib';
export async function onRequestGet({request,env}:{request:Request;env:Env}){await requireUser(request,env,'users.view');return json({users:await sheet(env,'users').then(s=>s.rows())})}
