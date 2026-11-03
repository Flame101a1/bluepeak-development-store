import {escapeHTML as e} from './core.mjs';
export const OWNER_CFX='fivem:8168011';
const namePattern=/^[a-zA-Z0-9_.-]{1,128}$/;
const tokenPattern=/^[a-f0-9]{64}$/;
const sessionKey='bluepeak:tracking-owner';
const challengeKey='bluepeak:cfx-proof';
export function isOwnerBasket(basket){return basket?.username_id===8168011||basket?.username_id==='8168011'||basket?.username_id===OWNER_CFX}
const encode=bytes=>btoa(String.fromCharCode(...new Uint8Array(bytes)));
const decode=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
export function safeMappings(value){const result={};if(!value||typeof value!=='object'||Array.isArray(value))return result;for(const [id,name] of Object.entries(value).slice(0,1000)){if(/^[1-9][0-9]{0,15}$/.test(id)&&typeof name==='string'&&namePattern.test(name))result[id]=name}return result}
export function trackingEditorHTML(product,owner,mappings){
 if(!owner)return '';
 const id=String(product?.id||'');if(!/^[1-9][0-9]{0,15}$/.test(id))return '';
 return '<form class="tracking-editor" data-product-id="'+e(id)+'"><label for="tracking-name">5Metrics resource name <span>Only visible to you</span></label><div class="tracking-editor-controls"><input id="tracking-name" name="tracking-name" value="'+e(mappings[id]||'')+'" placeholder="e.g. bluepeak-inventory" maxlength="128" pattern="[a-zA-Z0-9_.\\-]{1,128}" autocomplete="off" spellcheck="false"><button class="button secondary" type="submit">Save</button></div><p>Use the exact resource folder name reported by 5Metrics. Leave blank to use automatic matching. Usage reports update about every 30 minutes.</p></form>';
}
export class OwnerTracking {
 constructor(endpoint,{storage,fetcher=(...args)=>fetch(...args)}={}){
  this.endpoint='';try{const url=new URL(endpoint),loopback=['localhost','127.0.0.1'];const local=url.protocol==='http:'&&loopback.includes(url.hostname)&&loopback.includes(globalThis.location?.hostname);if((url.protocol==='https:'||local)&&!url.username&&!url.password&&!url.search&&!url.hash)this.endpoint=url.href.replace(/\/$/,'')}catch{}
  if(storage===undefined)try{storage=globalThis.sessionStorage}catch{}
  this.storage=storage;this.fetcher=fetcher;this.session=null;this.verified=false;this.mappings={};this.lastSavedAt=0;
  try{const data=JSON.parse(storage.getItem(sessionKey)||'null');if(data?.cfxId===OWNER_CFX&&tokenPattern.test(data.token)&&data.expiresAt>Date.now())this.session=data}catch{}
 }
 async request(path,{method='GET',body,authenticated=false}={}){
  if(!this.endpoint)throw Error('Tracking settings are not connected.');
  const response=await this.fetcher(this.endpoint+path,{method,credentials:'omit',cache:'no-store',headers:{...(body?{'Content-Type':'application/json'}:{}),...(authenticated&&this.session?{Authorization:'Bearer '+this.session.token}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
  const data=await response.json();if(!response.ok){if(response.status===401&&authenticated)this.clear();throw Error(data.error||'Tracking settings are unavailable.')}return data;
 }
 clear(){this.session=null;this.verified=false;try{this.storage.removeItem(sessionKey)}catch{}}
 async load(basket){
  this.verified=false;if(!this.endpoint)return;
  if(Date.now()-this.lastSavedAt>=60000)try{this.mappings=safeMappings((await this.request('/mappings')).mappings)}catch{}
  if(!isOwnerBasket(basket)||!this.session)return;
  try{const user=await this.request('/session',{authenticated:true});this.verified=user.cfxId===OWNER_CFX&&user.expiresAt>Date.now()}catch{this.clear()}
 }
 canEdit(basket){return this.verified&&this.session?.expiresAt>Date.now()&&isOwnerBasket(basket)}
 async save(id,name,basket){
  if(!this.canEdit(basket))throw Error('Your owner verification has expired. Connect your CFX account again.');
  name=String(name).trim();if(name&&!namePattern.test(name))throw Error('Use the exact resource folder name: letters, numbers, underscores, dots or hyphens.');
  await this.request('/mappings/'+encodeURIComponent(id),{method:name?'PUT':'DELETE',body:name?{name}:undefined,authenticated:true});
  if(name)this.mappings[id]=name;else delete this.mappings[id];this.lastSavedAt=Date.now();
 }
 async begin(base,hash){
  if(!this.endpoint)throw Error('Tracking settings are not connected.');
  const keys=await crypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-1'},true,['encrypt','decrypt']);
  const publicBytes=await crypto.subtle.exportKey('spki',keys.publicKey),privateKey=await crypto.subtle.exportKey('jwk',keys.privateKey);
  const nonce=encode(crypto.getRandomValues(new Uint8Array(32)));
  const returnHash=typeof hash==='string'&&hash.startsWith('#/')&&!/[\r\n]/.test(hash)?hash:'#/';
  this.storage.setItem(challengeKey,JSON.stringify({privateKey,nonce,expiresAt:Date.now()+600000,hash:returnHash}));
  const url=new URL('https://forum.cfx.re/user-api-key/new');
  url.search=new URLSearchParams({application_name:'BluePeak Development resource tracking',client_id:'bluepeak-resource-tracking-v1',scopes:'session_info',nonce,public_key:'-----BEGIN PUBLIC KEY-----\n'+encode(publicBytes).match(/.{1,64}/g).join('\n')+'\n-----END PUBLIC KEY-----',auth_redirect:new URL('cfx-callback.html',base).href,padding:'oaep'}).toString();
  return url.href;
 }
 async finish(payload){
  let challenge;try{challenge=JSON.parse(this.storage.getItem(challengeKey)||'null')}catch{}
  this.storage.removeItem(challengeKey);
  if(!challenge||challenge.expiresAt<=Date.now()||typeof payload!=='string'||payload.length>4096)throw Error('CFX verification expired. Return to the store and connect your account again.');
  const key=await crypto.subtle.importKey('jwk',challenge.privateKey,{name:'RSA-OAEP',hash:'SHA-1'},false,['decrypt']);
  const decrypted=await crypto.subtle.decrypt({name:'RSA-OAEP'},key,decode(payload));
  const identity=JSON.parse(new TextDecoder().decode(decrypted));
  if(identity.nonce!==challenge.nonce||typeof identity.key!=='string')throw Error('CFX verification could not be confirmed.');
  const session=await this.request('/session',{method:'POST',body:{apiKey:identity.key}});
  if(session.cfxId!==OWNER_CFX||!tokenPattern.test(session.token)||session.expiresAt<=Date.now())throw Error('This account is not authorized.');
  this.session=session;this.storage.setItem(sessionKey,JSON.stringify(session));
  return challenge.hash;
 }
}
