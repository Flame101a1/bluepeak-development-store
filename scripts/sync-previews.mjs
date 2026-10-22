import {mkdir,readFile,readdir,writeFile,rm,lstat} from 'node:fs/promises';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {config} from '../js/config.js';
import {TebexAPI} from '../assets/js/api.mjs';
import {visibleCategories,catalogProducts} from '../assets/js/core.mjs';
import {previewPage} from '../assets/js/sharing.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const domain=(await readFile(resolve(root,'CNAME'),'utf8')).trim();
const base=config.siteUrl||'https://'+domain+'/';
const api=new TebexAPI(config.publicToken,{storage:null});
// Fetch and validate the entire response before touching existing preview files.
const catalog=await api.catalog();
const products=catalogProducts(visibleCategories(catalog.categories),catalog.packages);
const pages=products.map(p=>({id:String(p.id),html:previewPage(p,base)}));
const directory=resolve(root,'products');
await mkdir(directory,{recursive:true});
if((await lstat(directory)).isSymbolicLink())throw new Error('Preview directory must not be a symbolic link.');
for(const page of pages){
 if(!/^\d+$/.test(page.id))throw new Error('Unexpected package ID.');
 const folder=resolve(directory,page.id);
 await mkdir(folder,{recursive:true});
 if((await lstat(folder)).isSymbolicLink())throw new Error('Preview folder must not be a symbolic link.');
 await writeFile(resolve(folder,'index.html'),page.html);
}
const active=new Set(pages.map(p=>p.id));
for(const entry of await readdir(directory,{withFileTypes:true})){
 if(!entry.isDirectory()||!/^\d+$/.test(entry.name)||active.has(entry.name))continue;
 const stale=resolve(directory,entry.name);
 if(!stale.startsWith(directory+sep))throw new Error('Unsafe preview cleanup path.');
 await rm(stale,{recursive:true});
}
console.log('Updated '+pages.length+' public product preview(s) from Tebex.');
