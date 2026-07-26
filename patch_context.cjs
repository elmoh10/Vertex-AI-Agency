const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t1 = `Current Date Context: The current local time is \${new Date().toLocaleDateString('ar-SA')} - \${new Date().toLocaleTimeString('ar-SA')}.`;

const r1 = `Current Date Context: The current local time is \${new Date().toLocaleDateString('ar-SA')} - \${new Date().toLocaleTimeString('ar-SA')}.

Currently Confirmed/Pending Bookings for this business:
\${bookings.filter(b => b.businessId === biz.id && (b.status === 'confirmed' || b.status === 'pending')).length > 0
  ? bookings.filter(b => b.businessId === biz.id && (b.status === 'confirmed' || b.status === 'pending'))
      .map(b => \`  - Date: \${b.date}, Time: \${b.time} (Service: \${b.service})\`).join('\\n')
  : "  (No upcoming bookings yet.)"}

IMPORTANT BOOKING RULE: 
If the user requests a booking for a specific Date and Time that is EXACTLY matching one of the "Currently Confirmed/Pending Bookings" above, you MUST REFUSE the booking, state that this specific time is unavailable (already booked), and suggest alternative available times. DO NOT output actionDetected=true or actionType=BOOKING in this case, handle it as a conversational FAQ/OTHER asking them to pick another time.`;

code = code.replace(t1, r1);
fs.writeFileSync('server.ts', code);
