/* RoomOptima · js/actions.js
   Form submit handlers and click actions (event delegation). */
'use strict';

/* ---------- submit handlers ---------- */
const handlers={
  lg:signIn,
  bk:submitBooking,
  cx:f=>{
    const b=S.bookings.find(x=>x.id===f.dataset.id),a=allVals('cx');
    const late=(pd(b.startDate).getTime()+tm(b.startTime)*60000)-Date.now()<864e5;
    Object.assign(b,{status:'cancelled',cancelReason:a['cx-reason']==='Other'?a['cx-other']:a['cx-reason'],cancelledAt:Date.now(),lateCancel:late});
    save();closeModal();render();toast(`Booking for Room ${b.roomNo} cancelled.`,'ok');
  },
  rm:f=>{
    const id=f.dataset.id,a=allVals('rm');
    const data={number:a['rm-no'],type:a['rm-type'],building:a['rm-bld'],floor:a['rm-floor'],wing:a['rm-wing'],capacity:+a['rm-cap'],equipment:a['rm-eq'],status:$('#rm-status').value};
    if(id){
      const r=S.rooms.find(x=>x.id===id),old=r.number;Object.assign(r,data);
      if(old!==data.number)S.bookings.forEach(b=>{if(b.roomNo===old)b.roomNo=data.number});
      toast(`Room ${data.number} updated.`,'ok');
    }else{S.rooms.push({id:'r'+data.number,...data});ui.sel='r'+data.number;toast(`Room ${data.number} added.`,'ok')}
    save();closeModal();render();
  },
  rc:()=>{recommend();$('#rc-out').innerHTML=recHtml()},
  pf:()=>{
    const a=allVals('pf');me.name=a['pf-name'];me.idNo=a['pf-id'];me.contact=a['pf-contact'];save();
    $('#sf-name').textContent=me.name;$('#tb-name').textContent=me.name;const i=initials(me.name).toUpperCase();$('#sf-av').textContent=i;$('#tb-av').textContent=i;
    render();toast('Profile saved.','ok');
  },
  pw:()=>{me.password=val('pw-new');save();render();toast('Password changed.','ok')},
  policy:()=>{S.policy={defaultStatus:$('#po-status').value,maxHours:+$('#po-hours').value,advanceDays:+$('#po-days').value,maxDays:+$('#po-span').value};save();toast('Booking policy saved.','ok')},
  fg:()=>{const d=$('#fg-done');d.hidden=false;d.textContent='Request noted. A reset link will be sent to this address.'}
};
document.addEventListener('submit',e=>{
  const f=e.target.closest('[data-submit]');if(!f)return;
  e.preventDefault();
  const n=f.dataset.submit;
  if(forms[n]&&!checkForm(n))return;
  if(handlers[n])handlers[n](f);
});

/* ---------- click actions ---------- */
const actions={
  go:a=>{closeModal();location.hash=a.dataset.to},
  'toggle-nav':()=>document.body.classList.toggle('nav-open'),
  'close-modal':closeModal,
  'confirm-yes':()=>{const f=pendingFn;closeModal();if(f)f()},
  policies:openPolicy,
  'close-policy':closePolicy,
  signout:signOut,
  'show-login':()=>showView('login'),
  'show-landing':()=>showView('landing'),
  scroll:a=>{const t=document.getElementById(a.dataset.to);if(t)t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})},
  'scroll-top':()=>$('#landing-view').scrollTo({top:0}),
  'toggle-pass':a=>{const i=$('#'+a.dataset.for);const s=i.type==='password';i.type=s?'text':'password';a.setAttribute('aria-label',s?'Hide password':'Show password');a.setAttribute('aria-pressed',s);$('.ic-on',a).toggleAttribute('hidden',s);$('.ic-off',a).toggleAttribute('hidden',!s)},
  forgot:()=>{
    reg('fg',{'fg-email':v=>!v?'Email is required':!/^[^\s@]+@gordoncollege\.edu\.ph$/i.test(v)?'Use your @gordoncollege.edu.ph email address':''});
    openModal('Reset password',`<form data-submit="fg" novalidate><div class="modal-b"><p class="muted">Enter your institutional email and we will record a reset request.</p>${fld('fg-email','Institutional email',inp('fg-email','fg',$('#lg-email').value,{type:'email',ph:'firstname.lastname@gordoncollege.edu.ph'}),{req:1})}<div class="sum" id="fg-done" style="font-size:13px" hidden></div></div><div class="modal-f"><button type="button" class="btn" data-act="close-modal">Close</button><button class="btn btn-pri" type="submit">Send request</button></div></form>`,460);
  },
  'new-booking':a=>openBooking({room:a.dataset.room,date:a.dataset.date,start:a.dataset.start,end:a.dataset.end,size:a.dataset.size}),
  'edit-booking':a=>openBooking({},a.dataset.id),
  'cancel-booking':a=>openCancel(a.dataset.id),
  'confirm-booking':a=>{const b=S.bookings.find(x=>x.id===a.dataset.id);if(b){b.status='confirmed';save();render();toast(`Room ${b.roomNo} booking confirmed.`,'ok')}},
  'pick-room':a=>{ui.sel=a.dataset.id;$('#rooms-body').innerHTML=roomsBody()},
  'add-room':()=>openRoom(null),
  'edit-room':a=>openRoom(a.dataset.id),
  'delete-room':a=>{
    const r=S.rooms.find(x=>x.id===a.dataset.id),up=S.bookings.filter(b=>active(b)&&b.roomNo===r.number&&b.endDate>=today()).length;
    if(up){openModal(`Can’t delete Room ${esc(r.number)}`,`<div class="modal-b"><div class="warn"><div class="wi">${ic('alert')}</div><div><h3>Room ${esc(r.number)} has ${up} upcoming booking(s)</h3><p class="muted">Cancel or move those bookings first, then delete the room.</p></div></div></div><div class="modal-f"><button type="button" class="btn btn-pri" data-act="close-modal">Close</button></div>`,460);return}
    confirmModal({title:`Delete Room ${esc(r.number)}?`,msg:'This removes the room from the system. This cannot be undone.',yes:'Yes, Delete Room',keep:'Keep Room',fn:()=>{S.rooms=S.rooms.filter(x=>x.id!==r.id);save();render();toast(`Room ${r.number} deleted.`,'ok')}});
  },
  chip:a=>{ui[a.dataset.k]=a.dataset.v;$$('.chipb',a.parentNode).forEach(c=>c.setAttribute('aria-pressed',c===a));refreshList()},
  'clear-date':()=>{ui.bd='';const i=$('#bd-filter');if(i)i.value='';refreshList()},
  'bulk-confirm':()=>{const n=S.bookings.filter(b=>b.status==='reserved').length;if(!n)return toast('No reserved bookings to confirm.');confirmModal({title:`Confirm ${n} reserved booking(s)?`,msg:'Every booking with the status Reserved becomes Confirmed.',yes:'Yes, Confirm All',danger:false,keep:'Cancel',fn:()=>{S.bookings.forEach(b=>{if(b.status==='reserved')b.status='confirmed'});save();render();toast(`${n} booking(s) confirmed.`,'ok')}})},
  'bulk-stale':()=>{const l=S.bookings.filter(b=>b.status==='reserved'&&b.endDate<today());if(!l.length)return toast('No stale reservations found.');confirmModal({title:`Cancel ${l.length} stale reservation(s)?`,msg:'These Reserved bookings ended before today and were never confirmed.',yes:'Yes, Cancel Them',keep:'Keep Them',fn:()=>{l.forEach(b=>{b.status='cancelled';b.cancelReason='Not confirmed before the booking date'});save();render();toast(`${l.length} reservation(s) cancelled.`,'ok')}})},
  'bulk-reset':()=>confirmModal({title:'Reset all rooms to Available?',msg:'Every room status, including maintenance, is set back to Available.',yes:'Yes, Reset Rooms',keep:'Cancel',fn:()=>{S.rooms.forEach(r=>r.status='available');save();render();toast('All rooms reset to Available.','ok')}})
};
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');
  if(a&&actions[a.dataset.act]&&!a.disabled){e.preventDefault();actions[a.dataset.act](a)}
  if(e.target.closest('.nav-i'))document.body.classList.remove('nav-open');
});
function refreshList(){
  if(route==='rooms')$('#rooms-body').innerHTML=roomsBody();
  else if(route==='bookings')$('#bk-rows').innerHTML=bookingRows();
}
function uiEvent(e){
  const el=e.target.closest&&e.target.closest('[data-ui]');if(!el)return;
  const k=el.dataset.ui;ui[k]=k==='cap'?+el.value:el.value;
  if(k==='sd'){if(!el.value){ui.sd=today()}$('#sched-body').innerHTML=schedTable()}else refreshList();
}
document.addEventListener('input',uiEvent);document.addEventListener('change',uiEvent);
