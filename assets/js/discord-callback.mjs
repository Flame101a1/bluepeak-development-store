import {config} from '../../js/config.js?v=20261022-discord-login';
import {finishDiscordLogin} from './discord-oauth.mjs';
const returned=location.href;
const base=new URL('./',location.href);base.search='';base.hash='';
// Strip the token fragment before any API request or storefront script loads.
history.replaceState(null,'',new URL('discord-callback.html',base).href);
finishDiscordLogin({href:returned,clientId:config.discordClientId,base:base.href}).then(({context})=>{
 const target=new URL(base);target.hash=context.hash.slice(1);location.replace(target.href);
}).catch(error=>{document.querySelector('h1').textContent='Discord connection incomplete.';document.querySelector('#discord-status').textContent=error.message||'Unable to connect Discord. Return to the store and try again.';});
