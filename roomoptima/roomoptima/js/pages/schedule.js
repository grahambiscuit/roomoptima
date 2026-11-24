/* RoomOptima · js/pages/schedule.js
   Schedule grid for any date. */
'use strict';

/* ---------- schedule ---------- */
function pgSched(){
  return `<div class="page-h"><div><h1>Schedule View</h1><p>Time grid of room availability for any date. Select a free slot to book it.</p></div></div>
  <div class="filters"><label class="lbl" for="sd-date">Date</label><input class="in" type="date" id="sd-date" data-ui="sd" value="${esc(ui.sd)}">
   <div class="legend" style="margin:0 0 0 auto"><span><i class="dot c-available"></i>Free</span><span><i class="dot c-reserved"></i>Reserved</span><span><i class="dot" style="background:var(--ok)"></i>Confirmed</span><span><i class="dot c-maintenance"></i>Maintenance</span></div></div>
  <div class="card"><div class="tw" style="max-height:calc(100vh - 260px)" id="sched-body">${schedTable()}</div></div>`;
}
function schedTable(){
  const d=ui.sd||today(), t=today(), rooms=[...S.rooms].sort((a,b)=>a.number.localeCompare(b.number,undefined,{numeric:true}));
  const books=S.bookings.filter(b=>active(b)&&covers(b,d));
  const head=`<tr><th class="tc">Time</th>${rooms.map(r=>`<th scope="col">Room ${r.number}<small>${esc(r.type)} · ${r.capacity}</small></th>`).join('')}</tr>`;
  const body=TIMES.slice(0,-1).map((slot,i)=>`<tr><th class="tc" scope="row">${f12(slot)}</th>${rooms.map(r=>{
    if(r.status==='maintenance') return `<td class="b-maintenance">${i===0?'Maintenance':''}</td>`;
    const b=books.find(x=>x.roomNo===r.number&&tm(slot)>=tm(x.startTime)&&tm(slot)<tm(x.endTime));
    if(b) return `<td class="b-${b.status}" title="${esc(b.bookedBy)}: ${esc(b.purpose)}">${slot===b.startTime?esc(lastName(b.bookedBy)):''}</td>`;
    const past=d<t||(d===t&&tm(slot)+30<=nowMin());
    return `<td><button class="free" data-act="new-booking" data-room="${r.number}" data-date="${d}" data-start="${slot}" data-end="${plus(slot,60)}"${past?' disabled':''} aria-label="Book Room ${r.number} at ${f12(slot)}">Free</button></td>`;
  }).join('')}</tr>`).join('');
  return `<table class="sg"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}
