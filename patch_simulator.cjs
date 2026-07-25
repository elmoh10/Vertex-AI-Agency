const fs = require('fs');
let code = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');

const oldCode = `            <button 
              type="button"
              onClick={() => setChannel('instagram')}
              className={\`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer \${
                channel === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              إنستجرام Instagram
            </button>
          </div>`;

const newCode = `            <button 
              type="button"
              onClick={() => setChannel('instagram')}
              className={\`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer \${
                channel === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              إنستجرام IG
            </button>
            <button 
              type="button"
              onClick={() => setChannel('telegram')}
              className={\`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer \${
                channel === 'telegram' ? 'bg-[#0088cc] text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }\`}
            >
              تليجرام Telegram
            </button>
          </div>`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/SandboxSimulator.tsx', code);
