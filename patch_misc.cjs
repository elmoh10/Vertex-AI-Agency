const fs = require('fs');

// Patch DashboardOverview.tsx
let dashboardCode = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');
dashboardCode = dashboardCode.replace(
  /قناة: \{log\.channel === 'whatsapp' \? 'واتساب' : log\.channel === 'instagram' \? 'إنستجرام' : 'التحقق'\}/,
  "قناة: {log.channel === 'whatsapp' ? 'واتساب' : log.channel === 'instagram' ? 'إنستجرام' : log.channel === 'telegram' ? 'تليجرام' : 'التحقق'}"
);
fs.writeFileSync('src/components/DashboardOverview.tsx', dashboardCode);

// Patch SandboxSimulator.tsx
let sandboxCode = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');
sandboxCode = sandboxCode.replace(
  /عبر واتساب أو إنستجرام وتتبع فوراً/,
  "عبر واتساب أو إنستجرام أو تليجرام وتتبع فوراً"
);
fs.writeFileSync('src/components/SandboxSimulator.tsx', sandboxCode);

// Patch ClientConfigurator.tsx
let clientConfigCode = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');
clientConfigCode = clientConfigCode.replace(
  /من واتساب أو إنستجرام للعميل، سيتم تدوينها فوراً/,
  "من واتساب، إنستجرام، أو تليجرام للعميل، سيتم تدوينها فوراً"
);
fs.writeFileSync('src/components/ClientConfigurator.tsx', clientConfigCode);

