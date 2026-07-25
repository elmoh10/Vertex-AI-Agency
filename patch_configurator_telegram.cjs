const fs = require('fs');
let code = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');

code = code.replace(
  /facebookAccessToken,\n      autoPilotEnabled/,
  "facebookAccessToken,\n      telegramBotToken,\n      autoPilotEnabled"
);

fs.writeFileSync('src/components/ClientConfigurator.tsx', code);
