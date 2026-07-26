const fs = require('fs');
let code = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');

const t1 = `                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">رقم واتساب للإرسال</label>
                  <input 
                    type="text"
                    placeholder="مثال: 9665XXXXXXXX"
                    value={whatsappSenderNumber}
                    onChange={(e) => setWhatsappSenderNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>`;

const r1 = `                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">رقم واتساب للإرسال</label>
                  <input 
                    type="text"
                    placeholder="مثال: 9665XXXXXXXX"
                    value={whatsappSenderNumber}
                    onChange={(e) => setWhatsappSenderNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">API Access Token (wasenderapi.com)</label>
                  <input 
                    type="text"
                    placeholder="ضع التوكن هنا لتسهيل الربط"
                    value={wasenderAccessToken}
                    onChange={(e) => setWasenderAccessToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">Webhook Secret (wasenderapi.com)</label>
                  <input 
                    type="text"
                    placeholder="كلمة سر الويب هوك"
                    value={wasenderWebhookSecret}
                    onChange={(e) => setWasenderWebhookSecret(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>`;

code = code.replace(t1, r1);
fs.writeFileSync('src/components/ClientConfigurator.tsx', code);
