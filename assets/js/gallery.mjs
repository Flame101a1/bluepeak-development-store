import {escapeHTML as e,httpsURL} from './core.mjs';
import {image,icons} from './ui.mjs';
export function productGallery(p){
 const pictures=[{url:p.image,name:p.name},...(Array.isArray(p.media)?p.media:[]).filter(m=>m.type==='image')].filter(m=>httpsURL(m.url));
 const media=[...new Map(pictures.map(m=>[m.url,m])).values()];
 const controls=media.length>1?'<button type="button" class="gallery-arrow gallery-previous" data-action="gallery-step" data-step="-1" aria-label="Previous image">'+icons.arrow+'</button><button type="button" class="gallery-arrow gallery-next" data-action="gallery-step" data-step="1" aria-label="Next image">'+icons.arrow+'</button>':'';
 return '<div class="product-gallery"><div class="gallery-stage" role="group" aria-label="Product images" tabindex="0">'+image(media[0]?.url,p.name,'main-product-image',true)+controls+'</div>'+(media.length>1?'<div class="gallery" aria-label="Product image gallery">'+media.map((m,i)=>'<button type="button" data-action="gallery" data-src="'+e(m.url)+'" aria-label="View image '+(i+1)+' of '+media.length+'" aria-pressed="'+(i===0)+'">'+image(m.url,m.name||p.name)+'</button>').join('')+'</div><span class="sr-only gallery-status" aria-live="polite">Image 1 of '+media.length+'</span>':'')+'</div>';
}
export function selectGallery(root,index){
 const buttons=[...root.querySelectorAll('.gallery button')];if(!buttons.length)return;
 const selected=((index%buttons.length)+buttons.length)%buttons.length,button=buttons[selected],target=root.querySelector('.main-product-image'),url=httpsURL(button.dataset.src);
 if(!target||!url)return;
 const img=new Image();img.className='main-product-image';img.alt=button.querySelector('img')?.alt||'Product image';img.decoding='async';img.referrerPolicy='no-referrer';img.src=url;target.replaceWith(img);
 buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));
 root.querySelector('.gallery-status').textContent='Image '+(selected+1)+' of '+buttons.length;
}
export function stepGallery(root,step){const buttons=[...root.querySelectorAll('.gallery button')];selectGallery(root,Math.max(0,buttons.findIndex(b=>b.getAttribute('aria-pressed')==='true'))+step)}
