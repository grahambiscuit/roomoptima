/* RoomOptima · js/pages/rooms.js
   Rooms list, room detail panel and the add/edit room dialog. */
'use strict';

/* ---------- rooms page ---------- */
function filteredRooms(){
  const q=ui.q.toLowerCase();
  return S.rooms.filter(r=>(ui.rs==='all'||r.status===ui.rs)&&(ui.bld==='all'||r.building===ui.bld)&&(ui.eq==='all'||r.equipment.includes(ui.eq))&&r.capacity>=ui.cap&&(!q||`room ${r.number} ${r.type} ${r.building} ${r.floor} ${r.wing}`.toLowerCase().includes(q))).sort((a,b)=>a.number.localeCompare(b.number,undefined,{numeric:true}));
}
function floorMap(r){
  const wi=WINGS.indexOf(r.wing);
  return `<svg class="fmap" viewBox="0 0 300 100" role="img" aria-label="${esc(r.building)}, ${esc(r.floor)}, ${esc(r.wing)}">${WINGS.map((w,i)=>`<rect class="fw${i===wi?' on':''}" x="${6+i*150}" y="8" width="144" height="62" rx="6"/><text x="${78+i*150}" y="${i===wi?36:42}" text-anchor="middle" class="${i===wi?'on-t':''}">${w}</text>${i===wi?`<text x="${78+i*150}" y="54" text-anchor="middle" class="on-t">Room ${esc(r.number)}</text>`:''}`).join('')}<text class="cap" x="6" y="90">${esc(r.building)} · ${esc(r.floor)}</text></svg>`;
}
function roomDetail(r){
  if(!r) return `<div class="card detail">${empty('Select a room','Room details, location and today’s schedule appear here.')}</div>`;
  const t=today(),tb=S.bookings.filter(b=>active(b)&&b.roomNo===r.number&&covers(b,t)).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  return `<div class="card detail"><div><h2>Room ${esc(r.number)} · ${esc(r.type)}</h2><div style="margin-top:8px">${badge(r.status)}</div></div>
  ${floorMap(r)}
  <dl class="kv" style="margin:0"><dt>Building</dt><dd>${esc(r.building)}</dd><dt>Floor / side</dt><dd>${esc(r.floor)} · ${esc(r.wing)}</dd><dt>Capacity</dt><dd>${r.capacity} persons (maximum group size)</dd><dt>Equipment</dt><dd><div class="tags">${r.equipment.map(e=>`<span class="pill">${esc(e)}</span>`).join('')||'None listed'}</div></dd><dt>Open hours</dt><dd>7:00 AM – 6:00 PM</dd><dt>Room code</dt><dd>${roomCode(r.building,r.floor,r.number)}</dd></dl>
  <div><p class="lbl" style="margin-bottom:6px">Today’s schedule</p><div style="display:grid;gap:6px">${tb.length?tb.map(b=>`<div class="sch-item"><span><b>${fmtTimes(b.startTime,b.endTime)}</b> ${esc(lastName(b.bookedBy))}</span>${badge(b.status)}</div>`).join(''):'<p class="muted" style="font-size:12.5px">No bookings today.</p>'}</div></div>
  <div class="row-actions"><button class="btn btn-pri btn-sm" data-act="new-booking" data-room="${r.number}"${r.status==='maintenance'?' disabled':''}>Book this room</button>${isAdmin()?`<button class="btn btn-sm" data-act="edit-room" data-id="${r.id}">Edit</button><button class="btn btn-sm btn-soft-danger" data-act="delete-room" data-id="${r.id}">Delete</button>`:''}</div></div>`;
}
function roomsBody(){
  const list=filteredRooms();
  if(!list.find(r=>r.id===ui.sel)) ui.sel=list[0]?list[0].id:null;
  const grid=list.length?`<div class="room-grid">${list.map(r=>`<button class="room ${r.status}" data-act="pick-room" data-id="${r.id}" aria-pressed="${r.id===ui.sel}"><span class="no">Room ${esc(r.number)}</span><span class="ty">${esc(r.type)}</span>${badge(r.status)}<span class="meta">${esc(r.building)} · ${esc(r.floor)}</span><span class="meta">Capacity ${r.capacity}</span><span class="meta">${esc(r.equipment.join(', ')||'No equipment')}</span></button>`).join('')}</div>`:`<div class="card">${empty('No rooms match these filters','Try clearing a filter.')}</div>`;
  return `<div class="rooms-layout"><div>${grid}</div>${roomDetail(S.rooms.find(r=>r.id===ui.sel))}</div>`;
}
function pgRooms(){
  return `<div class="page-h"><div><h1>Rooms</h1><p>Browse campus rooms, their locations and equipment.</p></div>${isAdmin()?'<button class="btn btn-pri" data-act="add-room">+ Add Room</button>':''}</div>
  <div class="filters"><div class="chips" role="group" aria-label="Filter by status">${['all',...STATUSES].map(s=>`<button class="chipb" data-act="chip" data-k="rs" data-v="${s}" aria-pressed="${ui.rs===s}">${cap(s)}</button>`).join('')}</div>
   <select class="in" data-ui="bld" aria-label="Building">${opts([['all','All buildings'],...Object.keys(BUILDINGS)],ui.bld)}</select>
   <select class="in" data-ui="eq" aria-label="Equipment">${opts([['all','Any equipment'],...EQUIP],ui.eq)}</select>
   <select class="in" data-ui="cap" aria-label="Minimum capacity">${opts([[0,'Any capacity'],[10,'10+ seats'],[20,'20+ seats'],[40,'40+ seats'],[60,'60+ seats']],ui.cap)}</select>
   <input class="in" data-ui="q" type="search" placeholder="Search rooms" aria-label="Search rooms" value="${esc(ui.q)}"></div>
  <div id="rooms-body">${roomsBody()}</div>`;
}

/* room modal */
function openRoom(id){
  const r=id?S.rooms.find(x=>x.id===id):null;
  const v=r||{number:'',type:'Lecture Room',building:'Main Building',floor:'1st Floor',wing:'Left Side',capacity:'',equipment:[],status:'available'};
  reg('rm',{
    'rm-no':(x)=>!x?'Room number is required':!/^\d{2,4}$/.test(x)?'Numbers only, 2 to 4 digits (e.g. 301)':S.rooms.some(o=>o.number===x&&o.id!==id)?`Room ${x} already exists`:'',
    'rm-bld':x=>x?'':'Select a building','rm-floor':x=>x?'':'Select a floor','rm-wing':x=>x?'':'Select a side','rm-type':x=>x?'':'Select a room type',
    'rm-cap':x=>intErr(x,1,200,'Capacity'),
    'rm-eq':x=>x.length?'':'Select at least one item of equipment'
  },{},{
    'rm-no':codeHook,'rm-bld':codeHook,'rm-floor':codeHook,
    'rm-eq':el=>{const s=$$('input:checked',el).map(i=>i.value);$('#rm-eq-s').textContent=s.length?s.join(', '):'Select equipment'}
  });
  openModal(r?`Edit Room ${esc(r.number)}`:'Add New Room',`<form id="rm-form" data-submit="rm" data-id="${id||''}" novalidate>
  <div class="modal-b"><div class="form-grid">
   ${fld('rm-no','Room number',inp('rm-no','rm',v.number,{ph:'e.g. 301',attrs:'inputmode="numeric" maxlength="4" data-digits data-dmsg="Numbers only (e.g. 301)"'}),{req:1,hint:'Digits only. Letters and symbols are not accepted.'})}
   ${fld('rm-type','Room type',slc('rm-type','rm',TYPES,v.type,'Select type'),{req:1})}
   ${fld('rm-bld','Building',slc('rm-bld','rm',Object.keys(BUILDINGS),v.building,'Select building'),{req:1})}
   ${fld('rm-floor','Floor',slc('rm-floor','rm',FLOORS,v.floor,'Select floor'),{req:1})}
   ${fld('rm-wing','Side of the building',slc('rm-wing','rm',WINGS,v.wing,'Select side'),{req:1})}
   ${fld('rm-cap','Capacity (persons)',inp('rm-cap','rm',v.capacity,{ph:'e.g. 40',attrs:'inputmode="numeric" maxlength="3" data-digits data-dmsg="Numbers only (1 to 200)"'}),{req:1,hint:'Between 1 and 200. Bookings cannot exceed this.'})}
   <div class="full">${fld('rm-eq','Equipment',multi('rm-eq','rm',EQUIP,v.equipment),{req:1})}</div>
   ${fld('rm-status','Status',slc('rm-status','rm-x',STATUSES.map(s=>[s,cap(s)]),v.status))}
   <div class="fld"><span class="lbl">Room code (automatic)</span><div class="in" style="background:var(--surface2)" id="rm-code">${roomCode(v.building,v.floor,v.number)}</div></div>
  </div></div><div class="modal-f"><button type="button" class="btn" data-act="close-modal">Cancel</button><button class="btn btn-pri" type="submit">${r?'Save Changes':'Save Room'}</button></div></form>`,640);
}
function codeHook(){const f=$('#rm-floor').value;$('#rm-code').textContent=roomCode($('#rm-bld').value,f,$('#rm-no').value.trim())}
