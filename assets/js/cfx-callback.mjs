import {config} from '../../js/config.js?v=20261103-owner-tracking';
import {OwnerTracking} from './owner-tracking.mjs';
const url=new URL(location.href),payload=url.searchParams.get('payload');
// Remove the encrypted credential before any further request or navigation.
history.replaceState(null,'',url.pathname);
const base=new URL('./',url);base.search='';base.hash='';
try{const owner=new OwnerTracking(config.trackingEndpoint);const hash=await owner.finish(payload);location.replace(base.href+hash)}catch{document.querySelector('#cfx-status').textContent='Your CFX account could not be verified for tracking settings. Your store account and basket are unchanged. Return to the store to try again.'}
