export const AUTH_WINDOW='bluepeak-cfx-signin';
export function authReturnURL(base){const url=new URL(base);url.hash='';url.search='';url.searchParams.set('bluepeak_auth','1');return url.href}
export function isAuthReturn(href){const url=new URL(href);return url.searchParams.has('bluepeak_auth')||/^#\/?auth\/return(?:[?&/]|$)/.test(url.hash)}
export function safeAuthContext(value){const hash=typeof value?.hash==='string'?value.hash:'';return {hash:hash.startsWith('#/')&&!/^#\/auth(?:[/?&]|$)/.test(hash)&&hash.length<2048&&!/[\r\n]/.test(hash)?hash:'#/',scroll:Number.isFinite(value?.scroll)&&value.scroll>=0?value.scroll:0}}
export function authContext(storage,key,value){try{if(value){storage?.setItem(key,JSON.stringify(safeAuthContext(value)));return safeAuthContext(value)}const saved=safeAuthContext(JSON.parse(storage?.getItem(key)||'null'));storage?.removeItem(key);return saved}catch{return safeAuthContext(value)}}
