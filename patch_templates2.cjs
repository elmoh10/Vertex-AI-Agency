const fs = require('fs');
let code = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');

const regex = /\/\* Add form \*\/([\s\S]*?)<div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">/;
const replacement = `              {/* Template Suggestions */}
              <div className="flex flex-wrap gap-2 mb-2 mt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setNewQuestion('ما هي ساعات العمل لديكم؟');
                    setNewAnswer('نعمل من الأحد للخميس من الساعة 9 صباحاً حتى 5 مساءً.');
                  }}
                  className="text-[10px] bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  قالب ساعات العمل
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setNewQuestion('أين يقع مقركم؟ / ما هو عنوانكم؟');
                    setNewAnswer('يقع مقرنا الرئيسي في الرياض، حي العليا، شارع التحلية.');
                  }}
                  className="text-[10px] bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  قالب العنوان والموقع
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setNewQuestion('كيف يمكنني التواصل معكم؟');
                    setNewAnswer('يمكنك التواصل معنا عبر الواتساب على هذا الرقم أو الاتصال بنا مباشرة.');
                  }}
                  className="text-[10px] bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  قالب طرق التواصل
                </button>
              </div>

              {/* Add form */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ClientConfigurator.tsx', code);
