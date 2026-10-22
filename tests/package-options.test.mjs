import test from 'node:test';
import assert from 'node:assert/strict';
import {discordField,discordVariableData,validateVariableData,packageOptionsHTML} from '../assets/js/package-options.mjs';
const product={options:[{name:'discord_id',type:'discord_id',required:false}],variables:[]};
test('Discord fields follow live optional and required flags, including encoded metadata',()=>{
 assert.deepEqual(discordField(product),{required:false});
 assert.deepEqual(discordField({variables:[JSON.stringify({...product.options[0],required:true})]}),{required:true});
 assert.equal(discordField({}),null);
});
test('Discord IDs remain precise strings and optional omissions are allowed',()=>{
 assert.deepEqual(discordVariableData(' 123456789012345678 '),{discord_id:'123456789012345678'});
 assert.deepEqual(discordVariableData('18446744073709551615'),{discord_id:'18446744073709551615'});
 assert.deepEqual(discordVariableData(''),{});
 for(const value of ['username','123','0'.repeat(18),'18446744073709551616','<@123456789012345678>'])assert.throws(()=>discordVariableData(value));
 assert.throws(()=>discordVariableData('',true));
 assert.throws(()=>validateVariableData({discord_id:123456789012345678}));
 assert.throws(()=>validateVariableData({__unsupported:'value'}));
});
test('customer-facing options show clear role instructions instead of raw metadata',()=>{
 const html=packageOptionsHTML(product,{discordUrl:'https://discord.gg/example'});
 assert.ok(html.includes('Discord role rewards'));
 assert.ok(html.includes('Optional Discord connection'));
 assert.ok(html.includes('Login with Discord'));assert.ok(!html.includes('<input'));
 assert.ok(!html.includes('"required":false'));
 assert.ok(!html.includes('JSON'));
 assert.ok(packageOptionsHTML({options:[{name:'<script>attack</script>'}]}).includes('&lt;script&gt;'));
});
