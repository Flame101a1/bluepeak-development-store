// This service has no login page. Only CFX-verified owner sessions may write.
export const OWNER_ID = 8168011;
const CFX = 'https://forum.cfx.re';
const encoder = new TextEncoder();
const tokenPattern = /^[a-f0-9]{64}$/;
const namePattern = /^[a-zA-Z0-9_.-]{1,128}$/;
const packagePattern = /^[1-9][0-9]{0,15}$/;
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {'Content-Type':'application/json', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}});
const hash = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
const randomToken = () => [...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');
async function body(request) {
 if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') throw new Error('Invalid request');
 const text = await request.text();
 if (text.length > 2048) throw new Error('Invalid request');
 return JSON.parse(text);
}
async function ownerSession(request, env, now) {
 const token = request.headers.get('Authorization')?.replace(/^Bearer /,'');
 if (!tokenPattern.test(token || '')) return null;
 const session = await env.DATA.get('session:'+await hash(token),'json');
 return session?.cfxId === OWNER_ID && session.expiresAt > now ? session : null;
}
export async function handle(request, env, {fetcher=fetch, now=Date.now()} = {}) {
 const origin = request.headers.get('Origin');
 const allowed = origin === env.STORE_ORIGIN;
 const url = new URL(request.url);
 let response;
 try {
  if (request.method === 'OPTIONS') response = allowed ? new Response(null,{status:204}) : json({error:'Forbidden'},403);
  else if (url.pathname === '/mappings' && request.method === 'GET') {
   const mappings = await env.DATA.get('mappings','json') || {};
   response = json({mappings});
   response.headers.set('Cache-Control','public, max-age=60');
  } else if (!allowed) response = json({error:'Forbidden'},403);
  else if (url.pathname === '/session' && request.method === 'POST') {
   const data = await body(request);
   if (typeof data.apiKey !== 'string' || !/^[a-zA-Z0-9_-]{20,256}$/.test(data.apiKey)) return cors(json({error:'CFX verification failed'},401),origin,allowed);
   // A basket identifier, username or claimed CFX ID is never authentication.
   // CFX itself identifies the holder of this short-lived, session_info-only key.
   let identity;
   try {
    const result = await fetcher(CFX+'/session/current.json',{headers:{'User-Api-Key':data.apiKey,Accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(10000)});
    if (result.ok) identity = (await result.json()).current_user;
   } finally {
    // Do not retain access to the owner's forum account after checking identity.
    await fetcher(CFX+'/user-api-key/revoke',{method:'POST',headers:{'User-Api-Key':data.apiKey},redirect:'manual',signal:AbortSignal.timeout(10000)}).catch(()=>{});
   }
   if (!Number.isSafeInteger(identity?.id) || identity.id !== OWNER_ID) response = json({error:'This account is not authorized'},403);
   else {
    const token = randomToken(), expiresAt = now+21600000;
    await env.DATA.put('session:'+await hash(token),JSON.stringify({cfxId:OWNER_ID,expiresAt}),{expirationTtl:21600});
    response = json({token,expiresAt,cfxId:'fivem:'+OWNER_ID});
   }
  } else {
   const session = await ownerSession(request,env,now);
   if (!session) response = json({error:'Owner verification required'},401);
   else if (url.pathname === '/session' && request.method === 'GET') response = json({cfxId:'fivem:'+OWNER_ID,expiresAt:session.expiresAt});
   else if (url.pathname === '/session' && request.method === 'DELETE') {
    await env.DATA.delete('session:'+await hash(request.headers.get('Authorization').slice(7)));
    response = json({ok:true});
   } else if (url.pathname.startsWith('/mappings/') && ['PUT','DELETE'].includes(request.method)) {
    const id = url.pathname.slice('/mappings/'.length);
    if (!packagePattern.test(id)) throw new Error('Invalid resource');
    const name = request.method === 'PUT' ? (await body(request)).name : '';
    if (request.method === 'PUT' && (typeof name !== 'string' || !namePattern.test(name))) throw new Error('Use the exact resource folder name: letters, numbers, underscores, dots or hyphens (128 characters maximum).');
    const mappings = await env.DATA.get('mappings','json') || {};
    if (name) mappings[id] = name; else delete mappings[id];
    if (Object.keys(mappings).length > 1000) throw new Error('Tracking-name limit reached');
    await env.DATA.put('mappings',JSON.stringify(mappings));
    response = json({id,name});
   } else response = json({error:'Not found'},404);
  }
 } catch (error) {
  response = json({error:error.message?.startsWith('Use the exact')?error.message:'The request could not be completed. Please try again.'},400);
 }
 return cors(response,origin,allowed);
}
function cors(response,origin,allowed) {
 if (allowed) {
  response.headers.set('Access-Control-Allow-Origin',origin);
  response.headers.set('Access-Control-Allow-Methods','GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers','Content-Type, Authorization');
  response.headers.set('Vary','Origin');
 }
 return response;
}
export default {fetch:handle};
