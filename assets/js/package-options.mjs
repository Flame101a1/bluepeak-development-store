import {escapeHTML as e} from './core.mjs';
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
export function packageOptionsHTML(p,{formId='purchase-form',prefix='product',discordUrl=''}={}){
 const discord=discordField(p),other=packageFields(p).filter(f=>f.type!=='discord_id'&&f.name!=='discord_id');
 return (discord?`<section class="discord-rewards" aria-labelledby="${prefix}-discord-title"><div class="discord-rewards-heading"><span class="value-icon">${icons.chat}</span><div><h3 id="${prefix}-discord-title">Discord role rewards</h3><span>${discord.required?'Required for this resource':'Optional for purchasing'}</span></div></div><p>Add your Discord user ID so Tebex can assign the roles configured for this package after a successful purchase. Join our server with that same account before buying.</p><label for="${prefix}-discord-id">Your Discord user ID</label><input id="${prefix}-discord-id" name="discord_id" form="${e(formId)}" type="text" inputmode="numeric" autocomplete="off" pattern="[1-9][0-9]{16,19}" maxlength="20" placeholder="Paste your numeric user ID" title="Enter your Discord user ID (17–20 digits), not your username" aria-describedby="${prefix}-discord-help" ${discord.required?'required':''}><p id="${prefix}-discord-help" class="discord-field-help">Use your own account’s ID. This identifies the recipient of the roles; it does not sign you in to Discord.</p><details class="discord-id-guide"><summary>Where do I find my Discord ID?</summary><p>In Discord, enable <strong>Developer Mode</strong> under Settings → Advanced. Open your profile’s menu and choose <strong>Copy User ID</strong>, then paste it above.</p></details>${external(discordUrl,'Join our Discord','text-link')}</section>`:'')+(other.length?`<div class="purchase-options-note"><strong>Additional purchase details</strong><p>This resource lists additional options: ${other.map(f=>e(String(f.label||f.description||f.name||'Purchase option').replace(/_/g,' '))).join('; ')}. Follow the product’s instructions and contact support if a required option is unavailable.</p></div>`:'');
}

export function promptDiscordOptions(p,config){
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='package-options-dialog';dialog.setAttribute('aria-labelledby','package-options-title');
  dialog.innerHTML=`<div class="dialog-top"><h2 id="package-options-title">Before you add this resource</h2><button type="button" class="icon-button" aria-label="Close purchase options">×</button></div><p class="package-options-name">${e(p.name)}</p><form id="package-options-form">${packageOptionsHTML(p,{formId:'package-options-form',prefix:'basket-option',discordUrl:config.discordUrl})}<button class="button" type="submit">Continue to basket ${icons.arrow}</button></form>`;
  document.body.append(dialog);
  let result=null;
  dialog.addEventListener('close',()=>{dialog.remove();resolve(result)},{once:true});
  dialog.querySelector('.icon-button').addEventListener('click',()=>dialog.close());
  const form=dialog.querySelector('form'),input=form.elements.namedItem('discord_id');
  input?.addEventListener('input',()=>input.setCustomValidity(''));
  form.addEventListener('submit',event=>{event.preventDefault();try{result=discordVariableData(input?.value,discordField(p)?.required);dialog.close()}catch(error){input.setCustomValidity(error.message);input.reportValidity()}});
  dialog.showModal();
 });
}
