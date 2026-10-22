// These values select a screen only. They never establish payment status.
export function checkoutReturnURL(base,result){
 if(!['complete','cancel'].includes(result))throw new Error('Unsupported checkout return.');
 const url=new URL(base);url.hash='';url.search='';
 url.searchParams.set('bluepeak_checkout',result);
 return url.href;
}

export function checkoutReturnState(href){
 const url=new URL(href);
 const result=url.searchParams.get('bluepeak_checkout');
 if(result==='complete'||result==='cancel')return result;
 let hash=url.hash;
 try{hash=decodeURIComponent(hash)}catch{return null}
 // Older baskets retain their original callback. Accept provider-added query
 // parameters after that fragment without changing any other storefront route.
 return hash.match(/^#\/?checkout\/(complete|cancel)\/?(?:[?&].*)?$/)?.[1]||null;
}
