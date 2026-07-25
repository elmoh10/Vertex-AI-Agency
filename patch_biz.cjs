const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const \{ id, name, systemPrompt, welcomeMessage, services, workingHours, quickReplies, googleSheetsId, googleSheetsLinked, googleSheetsAccessToken, whatsappSenderNumber, instagramAccountId, instagramAccessToken, facebookPageId, facebookAccessToken \} = req\.body;/,
  `const { id, name, systemPrompt, welcomeMessage, services, workingHours, quickReplies, googleSheetsId, googleSheetsLinked, googleSheetsAccessToken, whatsappSenderNumber, instagramAccountId, instagramAccessToken, facebookPageId, facebookAccessToken, telegramBotToken } = req.body;`
);

code = code.replace(
  /facebookAccessToken: facebookAccessToken !== undefined \? facebookAccessToken : businesses\[index\]\.facebookAccessToken/,
  `facebookAccessToken: facebookAccessToken !== undefined ? facebookAccessToken : businesses[index].facebookAccessToken,
      telegramBotToken: telegramBotToken !== undefined ? telegramBotToken : businesses[index].telegramBotToken`
);

fs.writeFileSync('server.ts', code);
