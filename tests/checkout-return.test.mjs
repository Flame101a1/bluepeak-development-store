import test from 'node:test';
import assert from 'node:assert/strict';
import {checkoutReturnURL,checkoutReturnState} from '../assets/js/checkout-return.mjs';
test('new return URLs preserve the deployment directory and avoid fragment query collisions',()=>{
 assert.equal(checkoutReturnURL('https://example.com/store/?old=1#/basket','complete'),'https://example.com/store/?bluepeak_checkout=complete');
 assert.equal(checkoutReturnURL('https://example.com/','cancel'),'https://example.com/?bluepeak_checkout=cancel');
 assert.throws(()=>checkoutReturnURL('https://example.com/','success'));
});
test('query callbacks and existing basket fragments tolerate appended provider parameters',()=>{
 for(const state of ['complete','cancel'])for(const href of [
  'https://example.com/?bluepeak_checkout='+state+'&txn-id=example',
  'https://example.com/#/checkout/'+state,
  'https://example.com/#/checkout/'+state+'?txn-id=example',
  'https://example.com/#/checkout/'+state+'&txn-id=example',
  'https://example.com/#/checkout/'+state+'/?txn-id=example',
  'https://example.com/#/checkout/'+state+'%3Ftxn-id%3Dexample'
 ])assert.equal(checkoutReturnState(href),state,href);
});
test('other pages and unknown statuses do not become checkout completion',()=>{
 for(const suffix of ['#/product/complete','#/checkout/complete-other','#/checkout/complete/unknown','?bluepeak_checkout=failed','?txn-id=example','#/auth/return?user_id=1'])assert.equal(checkoutReturnState('https://example.com/'+suffix),null);
});
