const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');
const lines = code.split('\n');
lines.forEach((line, i) => {
  if (line.includes('let webhookLogs')) console.log((i+1) + ': ' + line);
  if (line.includes('let complaints')) console.log((i+1) + ': ' + line);
  if (line.includes('let customers')) console.log((i+1) + ': ' + line);
});
