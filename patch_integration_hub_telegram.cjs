const fs = require('fs');
let code = fs.readFileSync('src/components/IntegrationHub.tsx', 'utf8');

// Also update initial state for connectStatus
code = code.replace(
  /facebook: 'idle'\n  \}\);/,
  "facebook: 'idle',\n    telegram: 'idle'\n  });"
);

// Update paragraph text
code = code.replace(
  /قم بربط قنواتك على منصات ميتا \(Meta\) بنقرة واحدة لتفعيل الذكاء الاصطناعي مباشرة دون الحاجة لضبط الإعدادات المعقدة\./,
  "قم بربط قنواتك على منصات ميتا (Meta) وتليجرام بنقرة واحدة لتفعيل الذكاء الاصطناعي مباشرة دون الحاجة لضبط الإعدادات المعقدة."
);

// Update grid and array
const oldGrid = `              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { id: 'whatsapp', label: 'واتساب أعمال', color: 'bg-[#25D366]' },
                  { id: 'instagram', label: 'إنستجرام', color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]' },
                  { id: 'facebook', label: 'فيسبوك ماسنجر', color: 'bg-[#0084FF]' },
                ].map(platform => (`;

const newGrid = `              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { id: 'whatsapp', label: 'واتساب أعمال', color: 'bg-[#25D366]', initial: 'و' },
                  { id: 'instagram', label: 'إنستجرام', color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]', initial: 'إ' },
                  { id: 'facebook', label: 'فيسبوك ماسنجر', color: 'bg-[#0084FF]', initial: 'ف' },
                  { id: 'telegram', label: 'تليجرام', color: 'bg-[#0088cc]', initial: 'ت' },
                ].map(platform => (`;

code = code.replace(oldGrid, newGrid);

// Update mapping rendering
code = code.replace(
  /\{platform\.label\.substring\(0, 1\)\}/,
  "{platform.initial}"
);

// Add Telegram Webhook info
const fbWebhookSection = `                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-2">
                      نهاية ويبهوك ماسنجر فيسبوك (Facebook Messenger Webhook)
                      {isChannelsLimited && (
                        <span className="bg-amber-500/10 text-amber-400 text-[9px] px-2 py-0.5 rounded border border-amber-900/30 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          يتطلب ترقية الباقة
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-left truncate">
                    {isChannelsLimited ? '••••••••••••••••••••••••••••••••••••' : facebookWebhookUrl}
                  </div>
                </div>`;

const tgWebhookSection = `                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-2">
                      نهاية ويبهوك تليجرام (Telegram Webhook)
                      {isChannelsLimited && (
                        <span className="bg-amber-500/10 text-amber-400 text-[9px] px-2 py-0.5 rounded border border-amber-900/30 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          يتطلب ترقية الباقة
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-left truncate">
                    {isChannelsLimited ? '••••••••••••••••••••••••••••••••••••' : telegramWebhookUrl}
                  </div>
                </div>`;

code = code.replace(fbWebhookSection, fbWebhookSection + "\n\n" + tgWebhookSection);

fs.writeFileSync('src/components/IntegrationHub.tsx', code);
