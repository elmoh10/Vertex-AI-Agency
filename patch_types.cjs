const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const t1 = `  services: string[];`;
const r1 = `  services: { name: string; price: string }[];
  wasenderAccessToken?: string;
  wasenderWebhookSecret?: string;`;

code = code.replace(t1, r1);
fs.writeFileSync('src/types.ts', code);
