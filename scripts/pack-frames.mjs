import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Small packs remove per-frame network round trips; bytes remain ordinary WebP.
for(const root of ['assets','assets/mobile']){
 const source=JSON.parse(await readFile(`${root}/manifest.json`,'utf8'));
 const packs=[],frames=[];
 await mkdir(`${root}/packs`,{recursive:true});
 for(let first=0;first<source.count;first+=12){
  const parts=[];let offset=0;
  for(let n=first;n<Math.min(first+12,source.count);n++){
   const data=await readFile(source.pattern.replace('{index}',String(n).padStart(4,'0')));
   frames.push([packs.length,offset,data.length]);parts.push(data);offset+=data.length;
  }
  const bytes=Buffer.concat(parts),hash=createHash('sha256').update(bytes).digest('hex').slice(0,12);
  const url=`${root}/packs/pack-${String(packs.length).padStart(2,'0')}-${hash}.bin`;
  await writeFile(url,bytes);packs.push({url,bytes:bytes.length});
 }
 const {pattern,...metadata}=source;
 await writeFile(`${root}/sequence.json`,JSON.stringify({...metadata,packs,frames}));
 console.log(`${root}: ${source.count} frames in ${packs.length} packs (${packs.reduce((n,p)=>n+p.bytes,0)} bytes)`);
}
