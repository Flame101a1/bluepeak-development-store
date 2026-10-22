import test from 'node:test';
import assert from 'node:assert/strict';
import {shareURL,previewDescription,previewPage} from '../assets/js/sharing.mjs';
const base='https://bluepeakdevelopment.store/';
const product={id:7757677,ident:'pkg_3481018_7757677',name:'Inventory & Tools',description:'<p>A premium &amp; powerful inventory.</p>',image:'https://example.com/inventory.png'};
test('share links use stable package IDs independently of category moves',()=>{
 assert.equal(shareURL(product,base),base+'products/7757677/');
 assert.equal(shareURL({...product,ident:'pkg_other_7757677'},base),shareURL(product,base));
 assert.throws(()=>shareURL({...product,id:'../escape'},base));
 assert.equal(shareURL(product,'http://localhost:8080/repo/'),'http://localhost:8080/repo/products/7757677/');
});
test('previews expose complete metadata without running JavaScript',()=>{
 const html=previewPage(product,base);
 for(const value of ['og:title','og:description','og:url','og:image','twitter:card','summary_large_image',product.image,base+'products/7757677/'])assert.ok(html.includes(value));
 assert.ok(html.includes('Inventory &amp; Tools'));
 assert.ok(html.includes('location.replace("../../#/product/pkg_3481018_7757677")'));
 assert.ok(!html.includes('http-equiv="refresh"'));
});
test('metadata escapes untrusted catalog text and uses a safe fallback image',()=>{
 const html=previewPage({...product,name:'</title><script>alert(1)</script>',description:'<script>bad()</script><p>Good &quot;text&quot;</p>',image:'javascript:alert(1)'},base);
 assert.ok(!html.includes('<script>alert(1)</script>'));
 assert.ok(html.includes(base+'assets/brand/bluepeak-hero.png'));
 assert.equal(previewDescription('<style>bad</style><p>Good &amp; clear</p>'),'Good & clear');
 assert.ok(!html.includes('bad()'));
 assert.ok(previewDescription('x'.repeat(500)).length<=200);
 assert.ok(previewDescription('A full sentence. '.repeat(30)).endsWith('…'));
});
