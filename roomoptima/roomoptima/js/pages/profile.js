/* RoomOptima · js/pages/profile.js
   Profile and login information. */
'use strict';

/* ---------- profile ---------- */
function pgProfile(){
  const u=me,adm=isAdmin();
  const last=u.prevLogin?new Date(u.prevLogin).toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'}):'This is your first sign in';
  return `<div class="page-h"><div><h1>My Profile</h1><p>Your account and login information.</p></div></div>
  <div class="prof"><div class="card id-card"><div class="avatar">${esc(initials(u.name).toUpperCase())}</div><div><h2 style="font-size:18px">${esc(u.name)}</h2><span class="pill" style="margin-top:6px">${adm?'Administrator':'Student'}</span></div>
   <dl class="kv"><dt>${adm?'Employee no.':'Student no.'}</dt><dd>${esc(u.idNo)}</dd><dt>${adm?'Position':'Program'}</dt><dd>${esc(u.program)}</dd><dt>College</dt><dd>${esc(u.college)}</dd><dt>Email</dt><dd>${esc(u.email)}</dd><dt>Last login</dt><dd>${esc(last)}</dd></dl></div>
  <div style="display:grid;gap:18px;min-width:0">
   <form class="card" id="pf-form" data-submit="pf" novalidate><div class="card-h"><h2>Personal information</h2></div><div class="card-b form-grid">
    ${fld('pf-name','Full name',inp('pf-name','pf',u.name,{ac:'name'}),{req:1,hint:'Format: Last Name, First Name M.I.'})}
    ${fld('pf-id',adm?'Employee number':'Student number',inp('pf-id','pf',u.idNo),{req:1,hint:adm?'Format: EMP-0000':'Format: YYYY-NNNNN (e.g. 2024-00123)'})}
    ${fld('pf-email','Institutional email',inp('pf-email','pf-x',u.email,{ro:1}),{hint:'Used to sign in. It cannot be changed here.'})}
    ${fld('pf-contact','Contact number',inp('pf-contact','pf',u.contact,{type:'tel',ph:'09XX XXX XXXX',ac:'tel'}),{req:1,hint:'Philippine mobile number'})}
    <div class="full" style="display:flex;justify-content:flex-end"><button class="btn btn-pri" type="submit">Save changes</button></div></div></form>
   <form class="card" id="pw-form" data-submit="pw" novalidate><div class="card-h"><h2>Login and security</h2></div><div class="card-b form-grid">
    <div class="full">${fld('pw-cur','Current password',inp('pw-cur','pw','',{type:'password',ac:'current-password'}),{req:1})}</div>
    ${fld('pw-new','New password',inp('pw-new','pw','',{type:'password',ac:'new-password'}),{req:1,hint:'At least 8 characters with 1 uppercase letter and 1 number'})}
    ${fld('pw-con','Confirm new password',inp('pw-con','pw','',{type:'password',ac:'new-password'}),{req:1})}
    <div class="full" style="display:flex;justify-content:flex-end"><button class="btn btn-pri" type="submit">Change password</button></div></div></form>
  </div></div>`;
}
function regProfile(){
  const adm=isAdmin();
  reg('pf',{
    'pf-name':nameErr,
    'pf-id':x=>!x?'This field is required':adm?(/^EMP-\d{4}$/.test(x)?'':'Format must be EMP-0000 (e.g. EMP-0042)'):(/^\d{4}-\d{5}$/.test(x)?'':'Format must be YYYY-NNNNN (e.g. 2024-00123)'),
    'pf-contact':x=>!x?'Contact number is required':/^(09|\+639)\d{9}$/.test(x.replace(/[\s-]/g,''))?'':'Enter a valid mobile number (09XX XXX XXXX)'
  });
  reg('pw',{
    'pw-cur':x=>!x?'Enter your current password':x!==me.password?'Current password is incorrect':'',
    'pw-new':x=>!x?'Enter a new password':x.length<8?'Use at least 8 characters':!/[A-Z]/.test(x)?'Include at least 1 uppercase letter':!/\d/.test(x)?'Include at least 1 number':x===me.password?'Choose a password different from your current one':'',
    'pw-con':(x,a)=>!x?'Re-enter the new password':x!==a['pw-new']?'Passwords do not match':''
  },{'pw-new':['pw-con']});
}
