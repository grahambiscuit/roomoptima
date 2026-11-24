/* RoomOptima · js/policy.js
   Terms and Room Use Policy text. */
'use strict';

/* ---------- policy text ---------- */
function policyHtml(){
  const p=S?S.policy:{defaultStatus:'reserved',maxHours:3,advanceDays:14,maxDays:3};
  return `<div class="modal-b"><div class="prose">
  <p class="muted">Sample policy text for the RoomOptima demo. Replace it with the college’s official wording before real use.</p>
  <h3>1. Who can book</h3><p>Gordon College students, faculty and staff who sign in with an institutional @gordoncollege.edu.ph account.</p>
  <h3>2. Booking limits</h3><ul><li>Up to ${p.maxHours} hour(s) per booking, between 7:00 AM and 6:00 PM.</li><li>Up to ${p.advanceDays} days in advance, for no more than ${p.maxDays} day(s) at a time.</li><li>Group size must not exceed the room’s posted capacity.</li></ul>
  <h3>3. Approval</h3><p>Student bookings are ${p.defaultStatus==='reserved'?'saved as Reserved and need administrator confirmation':'confirmed automatically'}. An administrator may change or cancel a booking for maintenance or college events.</p>
  <h3>4. Cancellations</h3><p>Cancel a booking you no longer need so others can use the room. Cancellations less than 24 hours before the start time are recorded.</p>
  <h3>5. Rooms and equipment</h3><ul><li>Use rooms only for the stated purpose and leave them clean.</li><li>Report damaged or missing equipment to an administrator.</li><li>Only the equipment listed for a room is guaranteed to be available.</li></ul>
  <h3>6. Your information</h3><p>Your name and booking details are visible to administrators. Students see only their own bookings.</p></div></div><div class="modal-f"><button type="button" class="btn btn-pri" data-act="close-policy">Close</button></div>`;
}
