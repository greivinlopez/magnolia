import {FrameStore} from './frame-store.js';
const $=s=>document.querySelector(s);
const mobile=matchMedia('(max-width: 760px)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const connection=navigator.connection;
const canvas=$('#film'),ctx=canvas.getContext('2d',{alpha:false}),story=$('.story'),stage=$('.stage');
const opening=$('.chapter-open'),revealChapter=$('.chapter-reveal'),progress=$('#progress'),label=$('#chapter-label');
let manifest=null,store=null,current=null,position=null,raf=0,epoch=0,controller=null,disposed=false,unavailable=false;
let stageWidth=1,stageHeight=1,travel=1,storyTop=0,lastTick=0,previousTarget=0;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const still=()=>unavailable||reduced.matches||Boolean(connection?.saveData);
function measure(){
 const dpr=Math.min(devicePixelRatio||1,1.5);
 stageWidth=stage.clientWidth;stageHeight=stage.clientHeight;
 travel=Math.max(1,story.offsetHeight-stageHeight);storyTop=story.getBoundingClientRect().top+scrollY;
 const w=Math.round(stageWidth*dpr),h=Math.round(stageHeight*dpr);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;current=null;}
}
function draw(frame){
 if(!frame||frame.index===current)return;
 const img=frame.image,w=canvas.width,h=canvas.height;
 const scale=Math.max(w/img.width,h/img.height),dw=img.width*scale,dh=img.height*scale;
 ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);current=frame.index;canvas.dataset.frame=String(frame.index);canvas.classList.add('ready');
}
function visibility(el,value){el.style.opacity=value;el.inert=value<.5;el.style.pointerEvents=value>=.5?'auto':'none';el.setAttribute('aria-hidden',value<.01?'true':'false');}
function timeAt(p){
 const beats=mobile.matches?[[0,0],[.06,0],[.2,2.4],[.7,8],[.92,10],[1,10]]:[[0,0],[.16,2.4],[.22,2.4],[.65,8],[.84,10.6],[.94,12],[1,12]];
 for(let i=1;i<beats.length;i++){const [b,t]=beats[i],[a,from]=beats[i-1];if(p<=b)return from+(t-from)*(p-a)/(b-a);}return 12;
}
function update(now){
 raf=0;
 const p=still()?0:clamp((scrollY-storyTop)/travel);
 progress.style.width=`${p*100}%`;
 visibility(opening,mobile.matches?clamp((.22-p)/.1):clamp((.27-p)/.09));
 const reveal=mobile.matches?clamp((p-.84)/.08):clamp((p-.68)/.07)*clamp((.89-p)/.05);
 visibility(revealChapter,still()?0:reveal);
 stage.style.setProperty('--reveal',mobile.matches?reveal:0);
 label.textContent=p<.25?'01 / OBSERVAR':p<.7?'02 / ACERCARSE':p<.92?'03 / DESCUBRIR':'04 / FLORECER';
 if(!manifest||still())return;
 const active=scrollY+stageHeight>=storyTop&&scrollY<=storyTop+travel+stageHeight;
 const target=clamp(timeAt(p)/manifest.duration)*(manifest.count-1);
 const direction=Math.sign(target-previousTarget)||store.direction;previousTarget=target;
 // Download for the actual scroll position; soften wheel/touch steps only in rendering.
 store.setTarget(Math.round(target),direction,active&&!document.hidden);
 if(position===null||!active)position=target;
 const elapsed=Math.min(64,now-(lastTick||now-16));lastTick=now;
 position+=(target-position)*(1-Math.exp(-elapsed/65));
 if(Math.abs(target-position)<.15)position=target;
 draw(store.nearest(Math.round(position)));
 if(active&&Math.abs(target-position)>=.15)schedule();
}
function schedule(){if(!raf&&!disposed)raf=requestAnimationFrame(update);}
function fallback(version){
 if(version!==epoch||disposed)return;
 unavailable=true;store?.dispose();store=null;document.body.classList.add('still-story');measure();schedule();
}
async function selectSequence(){
 const version=++epoch;controller?.abort();controller=new AbortController();store?.dispose();store=null;
 manifest=null;current=null;position=null;lastTick=0;unavailable=false;canvas.classList.remove('ready');
 document.body.classList.toggle('still-story',still());measure();schedule();
 if(still()||disposed)return;
 try{
  const r=await fetch(mobile.matches?'assets/mobile/sequence.json':'assets/sequence.json',{signal:controller.signal});
  if(!r.ok)throw Error('Sequence unavailable');const next=await r.json();
  if(version!==epoch||disposed)return;
  manifest=next;store=new FrameStore(next,{onReady:schedule,onUnavailable:()=>fallback(version)});schedule();
 }catch(error){if(error.name!=='AbortError')fallback(version);}
}
mobile.addEventListener('change',selectSequence);reduced.addEventListener('change',selectSequence);connection?.addEventListener?.('change',selectSequence);
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{measure();schedule();});
document.addEventListener('visibilitychange',schedule);
// Font loading can shift content in responsive layouts.
const observer=new ResizeObserver(()=>{measure();schedule();});observer.observe(stage);observer.observe(story);
addEventListener('pagehide',()=>{disposed=true;epoch++;controller?.abort();store?.dispose();observer.disconnect();cancelAnimationFrame(raf);raf=0;});
addEventListener('pageshow',event=>{if(event.persisted){disposed=false;observer.observe(stage);observer.observe(story);selectSequence();}});
selectSequence();
