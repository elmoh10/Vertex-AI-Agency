const fs = require('fs');
let code = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');

code = code.replace(
  /channel: 'whatsapp' \| 'instagram' \| 'telegram'/g,
  "channel: 'whatsapp' | 'instagram' | 'telegram' | 'facebook'"
);

const t1 = `            <button 
              type="button"
              onClick={() => setChannel('telegram')}
              className={\`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer \${
                channel === 'telegram' ? 'bg-[#0088cc] text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              تليجرام Telegram
            </button>`;

const r1 = `            <button 
              type="button"
              onClick={() => setChannel('telegram')}
              className={\`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer \${
                channel === 'telegram' ? 'bg-[#0088cc] text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              تليجرام Telegram
            </button>
            <button 
              type="button"
              onClick={() => setChannel('facebook')}
              className={\`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer \${
                channel === 'facebook' ? 'bg-[#0084FF] text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              فيسبوك
            </button>`;
code = code.replace(t1, r1);

code = code.replace(
  /channel === 'whatsapp' \? 'bg-emerald-950\/90 border-emerald-900' : \(channel === 'telegram' \? 'bg-blue-950\/90 border-blue-900' : 'bg-gradient-to-r from-purple-950\/90 to-pink-950\/90 border-purple-900'\)/g,
  "channel === 'whatsapp' ? 'bg-emerald-950/90 border-emerald-900' : (channel === 'telegram' ? 'bg-blue-950/90 border-blue-900' : (channel === 'facebook' ? 'bg-[#0084FF]/20 border-[#0084FF]/50' : 'bg-gradient-to-r from-purple-950/90 to-pink-950/90 border-purple-900'))"
);

code = code.replace(
  /\{channel === 'whatsapp' \? 'WA' : \(channel === 'telegram' \? 'TG' : 'IG'\)\}/g,
  "{channel === 'whatsapp' ? 'WA' : (channel === 'telegram' ? 'TG' : (channel === 'facebook' ? 'FB' : 'IG'))}"
);

code = code.replace(
  /\{channel === 'whatsapp' \? 'واتساب' : \(channel === 'telegram' \? 'تليجرام' : 'إنستجرام'\)\}/g,
  "{channel === 'whatsapp' ? 'واتساب' : (channel === 'telegram' ? 'تليجرام' : (channel === 'facebook' ? 'فيسبوك' : 'إنستجرام'))}"
);

fs.writeFileSync('src/components/SandboxSimulator.tsx', code);
