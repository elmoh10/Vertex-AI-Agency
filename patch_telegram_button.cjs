const fs = require('fs');
let code = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');

const targetHtml = `{telegramBotToken && (
                    <div className="text-[10px] text-emerald-500 mt-1">
                      رابط الويبهوك الخاص بك: 
                      <span className="font-mono text-emerald-400 mr-1 select-all break-all">
                        {window.location.origin}/api/webhooks/telegram/{selectedBusiness}
                      </span>
                    </div>
                  )}`;

const newHtml = `{telegramBotToken && (
                    <div className="mt-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-emerald-500 mb-2">
                        رابط الويبهوك الخاص بك: 
                        <span className="font-mono text-emerald-400 mr-1 select-all break-all">
                          {window.location.origin}/api/webhooks/telegram/{selectedBusiness}
                        </span>
                      </div>
                      <button 
                        onClick={async () => {
                          try {
                            const url = \`https://api.telegram.org/bot\${telegramBotToken}/setWebhook?url=\${window.location.origin}/api/webhooks/telegram/\${selectedBusiness}\`;
                            const res = await fetch(url);
                            const data = await res.json();
                            if (data.ok) {
                              alert('تم ربط تليجرام وتفعيل الويبهوك بنجاح! 🚀');
                            } else {
                              alert('حدث خطأ أثناء الربط: ' + data.description);
                            }
                          } catch (e) {
                            alert('فشل الاتصال بخوادم تليجرام.');
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                      >
                        تفعيل الربط تلقائياً
                      </button>
                    </div>
                  )}`;

code = code.replace(targetHtml, newHtml);

fs.writeFileSync('src/components/ClientConfigurator.tsx', code);
