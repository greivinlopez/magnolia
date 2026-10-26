// Keep compressed packs for replay, but decode only a small moving window.
export class FrameStore {
 constructor(manifest,{fetcher=(url,options)=>fetch(url,options),decode=blob=>createImageBitmap(blob),onReady=()=>{},onUnavailable=()=>{},maxImages=18,maxBytes=16*1024*1024}={}){
  this.manifest=manifest;this.fetcher=fetcher;this.decode=decode;this.onReady=onReady;this.onUnavailable=onUnavailable;
  this.maxImages=maxImages;this.maxBytes=maxBytes;this.bytes=0;this.wanted=0;this.direction=1;this.active=false;this.disposed=false;
  this.downloaded=new Set();this.packs=new Map();this.images=new Map();this.requests=new Map();this.decoding=new Set();this.failures=new Map();this.decodeFailures=new Map();
 }
 setTarget(n,direction=1,active=true){
  this.wanted=Math.max(0,Math.min(this.manifest.count-1,n));this.direction=direction||1;this.active=active;
  if(!active)return;
  const pack=this.manifest.frames[this.wanted][0];
  // A scroll jump must not wait behind downloads for a distant, obsolete position.
  if(!this.packs.has(pack)&&!this.requests.has(pack)&&this.requests.size>=2){
   const obsolete=[...this.requests.keys()].sort((a,b)=>Math.abs(b-pack)-Math.abs(a-pack))[0];
   if(Math.abs(obsolete-pack)>1){this.requests.get(obsolete).abort();this.requests.delete(obsolete);}
  }
  this.pump();
 }
 packOrder(){
  const center=this.manifest.frames[this.wanted][0],direction=this.direction;
  return this.manifest.packs.map((_,n)=>n).sort((a,b)=>{
   const score=n=>Math.abs(n-center)+(n===center?0:(n-center)*direction<0?.5:0);
   return score(a)-score(b);
  });
 }
 pump(){
  if(this.disposed||!this.active)return;
  for(const n of this.packOrder()){
   if(this.requests.size>=2)break;
   if(!this.packs.has(n)&&!this.requests.has(n)&&(this.failures.get(n)||0)<2&&(!this.downloaded.has(n)||n===this.manifest.frames[this.wanted][0]))this.loadPack(n);
  }
  // Requested frame first, then mostly ahead in the current scroll direction.
  const order=[this.wanted];
  for(let d=1;d<=12;d++){order.push(this.wanted+d*this.direction);if(d<=4)order.push(this.wanted-d*this.direction);}
  for(const n of order){
   if(this.decoding.size>=2)break;
   if(n<0||n>=this.manifest.count||this.images.has(n)||this.decoding.has(n)||(this.decodeFailures.get(n)||0)>=2)continue;
   const [pack]=this.manifest.frames[n];if(this.packs.has(pack))this.loadImage(n);
  }
 }
 async loadPack(n){
  const controller=new AbortController();this.requests.set(n,controller);
  try{
   const response=await this.fetcher(this.manifest.packs[n].url,{signal:controller.signal,cache:'force-cache'});
   if(!response.ok)throw Error('Pack unavailable');
   const blob=await response.blob();
   if(blob.size!==this.manifest.packs[n].bytes)throw Error('Incomplete pack');
   if(this.disposed||controller.signal.aborted)return;
   this.downloaded.add(n);this.packs.set(n,blob);this.bytes+=blob.size;
   // A cap also protects future sequences with larger files.
   while(this.bytes>this.maxBytes&&this.packs.size>1){
    const center=this.manifest.frames[this.wanted][0];
    const key=[...this.packs.keys()].sort((a,b)=>Math.abs(b-center)-Math.abs(a-center))[0];
    this.bytes-=this.packs.get(key).size;this.packs.delete(key);
   }
  }catch(error){
   if(!this.disposed&&!controller.signal.aborted){
    this.failures.set(n,(this.failures.get(n)||0)+1);
    if(this.failures.get(n)>=2&&!this.images.size&&n===this.manifest.frames[this.wanted][0])this.onUnavailable();
   }
  }finally{
   if(this.requests.get(n)===controller)this.requests.delete(n);
   // Stop background fill at the memory budget rather than evicting/refetching forever.
   if(!this.disposed){this.pumpDecodes();if(this.bytes<this.maxBytes)this.pump();}
  }
 }
 pumpDecodes(){
  // Decode a nearby available frame immediately even before the exact pack arrives.
  if(this.disposed||!this.active)return;
  const candidates=this.manifest.frames.map((_,n)=>n).filter(n=>this.packs.has(this.manifest.frames[n][0])&&!this.images.has(n)&&!this.decoding.has(n)&&(this.decodeFailures.get(n)||0)<2).sort((a,b)=>Math.abs(a-this.wanted)-Math.abs(b-this.wanted));
  for(const n of candidates.slice(0,2-this.decoding.size))if(Math.abs(n-this.wanted)<=18)this.loadImage(n);
 }
 async loadImage(n){
  const [pack,offset,length]=this.manifest.frames[n];this.decoding.add(n);
  try{
   const image=await this.decode(this.packs.get(pack).slice(offset,offset+length,'image/webp'));
   if(this.disposed){image.close();return;}
   this.images.set(n,image);
   while(this.images.size>this.maxImages){
    const key=[...this.images.keys()].sort((a,b)=>Math.abs(b-this.wanted)-Math.abs(a-this.wanted))[0];
    this.images.get(key).close();this.images.delete(key);
   }
   this.onReady();
  }catch{if(!this.disposed)this.decodeFailures.set(n,(this.decodeFailures.get(n)||0)+1);}
  finally{this.decoding.delete(n);if(!this.disposed)this.pump();}
 }
 nearest(n){
  const index=[...this.images.keys()].sort((a,b)=>Math.abs(a-n)-Math.abs(b-n))[0];
  return index===undefined?null:{index,image:this.images.get(index)};
 }
 dispose(){
  this.disposed=true;for(const controller of this.requests.values())controller.abort();this.requests.clear();
  for(const image of this.images.values())image.close();this.images.clear();this.packs.clear();this.bytes=0;
 }
}
