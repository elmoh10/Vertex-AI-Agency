const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const insertCode = `
let customers: any[] = [
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
  /let paymentRequests: PaymentRequest\[\] = \[/,
  insertCode + "\nlet paymentRequests: PaymentRequest[] = ["
);

fs.writeFileSync('server.ts', code);
