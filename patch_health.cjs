const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const healthRoute = `
app.get("/api/health/ai", (req, res) => {
  res.json({ connected: !!process.env.GEMINI_API_KEY });
});
`;

code = code.replace(/app\.get\("\/api\/state",/, healthRoute + '\napp.get("/api/state",');
fs.writeFileSync('server.ts', code);
