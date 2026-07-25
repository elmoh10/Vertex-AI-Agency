const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t1 = `    object: channel === "whatsapp" ? "whatsapp_business_account" : (channel === 'telegram' ? "telegram_bot" : "instagram_account"),`;
const r1 = `    object: channel === "whatsapp" ? "whatsapp_business_account" : (channel === 'telegram' ? "telegram_bot" : (channel === 'facebook' ? 'page' : "instagram_account")),`;

const t2 = `  logWebhook("incoming", channel, \`مستلم عبر \${channel === 'whatsapp' ? 'واتساب' : (channel === 'telegram' ? 'تليجرام' : 'إنستجرام')}: "\${message}"\`, incomingPayload, biz.id, "success");`;
const r2 = `  logWebhook("incoming", channel, \`مستلم عبر \${channel === 'whatsapp' ? 'واتساب' : (channel === 'telegram' ? 'تليجرام' : (channel === 'facebook' ? 'فيسبوك' : 'إنستجرام'))}: "\${message}"\`, incomingPayload, biz.id, "success");`;

code = code.replace(t1, r1);
code = code.replace(t2, r2);

fs.writeFileSync('server.ts', code);
