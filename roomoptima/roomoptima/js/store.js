/* RoomOptima · js/store.js
   Data layer: sample data, browser storage and lookups. */
'use strict';

/* ---------- data ---------- */
const KEY='roomoptima.v4';
let S=null, me=null;
const uid=()=>'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function seed(){
  const t=today(), d=n=>addDays(t,n), now=Date.now();
  const R=(number,type,building,floor,wing,capacity,equipment,status='available')=>({id:'r'+number,number,type,building,floor,wing,capacity,equipment,status});
  const B=(roomNo,sd,ed,st,et,bookedBy,ownerEmail,purpose,groupSize,status,age)=>({id:uid()+roomNo,roomNo,startDate:sd,endDate:ed,startTime:st,endTime:et,bookedBy,ownerEmail,purpose,groupSize,status,createdAt:now-age*3600e3});
  const stu='marc.bunan@gordoncollege.edu.ph', adm='john.lopez@gordoncollege.edu.ph';
  return {v:4,remember:null,
    policy:{defaultStatus:'reserved',maxHours:3,advanceDays:14,maxDays:3},
    users:[
      {email:adm,password:'Admin@1234',role:'admin',name:'Lopez, John Neo',idNo:'EMP-0042',program:'CCS Department Head',college:'College of Computer Studies',contact:'0917 555 0142',lastLogin:null,prevLogin:null},
      {email:stu,password:'Student@123',role:'student',name:'Bunan, Marc',idNo:'2024-00123',program:'BSCS 3-C',college:'College of Computer Studies',contact:'0917 123 4567',lastLogin:null,prevLogin:null}
    ],
    rooms:[
      R('301','Computer Lab','Main Building','3rd Floor','Right Side',40,['Air Conditioning','Computers / PCs','Projector']),
      R('302','Lecture Room','Main Building','3rd Floor','Left Side',50,['Projector','Whiteboard'],'occupied'),
      R('303','Seminar Room','Main Building','3rd Floor','Left Side',80,['Air Conditioning','AV System','Projector']),
      R('101','Conference Room','Main Building','1st Floor','Right Side',20,['Air Conditioning','Smart TV']),
      R('102','Study Room','Main Building','1st Floor','Right Side',12,['Air Conditioning','Whiteboard']),
      R('201','Science Lab','Annex Building','2nd Floor','Right Side',30,['Lab Benches'],'maintenance'),
      R('202','Lecture Room','Annex Building','2nd Floor','Left Side',45,['Projector','Whiteboard']),
      R('401','Computer Lab','Annex Building','4th Floor','Right Side',35,['Air Conditioning','Computers / PCs','Projector']),
      R('402','Computer Lab','Annex Building','4th Floor','Left Side',35,['Air Conditioning','Computers / PCs','Projector'],'reserved'),
      R('403','Lecture Room','Annex Building','4th Floor','Left Side',60,['Air Conditioning','Projector','Whiteboard'])
    ],
    bookings:[
      B('301',t,t,'08:00','10:00','Lagarde, Sam Kirby',adm,'ADET Class, BSCS 3-C',38,'confirmed',30),
      B('202',t,t,'09:00','10:30','Pilapil, David John',adm,'Database Systems Lecture',40,'confirmed',10),
      B('101',t,t,'14:00','16:00','Salting, Charles Cristian',adm,'Capstone Consultation',8,'reserved',2),
      B('401',t,t,'13:00','15:00','Evanje, Karl',adm,'Programming Laboratory',30,'confirmed',20),
      B('202',d(1),d(1),'13:00','14:30',S_NAME(),stu,'Study Group, BSCS 3-C',12,'reserved',6),
      B('101',d(3),d(3),'15:00','16:00',S_NAME(),stu,'Capstone Consultation',5,'confirmed',5),
      B('303',d(2),d(3),'09:00','12:00','Salting, Charles Cristian',adm,'Capstone Defense',60,'reserved',4),
      B('403',d(1),d(1),'10:00','12:00','Tupas, Chezko',adm,'Department Meeting',18,'reserved',3),
      B('301',d(-2),d(-2),'09:00','11:00','Valderey, Justine',adm,'Database Systems Lecture',36,'confirmed',60),
      B('102',d(-1),d(-1),'15:00','16:00',S_NAME(),stu,'Study Group, BSCS 3-C',8,'cancelled',40)
    ]};
}
function S_NAME(){return 'Bunan, Marc'}
function load(){try{const r=localStorage.getItem(KEY);if(r){const o=JSON.parse(r);if(o&&o.v===4)return o}}catch(e){}return null}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const roomOf=no=>S.rooms.find(r=>r.number===no);
const active=b=>b.status!=='cancelled';
const covers=(b,d)=>b.startDate<=d&&d<=b.endDate;
const mine=b=>me&&b.ownerEmail===me.email;
const isAdmin=()=>me&&me.role==='admin';
const canManage=b=>isAdmin()||mine(b);
const roomLabel=r=>`Room ${r.number} · ${r.type} · ${r.building}, ${r.floor}`;
const roomCode=(b,f,n)=>(BUILDINGS[b]||'XX')+'-'+(f?f[0]:'?')+'F-'+(n||'---');
const firstName=n=>n.includes(',')?n.split(',')[1].trim().split(' ')[0]:n;
const lastName=n=>n.split(',')[0].trim();
const initials=n=>(firstName(n)[0]||'')+(lastName(n)[0]||'');
function conflict(roomNo,sd,ed,st,et,ignore){
  return S.bookings.find(b=>b.id!==ignore&&b.roomNo===roomNo&&active(b)&&b.startDate<=ed&&sd<=b.endDate&&tm(st)<tm(b.endTime)&&tm(et)>tm(b.startTime));
}
function freeNow(){
  const t=today(),n=nowMin();
  return S.rooms.filter(r=>r.status==='available'&&!S.bookings.some(b=>active(b)&&b.roomNo===r.number&&covers(b,t)&&tm(b.startTime)<n+60&&tm(b.endTime)>n));
}
