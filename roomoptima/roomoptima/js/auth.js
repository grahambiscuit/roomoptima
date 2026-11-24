/* RoomOptima · js/auth.js
   Sign in, sign out and the signed-in shell. */
'use strict';

/* ---------- auth ---------- */
reg('lg',{
  'lg-email':v=>!v?'Email is required':!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?'Enter a valid email address':!/@gordoncollege\.edu\.ph$/i.test(v)?'Use your @gordoncollege.edu.ph email address':'',
  'lg-pass':v=>!v?'Password is required':v.length<8?'Password must be at least 8 characters':'',
  'lg-terms':v=>v?'':'You must agree to the Terms & Conditions to sign in'
});
function signIn(){
  const a=allVals('lg'), u=S.users.find(x=>x.email===a['lg-email'].toLowerCase());
  const er=$('#lg-err');
  if(!u||u.password!==a['lg-pass']){er.textContent='Incorrect email or password. Check both and try again.';return}
  er.textContent='';
  u.prevLogin=u.lastLogin;u.lastLogin=new Date().toISOString();
  S.remember=$('#lg-keep').checked?u.email:null;
  save();me=u;
  if(!location.hash||location.hash==='#')location.hash='dashboard';
  try{showApp()}catch(err){
    me=null;
    er.textContent='Signed in, but the page could not open: '+err.message;
    return;
  }
  $('#lg-pass').value='';
}
/* landing -> login -> app. Only one of the three is visible at a time. */
function showView(v){
  $('#landing-view').hidden=v!=='landing';$('#login-view').hidden=v!=='login';$('#app').hidden=v!=='app';
  if(v==='landing'){renderLanding();$('#landing-view').scrollTop=0}
  if(v==='login')$('#lg-email').focus();
}
function showApp(){
  $('#app').dataset.fresh='1';
  showView('app');
  $('#sf-name').textContent=me.name;$('#sf-role').textContent=isAdmin()?'Administrator · CCS':'Student · '+me.program;
  const ini=initials(me.name).toUpperCase();
  $('#sf-av').textContent=ini;$('#tb-av').textContent=ini;$('#tb-name').textContent=me.name;
  render();
}
function signOut(){me=null;S.remember=null;save();showView('landing');document.body.classList.remove('nav-open');try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}toast('You have been signed out.')}
