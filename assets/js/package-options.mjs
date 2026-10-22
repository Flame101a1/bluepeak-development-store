import {escapeHTML as e,productKey} from './core.mjs';
import {external,icons} from './ui.mjs';

export function packageFields(p){
 return [...(Array.isArray(p.options)?p.options:[]),...(Array.isArray(p.variables)?p.variables:[])].map(value=>{
  if(typeof value==='string'){try{return JSON.parse(value)}catch{return {name:value}}}
  return value;
 }).filter(value=>value&&typeof value==='object'&&!Array.isArray(value));
}
export function discordField(p){
 const fields=packageFields(p).filter(f=>f.type==='discord_id'||f.name==='discord_id');
 return fields.length?{required:fields.some(f=>f.required===true)}:null;
}
export function discordVariableData(value,required=false){
 const id=String(value??'').trim();
 if(!id){if(required)throw new Error('Enter your Discord user ID for this resource.');return {}}
 if(!/^[1-9]\d{16,19}$/.test(id)||BigInt(id)>18446744073709551615n)throw new Error('Enter a valid Discord user ID (17–20 digits), not a username.');
 return {discord_id:id};
}
export function validateVariableData(data){
 if(data===undefined)return {};
 if(!data||typeof data!=='object'||Array.isArray(data)||Object.keys(data).some(k=>k!=='discord_id'))throw new Error('Unsupported purchase information.');
 if(data.discord_id!==undefined&&typeof data.discord_id!=='string')throw new Error('Discord user IDs must be entered as text.');
 return discordVariableData(data.discord_id);
}
export function packageOptionsHTML(p,{discordUrl='',profile=null}={}){
 const discord=discordField(p),other=packageFields(p).filter(f=>f.type!=='discord_id'&&f.name!=='discord_id');
 return (discord?'<section class="discord-rewards"><div class="discord-rewards-heading"><span class="value-icon">'+icons.chat+'</span><div><h3>Discord role rewards</h3><span>'+(discord.required?'Discord connection required':'Optional Discord connection')+'</span></div></div>'+(profile?'<p>Connected as <strong>'+e(profile.name)+'</strong>. Tebex will receive this account’s ID for the package’s configured role rewards.</p><button type="button" class="text-link" data-action="discord-disconnect">Use a different Discord account</button>':'<p>Sign in with Discord to receive the roles configured for this package after purchase. Join our server using the same account.</p><button type="button" class="button secondary" data-action="discord-login" data-id="'+e(productKey(p))+'">Login with Discord '+icons.arrow+'</button>')+external(discordUrl,'Join our Discord','text-link discord-join-link')+'</section>':'')+(other.length?'<div class="purchase-options-note"><strong>Additional purchase details</strong><p>This resource lists additional options: '+other.map(f=>e(String(f.label||f.description||f.name||'Purchase option').replace(/_/g,' '))).join('; ')+'. Follow the product’s instructions and contact support if a required option is unavailable.</p></div>':'');
}
export function promptDiscordOptions(p){
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='package-options-dialog discord-login-dialog';dialog.setAttribute('aria-labelledby','package-options-title');
  const required=discordField(p)?.required;
  dialog.innerHTML='<div class="dialog-top"><h2 id="package-options-title">Adding to your basket</h2><button type="button" class="icon-button" aria-label="Close Discord login">×</button></div><p class="package-options-name">'+e(p.name)+'</p><div class="discord-prompt-symbol">'+icons.chat+'</div><h3>Connect with Discord.</h3><p>Login with Discord so we can identify your account for this package’s role rewards. Your FiveM account stays connected separately.</p><div class="discord-login-actions"><button class="button discord-prompt-login" type="button">Login with Discord '+icons.arrow+'</button>'+(!required?'<button class="button secondary discord-prompt-skip" type="button">Skip login</button>':'')+'</div><p class="discord-login-note">'+(required?'This package requires a Discord connection.':'You can skip Discord login and purchase without Discord role rewards.')+'</p>';
  document.body.append(dialog);let result=null;
  dialog.addEventListener('close',()=>{dialog.remove();resolve(result)},{once:true});
  dialog.querySelector('.icon-button').addEventListener('click',()=>dialog.close());
  dialog.querySelector('.discord-prompt-login').addEventListener('click',()=>{result='login';dialog.close()});
  dialog.querySelector('.discord-prompt-skip')?.addEventListener('click',()=>{result='skip';dialog.close()});
  dialog.showModal();
 });
}
