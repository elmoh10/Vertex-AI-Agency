const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /facebookAccessToken\?: string;/,
  \`facebookAccessToken?: string;
  telegramBotToken?: string;
  telegramLinked?: boolean;\`
);

code = code.replace(
  /channel: 'whatsapp' \| 'instagram' \| 'facebook' \| 'webhook_verification' \| 'billing';/,
  \`channel: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'webhook_verification' | 'billing';\`
);

fs.writeFileSync('src/types.ts', code);
