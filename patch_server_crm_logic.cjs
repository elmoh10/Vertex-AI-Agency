const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetLogic = `  if (!knownCustomers.has(customerKey)) {
    knownCustomers.add(customerKey);
    isFirstContact = true;
  }`;

const newLogic = `  if (!knownCustomers.has(customerKey)) {
    knownCustomers.add(customerKey);
    isFirstContact = true;
  }
  
  // CRM Logic
  let customerIndex = customers.findIndex(c => c.phone === senderPhone && c.businessId === biz.id);
  if (customerIndex === -1) {
    customers.push({
      id: "cust_" + Math.random().toString(36).substr(2, 9),
      businessId: biz.id,
      name: senderName || "عميل غير معروف",
      phone: senderPhone,
      totalBookings: 0,
      totalComplaints: 0,
      lastInteraction: new Date().toISOString(),
      tags: ["عميل جديد"]
    });
  } else {
    customers[customerIndex].lastInteraction = new Date().toISOString();
  }`;

code = code.replace(targetLogic, newLogic);

const targetBooking = `        bookings.unshift(bookingCreated);
        actionDetailsText = \`📅 حجز ملقط تلقائياً: \${bookingCreated.service} بتاريخ \${bookingCreated.date} في تمام الساعة \${bookingCreated.time}\`;`;

const newBooking = `        bookings.unshift(bookingCreated);
        actionDetailsText = \`📅 حجز ملقط تلقائياً: \${bookingCreated.service} بتاريخ \${bookingCreated.date} في تمام الساعة \${bookingCreated.time}\`;
        
        let cIdx = customers.findIndex(c => c.phone === bookingCreated.customerPhone && c.businessId === biz.id);
        if (cIdx !== -1) {
          customers[cIdx].totalBookings += 1;
        }`;

code = code.replace(targetBooking, newBooking);

const targetComplaint = `        complaints.unshift(complaintCreated);
        actionDetailsText = \`⚠️ شكوى مسجلة: [\${complaintCreated.category}] \${complaintCreated.summary}\`;`;

const newComplaint = `        complaints.unshift(complaintCreated);
        actionDetailsText = \`⚠️ شكوى مسجلة: [\${complaintCreated.category}] \${complaintCreated.summary}\`;
        
        let cIdx2 = customers.findIndex(c => c.phone === complaintCreated.customerPhone && c.businessId === biz.id);
        if (cIdx2 !== -1) {
          customers[cIdx2].totalComplaints += 1;
        }`;

code = code.replace(targetComplaint, newComplaint);

fs.writeFileSync('server.ts', code);
