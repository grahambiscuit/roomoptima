/* RoomOptima · js/pages/recommend.js
   Smart room recommendation. */
'use strict';

/* ---------- smart recommend ---------- */
function pgRec(){
  return `<div class="page-h"><div><h1>Smart Room Recommendation</h1><p>Enter what you need. The scoring weighs fit, equipment and how busy a room already is.</p></div></div>
  <div class="grid-2" style="align-items:start">
   <form class="card" id="rc-form" data-submit="rc" novalidate><div class="card-h"><h2>Your requirements</h2></div><div class="card-b form-grid">
     ${fld('rc-date','Date',inp('rc-date','rc',today(),{type:'date',attrs:`min="${today()}"`}),{req:1})}
     ${fld('rc-size','Group size',inp('rc-size','rc','',{ph:'e.g. 20',attrs:'inputmode="numeric" maxlength="3" data-digits data-dmsg="Numbers only"'}),{req:1})}
     ${fld('rc-st','Start time',slc('rc-st','rc',TIMES.slice(0,-1).map(x=>[x,f12(x)]),'','Select time'),{req:1})}
     ${fld('rc-et','End time',slc('rc-et','rc',TIMES.slice(1).map(x=>[x,f12(x)]),'','Select time'),{req:1})}
     ${fld('rc-act','Activity type',slc('rc-act','rc-x',[['lecture','Lecture / class'],['lab','Laboratory / computer work'],['meeting','Meeting / discussion'],['seminar','Seminar / presentation'],['other','Other']],'lecture'))}
     ${fld('rc-eq','Equipment needed',slc('rc-eq','rc-x',[['','Any equipment'],...EQUIP],''))}
     <div class="full"><button class="btn btn-pri btn-block" type="submit">Find best rooms</button></div></div></form>
   <div><div class="page-h" style="margin-bottom:12px"><h2 style="font-size:16px">Recommendations</h2><span class="muted" style="font-size:12px">Select a room to start booking</span></div><div id="rc-out" style="display:grid;gap:12px">${recHtml()}</div></div></div>`;
}
function regRec(){
  const p=S.policy;
  reg('rc',{
    'rc-date':x=>!x?'Date is required':x<today()?'Date can’t be in the past':x>addDays(today(),p.advanceDays)?`Bookings open up to ${p.advanceDays} days ahead`:'',
    'rc-size':x=>{const e=intErr(x,1,200,'Group size');if(e)return e;const mx=Math.max(...S.rooms.map(r=>r.capacity));return +x>mx?`No room is large enough (largest seats ${mx})`:''},
    'rc-st':x=>x?'':'Select a start time',
    'rc-et':(x,a)=>!x?'Select an end time':(a['rc-st']&&tm(x)<=tm(a['rc-st']))?'End time must be after the start time':(a['rc-st']&&tm(x)-tm(a['rc-st'])>p.maxHours*60)?`Maximum ${p.maxHours} hour(s) per booking`:''
  },{'rc-st':['rc-et']});
}
function recommend(){
  const date=val('rc-date'),size=+val('rc-size'),st=val('rc-st'),et=val('rc-et'),act=$('#rc-act').value,eq=$('#rc-eq').value;
  const res=S.rooms.filter(r=>r.status!=='maintenance'&&r.capacity>=size&&(!eq||r.equipment.includes(eq))&&!conflict(r.number,date,date,st,et)).map(r=>{
    const why=[`Seats ${r.capacity}, fits your group of ${size}`];
    let s=55+Math.round(30*size/r.capacity);
    const has=x=>r.equipment.includes(x);
    if(act==='lecture'&&has('Projector')){s+=8;why.push('Has a projector')}
    if(act==='lab'&&has('Computers / PCs')){s+=12;why.push('Has computers')}
    if(act==='meeting'&&(has('Whiteboard')||has('Smart TV'))){s+=7;why.push('Has a whiteboard or smart TV')}
    if(act==='seminar'&&has('AV System')){s+=10;why.push('Has an AV system')}
    if(eq) why.push(`Has ${eq}`);
    const load=S.bookings.filter(b=>active(b)&&b.roomNo===r.number&&b.endDate>=today()).length;
    s-=Math.min(load*2,10); if(load<=1) why.push('Lightly booked');
    return {r,score:Math.max(30,Math.min(99,s)),why};
  }).sort((a,b)=>b.score-a.score).slice(0,3);
  ui.rec={date,size,st,et,res};
}
function recHtml(){
  const x=ui.rec;
  if(!x) return `<div class="card">${empty('Fill in your requirements','Results appear here after you select Find best rooms.')}</div>`;
  if(!x.res.length) return `<div class="card">${empty('No suitable room found','Every room that fits is booked or in maintenance for this time. Try another time or a smaller group.')}</div>`;
  const L=['Best match','Alternative','Backup'];
  return x.res.map((s,i)=>`<div class="rec"><div class="rk">${L[i]}</div><h3>Room ${s.r.number} · ${esc(s.r.type)}</h3><p class="muted" style="font-size:12.5px">${esc(s.r.building)} · ${esc(s.r.floor)} · ${esc(s.r.wing)}</p><div class="score"><span>Fit score ${s.score}%</span><div class="bar"><i style="width:${s.score}%"></i></div></div><ul>${s.why.map(w=>`<li>${esc(w)}</li>`).join('')}</ul><div><button class="btn btn-pri btn-sm" data-act="new-booking" data-room="${s.r.number}" data-date="${x.date}" data-start="${x.st}" data-end="${x.et}" data-size="${x.size}">Book this room</button></div></div>`).join('');
}
