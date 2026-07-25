const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('app.get("/api/webhooks/facebook"')) {
  const insertCode = `
app.get("/api/webhooks/facebook", (req, res) => {
  const verifyToken = "VERTEX_AI_AGENCY_TOKEN_2026";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      logWebhook("system", "facebook", "طلب تفعيل Webhook من Meta لفيسبوك (ناجح)", { query: req.query });
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification token mismatch");
  }
  res.status(400).send("Bad Request");
});

app.post("/api/webhooks/facebook", async (req, res) => {
  const body = req.body;
  logWebhook("incoming", "facebook", "رسالة واردة عبر ماسنجر (تجريبي)", { body });
  res.status(200).send("EVENT_RECEIVED");
});
`;

  code = code.replace(
    /app\.get\("\/api\/webhooks\/instagram", \(req, res\) => \{/,
    insertCode + "\napp.get(\"/api/webhooks/instagram\", (req, res) => {"
  );
  fs.writeFileSync('server.ts', code);
}
