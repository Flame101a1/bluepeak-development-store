import {catalogProducts,visibleCategories} from './core.mjs';
// One shared catalog request, short-lived cache and retry backoff. No customer data is cached on disk.
export class CatalogCache {
 constructor(api,{ttl=60000,now=()=>Date.now()}={}){this.api=api;this.ttl=Math.max(60000,ttl);this.now=now;this.snapshot=null;this.pending=null;this.updatedAt=0;this.retryAt=0;this.failures=0;this.error=null;this.fingerprint=''}
 async refresh({force=false}={}){
  if(this.pending)return this.pending;
  if(this.now()<this.retryAt||(!force&&this.snapshot&&this.now()-this.updatedAt<this.ttl))return this.snapshot;
  this.pending=(async()=>{try{const data=await this.api.catalog();const categories=visibleCategories(data.categories);const products=catalogProducts(categories,data.packages);const next={store:data.store,categories,products};this.fingerprint=JSON.stringify(next);this.snapshot=next;this.updatedAt=this.now();this.retryAt=0;this.failures=0;this.error=null;return next}catch(error){this.error=error;this.failures++;this.retryAt=Math.max(error.retryAt||0,this.now()+Math.min(300000,30000*2**Math.min(this.failures-1,4)));return this.snapshot}finally{this.pending=null}})();return this.pending;
 }
}
