import {cp,mkdir} from 'node:fs/promises';
// An allowlist keeps local reports, tests and repository files out of the deployment.
await mkdir('_site',{recursive:true});
for(const path of ['index.html','404.html','.nojekyll','CNAME','robots.txt','config.js','js','assets','products']){
 await cp(path,'_site/'+path,{recursive:true});
}
