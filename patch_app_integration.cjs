const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<IntegrationHub businesses=\{businesses\} plans=\{plans\} currentUser=\{user\} \/>/,
  "<IntegrationHub businesses={businesses} plans={plans} currentUser={user} webhookLogs={webhookLogs} chatMessages={chatMessages} />"
);

fs.writeFileSync('src/App.tsx', code);
