const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const webhookCode = `

// Wasender Webhook
app.post("/api/webhooks/wasender", async (req, res) => {
  const body = req.body;
  res.status(200).send("EVENT_RECEIVED");
  
  try {
    // Attempt to parse typical WhatsApp API Gateway payloads
    let text = "";
    let senderId = "";
    let senderName = "عميل";
    let businessId = req.query.businessId; // Support passing ?businessId=
    
    // Support multiple common formats (Evolution, WAApi, UltraMsg, WappBot)
    if (body.data && body.data.body) {
      text = body.data.body;
      senderId = body.data.from || body.data.sender;
    } else if (body.message && body.message.text) {
      text = body.message.text;
      senderId = body.message.from || body.message.sender;
    } else if (body.text) {
      text = body.text;
      senderId = body.from || body.sender;
    } else if (body.body) {
      text = body.body;
      senderId = body.from || body.sender;
    }
    
    // Clean up sender ID (remove @s.whatsapp.net etc)
    senderId = senderId ? senderId.split('@')[0] : "";
    
    if (text && senderId) {
      let biz = null;
      if (businessId) {
        biz = businesses.find(b => b.id === businessId);
      } else {
        // Find by token or generic if single tenant
        biz = businesses.find(b => b.wasenderWebhookSecret === req.headers['x-webhook-secret']) || businesses[0];
      }
      
      if (!biz) return;
      
      logWebhook("incoming", "whatsapp", \`رسالة WaSender من \${senderId}: "\${text}"\`, body, biz.id, "success");
      
      const result = await processAgentInteraction(biz, text, "whatsapp", senderName, senderId);
      
      if (biz.wasenderAccessToken) {
        // Attempt to send response via WaSender API
        await fetch('https://wasenderapi.com/api/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${biz.wasenderAccessToken}\`
          },
          body: JSON.stringify({
            number: senderId,
            message: result.responseText
          })
        }).catch(e => console.error("WaSender Send Error:", e));
        
        logWebhook("outgoing", "whatsapp", \`تم إرسال رد تلقائي عبر WaSender إلى \${senderId}\`, { responseText: result.responseText }, biz.id, "success");
      }
    }
  } catch (err) {
    console.error("WaSender Webhook Error:", err);
  }
});
`;

code = code.replace('app.post("/api/webhooks/whatsapp"', webhookCode + '\napp.post("/api/webhooks/whatsapp"');

fs.writeFileSync('server.ts', code);
