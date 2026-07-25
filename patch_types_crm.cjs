const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('export interface Customer {')) {
  code += `
export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  totalBookings: number;
  totalComplaints: number;
  lastInteraction: string;
  tags: string[];
  notes?: string;
}
`;
  fs.writeFileSync('src/types.ts', code);
}
