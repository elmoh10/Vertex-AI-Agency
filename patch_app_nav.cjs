const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const navItems = \[\n\s*\{ id: 'dashboard', label: 'نظرة عامة', icon: LayoutDashboard \},\n\s*\{ id: 'config', label: 'تهيئة العملاء', icon: Settings \},/,
  "const navItems = [\n    { id: 'dashboard', label: 'نظرة عامة', icon: LayoutDashboard },\n    { id: 'crm', label: 'العملاء (CRM)', icon: Users },\n    { id: 'config', label: 'تهيئة العملاء', icon: Settings },"
);

fs.writeFileSync('src/App.tsx', code);
