import test from 'node:test';
import assert from 'node:assert/strict';
import {OwnerTracking,isOwnerBasket,trackingEditorHTML,safeMappings} from '../assets/js/owner-tracking.mjs';
import {matchResourceMetric} from '../assets/js/resource-metrics.mjs';
const storage=()=>{const values=new Map();return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}};
const endpoint='https://tracking.example', owner={username_id:'fivem:8168011'}, token='b'.repeat(64);
test('editor stays absent for visitors, ordinary accounts and unverified owner claims',async()=>{
 const store=storage();store.setItem('bluepeak:tracking-owner',JSON.stringify({cfxId:'fivem:8168011',token,expiresAt:Date.now()+60000}));
 const client=new OwnerTracking(endpoint,{storage:store,fetcher:async url=>new Response(JSON.stringify(url.endsWith('/session')?{error:'Unauthorized'}:{mappings:{}}),{status:url.endsWith('/session')?401:200})});
 for(const basket of [null,{username_id:42},owner]){await client.load(basket);assert.equal(client.canEdit(basket),false);assert.equal(trackingEditorHTML({id:7757677},client.canEdit(basket),{}),'')}
 await assert.rejects(client.save('7757677','qb-inventory',owner));
 assert.equal(isOwnerBasket({username:'fivem:8168011'}),false);
});
test('server-verified owner sees only the requested inline editor',async()=>{
 const store=storage(),expiresAt=Date.now()+60000;store.setItem('bluepeak:tracking-owner',JSON.stringify({cfxId:'fivem:8168011',token,expiresAt}));
 const client=new OwnerTracking(endpoint,{storage:store,fetcher:async url=>new Response(JSON.stringify(url.endsWith('/session')?{cfxId:'fivem:8168011',expiresAt}:{mappings:{'7757677':'qb-inventory'}}))});
 await client.load(owner);assert.equal(client.canEdit(owner),true);assert.equal(client.canEdit({username_id:1}),false);
 const html=trackingEditorHTML({id:7757677},client.canEdit(owner),client.mappings);assert.ok(html.includes('value="qb-inventory"'));assert.ok(html.includes('Only visible to you'));assert.ok(!html.toLowerCase().includes('login'));
});
test('manual mappings match the exact runtime name and cannot inject HTML or fuzzy-match another script',()=>{
 const rows=[{name:'qb-inventory',servers:10,players:25},{name:'qb_inventory',servers:30,players:50}];
 assert.equal(matchResourceMetric({name:'BluePeak Inventory'},rows,'qb-inventory'),rows[0]);
 assert.equal(matchResourceMetric({name:'BluePeak Inventory'},rows,'qb-inventory-plus'),null);
 assert.deepEqual(safeMappings({'7757677':'qb-inventory','1':'<script>','../2':'unsafe','3':0}),{'7757677':'qb-inventory'});
 assert.ok(trackingEditorHTML({id:1},true,{'1':'\"><script>'}).includes('&lt;script&gt;'));
});
test('CFX proof is bound to the initiating browser, short-lived, encrypted and one-use',async()=>{
 const store=storage();let calls=0;
 const client=new OwnerTracking(endpoint,{storage:store,fetcher:async(url,options)=>{calls++;assert.equal(url,endpoint+'/session');assert.equal(JSON.parse(options.body).apiKey,'a'.repeat(64));return new Response(JSON.stringify({cfxId:'fivem:8168011',token,expiresAt:Date.now()+60000}))}});
 const url=new URL(await client.begin('https://bluepeakdevelopment.store/','#/product/7757677'));
 assert.equal(url.origin,'https://forum.cfx.re');assert.equal(url.searchParams.get('scopes'),'session_info');assert.equal(url.searchParams.get('padding'),'oaep');
 const encoded=url.searchParams.get('public_key').replace(/-----(?:BEGIN|END) PUBLIC KEY-----|\s/g,'');
 const pub=await crypto.subtle.importKey('spki',Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),{name:'RSA-OAEP',hash:'SHA-1'},false,['encrypt']);
 const ciphertext=await crypto.subtle.encrypt({name:'RSA-OAEP'},pub,new TextEncoder().encode(JSON.stringify({nonce:url.searchParams.get('nonce'),key:'a'.repeat(64)})));
 const payload=btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
 assert.equal(await client.finish(payload),'#/product/7757677');assert.equal(calls,1);await assert.rejects(client.finish(payload));assert.equal(calls,1);
 const other=new OwnerTracking(endpoint,{storage:storage(),fetcher:()=>assert.fail()});await assert.rejects(other.finish(payload));
});
test('mismatched CFX nonce is rejected before contacting the backend',async()=>{
 const store=storage(),client=new OwnerTracking(endpoint,{storage:store,fetcher:()=>assert.fail()});
 const url=new URL(await client.begin('https://bluepeakdevelopment.store/','#/'));
 const encoded=url.searchParams.get('public_key').replace(/-----(?:BEGIN|END) PUBLIC KEY-----|\s/g,'');
 const pub=await crypto.subtle.importKey('spki',Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),{name:'RSA-OAEP',hash:'SHA-1'},false,['encrypt']);
 const ciphertext=await crypto.subtle.encrypt({name:'RSA-OAEP'},pub,new TextEncoder().encode(JSON.stringify({nonce:'other-request',key:'a'.repeat(64)})));
 await assert.rejects(client.finish(btoa(String.fromCharCode(...new Uint8Array(ciphertext)))),/could not be confirmed/);
});
