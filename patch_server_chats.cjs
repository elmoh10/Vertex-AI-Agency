const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('let chatMessages: ChatMessage[] = [];')) {
  code = code.replace(
    /let webhookLogs: WebhookLog\[\] = \[/,
    "let chatMessages: ChatMessage[] = [];\nlet webhookLogs: WebhookLog[] = ["
  );
  
  // State 1
  code = code.replace(
    /const filteredWebhookLogs = webhookLogs\.filter\(l => l\.businessId === businessId \|\| !l\.businessId\);/,
    "const filteredWebhookLogs = webhookLogs.filter(l => l.businessId === businessId || !l.businessId);\n    const filteredChatMessages = chatMessages.filter(m => m.businessId === businessId);"
  );
  
  code = code.replace(
    /webhookLogs: filteredWebhookLogs,/,
    "webhookLogs: filteredWebhookLogs,\n      chatMessages: filteredChatMessages,"
  );

  // State 2 (admin)
  code = code.replace(
    /webhookLogs,\n\s*paymentRequests,\n\s*customers,/,
    "webhookLogs,\n      paymentRequests,\n      customers,\n      chatMessages,"
  );
  
  // Reset
  code = code.replace(
    /webhookLogs = \[\];/,
    "webhookLogs = [];\n  chatMessages = [];"
  );
  
  code = code.replace(
    /webhookLogs \}\);/,
    "webhookLogs, chatMessages });"
  );

  fs.writeFileSync('server.ts', code);
}
