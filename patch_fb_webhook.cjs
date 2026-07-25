const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const fbTarget = `app.post("/api/webhooks/facebook", async (req, res) => {
  const body = req.body;
  res.status(200).send("EVENT_RECEIVED");
  
  try {
    if (body.object === "page" && body.entry) {`;

const fbNew = `app.post("/api/webhooks/facebook", async (req, res) => {
  const body = req.body;
  res.status(200).send("EVENT_RECEIVED");
  logWebhook("incoming", "facebook", "رسالة واردة عبر ماسنجر (تجريبي)", { body });
  
  try {
    if (body.object === "page" && body.entry) {`;
    
code = code.replace(fbTarget, fbNew);
fs.writeFileSync('server.ts', code);
