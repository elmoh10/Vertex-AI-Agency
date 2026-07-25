const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /if \(!\[\]\.has\(customerKey\)\) \{\s*\[\]\.add\(customerKey\);/g,
  "if (!knownCustomers.has(customerKey)) {\n    knownCustomers.add(customerKey);"
);

if (!code.includes('const knownCustomers = new Set<string>();')) {
  code = code.replace(
    /const app = express\(\);/,
    "const app = express();\nconst knownCustomers = new Set<string>();"
  );
}

// And fix telegram typings in webhookLog
code = code.replace(
  /channel: 'telegram'/g,
  "channel: 'telegram' as any"
);

fs.writeFileSync('server.ts', code);
