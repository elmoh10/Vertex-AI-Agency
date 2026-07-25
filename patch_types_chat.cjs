const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(
  "sender: 'customer' | 'agent' | 'system';",
  "businessId?: string;\n  customerPhone?: string;\n  sender: 'customer' | 'agent' | 'system';"
);
fs.writeFileSync('src/types.ts', code);
