const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /actionDetails\?: string;/,
  "actionDetails?: string;\n  actionType?: string;"
);

fs.writeFileSync('src/types.ts', code);
