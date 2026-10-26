import test from 'node:test';
import assert from 'node:assert/strict';
import {FrameStore} from '../frame-store.js';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(predicate){for(let i=0;i<200;i++){if(predicate())return;await sleep(5);}throw Error('Timed out');}
function fixture({delay=8,fail=false,decodeDelay=0}={}){
 const count=60,frames=Array.from({length:count},(_,n)=>[Math.floor(n/12),n%12,1]);
 const packs=Array.from({length:5},(_,n)=>({url:`pack-${n}`,bytes:12}));
 const calls=[],closed=[];let active=0,peak=0;
 const fetcher=(url,{signal})=>new Promise((resolve,reject)=>{
  calls.push(url);active++;peak=Math.max(peak,active);let finished=false;
  const finish=fn=>{if(!finished){finished=true;active--;fn();}};
  const timer=setTimeout(()=>finish(()=>fail?reject(Error('offline')):resolve({ok:true,blob:async()=>new Blob([Uint8Array.from({length:12},(_,i)=>Number(url.slice(5))*12+i)])})),delay);
  signal.addEventListener('abort',()=>{clearTimeout(timer);finish(()=>reject(new DOMException('aborted','AbortError')));});
 });
 const decode=async blob=>{await sleep(decodeDelay);const n=new Uint8Array(await blob.arrayBuffer())[0];return{n,width:1,height:1,close:()=>closed.push(n)};};
 return{manifest:{count,frames,packs},fetcher,decode,calls,closed,peak:()=>peak};
}
test('warms compressed packs, reuses them on reverse scroll, bounds requests and decoded images',async()=>{
 const f=fixture();let paints=0;
 const store=new FrameStore(f.manifest,{...f,onReady:()=>paints++});store.setTarget(0);
 await until(()=>store.packs.size===5&&store.images.has(0));
 assert.equal(f.calls.length,5);assert(f.peak()<=2);assert(store.images.size<=18);assert(paints>0);
 store.setTarget(59,1);await until(()=>store.images.has(59));assert.equal(store.nearest(59).image.n,59);
 store.setTarget(0,-1);await until(()=>store.images.has(0));assert.equal(f.calls.length,5);assert(store.images.size<=18);
 store.dispose();assert.equal(store.images.size,0);assert.equal(store.bytes,0);
});
test('a rapid jump cancels obsolete downloads and prioritizes the new position',async()=>{
 const f=fixture({delay:30}),store=new FrameStore(f.manifest,f);store.setTarget(0);store.setTarget(59);
 assert(f.calls.includes('pack-4'));await until(()=>store.images.has(59));assert.equal(store.nearest(59).index,59);assert(f.peak()<=2);store.dispose();
});
test('an available nearby frame can be painted while the exact frame is decoding',async()=>{
 const f=fixture({decodeDelay:10}),store=new FrameStore(f.manifest,f);store.setTarget(0);await until(()=>store.images.has(0));
 store.setTarget(8);assert(store.nearest(8));await until(()=>store.images.has(8));assert.equal(store.nearest(8).index,8);store.dispose();
});
test('failed media retries are bounded and invoke the poster fallback',async()=>{
 const f=fixture({fail:true});let fallback=0;const store=new FrameStore(f.manifest,{...f,onUnavailable:()=>{fallback++;store.dispose();}});
 store.setTarget(0);await until(()=>fallback===1);assert.equal(f.calls.filter(x=>x==='pack-0').length,2);
});
test('disposed sequence releases images that finish decoding later',async()=>{
 const f=fixture({decodeDelay:30}),store=new FrameStore(f.manifest,f);store.setTarget(0);await until(()=>store.decoding.size>0);
 store.dispose();await sleep(45);assert.equal(store.images.size,0);assert(f.closed.length>0);
});
test('inactive or reduced-motion callers do not request animation data',async()=>{
 const f=fixture(),store=new FrameStore(f.manifest,f);store.setTarget(0,1,false);await sleep(20);assert.equal(f.calls.length,0);store.dispose();
});
test('compressed byte cap does not trigger endless background refetching',async()=>{
 const f=fixture(),store=new FrameStore(f.manifest,{...f,maxBytes:20});store.setTarget(0);
 await until(()=>store.downloaded.size===5);await sleep(30);assert(store.bytes<=20);assert.equal(f.calls.length,5);
 store.setTarget(59);await until(()=>store.images.has(59));assert(store.bytes<=20);assert(f.calls.length<=6);store.dispose();
});
