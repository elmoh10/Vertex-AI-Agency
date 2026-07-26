const fs = require('fs');
let code = fs.readFileSync('src/components/IntegrationHub.tsx', 'utf8');

const t1 = `  const whatsappWebhookUrl = \`\${serverBaseUrl}/api/webhooks/whatsapp\`;`;
const r1 = `  const whatsappWebhookUrl = \`\${serverBaseUrl}/api/webhooks/whatsapp\`;
  const wasenderWebhookUrl = \`\${serverBaseUrl}/api/webhooks/wasender?businessId=\${currentUser?.businessId || ''}\`;`;
  
code = code.replace(t1, r1);

const t2 = `                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">نهاية ويبهوك واتساب (WhatsApp Webhook)</span>
                    <button onClick={() => handleCopy(whatsappWebhookUrl, 'url')} className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer">
                      {copiedText === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      نسخ الرابط
                    </button>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-left truncate">{whatsappWebhookUrl}</div>
                </div>`;

const r2 = `                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-2">نهاية ويبهوك واتساب (WaSender API)</span>
                    <button onClick={() => handleCopy(wasenderWebhookUrl, 'url')} className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer">
                      {copiedText === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      نسخ الرابط
                    </button>
                  </div>
                  <div className="p-3 bg-emerald-950/20 rounded border border-emerald-900/30 text-emerald-300 font-mono text-left truncate">{wasenderWebhookUrl}</div>
                  <p className="text-[10px] text-slate-400">استخدم هذا الرابط في موقع wasenderapi.com وتأكد من إضافة API Access Token في إعدادات العميل.</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">نهاية ويبهوك واتساب الرسمي (Official WhatsApp API)</span>
                    <button onClick={() => handleCopy(whatsappWebhookUrl, 'url')} className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer">
                      {copiedText === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      نسخ الرابط
                    </button>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-left truncate">{whatsappWebhookUrl}</div>
                </div>`;
                
code = code.replace(t2, r2);

fs.writeFileSync('src/components/IntegrationHub.tsx', code);
