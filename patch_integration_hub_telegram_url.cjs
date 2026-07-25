const fs = require('fs');
let code = fs.readFileSync('src/components/IntegrationHub.tsx', 'utf8');

const serverBaseUrlMatch = code.match(/const facebookWebhookUrl = \\\`\\\$\\{serverBaseUrl\\}\/api\/webhooks\/facebook\\\`;/);
if (code.includes('facebookWebhookUrl =')) {
  code = code.replace(
    /const facebookWebhookUrl = [^\n]+;/,
    "const facebookWebhookUrl = \`\${serverBaseUrl}/api/webhooks/facebook\`;\n  const telegramWebhookUrl = \`\${serverBaseUrl}/api/webhooks/telegram\`;"
  );
}

fs.writeFileSync('src/components/IntegrationHub.tsx', code);
