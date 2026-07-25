const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /\`مستلم عبر \$\{channel === 'whatsapp' \? 'واتساب' : 'إنستجرام'\}\: "\$\{message\}"\`/g,
  `\`مستلم عبر \${channel === 'whatsapp' ? 'واتساب' : (channel === 'telegram' ? 'تليجرام' : 'إنستجرام')}: "\${message}"\``
);

code = code.replace(
  /\`رد ملقى عبر \$\{channel === 'whatsapp' \? 'واتساب' : 'إنستجرام'\}\`/g,
  `\`رد ملقى عبر \${channel === 'whatsapp' ? 'واتساب' : (channel === 'telegram' ? 'تليجرام' : 'إنستجرام')}\``
);

code = code.replace(
  /object: channel === "whatsapp" \? "whatsapp_business_account" : "instagram_account",/,
  `object: channel === "whatsapp" ? "whatsapp_business_account" : (channel === 'telegram' ? "telegram_bot" : "instagram_account"),`
);

fs.writeFileSync('server.ts', code);
