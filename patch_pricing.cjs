const fs = require('fs');
let code = fs.readFileSync('src/components/PricingManager.tsx', 'utf8');

// Growth: remove telegram
code = code.replace(
  /'تكامل كامل مع واتساب، إنستجرام، وتليجرام',/,
  "'تكامل كامل مع واتساب وإنستجرام',"
);

// Enterprise: add telegram explicitly
code = code.replace(
  /      'كل ما تشمله الباقة المتقدمة',\n/,
  "      'كل ما تشمله الباقة المتقدمة',\n      'تكامل إضافي مع منصة تليجرام (Telegram)',\n"
);

fs.writeFileSync('src/components/PricingManager.tsx', code);
