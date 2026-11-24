/* RoomOptima · js/pages/settings.js
   Administrator settings: summary, booking policy, bulk actions. */
'use strict';

/* ---------- settings (admin) ---------- */
function pgSettings(){
  const R=S.rooms,t=today(),cnt=s=>R.filter(r=>r.status===s).length,p=S.policy;
  const rows=[['Total rooms',R.length],['Available',cnt('available')],['Occupied',cnt('occupied')],['Reserved (room status)',cnt('reserved')],['Under maintenance',cnt('maintenance')],['Today’s bookings',S.bookings.filter(b=>active(b)&&covers(b,t)).length],['All bookings',S.bookings.length],['Pending confirmation',S.bookings.filter(b=>b.status==='reserved').length]];
  const log=[...S.bookings].sort((a,b)=>b.createdAt-a.createdAt).slice(0,8);
  return `<div class="page-h"><div><h1>Admin Settings</h1><p>System summary, booking policy and management tools.</p></div></div>
  <div class="grid-2" style="align-items:start">
   <div class="card"><div class="card-h"><h2>System summary</h2></div><div class="tw"><table><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td style="text-align:right;font-weight:700">${r[1]}</td></tr>`).join('')}</tbody></table></div></div>
   <form class="card" data-submit="policy" id="policy-form" novalidate><div class="card-h"><h2>Booking policy</h2></div><div class="card-b" style="display:grid;gap:14px">
    ${fld('po-status','Status for new student bookings',slc('po-status','po',[['reserved','Reserved (needs admin confirmation)'],['confirmed','Confirmed (auto-approve)']],p.defaultStatus))}
    ${fld('po-hours','Maximum hours per booking',slc('po-hours','po',[[1,'1 hour'],[2,'2 hours'],[3,'3 hours'],[4,'4 hours'],[8,'Full day (8 hours)']],p.maxHours))}
    ${fld('po-days','Booking window',slc('po-days','po',[[7,'Up to 7 days ahead'],[14,'Up to 14 days ahead'],[30,'Up to 30 days ahead'],[90,'Up to 90 days ahead']],p.advanceDays))}
    ${fld('po-span','Longest booking (days)',slc('po-span','po',[[1,'1 day'],[2,'2 days'],[3,'3 days'],[5,'5 days']],p.maxDays))}
    <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-pri" type="submit">Save policy</button><button type="button" class="btn" data-act="policies">Preview policy text</button></div></div></form>
  </div>
  <div class="grid-2" style="align-items:start">
   <div class="card"><div class="card-h"><h2>Bulk actions</h2></div><div class="card-b" style="display:grid;gap:10px">
    <p class="muted" style="font-size:13px">These change many records at once and cannot be undone.</p>
    ${[['Confirm all reserved','Approve every pending Reserved booking','bulk-confirm','btn-pri','Run'],['Cancel stale reservations','Cancel Reserved bookings that ended before today','bulk-stale','btn-soft-danger','Run'],['Reset all rooms','Set every room status back to Available','bulk-reset','btn-soft-danger','Run']].map(x=>`<div class="sum" style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap"><div><b>${x[0]}</b><div class="muted" style="font-size:12px">${x[1]}</div></div><button class="btn btn-sm ${x[3]}" data-act="${x[2]}">${x[4]}</button></div>`).join('')}</div></div>
   <div class="card"><div class="card-h"><h2>Recent activity</h2><span class="muted" style="font-size:12px">Last 8 bookings created</span></div><div class="tw"><table><thead><tr><th>Who</th><th>Room</th><th>Date</th><th>Status</th></tr></thead><tbody>${log.map(b=>`<tr><td>${esc(b.bookedBy)}</td><td>Room ${esc(b.roomNo)}</td><td>${fmtDate(b.startDate)}</td><td>${badge(b.status)}</td></tr>`).join('')||`<tr><td colspan="4">${empty('No activity yet')}</td></tr>`}</tbody></table></div></div>
  </div>
  <div class="card"><div class="card-h"><h2>About RoomOptima</h2></div><div class="card-b" style="display:flex;gap:18px;flex-wrap:wrap;align-items:center"><img data-seal src="${SEAL}" alt="Gordon College seal" width="64" height="64" style="border-radius:50%"><div style="flex:1;min-width:220px"><h3 style="font-size:17px">RoomOptima</h3><p class="muted">Predictive Room Allocation and Intelligent Scheduling</p></div>
   <dl class="kv" style="margin:0;min-width:240px"><dt>Team</dt><dd>Team Falcons Philippines</dd><dt>Program</dt><dd>BSCS 3-C</dd><dt>School</dt><dd>Gordon College, College of Computer Studies</dd><dt>SDGs</dt><dd>9 and 11</dd></dl></div></div>`;
}
