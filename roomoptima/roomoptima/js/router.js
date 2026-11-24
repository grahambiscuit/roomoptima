/* RoomOptima · js/router.js
   Hash routing, sidebar navigation and page rendering. */
'use strict';

/* ---------- navigation ---------- */
const TITLES={dashboard:'Dashboard',rooms:'Rooms',bookings:'Bookings',schedule:'Schedule View',recommend:'Smart Recommend','admin-settings':'Admin Settings',profile:'My Profile'};
function renderNav(){
  const pend=S.bookings.filter(b=>b.status==='reserved').length;
  const item=(r,l,i,n)=>`<a class="nav-i" href="#${r}" data-r="${r}">${ic(i)}<span>${l}</span>${n?`<span class="n">${n}</span>`:''}</a>`;
  $('#nav').innerHTML=`<div class="nav-l">Main</div>${item('dashboard','Dashboard','grid')}${item('rooms','Rooms','door')}${item('bookings','Bookings','cal',isAdmin()&&pend?pend:0)}${item('schedule','Schedule View','table')}<div class="nav-l">Intelligence</div>${item('recommend','Smart Recommend','target')}${isAdmin()?`<div class="nav-l">Admin</div>${item('admin-settings','Settings','sliders')}`:''}`;
}
let route='dashboard';
function render(){
  if(!me) return;
  let r=location.hash.slice(1);
  if(!TITLES[r]) r='dashboard';
  if(r==='admin-settings'&&!isAdmin()) r='dashboard';
  const keepY=(r===route&&!$('#app').dataset.fresh)?$('#content').scrollTop:0;
  delete $('#app').dataset.fresh;
  if(r!=='recommend')ui.rec=null;
  route=r;
  renderNav();
  $$('#nav .nav-i').forEach(a=>{if(a.dataset.r===r)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  $('#top-title').textContent=TITLES[r];
  document.title='RoomOptima';
  const fn={dashboard:isAdmin()?dashAdmin:dashStudent,rooms:pgRooms,bookings:pgBookings,schedule:pgSched,recommend:pgRec,'admin-settings':pgSettings,profile:pgProfile}[r];
  $('#view').innerHTML=fn();
  const post={rooms:()=>{},profile:regProfile,recommend:regRec}[r]; if(post) post();
  $('#content').scrollTop=keepY;
}
window.addEventListener('hashchange',render);
