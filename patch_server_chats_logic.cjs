const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target1 = `  try {
    const systemPrompt = \``;
    
const replacement1 = `  // Record incoming message
  chatMessages.push({
    id: "msg_" + Math.random().toString(36).substr(2, 9),
    businessId: biz.id,
    customerPhone: senderPhone,
    sender: "customer",
    text: message,
    timestamp: new Date().toISOString()
  });

  try {
    const systemPrompt = \``;

code = code.replace(target1, replacement1);

const target2 = `    return {
      responseText: parsedResult.responseText,
      actionDetected: parsedResult.actionDetected,
      actionDetailsText
    };`;
    
const replacement2 = `    // Record outgoing agent message
    chatMessages.push({
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      businessId: biz.id,
      customerPhone: senderPhone,
      sender: "agent",
      text: parsedResult.responseText,
      timestamp: new Date().toISOString(),
      isActionTriggered: parsedResult.actionDetected,
      actionType: parsedResult.actionType,
      actionDetails: actionDetailsText
    });

    return {
      responseText: parsedResult.responseText,
      actionDetected: parsedResult.actionDetected,
      actionDetailsText
    };`;

code = code.replace(target2, replacement2);
fs.writeFileSync('server.ts', code);
