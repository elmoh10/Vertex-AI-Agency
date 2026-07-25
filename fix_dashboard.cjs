const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

if (!code.includes('import {') || !code.includes('MessageCircle')) {
  code = code.replace(
    /Sparkles,\n/,
    "Sparkles,\n  MessageCircle,\n"
  );
}

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
