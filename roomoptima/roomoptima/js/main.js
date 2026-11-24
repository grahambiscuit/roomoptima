/* RoomOptima · js/main.js
   Start-up. */
'use strict';

/* ---------- boot ---------- */
S=load()||seed();save();
renderLanding();
if(S.remember){const u=S.users.find(x=>x.email===S.remember);if(u){me=u;showApp()}}
