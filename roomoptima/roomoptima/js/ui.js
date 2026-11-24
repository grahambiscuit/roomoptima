/* RoomOptima · js/ui.js
   Shared UI state, HTML builders for fields and badges, modals and toasts. */
'use strict';

/* ---------- ui state ---------- */
const ui={rs:'all',bld:'all',eq:'all',cap:0,q:'',sel:null,bs:'all',bd:'',sd:today(),rec:null};
let pendingFn=null, lastFocus=null;

/* ---------- small html helpers ---------- */
const badge=s=>`<span class="badge ${s}">${cap(s)}</span>`;
const opts=(list,sel,first)=>(first?`<option value="">${esc(first)}</option>`:'')+list.map(x=>{const [v,l]=Array.isArray(x)?x:[x,x];return `<option value="${esc(v)}"${String(v)===String(sel)?' selected':''}>${esc(l)}</option>`}).join('');
const fld=(id,label,ctl,{req,hint}={})=>`<div class="fld"><label for="${id}">${label}${req?' <span class="req" aria-hidden="true">*</span>':''}</label>${ctl}${hint?`<div class="hint" id="${id}-h">${hint}</div>`:''}<div class="err" id="${id}-e" role="alert"></div></div>`;
const inp=(id,f,v,{type='text',ph='',ro,attrs='',ac='off'}={})=>`<input class="in" id="${id}" data-f="${f}" type="${type}" value="${esc(v??'')}" ${ph?`placeholder="${esc(ph)}"`:''} ${ro?'readonly':''} autocomplete="${ac}" aria-describedby="${id}-e" ${attrs}>`;
const slc=(id,f,list,sel,first,attrs='')=>`<select class="in" id="${id}" data-f="${f}" aria-describedby="${id}-e" ${attrs}>${opts(list,sel,first)}</select>`;
const multi=(id,f,list,sel)=>`<details class="ms" id="${id}" data-f="${f}" data-multi><summary class="in" id="${id}-s">${sel.length?esc(sel.join(', ')):'Select equipment'}</summary><div class="ms-list">${list.map(x=>`<label class="chk"><input type="checkbox" value="${esc(x)}"${sel.includes(x)?' checked':''}> ${esc(x)}</label>`).join('')}</div></details>`;
const termsBox=(id,f)=>`<div class="fld"><label class="chk"><input type="checkbox" id="${id}" data-f="${f}" aria-describedby="${id}-e"><span>I have read and agree to the <button type="button" class="link" data-act="policies">Terms &amp; Conditions and Room Use Policy</button></span></label><div class="err" id="${id}-e" role="alert"></div></div>`;
const timeOpts=sel=>opts(TIMES.slice(0,-1).map(t=>[t,f12(t)]),sel,'Select time')+'';
const timeOptsEnd=sel=>opts(TIMES.slice(1).map(t=>[t,f12(t)]),sel,'Select time');

/* ---------- modal, toast ---------- */
function shell(kind,title,inner,w,closeAct){
  return `<div class="scrim" data-scrim="${kind}"${kind==='policy'?' style="z-index:110"':''}><div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title-${kind}" style="--mw:${w}px"><div class="modal-h"><h2 id="m-title-${kind}">${title}</h2><button type="button" class="x" data-act="${closeAct}" aria-label="Close dialog">${ic('x')}</button></div>${inner}</div></div>`;
}
function openModal(title,inner,w=520){
  lastFocus=document.activeElement;
  $('#modal-root').innerHTML=shell('main',title,inner,w,'close-modal');
  const f=$('#modal-root .in:not([readonly]),#modal-root summary,#modal-root .btn');
  if(f) setTimeout(()=>f.focus(),30);
}
function closeModal(){$('#modal-root').innerHTML='';pendingFn=null;if(lastFocus&&lastFocus.focus&&document.contains(lastFocus))lastFocus.focus();lastFocus=null}
let lastFocus2=null;
function openPolicy(){
  lastFocus2=document.activeElement;
  $('#modal-root2').innerHTML=shell('policy','Terms &amp; Conditions and Room Use Policy',policyHtml(),560,'close-policy');
  setTimeout(()=>{const b=$('#modal-root2 .btn');if(b)b.focus()},30);
}
function closePolicy(){$('#modal-root2').innerHTML='';if(lastFocus2&&lastFocus2.focus&&document.contains(lastFocus2))lastFocus2.focus();lastFocus2=null}
function toast(msg,kind=''){
  const t=document.createElement('div');t.className='toast '+kind;t.textContent=msg;$('#toasts').appendChild(t);
  setTimeout(()=>t.remove(),3600);
}
function confirmModal({title,msg,yes,danger=true,keep='Keep',fn}){
  pendingFn=fn;
  openModal(title,`<div class="modal-b"><div class="warn"><div class="wi">${ic('alert')}</div><div><h3>${title}</h3><p class="muted">${msg}</p></div></div></div><div class="modal-f"><button type="button" class="btn" data-act="close-modal">${keep}</button><button type="button" class="btn ${danger?'btn-danger':'btn-pri'}" data-act="confirm-yes">${yes}</button></div>`,460);
}
let downOnScrim='';
document.addEventListener('mousedown',e=>{downOnScrim=e.target.matches&&e.target.matches('[data-scrim]')?e.target.dataset.scrim:''});
document.addEventListener('click',e=>{
  if(downOnScrim&&e.target.matches&&e.target.matches('[data-scrim]')&&e.target.dataset.scrim===downOnScrim){downOnScrim==='policy'?closePolicy():closeModal()}
  downOnScrim='';
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#modal-root2 .scrim'))closePolicy();else if($('#modal-root .scrim'))closeModal();else document.body.classList.remove('nav-open')}});
