/* RoomOptima · js/config.js
   Fixed lists (equipment, buildings, floors), time slots and SVG icons. */
'use strict';

/* ---------- constants ---------- */
const EQUIP=['Air Conditioning','AV System','Computers / PCs','Lab Benches','Projector','Smart TV','Whiteboard'];
const BUILDINGS={'Main Building':'MB','Annex Building':'AB'};
const FLOORS=['1st Floor','2nd Floor','3rd Floor','4th Floor'];
const WINGS=['Left Side','Right Side'];
const TYPES=['Lecture Room','Computer Lab','Science Lab','Seminar Room','Conference Room','Study Room'];
const STATUSES=['available','occupied','reserved','maintenance'];
const REASONS=['Class or event was rescheduled','Group size changed','Room no longer needed','Booked by mistake','Room or equipment problem','Other'];
const TIMES=[];for(let m=420;m<=1080;m+=30)TIMES.push(pad(Math.floor(m/60))+':'+pad(m%60));
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const ICONS={
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 door:'<path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17"/><path d="M3 21h18"/><circle cx="15" cy="12" r="1"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 table:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
 sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 alert:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>'
};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
