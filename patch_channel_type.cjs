const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      let channel = "whatsapp"; // Default
      if (customerMsgs.length > 0) {
        // If we want to store channel in message, we might not have it yet. But we know it from webhook logs.
      }
      
      // Let's check webhook logs instead for the channel
      const customerLogs = webhookLogs.filter(l => l.businessId === bookings[index].businessId && l.payload && l.payload.customerPhone === bookings[index].customerPhone);
      if (customerLogs.length > 0) {
        channel = customerLogs[customerLogs.length - 1].channel || "whatsapp";
      }

      logWebhook("outgoing", channel, \`إرسال رسالة شكر وفاتورة للعميل: \${bookings[index].customerName}\`, {`;
      
const replacement = `      let channel: 'whatsapp' | 'instagram' | 'facebook' | 'telegram' | 'webhook_verification' | 'billing' = "whatsapp";
      // Let's check webhook logs instead for the channel
      const customerLogs = webhookLogs.filter(l => l.businessId === bookings[index].businessId && l.payload && l.payload.customerPhone === bookings[index].customerPhone);
      if (customerLogs.length > 0) {
        channel = customerLogs[customerLogs.length - 1].channel || "whatsapp";
      }

      logWebhook("outgoing", channel, \`إرسال رسالة شكر وفاتورة للعميل: \${bookings[index].customerName}\`, {`;
      
code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
