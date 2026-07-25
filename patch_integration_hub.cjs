const fs = require('fs');
let code = fs.readFileSync('src/components/IntegrationHub.tsx', 'utf8');

// 1. Add lucide-react icons
code = code.replace(
  /Lock\n\} from 'lucide-react';/,
  "Lock,\n  ArrowLeft,\n  Plus,\n  Trash2,\n  Workflow\n} from 'lucide-react';"
);

// 2. Add state
const stateCode = `  const [copiedText, setCopiedText] = useState<'url' | 'token' | 'nodeCode' | null>(null);

  const [activeTab, setActiveTab] = useState<'webhooks' | 'workflows'>('webhooks');
  const [workflows, setWorkflows] = useState([
    { id: '1', trigger: 'intent_booking', action: 'google_sheets' },
    { id: '2', trigger: 'intent_complaint', action: 'send_email' }
  ]);

  const triggers = [
    { id: 'intent_booking', label: 'الذكاء الاصطناعي رصد "طلب حجز"' },
    { id: 'intent_complaint', label: 'الذكاء الاصطناعي رصد "شكوى"' },
    { id: 'intent_inquiry', label: 'الذكاء الاصطناعي رصد "استفسار عام"' }
  ];

  const actions = [
    { id: 'google_sheets', label: 'تحديث بيانات Google Sheets' },
    { id: 'send_email', label: 'إرسال بريد إلكتروني للإدارة' },
    { id: 'internal_notification', label: 'إرسال إشعار داخلي بالنظام' },
    { id: 'auto_reply', label: 'توليد رد تلقائي عبر Gemini' }
  ];

  const updateWorkflow = (id: string, field: 'trigger' | 'action', value: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };`;

code = code.replace(/  const \[copiedText, setCopiedText\] = useState\<'url' \| 'token' \| 'nodeCode' \| null\>\(null\);/, stateCode);

// 3. Add tabs and workflow render logic
const renderCode = `
      {/* Tab Switcher */}
      <div className="flex space-x-reverse space-x-6 border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('webhooks')}
          className={\`pb-3 text-sm font-bold transition-colors flex items-center gap-2 \${
            activeTab === 'webhooks' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }\`}
        >
          <Code2 className="w-4 h-4" />
          الربط التقني للويب-هوك (Webhooks)
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className={\`pb-3 text-sm font-bold transition-colors flex items-center gap-2 \${
            activeTab === 'workflows' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-slate-200'
          }\`}
        >
          <Workflow className="w-4 h-4" />
          محرر مسارات العمل (Workflow Editor)
        </button>
      </div>

      {activeTab === 'webhooks' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
`;

code = code.replace(
  /<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">/,
  renderCode
);

const workflowsRender = `
        </div>
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
              className="flex items-center gap-2 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-lg border border-purple-500/30 transition-colors text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              إضافة مسار عمل
            </button>
          </div>

          <div className="space-y-4">
            {workflows.map(wf => (
              <div key={wf.id} className="flex flex-col md:flex-row items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 transition-all hover:border-slate-700">
                {/* Trigger Select */}
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-400 mb-1.5 block font-bold">الحدث المرصود (AI Trigger)</label>
                  <select 
                    value={wf.trigger}
                    onChange={(e) => updateWorkflow(wf.id, 'trigger', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-emerald-300 font-bold outline-none focus:border-purple-500 transition-colors"
                  >
                    {triggers.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>

                <div className="text-slate-600 hidden md:flex items-center justify-center pt-5">
                  <ArrowLeft className="w-6 h-6" />
                </div>
                
                {/* Mobile spacer arrow */}
                <div className="text-slate-600 flex md:hidden items-center justify-center rotate-90">
                  <ArrowLeft className="w-5 h-5" />
                </div>

                {/* Action Select */}
                <div className="flex-1 w-full">
                  <label className="text-[10px] text-slate-400 mb-1.5 block font-bold">الإجراء التلقائي (Action)</label>
                  <select 
                    value={wf.action}
                    onChange={(e) => updateWorkflow(wf.id, 'action', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-purple-300 font-bold outline-none focus:border-purple-500 transition-colors"
                  >
                    {actions.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </div>

                <div className="pt-0 md:pt-5 w-full md:w-auto">
                  <button 
                    onClick={() => deleteWorkflow(wf.id)}
                    className="w-full md:w-auto flex justify-center text-slate-400 hover:text-rose-500 bg-slate-900 hover:bg-rose-950/30 p-2.5 rounded-lg border border-slate-800 transition-colors"
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
}
`;

code = code.replace(/        <\/div>\n      <\/div>\n    <\/div>\n  \);\n}/, workflowsRender);

fs.writeFileSync('src/components/IntegrationHub.tsx', code);
