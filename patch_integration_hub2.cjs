const fs = require('fs');
let code = fs.readFileSync('src/components/IntegrationHub.tsx', 'utf8');

const regex = /        <\/div>\n      <\/div>\n    <\/div>\n  \);\n}/;
const workflowsRender = `        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Workflow className="w-5 h-5 text-purple-400" />
                أتمتة المهام بعد ردود الذكاء الاصطناعي
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                اربط التحليلات والنوايا (Intents) التي يرصدها Gemini بإجراءات تلقائية لتسهيل إدارة أعمالك.
              </p>
            </div>
            <button 
              onClick={() => setWorkflows([...workflows, { id: Date.now().toString(), trigger: 'intent_inquiry', action: 'auto_reply' }])}
              className="flex items-center gap-2 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30 transition-colors text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة مسار عمل
            </button>
          </div>

          <div className="space-y-4">
            {workflows.map(wf => (
              <div key={wf.id} className="flex flex-col md:flex-row items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 transition-all hover:border-slate-700">
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-400 mb-1.5 block font-bold">الحدث المرصود (AI Trigger)</label>
                  <select 
                    value={wf.trigger}
                    onChange={(e) => updateWorkflow(wf.id, 'trigger', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-emerald-300 font-bold outline-none focus:border-purple-500 transition-colors cursor-pointer"
                  >
                    {triggers.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>

                <div className="text-slate-600 hidden md:flex items-center justify-center pt-5">
                  <ArrowLeft className="w-6 h-6" />
                </div>
                
                <div className="text-slate-600 flex md:hidden items-center justify-center rotate-90">
                  <ArrowLeft className="w-5 h-5" />
                </div>

                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-400 mb-1.5 block font-bold">الإجراء التلقائي (Action)</label>
                  <select 
                    value={wf.action}
                    onChange={(e) => updateWorkflow(wf.id, 'action', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-purple-300 font-bold outline-none focus:border-purple-500 transition-colors cursor-pointer"
                  >
                    {actions.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </div>

                <div className="pt-0 md:pt-5 w-full md:w-auto">
                  <button 
                    onClick={() => deleteWorkflow(wf.id)}
                    className="w-full md:w-auto flex justify-center text-slate-400 hover:text-rose-500 bg-slate-900 hover:bg-rose-950/30 p-2.5 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                    title="حذف المسار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {workflows.length === 0 && (
              <div className="text-center py-12 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                <Workflow className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-bold">لا توجد مسارات عمل مضافة</p>
                <p className="text-xs text-slate-500 mt-1">انقر على "إضافة مسار عمل" لإنشاء أتمتة جديدة</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}`;

// Use string replacement instead of regex to match the exact end of file
code = code.substring(0, code.lastIndexOf('        </div>\n      </div>\n    </div>\n  );\n}')) + workflowsRender;

fs.writeFileSync('src/components/IntegrationHub.tsx', code);
