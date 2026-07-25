const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const fbTarget = `app.post("/api/webhooks/facebook", async (req, res) => {
  const body = req.body;
  logWebhook("incoming", "facebook", "رسالة واردة عبر ماسنجر (تجريبي)", { body });
  res.status(200).send("EVENT_RECEIVED");
});`;

const fbNew = `app.post("/api/webhooks/facebook", async (req, res) => {
  const body = req.body;
  res.status(200).send("EVENT_RECEIVED");
  
  try {
    if (body.object === "page" && body.entry) {
      for (const entry of body.entry) {
        const pageId = entry.id;
        const biz = businesses.find(b => b.facebookPageId === pageId) || businesses[0];
        
        if (!biz) continue;

        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.message && event.message.text) {
              const text = event.message.text;
              const senderId = event.sender.id;
              
              logWebhook("incoming", "facebook", \`رسالة فيسبوك ماسنجر من \${senderId}: "\${text}"\`, body, biz.id, "success");
              
              const result = await processAgentInteraction(biz, text, "facebook", "عميل فيسبوك", senderId);
              
              if (biz.facebookAccessToken) {
                await fetch(\`https://graph.facebook.com/v21.0/me/messages?access_token=\${biz.facebookAccessToken}\`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    recipient: { id: senderId },
                    messaging_type: "RESPONSE",
                    message: { text: result.responseText }
                  })
                });
                logWebhook("outgoing", "facebook", \`تم إرسال رد تلقائي إلى \${senderId} عبر ماسنجر\`, { responseText: result.responseText }, biz.id, "success");
              } else {
                logWebhook("system", "facebook", "تم معالجة الرسالة ولكن facebookAccessToken غير متوفر لإرسال الرد الحقيقي", result, biz.id, "success");
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing Facebook webhook:", error);
    logWebhook("system", "facebook", "خطأ أثناء معالجة ويبهوك فيسبوك", { error: String(error) }, null, "failed");
  }
});`;

code = code.replace(fbTarget, fbNew);

const igTarget = `app.post("/api/webhooks/instagram", async (req, res) => {
  const body = req.body;
  logWebhook("incoming", "instagram", "رسالة واردة عبر انستجرام (تجريبي)", { body });
  res.status(200).send("EVENT_RECEIVED");
});`;

const igNew = `app.post("/api/webhooks/instagram", async (req, res) => {
  const body = req.body;
  res.status(200).send("EVENT_RECEIVED");

  try {
    if ((body.object === "instagram" || body.object === "page") && body.entry) {
      for (const entry of body.entry) {
        const accountId = entry.id; // Could be instagram account id or page id
        const biz = businesses.find(b => b.instagramAccountId === accountId || b.facebookPageId === accountId) || businesses[0];
        
        if (!biz) continue;

        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.message && event.message.text) {
              const text = event.message.text;
              const senderId = event.sender.id;
              
              logWebhook("incoming", "instagram", \`رسالة انستجرام من \${senderId}: "\${text}"\`, body, biz.id, "success");
              
              const result = await processAgentInteraction(biz, text, "instagram", "عميل انستجرام", senderId);
              
              if (biz.instagramAccessToken || biz.facebookAccessToken) {
                const token = biz.instagramAccessToken || biz.facebookAccessToken;
                await fetch(\`https://graph.facebook.com/v21.0/me/messages?access_token=\${token}\`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    recipient: { id: senderId },
                    messaging_type: "RESPONSE",
                    message: { text: result.responseText }
                  })
                });
                logWebhook("outgoing", "instagram", \`تم إرسال رد تلقائي إلى \${senderId} عبر انستجرام\`, { responseText: result.responseText }, biz.id, "success");
              } else {
                logWebhook("system", "instagram", "تم معالجة الرسالة ولكن Access Token غير متوفر لإرسال الرد الحقيقي", result, biz.id, "success");
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing Instagram webhook:", error);
    logWebhook("system", "instagram", "خطأ أثناء معالجة ويبهوك انستجرام", { error: String(error) }, null, "failed");
  }
});`;

code = code.replace(igTarget, igNew);

fs.writeFileSync('server.ts', code);
