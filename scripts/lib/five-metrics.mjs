import {validMetric} from '../../assets/js/resource-metrics.mjs';
// Read the public page's JSON data without evaluating any remote JavaScript.
export function metricsFromPage(html){
 if(typeof html!=='string'||html.length>10000000)throw Error('Invalid 5Metrics page');
 const chunks=[];for(const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)){const script=match[1].trim();if(!script.startsWith('self.__next_f.push('))continue;const end=script.lastIndexOf(')');try{const payload=JSON.parse(script.slice('self.__next_f.push('.length,end));if(payload[0]===1&&typeof payload[1]==='string')chunks.push(payload[1])}catch{}}
 let rows=null;const visit=(value,depth=0)=>{if(depth>60||value===null||typeof value!=='object')return;if(Array.isArray(value)){for(const v of value)visit(v,depth+1)}else{if(Array.isArray(value.initialResources))rows=value.initialResources;for(const v of Object.values(value))visit(v,depth+1)}};
 for(const line of chunks.join('').split('\n')){const separator=line.indexOf(':');if(separator<0)continue;try{visit(JSON.parse(line.slice(separator+1)))}catch{}}
 if(!rows||!rows.every(validMetric))throw Error('5Metrics published data format changed');
 return rows.map(({name,servers,players})=>({name,servers,players}));
}
export function mergeMetrics(lists){const rows=new Map();for(const list of lists)for(const row of list)if(validMetric(row))rows.set(row.name,row);return [...rows.values()].sort((a,b)=>a.name.localeCompare(b.name))}
