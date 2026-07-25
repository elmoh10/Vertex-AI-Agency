const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('app.post("/api/webhooks/instagram"')) {
  const insertCode = `
app.post("/api/webhooks/instagram", async (req, res) => {
  const body = req.body;
  logWebhook("incoming", "instagram", "رسالة واردة عبر انستجرام (تجريبي)", { body });
  res.status(200).send("EVENT_RECEIVED");
});
`;

  code = code.replace(
    /app\.get\("\/api\/webhooks\/instagram", \(req, res\) => \{[\s\S]*?res\.status\(400\)\.send\("Bad Request"\);\n\}\);/,
    match => match + "\n" + insertCode
  );
  fs.writeFileSync('server.ts', code);
}
