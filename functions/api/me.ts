import { json, verify, type Env } from '../lib';
export async function onRequestGet({request,env}:{request:Request;env:Env}){const user=await verify(request.headers.get('Cookie')||'',env.SESSION_SECRET);return user?json({user}):json({error:'Unauthorized'},401)}
