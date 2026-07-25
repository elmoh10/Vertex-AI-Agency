const fs = require('fs');
let code = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');

code = code.replace(
  /channel: 'whatsapp' \| 'instagram'/g,
  `channel: 'whatsapp' | 'instagram' | 'telegram'`
);

code = code.replace(
  /useState\<'whatsapp' \| 'instagram'\>\('whatsapp'\);/g,
  `useState<'whatsapp' | 'instagram' | 'telegram'>('whatsapp');`
);

// We need to add the telegram button
const tabs = `
            <div className="flex bg-slate-900 rounded-lg p-1 w-fit">
              <button
                onClick={() => setChannel('whatsapp')}
                className={\`px-4 py-1.5 rounded-md text-xs font-bold transition-all \${
                  channel === 'whatsapp' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                }\`}
              >
                واتساب
              </button>
              <button
                onClick={() => setChannel('instagram')}
                className={\`px-4 py-1.5 rounded-md text-xs font-bold transition-all \${
                  channel === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }\`}
              >
                إنستجرام
              </button>
              <button
                onClick={() => setChannel('telegram')}
                className={\`px-4 py-1.5 rounded-md text-xs font-bold transition-all \${
                  channel === 'telegram' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }\`}
              >
                تليجرام
              </button>
            </div>
`;

code = code.replace(
  /<div className="flex bg-slate-900 rounded-lg p-1 w-fit">[\s\S]*?<\/div>/,
  tabs
);

code = code.replace(
  /channel === 'whatsapp' \? 'bg-emerald-950\/90 border-emerald-900' : 'bg-gradient-to-r from-purple-950\/90 to-pink-950\/90 border-purple-900'/g,
  `channel === 'whatsapp' ? 'bg-emerald-950/90 border-emerald-900' : (channel === 'telegram' ? 'bg-blue-950/90 border-blue-900' : 'bg-gradient-to-r from-purple-950/90 to-pink-950/90 border-purple-900')`
);

code = code.replace(
  /\{channel === 'whatsapp' \? 'WA' : 'IG'\}/g,
  `{channel === 'whatsapp' ? 'WA' : (channel === 'telegram' ? 'TG' : 'IG')}`
);

code = code.replace(
  /\{channel === 'whatsapp' \? 'واتساب' : 'إنستجرام'\}/g,
  `{channel === 'whatsapp' ? 'واتساب' : (channel === 'telegram' ? 'تليجرام' : 'إنستجرام')}`
);

fs.writeFileSync('src/components/SandboxSimulator.tsx', code);
