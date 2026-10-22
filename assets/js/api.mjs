import {checkoutReturnURL} from './checkout-return.mjs';
import {authReturnURL} from './auth.mjs';
import {API,unwrap,readBasket,basketPath,packagePath} from './core.mjs';
export class ApiError extends Error {
 constructor(message,status=0,retryAt=0){super(message);this.name='ApiError';this.status=status;this.retryAt=retryAt}
}
function browserStorage(){try{return globalThis.localStorage}catch{return null}}
export class TebexAPI {
 constructor(token,{fetcher=(...args)=>globalThis.fetch(...args),baseUrl='',storage=browserStorage()}={}){
  this.token=token;this.fetcher=fetcher;this.baseUrl=baseUrl;this.storage=storage;
  this.key='bluepeak:basket:'+token;this.pending=null;this.queue=Promise.resolve();this.memoryIdent='';this.storageFailed=false;this.cooldownUntil=0;
 }
 get account(){if(!this.token)throw new ApiError('The store connection is not configured yet.');return API+'/accounts/'+encodeURIComponent(this.token)}
 async request(url,method='GET',body){
  if(Date.now()<this.cooldownUntil)throw new ApiError('Tebex asked us to pause requests. Please try again shortly.',429,this.cooldownUntil);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await this.fetcher(url,{method,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),credentials:'omit',cache:'no-store',signal:controller.signal});
   let json=null;try{json=await response.json()}catch{if(response.ok&&response.status!==204)throw new ApiError('Tebex returned an unreadable response. Please try again.')}
   if(!response.ok){
    if(response.status===429||response.status===503){const retry=response.headers?.get('retry-after');const seconds=Number(retry);const retryAt=retry?(Number.isFinite(seconds)?Date.now()+Math.max(seconds,1)*1000:Date.parse(retry)):0;this.cooldownUntil=Math.max(this.cooldownUntil,Number.isFinite(retryAt)&&retryAt>Date.now()?retryAt:Date.now()+60000)}
    const messages={400:'Tebex could not accept this package or option.',401:'Tebex could not authorize this request.',403:'This resource is not available for your account.',404:'This basket or resource is no longer available.',410:'This basket or resource has expired.',422:'Tebex could not accept this change. Check your account, package eligibility, or code.',429:'Too many requests. Please wait a moment and try again.'};
    throw new ApiError(messages[response.status]||'Tebex is temporarily unavailable. Please try again.',response.status,this.cooldownUntil);
   }
   return unwrap(json);
  }catch(error){if(error instanceof ApiError)throw error;throw new ApiError('Unable to reach Tebex. Check your connection and try again.')}
  finally{clearTimeout(timer)}
 }
 stored(){if(this.storage&&!this.storageFailed){try{return this.storage.getItem(this.key)||''}catch{this.storageFailed=true}}return this.memoryIdent}
 remember(ident){this.memoryIdent=ident;try{ident?this.storage?.setItem(this.key,ident):this.storage?.removeItem(this.key)}catch{this.storageFailed=true}}
 async basket(){
  const ident=this.stored();if(!ident)return null;
  try{const basket=readBasket(await this.request(basketPath(this.token,ident)));if(basket.complete){this.remember('');return null}return basket}
  catch(error){if([404,410,422].includes(error.status)){this.remember('');return null}throw error}
 }
 async ensureBasket(){
  if(this.pending)return this.pending;
  const create=async()=>{const existing=await this.basket();if(existing)return existing;const basket=readBasket(await this.request(this.account+'/baskets','POST',{complete_url:checkoutReturnURL(this.baseUrl||globalThis.location?.href||'http://localhost/','complete'),cancel_url:checkoutReturnURL(this.baseUrl||globalThis.location?.href||'http://localhost/','cancel'),complete_auto_redirect:true}));this.remember(basket.ident);return basket};
  this.pending=globalThis.navigator?.locks?.request?globalThis.navigator.locks.request('bluepeak:create:'+this.token,create):create();
  try{return await this.pending}finally{this.pending=null}
 }
 serialize(fn){const task=this.queue.then(fn);this.queue=task.catch(()=>{});return task}
 async auth(basket){const links=await this.request(basketPath(this.token,basket.ident)+'/auth?returnUrl='+encodeURIComponent(authReturnURL(this.baseUrl||globalThis.location?.href||'http://localhost/')));if(!Array.isArray(links))throw new ApiError('Sign-in options are temporarily unavailable.');return links.filter(link=>typeof link.name==='string'&&typeof link.url==='string')}
 mutate(action,{id,quantity=1,code='',dynamic=false}={}){
  return this.serialize(async()=>{
   const packageAction=['add','remove','quantity'].includes(action);
   if(packageAction&&(!['string','number'].includes(typeof id)||!String(id)||String(id).length>512))throw new ApiError('Choose a valid package.');
   if(['add','quantity'].includes(action)&&(!Number.isInteger(quantity)||quantity<1||quantity>99))throw new ApiError('Choose a quantity between 1 and 99.');
   const names={coupon:['coupons','coupon_code'],giftcard:['giftcards','card_number'],creator:['creator-codes','creator_code']};const remove=action.startsWith('remove-'),kind=action.replace('remove-','');
   if(!packageAction&&(!names[kind]||typeof code!=='string'||!code.trim()||code.length>128))throw new ApiError('Enter a valid supported code.');
   const basket=['remove','quantity'].includes(action)||remove?await this.basket():await this.ensureBasket();
   if(!basket)throw new ApiError('Your basket expired. Add a resource to start a new basket.',410);
   const path=basketPath(this.token,basket.ident),pkg=packagePath(basket.ident);let url,method='POST',body;
   if(action==='add'){url=pkg;body={package_id:String(id),quantity,...(dynamic?{dynamic:true}:{})}}
   else if(action==='remove'){url=pkg+'/remove';body={package_id:String(id)}}
   else if(action==='quantity'){url=pkg+'/'+encodeURIComponent(id);method='PUT';body={quantity}}
   else{const [segment,field]=names[kind];url=path+'/'+segment+(remove?'/remove':'');body={[field]:code.trim()}}
   await this.request(url,method,body);const fresh=await this.basket();if(!fresh)throw new ApiError('This basket expired. Please add the resource again.',410);return fresh;
  });
 }
 async catalog(){
  const suffix=this.stored()?'&basketIdent='+encodeURIComponent(this.stored()):'';
  const [store,categories,packages]=await Promise.all([this.request(this.account),this.request(this.account+'/categories?includePackages=1'+suffix),this.request(this.account+'/packages')]);
  if(!store||typeof store.currency!=='string'||!Array.isArray(categories)||!Array.isArray(packages))throw new ApiError('Tebex returned an unexpected catalog.');
  // Do not infer Headless availability from the hosted webstore's disabled flag.
  // The actual API responses remain authoritative for browsing and purchase eligibility.
  return {store,categories,packages};
 }
 async product(id){return this.request(this.account+'/packages/'+encodeURIComponent(id))}
 async category(id){return this.request(this.account+'/categories/'+encodeURIComponent(id)+'?includePackages=1'+(this.stored()?'&basketIdent='+encodeURIComponent(this.stored()):''))}
}
