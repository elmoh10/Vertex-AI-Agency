const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('let customers = [')) {
  const insertCode = `
let customers = [
  {
    id: "cust_1",
    businessId: "clinic_1",
    name: "عبدالرحمن بن سعود",
    phone: "0501234567",
    totalBookings: 1,
    totalComplaints: 0,
    lastInteraction: "2026-07-15T14:30:00Z",
    tags: ["عميل جديد"]
  },
  {
    id: "cust_2",
    businessId: "restaurant_1",
    name: "سارة الأحمد",
    phone: "0559876543",
    totalBookings: 1,
    totalComplaints: 0,
    lastInteraction: "2026-07-15T18:22:00Z",
    tags: ["عائلة"]
  }
];
`;
  code = code.replace(
    /let webhookLogs: WebhookLog\[\] = \[\];/,
    "let webhookLogs: WebhookLog[] = [];\n" + insertCode
  );
  
  // also add customers to /api/state response
  code = code.replace(
    /return res\.json\({\n      businesses: filteredBusinesses,\n      bookings: filteredBookings,\n      complaints: filteredComplaints,\n      webhookLogs: filteredWebhookLogs,/,
    "return res.json({\n      businesses: filteredBusinesses,\n      bookings: filteredBookings,\n      complaints: filteredComplaints,\n      webhookLogs: filteredWebhookLogs,\n      customers: customers.filter(c => c.businessId === businessId),\n"
  );
  
  code = code.replace(
    /return res\.json\({\n      businesses,\n      bookings,\n      complaints,\n      webhookLogs,\n      paymentRequests,/,
    "return res.json({\n      businesses,\n      bookings,\n      complaints,\n      webhookLogs,\n      paymentRequests,\n      customers,\n"
  );
  
  fs.writeFileSync('server.ts', code);
}
