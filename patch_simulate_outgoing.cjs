const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  const outgoingPayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: senderPhone || "simulated_user_id",
    type: "text",
    text: { body: result.responseText },`;
    
const replacement = `  const outgoingPayload = {
    messaging_product: channel === 'whatsapp' ? 'whatsapp' : (channel === 'facebook' ? 'messenger' : channel),
    recipient_type: "individual",
    to: senderPhone || "simulated_user_id",
    type: "text",
    text: { body: result.responseText },`;
    
code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
