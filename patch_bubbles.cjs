const fs = require('fs');
let code = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');

const oldBubbles = `                  className={\`max-w-[85%] rounded-2xl p-3 leading-relaxed relative space-y-1.5 \${
                    msg.sender === 'customer' 
                      ? 'bg-slate-800 text-slate-100 self-start rounded-tr-none' 
                      : msg.sender === 'agent'
                      ? 'bg-emerald-950 text-slate-100 self-end rounded-tl-none border border-emerald-900'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 text-center text-[11px] self-center w-full max-w-full'
                  }\`}`;

const newBubbles = `                  className={\`max-w-[85%] p-3 leading-relaxed relative space-y-1.5 shadow-sm \${
                    msg.sender === 'customer' 
                      ? 'bg-emerald-600 text-white self-start rounded-2xl rounded-tr-sm' 
                      : msg.sender === 'agent'
                      ? 'bg-slate-800 text-slate-100 self-end rounded-2xl rounded-tl-sm border border-slate-700'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 text-center text-[11px] self-center w-full max-w-full rounded-lg'
                  }\`}`;

code = code.replace(oldBubbles, newBubbles);

const oldTyping = `{isTyping && (
                <div className="bg-emerald-950/50 border border-emerald-900/50 text-slate-300 self-end rounded-2xl rounded-tl-none p-3 max-w-[85%] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-emerald-400/80 mr-1.5 font-bold">المساعد يكتب...</span>
                </div>
              )}`;

const newTyping = `{isTyping && (
                <div className="bg-slate-800 border border-slate-700 text-slate-300 self-end rounded-2xl rounded-tl-sm p-3 max-w-[85%] flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">جاري الكتابة...</span>
                </div>
              )}`;

code = code.replace(oldTyping, newTyping);

fs.writeFileSync('src/components/SandboxSimulator.tsx', code);
