const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');
code = code.replace(
  /Building2,\s*CalendarCheck,/,
  "Building2, MessageCircle, CalendarCheck,"
);
fs.writeFileSync('src/components/DashboardOverview.tsx', code);
