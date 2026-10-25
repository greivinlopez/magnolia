const $=s=>document.querySelector(s);
async function initContent(){
const content=await fetch('content.json').then(r=>{if(!r.ok)throw Error('Content unavailable');return r.json()});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('#service-list').innerHTML=content.services.map(s=>`<details class="service"><summary><span class="service-number">${s.number}</span><div><h3>${escape(s.title)}</h3><span class="short">${escape(s.short)}</span></div><span class="plus" aria-hidden="true">+</span></summary><div class="service-body"><p class="audience">${escape(s.audience)}</p><p>${escape(s.description)}</p><div class="topics">${s.topics.map(([t,d])=>`<div><h4>${escape(t)}</h4><p>${escape(d)}</p></div>`).join('')}</div><p class="deliverable"><strong>Lo que te llevas</strong><br>${escape(s.deliverable)}</p><a class="text-link service-cta" href="#contacto" data-service="${s.number}">Hablemos de este servicio <span>↗</span></a></div></details>`).join('');
document.querySelectorAll('.service-cta').forEach(a=>a.addEventListener('click',()=>{$('#service').selectedIndex=Number(a.dataset.service)-1;}));
const contact=content.contact;
if(contact.email){$('#contact-submit').innerHTML='Abrir correo <span>↗</span>';$('#contact-note').textContent='Se abrirá tu aplicación de correo con la consulta preparada. Revisa y envía el mensaje desde allí.';}
for(const phone of (Array.isArray(contact.whatsapp)?contact.whatsapp:[contact.whatsapp]).filter(Boolean)){const a=document.createElement('a');a.href=`https://wa.me/${phone.replace(/\D/g,'')}`;a.textContent=`WhatsApp +${phone.slice(0,3)} ${phone.slice(3,7)} ${phone.slice(7)} ↗`;$('#contact-links').append(a);}
if(contact.email){const a=document.createElement('a');a.href=`mailto:${contact.email}`;a.textContent=contact.email;$('#contact-links').append(a);}
if(contact.bookingUrl&&/^https:\/\//.test(contact.bookingUrl)){const a=document.createElement('a');a.href=contact.bookingUrl;a.textContent='Reservar una cita ↗';$('#contact-links').append(a);}
$('#contact-form').addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const text=`Hola, Magnolia.\n\nSoy ${f.get('name')}. Me gustaría ${String(f.get('intent')).toLowerCase()}.\nServicio: ${f.get('service')}\n\n${f.get('message')}`;if(contact.email){location.href=`mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(f.get('intent')+' — Magnolia')}&body=${encodeURIComponent(text)}`;}else{try{await navigator.clipboard.writeText(text);$('#contact-note').textContent='Consulta copiada. No se ha enviado: falta configurar el canal de contacto de Magnolia.';}catch{$('#contact-note').textContent=text+'\n\nNo se ha enviado. Copia este texto para conservar tu consulta.';}}});

}
initContent().catch(()=>{document.querySelector("#service-list").textContent="No se pudieron cargar los servicios. Recarga la página para intentarlo de nuevo.";});

