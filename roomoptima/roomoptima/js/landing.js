/* RoomOptima · js/landing.js
   Landing page: today's room board, booking rules and buildings.
   Everything is read from the same data the app uses, so the page never disagrees with it. */
'use strict';

/* ---------- today's board ---------- */
const BOARD_START=420, BOARD_END=1080;               // 7:00 AM to 6:00 PM
const boardPct=m=>Math.max(0,Math.min(100,(m-BOARD_START)/(BOARD_END-BOARD_START)*100));
const sideShort=r=>r.building.replace(' Building','')+' · '+r.wing;

function boardRow(r,i){
  const t=today();
  const blocks=S.bookings.filter(b=>active(b)&&b.roomNo===r.number&&covers(b,t)).map(b=>{
    const l=boardPct(tm(b.startTime)), w=boardPct(tm(b.endTime))-l;
    return `<span class="bk ${b.status==='confirmed'?'conf':'resv'}" style="left:${l}%;width:${w}%;--i:${i}" title="${esc(fmtTimes(b.startTime,b.endTime))} · ${esc(cap(b.status))}"></span>`;
  }).join('');
  const off=r.status==='maintenance'?'Under maintenance':'';
  return `<div class="row"><div class="lbl"><b>Room ${esc(r.number)}</b><span>${esc(sideShort(r))}${off?' · '+off:''}</span></div><div class="track${off?' off':''}">${blocks}<i class="nowline" style="left:${boardPct(nowMin())}%"></i></div></div>`;
}
function boardHtml(){
  const t=today(), n=r=>S.bookings.filter(b=>active(b)&&b.roomNo===r.number&&covers(b,t)).length;
  const rooms=[...S.rooms].sort((a,b)=>n(b)-n(a)||a.number.localeCompare(b.number,undefined,{numeric:true})).slice(0,6).sort((a,b)=>a.number.localeCompare(b.number,undefined,{numeric:true}));
  const hours=[8,10,12,14,16,18].map(h=>`<span style="left:${boardPct(h*60)}%">${f12(pad(h)+':00').replace(':00 ',' ')}</span>`).join('');
  return `<div class="row axis"><div class="lbl"></div><div class="ticks">${hours}</div></div>${rooms.map(boardRow).join('')}`;
}

/* ---------- rules (values come from the booking policy) ---------- */
function rulesHtml(){
  const p=S.policy, big=[...S.rooms].sort((a,b)=>b.capacity-a.capacity)[0];
  const rules=[
    ['Group size',big?`A group can’t be larger than the room. Room ${big.number} holds ${big.capacity} people, so a booking for ${big.capacity+1} is stopped with a message.`:'A group can’t be larger than the room.'],
    ['Double bookings','If someone already has the room at that time, the form tells you before you send the request.'],
    ['Start and end dates',`Start on today or later, up to ${p.advanceDays} days ahead. The end date can’t come before the start, and a booking can last up to ${p.maxDays} day${p.maxDays===1?'':'s'}.`],
    ['Time',`Up to ${p.maxHours} hour${p.maxHours===1?'':'s'} per booking, between 7:00 AM and 6:00 PM.`],
    ['Room policy','You agree to the Terms and Room Use Policy when you sign in and again when you book.'],
    ['Cancelling','Cancelling asks you to confirm and give a reason, so the room can go back to others.']
  ];
  return rules.map(x=>`<div><dt>${x[0]}</dt><dd>${x[1]}</dd></div>`).join('');
}

/* ---------- buildings ---------- */
function buildingsHtml(){
  return Object.keys(BUILDINGS).map(name=>{
    const rooms=S.rooms.filter(r=>r.building===name);
    const side=w=>{
      const l=rooms.filter(r=>r.wing===w).sort((a,b)=>a.number.localeCompare(b.number,undefined,{numeric:true}));
      return `<div class="half"><h4>${w}</h4>${l.length?`<div class="tags">${l.map(r=>`<span class="pill" title="${esc(r.type)}, ${esc(r.floor)}">Room ${esc(r.number)}</span>`).join('')}</div>`:'<p class="muted">No rooms listed</p>'}</div>`;
    };
    return `<article class="bcard"><h3>${esc(name)}</h3><p class="muted">${rooms.length} room${rooms.length===1?'':'s'}</p><div class="halves">${WINGS.map(side).join('')}</div></article>`;
  }).join('');
}

function renderLanding(){
  if(!S) return;
  $('#ld-date').textContent=new Date().toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'});
  $('#ld-board').innerHTML=boardHtml();
  $('#ld-rules-list').innerHTML=rulesHtml();
  $('#ld-bld').innerHTML=buildingsHtml();
}
