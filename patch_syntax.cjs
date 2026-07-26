const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      } else if (parsedResult.actionType === "COMPLAINT") {`;
const replacement = `        }
      } else if (parsedResult.actionType === "COMPLAINT") {`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
