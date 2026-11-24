/* RoomOptima · js/utils.js
   DOM helpers, HTML escaping and date/time helpers (all dates use local time). */
'use strict';

const SEAL='assets/seal.png';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cap=s=>s?s[0].toUpperCase()+s.slice(1):'';

/* ---------- dates and times (local time) ---------- */
function pad(n){return String(n).padStart(2,'0')}
function ymd(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function pd(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)}
function addDays(s,n){const d=pd(s);d.setDate(d.getDate()+n);return ymd(d)}
function today(){return ymd(new Date())}
function dayDiff(a,b){return Math.round((pd(b)-pd(a))/864e5)}
function fmtDate(s){const d=pd(s);return MON[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()}
function fmtRange(a,b){return a===b?fmtDate(a):fmtDate(a)+' – '+fmtDate(b)}
function tm(t){const [h,m]=t.split(':').map(Number);return h*60+m}
function f12(t){const [h,m]=t.split(':').map(Number);return ((h+11)%12+1)+':'+pad(m)+' '+(h<12?'AM':'PM')}
function fmtTimes(a,b){return f12(a)+' – '+f12(b)}
function nowMin(){const n=new Date();return n.getHours()*60+n.getMinutes()}
function plus(t,mins){const m=Math.min(tm(t)+mins,1080);return pad(Math.floor(m/60))+':'+pad(m%60)}
