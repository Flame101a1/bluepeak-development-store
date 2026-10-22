// Build every category view from Tebex IDs and parent relationships, never names.
export function parentId(category){const id=category?.parent?.id??category?.parent_id??(typeof category?.parent==='number'?category.parent:null);return id==null?null:String(id)}
export function categoryTree(categories){
 const nodes=new Map(categories.map((category,index)=>[String(category.id),{category,index,children:[]}]));const roots=[];
 for(const node of nodes.values()){
  let id=parentId(node.category),cursor=id,seen=new Set([String(node.category.id)]),cyclic=false;
  while(cursor&&nodes.has(cursor)){if(seen.has(cursor)){cyclic=true;break}seen.add(cursor);cursor=parentId(nodes.get(cursor).category)}
  const parent=!cyclic&&nodes.get(id);(parent?parent.children:roots).push(node);
 }
 const sort=items=>{items.sort((a,b)=>(Number(a.category.order)||0)-(Number(b.category.order)||0)||a.index-b.index);items.forEach(n=>sort(n.children));return items};return sort(roots);
}
export function orderedCategories(categories){const rows=[];const walk=(nodes,depth=0)=>nodes.forEach(n=>{rows.push({...n,depth});walk(n.children,depth+1)});walk(categoryTree(categories));return rows}
export function categoryTrail(categories,id){const byId=new Map(categories.map(c=>[String(c.id),c])),trail=[],seen=new Set();let c=byId.get(String(id));while(c&&!seen.has(String(c.id))){seen.add(String(c.id));trail.unshift(c);c=byId.get(parentId(c))}return trail}
export function categoryIds(categories,id){if(id==null||id==='')return new Set();const ids=new Set([String(id)]);let changed=true;while(changed){changed=false;for(const c of categories)if(ids.has(parentId(c))&&!ids.has(String(c.id))){ids.add(String(c.id));changed=true}}return ids}
