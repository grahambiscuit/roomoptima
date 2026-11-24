/* RoomOptima · js/pages/dashboard.js
   Administrator and student dashboards. */
'use strict';

/* ---------- dashboards ---------- */
function dashAdmin(){
  const rooms=S.rooms,t=today(),cnt=s=>rooms.filter(r=>r.status===s).length;
  const todays=S.bookings.filter(b=>active(b)&&covers(b,t));
  const booked=new Set(todays.map(b=>b.roomNo)).size;
  const usable=rooms.filter(r=>r.status!=='maintenance').length||1;
  const util=Math.round(booked/usable*100);
  const pending=S.bookings.filter(b=>b.status==='reserved').length;
  const recent=[...S.bookings].sort((a,b)=>b.createdAt-a.createdAt).slice(0,6);
  const tot=rooms.length||1;
  const seg=STATUSES.map(s=>{const c=cnt(s);return c?`<i class="c-${s}" style="width:${c/tot*100}%" title="${cap(s)}: ${c}"></i>`:''}).join('');
  const leg=STATUSES.map(s=>`<span><i class="dot c-${s}"></i>${cap(s)} (${cnt(s)})</span>`).join('');
  return `<div class="page-h"><div><h1>Admin Dashboard</h1><p>Room status, bookings and utilisation across campus.</p></div><button class="btn btn-pri" data-act="new-booking">+ New Booking</button></div>
  <div class="stats">
   <div class="stat"><div class="k">Available now</div><div class="v">${cnt('available')}</div><div class="s">rooms open</div></div>
   <div class="stat s-err"><div class="k">Occupied</div><div class="v">${cnt('occupied')}</div><div class="s">rooms in use</div></div>
   <div class="stat s-wn"><div class="k">Maintenance</div><div class="v">${cnt('maintenance')}</div><div class="s">unavailable</div></div>
   <div class="stat s-inf"><div class="k">Today’s bookings</div><div class="v">${todays.length}</div><div class="s">scheduled today</div></div>
  </div>
  <div class="grid-2">
   <div class="card"><div class="card-h"><h2>Utilisation today</h2></div><div class="card-b">
     <div class="big" style="color:var(--pri-t)">${util}%</div><p class="muted">${booked} of ${usable} usable rooms have a booking today</p>
     <div class="bar" role="img" aria-label="Utilisation ${util} percent"><i style="width:${util}%"></i></div>
     <p class="lbl" style="margin-top:18px">Room status breakdown</p><div class="seg">${seg}</div><div class="legend">${leg}</div></div></div>
   <div class="card"><div class="card-h"><h2>Pending approvals</h2></div><div class="card-b" style="display:grid;gap:12px">
     <div class="big" style="color:var(--acc-t)">${pending}</div><p class="muted">bookings waiting for confirmation</p>
     <p style="font-size:13px;color:var(--fg2)">These are bookings with the status Reserved. Confirm or cancel them from the Bookings page.</p>
     <div><button class="btn btn-pri btn-sm" data-act="go" data-to="bookings">Review bookings</button></div></div></div>
  </div>
  <div class="card"><div class="card-h"><h2>Recent bookings</h2><button class="btn btn-sm" data-act="go" data-to="bookings">View all</button></div>
   <div class="tw"><table><thead><tr><th>Room</th><th>Booked by</th><th>Purpose</th><th>Dates</th><th>Time</th><th>Status</th></tr></thead><tbody>
   ${recent.length?recent.map(b=>`<tr><td><b>Room ${esc(b.roomNo)}</b></td><td>${esc(b.bookedBy)}</td><td>${esc(b.purpose)}</td><td>${fmtRange(b.startDate,b.endDate)}</td><td>${fmtTimes(b.startTime,b.endTime)}</td><td>${badge(b.status)}</td></tr>`).join(''):`<tr><td colspan="6">${empty('No bookings yet')}</td></tr>`}
   </tbody></table></div></div>`;
}
function dashStudent(){
  const t=today(),n=nowMin(),open=n>=420&&n<1080;
  const my=S.bookings.filter(b=>mine(b)&&active(b));
  const up=my.filter(b=>b.endDate>=t).sort((a,b)=>(a.startDate+a.startTime).localeCompare(b.startDate+b.startTime));
  const free=open?freeNow():[];
  return `<div class="page-h"><div><h1>Welcome back, ${esc(firstName(me.name))}</h1><p>Find and book an available room on campus.</p></div></div>
  <div class="banner"><div><h2>Need a room for your group?</h2><p>Smart Recommend matches size, time and equipment to the best free room.</p></div><button class="btn" data-act="go" data-to="recommend">Find a room</button></div>
  <div class="stats">
   <div class="stat"><div class="k">Available rooms</div><div class="v">${S.rooms.filter(r=>r.status==='available').length}</div></div>
   <div class="stat s-inf"><div class="k">My bookings</div><div class="v">${my.length}</div></div>
   <div class="stat s-wn"><div class="k">Upcoming</div><div class="v">${up.length}</div></div>
  </div>
  <div class="card"><div class="card-h"><h2>Free right now</h2><span class="muted" style="font-size:12px">Open 7:00 AM – 6:00 PM</span></div><div class="card-b">
   ${!open?`<p class="muted">Rooms are closed at the moment. You can still book a room for another day.</p>`:free.length?`<div class="room-grid">${free.slice(0,6).map(r=>`<button class="room" data-act="new-booking" data-room="${r.number}"><span class="no">Room ${r.number}</span><span class="ty">${esc(r.type)}</span><span class="meta">${esc(r.building)} · ${esc(r.floor)}</span><span class="meta">Capacity ${r.capacity} · ${esc(r.equipment.slice(0,2).join(', ')||'Basic')}</span><span class="link" style="text-decoration:none">Book this room</span></button>`).join('')}</div>`:`<p class="muted">No rooms are free for the next hour.</p>`}
  </div></div>
  <div class="card"><div class="card-h"><h2>My upcoming bookings</h2></div><div class="tw"><table><thead><tr><th>Room</th><th>Dates</th><th>Time</th><th>Purpose</th><th>Status</th><th>Actions</th></tr></thead><tbody>
   ${up.length?up.slice(0,5).map(b=>`<tr><td><b>Room ${esc(b.roomNo)}</b></td><td>${fmtRange(b.startDate,b.endDate)}</td><td>${fmtTimes(b.startTime,b.endTime)}</td><td>${esc(b.purpose)}</td><td>${badge(b.status)}</td><td>${bkActions(b)}</td></tr>`).join(''):`<tr><td colspan="6">${empty('No upcoming bookings','Book a room to see it here.')}</td></tr>`}
  </tbody></table></div></div>`;
}
