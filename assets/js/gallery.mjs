import {escapeHTML as e,httpsURL} from './core.mjs';
import {image,icons} from './ui.mjs';
export function productGallery(p){
 const pictures=[{url:p.image,name:p.name},...(Array.isArray(p.media)?p.media:[]).filter(m=>m.type==='image')].filter(m=>httpsURL(m.url));
 const media=[...new Map(pictures.map(m=>[m.url,m])).values()];
 const controls=media.length>1?'<button type="button" class="gallery-arrow gallery-previous" data-action="gallery-step" data-step="-1" aria-label="Previous image">'+icons.arrow+'</button><button type="button" class="gallery-arrow gallery-next" data-action="gallery-step" data-step="1" aria-label="Next image">'+icons.arrow+'</button>':'';
 return '<div class="product-gallery"><div class="gallery-stage" role="group" aria-label="Product images" tabindex="0">'+(media.length?'<button type="button" class="gallery-expand" data-action="gallery-expand" aria-label="Expand product image">'+image(media[0].url,p.name,'main-product-image',true)+'</button>':image('',p.name,'main-product-image'))+controls+'</div>'+(media.length>1?'<div class="gallery" aria-label="Product image gallery">'+media.map((m,i)=>'<button type="button" data-action="gallery" data-src="'+e(m.url)+'" aria-label="View image '+(i+1)+' of '+media.length+'" aria-pressed="'+(i===0)+'">'+image(m.url,m.name||p.name)+'</button>').join('')+'</div><span class="sr-only gallery-status" aria-live="polite">Image 1 of '+media.length+'</span>':'')+'</div>';
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

export function expandGallery(root){
 const opener=root.querySelector('.gallery-expand'),thumbs=[...root.querySelectorAll('.gallery button')],main=root.querySelector('.main-product-image');
 const pictures=thumbs.length?thumbs.map(b=>({url:httpsURL(b.dataset.src),alt:b.querySelector('img')?.alt||'Product image'})):[{url:httpsURL(main?.getAttribute('src')),alt:main?.alt||'Product image'}];
 if(!pictures.length||pictures.some(p=>!p.url))return;
 let index=Math.max(0,thumbs.findIndex(b=>b.getAttribute('aria-pressed')==='true'));
 const dialog=document.createElement('dialog');dialog.className='gallery-lightbox';dialog.setAttribute('aria-label','Product image viewer');
 dialog.innerHTML='<div class="lightbox-toolbar"><span class="lightbox-counter" aria-live="polite"></span><button type="button" class="icon-button lightbox-close" aria-label="Close image viewer">×</button></div><div class="lightbox-stage"><img class="lightbox-image" alt="" referrerpolicy="no-referrer">'+(pictures.length>1?'<button type="button" class="gallery-arrow gallery-previous lightbox-previous" aria-label="Previous image">'+icons.arrow+'</button><button type="button" class="gallery-arrow gallery-next lightbox-next" aria-label="Next image">'+icons.arrow+'</button>':'')+'</div><p class="lightbox-hint">'+(pictures.length>1?'Use the arrows to browse · ':'')+'Press Esc to close</p>';
 const show=step=>{index=(index+step+pictures.length)%pictures.length;const img=dialog.querySelector('.lightbox-image');img.src=pictures[index].url;img.alt=pictures[index].alt;dialog.querySelector('.lightbox-counter').textContent='Image '+(index+1)+' of '+pictures.length;selectGallery(root,index)};
 dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
 dialog.querySelector('.lightbox-previous')?.addEventListener('click',()=>show(-1));dialog.querySelector('.lightbox-next')?.addEventListener('click',()=>show(1));
 dialog.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();event.stopPropagation();show(event.key==='ArrowLeft'?-1:1)}});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()});
 const close=()=>dialog.close(),overflow=document.body.style.overflow;
 dialog.addEventListener('close',()=>{document.body.style.overflow=overflow;window.removeEventListener('hashchange',close);dialog.remove();if(opener?.isConnected)opener.focus({preventScroll:true})},{once:true});
 window.addEventListener('hashchange',close);document.body.append(dialog);show(0);dialog.showModal();document.body.style.overflow='hidden';
}
