const fs = require('fs');
let code = fs.readFileSync('src/components/IntegrationHub.tsx', 'utf8');

if (!code.includes('webhookLogs?: any[];')) {
  code = code.replace(
    /interface IntegrationHubProps \{/,
    "interface IntegrationHubProps {\n  webhookLogs?: any[];\n  chatMessages?: any[];"
  );
  
  code = code.replace(
    /export default function IntegrationHub\(\{ businesses, plans, currentUser \}: IntegrationHubProps\) \{/,
    "export default function IntegrationHub({ businesses, plans, currentUser, webhookLogs = [], chatMessages = [] }: IntegrationHubProps) {"
  );
  fs.writeFileSync('src/components/IntegrationHub.tsx', code);
}
