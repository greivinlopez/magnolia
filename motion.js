// Responsive sequences: select first, then request only that variant.
const $=s=>document.querySelector(s);
const mobile=matchMedia('(max-width: 760px)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const connection=navigator.connection;
const canvas=$('#film'),ctx=canvas.getContext('2d',{alpha:false}),story=$('.story'),stage=$('.stage');
const cache=new Map(),pending=new Map(),failed=new Map();
const MAX_CACHE=18,MAX_PENDING=3;
let manifest=null,current=null,wanted=0,raf=0,epoch=0,controller=null,disposed=false,unavailable=false;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const still=()=>unavailable||reduced.matches||Boolean(connection?.saveData);
function draw(img){
 if(!img)return;
 const dpr=Math.min(devicePixelRatio||1,1.5),w=Math.round(stage.clientWidth*dpr),h=Math.round(stage.clientHeight*dpr);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 const scale=Math.max(w/img.width,h/img.height),dw=img.width*scale,dh=img.height*scale;
 ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);
 canvas.classList.add('ready');
}
function visibility(el,value){el.style.opacity=value;el.inert=value<.5;el.style.pointerEvents=value>=.5?'auto':'none';el.setAttribute('aria-hidden',value<.01?'true':'false');}
function timeAt(p){
 const beats=mobile.matches?[[0,0],[.06,0],[.2,2.4],[.7,8],[.92,10],[1,10]]:[[0,0],[.16,2.4],[.22,2.4],[.65,8],[.84,10.6],[.94,12],[1,12]];
 for(let i=1;i<beats.length;i++){const [b,t]=beats[i],[a,from]=beats[i-1];if(p<=b)return from+(t-from)*(p-a)/(b-a);}return 12;
}
function evict(){while(cache.size>MAX_CACHE){const key=[...cache.keys()].sort((a,b)=>Math.abs(b-wanted)-Math.abs(a-wanted))[0];cache.get(key).close();cache.delete(key);}}
async function loadFrame(n){
 const version=epoch,signal=controller.signal,url=manifest.pattern.replace('{index}',String(n).padStart(4,'0'));
 pending.set(n,version);
 try{
  const response=await fetch(url,{signal});if(!response.ok)throw Error('Frame unavailable');
  const bitmap=await createImageBitmap(await response.blob());
  if(disposed||version!==epoch||signal.aborted){bitmap.close();return;}
  cache.set(n,bitmap);evict();
  if(n===wanted){current=n;draw(bitmap);}
 }catch(error){if(version===epoch&&error.name!=='AbortError')failed.set(n,(failed.get(n)||0)+1);}
 finally{if(version===epoch){pending.delete(n);queueNearby();}}
}
function queueNearby(){
 if(disposed||!manifest||still())return;
 for(const offset of [0,1,-1,2,-2,3,-3,5,-5]){
  const n=clamp(wanted+offset,0,manifest.count-1);if(pending.size>=MAX_PENDING)break;
  if(!cache.has(n)&&!pending.has(n)&&(failed.get(n)||0)<2)loadFrame(n);
 }
}
function update(){
 raf=0;const travel=story.offsetHeight-stage.clientHeight;
 const p=still()?0:clamp(-story.getBoundingClientRect().top/Math.max(1,travel));
 $('#progress').style.width=`${p*100}%`;
 visibility($('.chapter-open'),mobile.matches?clamp((.22-p)/.1):clamp((.27-p)/.09));
 const reveal=mobile.matches?clamp((p-.84)/.08):clamp((p-.68)/.07)*clamp((.89-p)/.05);
 visibility($('.chapter-reveal'),still()?0:reveal);
 stage.style.setProperty('--reveal',mobile.matches?reveal:0);
 $('#chapter-label').textContent=p<.25?'01 / OBSERVAR':p<.7?'02 / ACERCARSE':p<.92?'03 / DESCUBRIR':'04 / FLORECER';
 if(!manifest||still())return;
 wanted=Math.round(clamp(timeAt(p)/manifest.duration)*(manifest.count-1));
 if(cache.has(wanted)){current=wanted;draw(cache.get(wanted));}
 queueNearby();
}
function schedule(){if(!raf&&!disposed)raf=requestAnimationFrame(update);}
async function selectSequence(){
 epoch++;const version=epoch;controller?.abort();controller=new AbortController();
 for(const bitmap of cache.values())bitmap.close();cache.clear();pending.clear();failed.clear();
 manifest=null;current=null;unavailable=false;canvas.classList.remove('ready');
 document.body.classList.toggle('still-story',still());schedule();
 // HTML picture supplies the correct poster even when the manifest fails.
 if(still()||disposed)return;
 try{
  const r=await fetch(mobile.matches?'assets/mobile/manifest.json':'assets/manifest.json',{signal:controller.signal});
  if(!r.ok)throw Error('Manifest unavailable');const next=await r.json();
  if(version!==epoch||disposed)return;
  manifest=next;schedule();
 }catch(error){if(version===epoch&&error.name!=='AbortError'){unavailable=true;document.body.classList.add('still-story');schedule();console.warn('Animation unavailable; showing the responsive poster.');}}
}
mobile.addEventListener('change',selectSequence);reduced.addEventListener('change',selectSequence);connection?.addEventListener?.('change',selectSequence);
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{if(cache.has(current))draw(cache.get(current));schedule();});
addEventListener('pagehide',()=>{disposed=true;epoch++;controller?.abort();cancelAnimationFrame(raf);raf=0;for(const bitmap of cache.values())bitmap.close();cache.clear();});
addEventListener('pageshow',event=>{if(event.persisted){disposed=false;selectSequence();}});
selectSequence();
