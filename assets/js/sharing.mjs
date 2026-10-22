import {escapeHTML,httpsURL,productRoute} from './core.mjs';

export function shareURL(product,base){
 const id=String(product.id);
 if(!/^\d+$/.test(id))throw new Error('This resource does not have a share link yet.');
 return new URL('products/'+id+'/',base).href;
}

export function previewDescription(html=''){
 const text=String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
 if(!text)return 'Premium FiveM resources from BluePeak Development. Explore the details and shop securely through Tebex.';
 return text.length<=200?text:(text.slice(0,196).replace(/\s+\S*$/,'')+'…');
}

export function previewPage(product,base){
 const url=shareURL(product,base),title=product.name+' — BluePeak Development';
 const description=previewDescription(product.description),image=httpsURL(product.image)||new URL('assets/brand/bluepeak-hero.png',base).href;
 // Relative navigation keeps local previews and the deployed custom domain working alike.
 const destination='../../'+productRoute(product);
 const scriptURL=JSON.stringify(destination).replace(/</g,'\\u003c');
 const meta=(key,value,name=false)=>'<meta '+(name?'name':'property')+'="'+key+'" content="'+escapeHTML(value)+'">';
 return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escapeHTML(title)+'</title>'+meta('description',description,true)+meta('og:type','website')+meta('og:site_name','BluePeak Development')+meta('og:title',title)+meta('og:description',description)+meta('og:url',url)+meta('og:image',image)+meta('og:image:secure_url',image)+meta('og:image:alt',product.name)+meta('twitter:card','summary_large_image',true)+meta('twitter:title',title,true)+meta('twitter:description',description,true)+meta('twitter:image',image,true)+'<link rel="canonical" href="'+escapeHTML(url)+'"><link rel="icon" href="../../assets/brand/bluepeak-logo.png"><meta name="theme-color" content="#050B16"><link rel="stylesheet" href="../../assets/css/styles.css"><script>location.replace('+scriptURL+');</script></head><body><main class="container section"><a class="text-link" href="../../">BluePeak Development</a><h1>'+escapeHTML(product.name)+'</h1><img style="max-width:100%;border-radius:12px" src="'+escapeHTML(image)+'" alt="'+escapeHTML(product.name)+'"><p>'+escapeHTML(description)+'</p><a class="button" href="'+escapeHTML(destination)+'">View resource →</a></main></body></html>\n';
}
