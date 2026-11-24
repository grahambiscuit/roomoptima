/* RoomOptima · js/forms.js
   Inline form validation engine and shared validators. */
'use strict';

/* ---------- form engine (inline validation) ---------- */
const forms={};
const reg=(n,fields,deps={},hooks={})=>{forms[n]={fields,deps,hooks}};
function val(id){
  const el=document.getElementById(id); if(!el) return '';
  if(el.type==='checkbox') return el.checked;
  if(el.dataset.multi!==undefined) return $$('input:checked',el).map(i=>i.value);
  return (el.value||'').trim();
}
function allVals(n){const o={};for(const id in forms[n].fields)o[id]=val(id);return o}
function showErr(id,msg){
  const el=document.getElementById(id); if(!el) return;
  const er=document.getElementById(id+'-e'); if(er) er.textContent=msg||'';
  const host=el.closest('.fld'); if(host) host.classList.toggle('invalid',!!msg);
  el.setAttribute('aria-invalid',msg?'true':'false');
}
function checkField(n,id){const F=forms[n];if(!F||!F.fields[id]||!document.getElementById(id))return true;const m=F.fields[id](val(id),allVals(n))||'';showErr(id,m);return !m}
function checkForm(n){
  let first=null;
  for(const id in forms[n].fields){ if(!checkField(n,id)&&!first) first=id }
  if(first){const el=document.getElementById(first);(el.dataset.multi!==undefined?el.querySelector('summary'):el).focus()}
  return !first;
}
function fieldEvent(e){
  const el=e.target.closest&&e.target.closest('[data-f]'); if(!el) return;
  const n=el.dataset.f, id=el.id, F=forms[n]; if(!F) return;
  const t=e.type;
  if(t==='input'&&el.dataset.digits!==undefined){
    const c=el.value.replace(/\D/g,'');
    if(c!==el.value){el.value=c;el.dataset.t=1;showErr(id,el.dataset.dmsg||'Numbers only');return}
  }
  let validate=false;
  if(t==='change'){el.dataset.t=1;validate=true}
  else if(t==='input'){el.dataset.t=1;validate=!!(el.closest('.fld')&&el.closest('.fld').classList.contains('invalid'))}
  else if(t==='focusout'){if(el.dataset.t||(typeof el.value==='string'&&el.value&&el.type!=='checkbox')){el.dataset.t=1;validate=true}}
  if(validate&&F.fields[id]){
    checkField(n,id);
    (F.deps[id]||[]).forEach(d=>{const de=document.getElementById(d);if(de&&de.dataset.t)checkField(n,d)});
  }
  if(t!=='focusout'&&F.hooks[id]) F.hooks[id](el);
}
['input','change','focusout'].forEach(t=>document.addEventListener(t,fieldEvent));

/* ---------- shared validators ---------- */
const nameErr=v=>!v?'Full name is required':(!/^[A-Za-zÑñ'’.\- ]+, [A-Za-zÑñ'’.\- ]+( [A-Z]\.)?$/.test(v)?'Use the format Last Name, First Name M.I. (e.g. Bunan, Marc)':'');
const intErr=(v,min,max,label)=>{if(v==='')return label+' is required';if(!/^\d+$/.test(v)||+v<min||+v>max)return `${label} must be a whole number from ${min} to ${max}`;return ''};
