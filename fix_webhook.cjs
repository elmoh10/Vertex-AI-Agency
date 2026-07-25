const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /channel: 'whatsapp' \| 'instagram' \| 'facebook' \| 'webhook_verification' \| 'billing',/g,
  "channel: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'webhook_verification' | 'billing',"
);

fs.writeFileSync('server.ts', code);
