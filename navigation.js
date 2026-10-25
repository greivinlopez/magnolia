const toggle=document.querySelector('#menu-toggle');
const dialog=document.querySelector('#mobile-menu');
const close=document.querySelector('#menu-close');
toggle.addEventListener('click',()=>{
 dialog.showModal();toggle.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');close.focus();
});
function closeMenu(){dialog.close();}
close.addEventListener('click',closeMenu);
dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)closeMenu();}});
// Keep keyboard focus within the menu, including browsers that cycle via browser chrome.
dialog.addEventListener('keydown',event=>{
 if(event.key!=='Tab')return;
 const items=[...dialog.querySelectorAll('button,a[href]')],first=items[0],last=items.at(-1);
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});
// Native modal dialog makes the page inert and supports Escape.
dialog.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');toggle.focus({preventScroll:true});});
dialog.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
 closeMenu();const target=document.querySelector(link.getAttribute('href'));
 if(target){target.setAttribute('tabindex','-1');requestAnimationFrame(()=>target.focus({preventScroll:true}));}
}));
matchMedia('(max-width: 760px)').addEventListener('change',event=>{if(!event.matches&&dialog.open)closeMenu();});
