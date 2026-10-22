const PREFIX='bluepeak:discord:';
const validId=id=>typeof id==='string'&&/^[1-9]\d{16,19}$/.test(id)&&BigInt(id)<=18446744073709551615n;
const key=(clientId,name)=>PREFIX+clientId+':'+name;
export function safeDiscordContext(value={}){
 const hash=typeof value.hash==='string'&&value.hash.startsWith('#/')&&value.hash.length<2048&&!/[\r\n]/.test(value.hash)?value.hash:'#/';
 const packageId=typeof value.packageId==='string'&&value.packageId.length<=512?value.packageId:'';
 return {hash,packageId,quantity:Number.isInteger(value.quantity)&&value.quantity>=1&&value.quantity<=99?value.quantity:1,buy:value.buy===true,action:value.action==='add'?'add':'connect'};
}
export function discordProfile(storage,clientId,now=Date.now()){
 try{const p=JSON.parse(storage.getItem(key(clientId,'profile'))||'null');if(validId(p?.id)&&typeof p.name==='string'&&Number.isFinite(p.expiresAt)&&p.expiresAt>now)return {id:p.id,name:p.name.slice(0,100),expiresAt:p.expiresAt};storage.removeItem(key(clientId,'profile'))}catch{}
 return null;
}
export function disconnectDiscord(storage,clientId){try{storage.removeItem(key(clientId,'profile'))}catch{}}
export function beginDiscordLogin({clientId,base,context,storage=globalThis.sessionStorage,crypto=globalThis.crypto,now=Date.now()}){
 if(!validId(clientId))throw new Error('Discord sign-in is not configured. Please contact support.');
 const callback=new URL('discord-callback.html',base);
 if(callback.protocol!=='https:'&&!(callback.protocol==='http:'&&callback.hostname==='127.0.0.1'))throw new Error('Discord sign-in needs a secure storefront address.');
 const state=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
 try{storage.removeItem(key(clientId,'profile'));storage.setItem(key(clientId,'pending'),JSON.stringify({state,createdAt:now,context:safeDiscordContext(context)}))}catch{throw new Error('Allow session storage to connect Discord, or skip login if it is optional.');}
 const url=new URL('https://discord.com/oauth2/authorize');
 for(const [name,value] of Object.entries({client_id:clientId,response_type:'token',redirect_uri:callback.href,scope:'identify',state}))url.searchParams.set(name,value);
 return url.href;
}
export async function finishDiscordLogin({href,clientId,base,storage=globalThis.sessionStorage,fetcher=(...args)=>globalThis.fetch(...args),now=Date.now()}){
 const url=new URL(href),callback=new URL('discord-callback.html',base);
 if(url.origin!==callback.origin||url.pathname!==callback.pathname)throw new Error('Unexpected Discord return address.');
 let pending;try{pending=JSON.parse(storage.getItem(key(clientId,'pending'))||'null');storage.removeItem(key(clientId,'pending'))}catch{}
 const params=new URLSearchParams(url.hash.slice(1));
 if(!pending||typeof pending.state!=='string'||params.get('state')!==pending.state||!Number.isFinite(pending.createdAt)||now-pending.createdAt>600000||now<pending.createdAt)throw new Error('Discord sign-in expired or could not be verified. Return to the store and try again.');
 if(params.has('iss')&&params.get('iss')!=='https://discord.com')throw new Error('Unexpected Discord sign-in provider.');
 if(params.has('error'))throw new Error('Discord sign-in was canceled. Return to the store to try again or skip if optional.');
 const token=params.get('access_token'),expires=Number(params.get('expires_in'));
 if(!token||token.length>4096||params.get('token_type')?.toLowerCase()!=='bearer'||!params.get('scope')?.split(' ').includes('identify')||!Number.isFinite(expires)||expires<=0)throw new Error('Discord did not return a usable sign-in. Please try again.');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 let response;
 try{response=await fetcher('https://discord.com/api/v10/users/@me',{headers:{Authorization:'Bearer '+token,Accept:'application/json'},credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal})}catch{throw new Error('Unable to confirm your Discord account. Please try again.')}finally{clearTimeout(timer)}
 if(!response.ok)throw new Error('Discord could not confirm your account. Please sign in again.');
 const user=await response.json();
 if(!validId(user?.id)||typeof user.username!=='string')throw new Error('Discord returned an unexpected account. Please try again.');
 const profile={id:user.id,name:(typeof user.global_name==='string'&&user.global_name?user.global_name:user.username).slice(0,100),expiresAt:now+Math.min(expires*1000,3600000)};
 // Keep the account identity only. Never put the OAuth token in browser storage.
 storage.setItem(key(clientId,'profile'),JSON.stringify(profile));
 storage.setItem(key(clientId,'resume'),JSON.stringify({context:safeDiscordContext(pending.context),createdAt:now}));
 return {profile,context:safeDiscordContext(pending.context)};
}
export function takeDiscordResume(storage,clientId,now=Date.now()){
 try{const value=JSON.parse(storage.getItem(key(clientId,'resume'))||'null');storage.removeItem(key(clientId,'resume'));if(value&&now>=value.createdAt&&now-value.createdAt<600000&&discordProfile(storage,clientId,now))return safeDiscordContext(value.context)}catch{}
 return null;
}
