import test from 'node:test';
import assert from 'node:assert/strict';
import {beginDiscordLogin,finishDiscordLogin,discordProfile,takeDiscordResume,disconnectDiscord} from '../assets/js/discord-oauth.mjs';
const clientId='1562955299302670406',base='https://bluepeakdevelopment.store/',now=1000000;
function setup(){const values=new Map();const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};const url=new URL(beginDiscordLogin({clientId,base,storage,now,context:{hash:'#/resources',packageId:'pkg_1_7',quantity:2,buy:false,action:'add'}}));const href=base+'discord-callback.html#'+new URLSearchParams({access_token:'mock-token',token_type:'Bearer',expires_in:'3600',scope:'identify',state:url.searchParams.get('state')});return {values,storage,url,href}}
test('Discord authorization requests only identify and binds a random state to the pending action',()=>{
 const {url,values}=setup();assert.equal(url.origin,'https://discord.com');assert.equal(url.searchParams.get('scope'),'identify');assert.equal(url.searchParams.get('response_type'),'token');assert.equal(url.searchParams.get('redirect_uri'),base+'discord-callback.html');assert.equal(url.searchParams.get('state').length,64);assert.ok(!JSON.stringify([...values.values()]).includes('access_token'));
});
test('valid callback reads identity from Discord, preserves pending purchase and discards the token',async()=>{
 const {storage,values,href}=setup();let calls=0;
 const result=await finishDiscordLogin({href,clientId,base,storage,now,fetcher:async(url,options)=>{calls++;assert.equal(url,'https://discord.com/api/v10/users/@me');assert.equal(options.headers.Authorization,'Bearer mock-token');return new Response(JSON.stringify({id:'123456789012345678',username:'buyer',global_name:'Buyer'}))}});
 assert.equal(result.profile.id,'123456789012345678');assert.equal(result.context.quantity,2);assert.equal(calls,1);assert.equal(discordProfile(storage,clientId,now).name,'Buyer');assert.ok(!JSON.stringify([...values.values()]).includes('mock-token'));assert.equal(takeDiscordResume(storage,clientId,now).packageId,'pkg_1_7');assert.equal(takeDiscordResume(storage,clientId,now),null);disconnectDiscord(storage,clientId);assert.equal(discordProfile(storage,clientId,now),null);
});
test('mismatched state, replay, cancellation and expired callbacks never create an identity',async()=>{
 for(const kind of ['state','expired','cancel','provider']){const {storage,href}=setup();let returned=href;if(kind==='state')returned=returned.replace(/state=[^&]+/,'state=invalid');if(kind==='cancel')returned+='&error=access_denied';if(kind==='provider')returned+='&iss=https://example.com';let calls=0;await assert.rejects(()=>finishDiscordLogin({href:returned,clientId,base,storage,now:kind==='expired'?now+600001:now,fetcher:async()=>{calls++;throw Error('must not fetch')}}));assert.equal(calls,0);assert.equal(discordProfile(storage,clientId,now),null);await assert.rejects(()=>finishDiscordLogin({href,clientId,base,storage,now}));}
});
test('failed identity requests and invalid profile IDs cannot connect an account',async()=>{
 for(const user of [{id:'invalid',username:'buyer'},null]){const {storage,href}=setup();await assert.rejects(()=>finishDiscordLogin({href,clientId,base,storage,now,fetcher:async()=>user?new Response(JSON.stringify(user)):new Response('{}',{status:401})}));assert.equal(discordProfile(storage,clientId,now),null)}
});
