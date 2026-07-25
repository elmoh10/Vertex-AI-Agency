const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const telegramWebhook = `
app.post("/api/webhooks/telegram/:businessId", async (req, res) => {
  const { businessId } = req.params;
  const body = req.body;
  
  res.status(200).send("OK");
  
  try {
    const biz = businesses.find(b => b.id === businessId);
    if (!biz || !biz.telegramBotToken) return;

    if (body.message && body.message.text) {
      const text = body.message.text;
      const senderId = body.message.chat.id.toString();
      const senderName = body.message.from.first_name || "عميل";

      logWebhook("incoming", "telegram", \`رسالة تليجرام من \${senderName}: "\${text}"\`, body, biz.id, "success");

      const result = await processAgentInteraction(biz, text, "telegram", senderName, senderId);

      // Send response via Telegram API
      await fetch(\`https://api.telegram.org/bot\${biz.telegramBotToken}/sendMessage\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: senderId,
          text: result.responseText
        })
      });

      logWebhook("outgoing", "telegram", \`تم إرسال رد تلقائي إلى \${senderId} عبر تليجرام\`, { responseText: result.responseText }, biz.id, "success");
    }
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    logWebhook("system", "telegram", "خطأ أثناء معالجة ويبهوك تليجرام", { error: String(error) }, businessId, "failed");
  }
});
`;

code = code.replace(/app\.get\("\/api\/webhooks\/instagram",/, telegramWebhook + '\napp.get("/api/webhooks/instagram",');
fs.writeFileSync('server.ts', code);
