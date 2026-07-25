const fs = require('fs');
let code = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');

code = code.replace(
  /const \[facebookAccessToken, setFacebookAccessToken\] = useState\(''\);/,
  `const [facebookAccessToken, setFacebookAccessToken] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');`
);

code = code.replace(
  /setFacebookAccessToken\(biz\.facebookAccessToken \|\| ''\);/,
  `setFacebookAccessToken(biz.facebookAccessToken || '');
        setTelegramBotToken(biz.telegramBotToken || '');`
);

code = code.replace(
  /facebookAccessToken,(\n\s*onSave)/,
  `facebookAccessToken,\n      telegramBotToken,$1`
);

const telegramHtml = `
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400">توكن بوت تليجرام (Telegram Bot Token)</label>
                  <input 
                    type="text"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    placeholder="مثال: 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                  {telegramBotToken && (
                    <div className="text-[10px] text-emerald-500 mt-1">
                      رابط الويبهوك الخاص بك: 
                      <span className="font-mono text-emerald-400 mr-1 select-all break-all">
                        {window.location.origin}/api/webhooks/telegram/{selectedBusiness}
                      </span>
                    </div>
                  )}
                </div>
`;

code = code.replace(
  /<\/div>\n\s*<\/div>\n\s*\{\/\* Google Sheets Integration Section \*\/\}/,
  `${telegramHtml}              </div>\n            </div>\n            {/* Google Sheets Integration Section */}`
);

fs.writeFileSync('src/components/ClientConfigurator.tsx', code);
