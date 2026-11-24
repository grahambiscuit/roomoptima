/* RoomOptima · js/pages/bookings.js
   Bookings list, booking dialog and cancellation dialog. */
'use strict';

/* ---------- booking rows ---------- */
function bkActions(b){
  if(b.status==='cancelled'||b.endDate<today()) return '<span class="muted">None</span>';
  let h='';
  if(canManage(b)) h+=`<button class="btn btn-sm" data-act="edit-booking" data-id="${b.id}">Edit</button>`;
  if(isAdmin()&&b.status==='reserved') h+=`<button class="btn btn-sm btn-pri" data-act="confirm-booking" data-id="${b.id}">Confirm</button>`;
  if(canManage(b)) h+=`<button class="btn btn-sm btn-soft-danger" data-act="cancel-booking" data-id="${b.id}">Cancel</button>`;
  return `<div class="row-actions">${h}</div>`;
}
const empty=(t,s)=>`<div class="empty"><b>${t}</b>${s||''}</div>`;

/* ---------- bookings page ---------- */
function bookingList(){
  let b=[...S.bookings].sort((x,y)=>(x.startDate+x.startTime).localeCompare(y.startDate+y.startTime));
  if(!isAdmin()) b=b.filter(mine);
  if(ui.bs!=='all') b=b.filter(x=>x.status===ui.bs);
  if(ui.bd) b=b.filter(x=>covers(x,ui.bd));
  return b;
}
function bookingRows(){
  const b=bookingList();
  const c=$('#bk-count'); if(c) c.textContent=b.length;
  if(!b.length) return `<tr><td colspan="8">${empty('No bookings found','Change the filters or create a new booking.')}</td></tr>`;
  return b.map(x=>`<tr><td><b>Room ${esc(x.roomNo)}</b></td><td>${esc(x.bookedBy)}</td><td>${esc(x.purpose)}${x.status==='cancelled'&&x.cancelReason?`<small>Reason: ${esc(x.cancelReason)}</small>`:''}</td><td>${fmtRange(x.startDate,x.endDate)}</td><td>${fmtTimes(x.startTime,x.endTime)}</td><td>${x.groupSize}</td><td>${badge(x.status)}</td><td>${bkActions(x)}</td></tr>`).join('');
}
function pgBookings(){
  const n=bookingList().length;
  return `<div class="page-h"><div><h1>Bookings</h1><p>${isAdmin()?'All room reservations':'Your room reservations'} · <b id="bk-count">${n}</b> records</p></div><button class="btn btn-pri" data-act="new-booking">+ New Booking</button></div>
  <div class="filters"><select class="in" data-ui="bs" aria-label="Status">${opts([['all','All statuses'],['reserved','Reserved'],['confirmed','Confirmed'],['cancelled','Cancelled']],ui.bs)}</select>
   <input class="in" type="date" data-ui="bd" id="bd-filter" value="${esc(ui.bd)}" aria-label="Show bookings on date"><button class="btn btn-sm" data-act="clear-date">Clear date</button></div>
  <div class="card"><div class="tw"><table><thead><tr><th>Room</th><th>Booked by</th><th>Purpose</th><th>Start – end date</th><th>Time</th><th>Group</th><th>Status</th><th>Actions</th></tr></thead><tbody id="bk-rows">${bookingRows()}</tbody></table></div></div>`;
}

/* booking modal */
function openBooking(pre={},editId=null){
  const b=editId?S.bookings.find(x=>x.id===editId):null, p=S.policy, t=today();
  const rooms=S.rooms.filter(r=>r.status!=='maintenance'||(b&&b.roomNo===r.number));
  const v={room:b?b.roomNo:(pre.room||''),sd:b?b.startDate:(pre.date||t),ed:b?b.endDate:(pre.date||t),st:b?b.startTime:(pre.start||''),et:b?b.endTime:(pre.end||''),name:b?b.bookedBy:me.name,size:b?b.groupSize:(pre.size||''),purpose:b?b.purpose:(pre.purpose||''),status:b?b.status:(isAdmin()?'confirmed':p.defaultStatus)};
  const maxD=addDays(t,p.advanceDays);
  reg('bk',{
    'bk-room':x=>x?'':'Select a room',
    'bk-sd':x=>!x?'Start date is required':(!b&&x<t)?'Start date can’t be in the past':x>maxD?`Bookings open up to ${p.advanceDays} days ahead (until ${fmtDate(maxD)})`:'',
    'bk-ed':(x,a)=>!x?'End date is required':(a['bk-sd']&&x<a['bk-sd'])?'End date can’t be earlier than the start date':(a['bk-sd']&&dayDiff(a['bk-sd'],x)+1>p.maxDays)?`A booking can last at most ${p.maxDays} day(s)`:'',
    'bk-st':(x,a)=>!x?'Select a start time':(!b&&a['bk-sd']===t&&tm(x)<nowMin())?'That start time has already passed':'',
    'bk-et':(x,a)=>!x?'Select an end time':(a['bk-st']&&tm(x)<=tm(a['bk-st']))?'End time must be after the start time':(a['bk-st']&&tm(x)-tm(a['bk-st'])>p.maxHours*60)?`Maximum ${p.maxHours} hour(s) per booking`:'',
    'bk-name':nameErr,
    'bk-size':(x,a)=>{if(x==='')return 'Group size is required';if(!/^\d+$/.test(x)||+x<1)return 'Enter a whole number of 1 or more';const r=roomOf(a['bk-room']);if(!r)return 'Select a room first';return +x>r.capacity?`Exceeds room capacity (max ${r.capacity})`:''},
    'bk-purpose':x=>x.length<5?'Purpose is required (at least 5 characters)':x.length>80?'Keep the purpose under 80 characters':'',
    'bk-terms':x=>x?'':'You must accept the Terms & Conditions to continue'
  },{'bk-room':['bk-size'],'bk-sd':['bk-ed','bk-st'],'bk-st':['bk-et'],'bk-ed':[]},{
    'bk-sd':()=>{const s=$('#bk-sd'),e=$('#bk-ed');if(s.value&&(!e.value||e.value<s.value)){e.value=s.value;showErr('bk-ed','')}},
    'bk-room':()=>{const r=roomOf($('#bk-room').value);$('#bk-info').textContent=r?`Capacity ${r.capacity} persons · ${r.equipment.join(', ')||'No equipment'} · ${r.wing}`:'Choose a room to see its capacity and equipment.';const s=$('#bk-size');if(r)s.setAttribute('maxlength','3')}
  });
  openModal(b?'Edit Booking':'New Booking',`<form id="bk-form" data-submit="bk" data-id="${editId||''}" novalidate><div class="modal-b">
   <div class="form-err" id="bk-conflict" role="alert"></div>
   ${fld('bk-room','Room',slc('bk-room','bk',rooms.map(r=>[r.number,roomLabel(r)]),v.room,'Select room'),{req:1,hint:'<span id="bk-info"></span>'})}
   <div class="form-grid">
    ${fld('bk-sd','Start date',inp('bk-sd','bk',v.sd,{type:'date',attrs:`min="${b?'':t}" max="${maxD}"`}),{req:1})}
    ${fld('bk-ed','End date',inp('bk-ed','bk',v.ed,{type:'date',attrs:`min="${t}"`}),{req:1})}
    ${fld('bk-st','Start time',slc('bk-st','bk',TIMES.slice(0,-1).map(x=>[x,f12(x)]),v.st,'Select time'),{req:1})}
    ${fld('bk-et','End time',slc('bk-et','bk',TIMES.slice(1).map(x=>[x,f12(x)]),v.et,'Select time'),{req:1,hint:`Up to ${p.maxHours} hour(s) per booking`})}
    ${fld('bk-name','Booked by (Last Name, First Name M.I.)',inp('bk-name','bk',v.name,{ro:!isAdmin(),ph:'Bunan, Marc'}),{req:1,hint:isAdmin()?'You can book on behalf of someone else.':'Filled in from your profile.'})}
    ${fld('bk-size','Group size',inp('bk-size','bk',v.size,{ph:'e.g. 25',attrs:'inputmode="numeric" maxlength="3" data-digits data-dmsg="Numbers only"'}),{req:1})}
   </div>
   ${fld('bk-purpose','Purpose',inp('bk-purpose','bk',v.purpose,{ph:'e.g. ADET Class, BSCS 3-C'}),{req:1})}
   ${isAdmin()?fld('bk-status','Status',slc('bk-status','bk-x',[['reserved','Reserved'],['confirmed','Confirmed']],v.status==='cancelled'?'reserved':v.status)):''}
   ${termsBox('bk-terms','bk')}
  </div><div class="modal-f"><button type="button" class="btn" data-act="close-modal">Cancel</button><button class="btn btn-pri" type="submit">${b?'Save Changes':'Submit Booking'}</button></div></form>`,620);
  forms.bk.hooks['bk-room']();
}
function submitBooking(form){
  const id=form.dataset.id||null,a=allVals('bk'),r=roomOf(a['bk-room']);
  const c=conflict(a['bk-room'],a['bk-sd'],a['bk-ed'],a['bk-st'],a['bk-et'],id);
  if(c){$('#bk-conflict').textContent=`Room ${r.number} is already booked ${fmtRange(c.startDate,c.endDate)}, ${fmtTimes(c.startTime,c.endTime)} (${c.bookedBy}). Pick another time or room.`;showErr('bk-st','Time clashes with an existing booking');return}
  const st=isAdmin()?$('#bk-status').value:null;
  if(id){
    const b=S.bookings.find(x=>x.id===id);
    Object.assign(b,{roomNo:r.number,startDate:a['bk-sd'],endDate:a['bk-ed'],startTime:a['bk-st'],endTime:a['bk-et'],bookedBy:a['bk-name'],groupSize:+a['bk-size'],purpose:a['bk-purpose']});
    if(st) b.status=st;
    toast('Booking updated.','ok');
  }else{
    S.bookings.push({id:uid(),roomNo:r.number,startDate:a['bk-sd'],endDate:a['bk-ed'],startTime:a['bk-st'],endTime:a['bk-et'],bookedBy:a['bk-name'],ownerEmail:me.email,purpose:a['bk-purpose'],groupSize:+a['bk-size'],status:st||S.policy.defaultStatus,createdAt:Date.now()});
    toast(`Room ${r.number} booked${(st||S.policy.defaultStatus)==='reserved'?'. Waiting for administrator confirmation.':'.'}`,'ok');
  }
  save();closeModal();render();
}

/* cancellation modal */
function openCancel(id){
  const b=S.bookings.find(x=>x.id===id); if(!b) return;
  reg('cx',{
    'cx-reason':x=>x?'':'Select a reason for cancelling',
    'cx-other':(x,a)=>a['cx-reason']==='Other'&&x.length<5?'Tell us the reason (at least 5 characters)':'',
    'cx-ack':x=>x?'':'Please confirm that you understand the cancellation policy'
  },{'cx-reason':['cx-other']},{'cx-reason':()=>{$('#cx-other-wrap').hidden=$('#cx-reason').value!=='Other'}});
  const r=roomOf(b.roomNo);
  openModal('Cancel Booking',`<form id="cx-form" data-submit="cx" data-id="${id}" novalidate><div class="modal-b">
   <div class="warn"><div class="wi">${ic('alert')}</div><div><h3>Cancel this booking?</h3><p class="muted">The room becomes free for other students and staff.</p></div></div>
   <div class="sum"><dl class="kv" style="margin:0"><dt>Room</dt><dd>Room ${esc(b.roomNo)}${r?' · '+esc(r.type):''}</dd><dt>Dates</dt><dd>${fmtRange(b.startDate,b.endDate)}</dd><dt>Time</dt><dd>${fmtTimes(b.startTime,b.endTime)}</dd><dt>Booked by</dt><dd>${esc(b.bookedBy)}</dd><dt>Purpose</dt><dd>${esc(b.purpose)}</dd></dl></div>
   ${fld('cx-reason','Reason for cancelling',slc('cx-reason','cx',REASONS,'','Select a reason'),{req:1})}
   <div id="cx-other-wrap" hidden>${fld('cx-other','Please explain',inp('cx-other','cx','',{ph:'Short explanation'}),{req:1})}</div>
   <div class="fld"><label class="chk"><input type="checkbox" id="cx-ack" data-f="cx" aria-describedby="cx-ack-e"><span>I understand that cancellations less than 24 hours before the start time are recorded under the Room Use Policy.</span></label><div class="err" id="cx-ack-e" role="alert"></div></div>
  </div><div class="modal-f"><button type="button" class="btn" data-act="close-modal">Keep Booking</button><button class="btn btn-danger" type="submit">Yes, Cancel Booking</button></div></form>`,500);
}
