const fs = require('fs');
let code = fs.readFileSync('src/components/IntegrationHub.tsx', 'utf8');

// Update lucide-react imports
code = code.replace(
  /Workflow\n\} from 'lucide-react';/,
  "Workflow,\n  Settings,\n  Save\n} from 'lucide-react';"
);

// Update activeTab type
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState\<'webhooks' \| 'workflows'\>\('webhooks'\);/,
  "const [activeTab, setActiveTab] = useState<'webhooks' | 'workflows' | 'meta_api'>('webhooks');\n  const [metaApiSettings, setMetaApiSettings] = useState({ phoneNumberId: '', accessToken: '' });\n  const [isSavingMeta, setIsSavingMeta] = useState(false);"
);

// Add tab button
const oldTabs = `        <button
          onClick={() => setActiveTab('workflows')}
          className={\`pb-3 text-sm font-bold transition-colors flex items-center gap-2 \${
            activeTab === 'workflows' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-slate-200'
          }\`}
        >
          <Workflow className="w-4 h-4" />
          محرر مسارات العمل (Workflow Editor)
        </button>`;

const newTabs = `        <button
          onClick={() => setActiveTab('workflows')}
          className={\`pb-3 text-sm font-bold transition-colors flex items-center gap-2 \${
            activeTab === 'workflows' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-slate-200'
          }\`}
        >
          <Workflow className="w-4 h-4" />
          محرر مسارات العمل (Workflow Editor)
        </button>
        <button
          onClick={() => setActiveTab('meta_api')}
          className={\`pb-3 text-sm font-bold transition-colors flex items-center gap-2 \${
            activeTab === 'meta_api' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'
          }\`}
        >
          <Settings className="w-4 h-4" />
          إعدادات Meta API
        </button>`;

code = code.replace(oldTabs, newTabs);

// Add the third tab rendering
const oldRender = `      {activeTab === 'webhooks' ? (`;

const newRender = `      {activeTab === 'meta_api' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                ربط حساب WhatsApp الحقيقي
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                أدخل تفاصيل Meta Business API الخاصة بك لتفعيل إرسال واستقبال الرسائل الحقيقية.
              </p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 block">Phone Number ID (معرف رقم الهاتف)</label>
              <input 
                type="text" 
                value={metaApiSettings.phoneNumberId}
                onChange={e => setMetaApiSettings({...metaApiSettings, phoneNumberId: e.target.value})}
                placeholder="مثال: 123456789012345"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 outline-none rounded-xl px-3.5 py-2.5 text-xs transition-colors font-mono"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 block">System User Access Token (رمز الوصول الدائم)</label>
              <textarea 
                value={metaApiSettings.accessToken}
                onChange={e => setMetaApiSettings({...metaApiSettings, accessToken: e.target.value})}
                placeholder="EAAI..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 text-slate-200 outline-none rounded-xl px-3.5 py-2.5 text-xs transition-colors font-mono min-h-[100px] resize-y custom-scrollbar"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => {
                  setIsSavingMeta(true);
                  setTimeout(() => setIsSavingMeta(false), 1500);
                }}
                disabled={isSavingMeta || !metaApiSettings.phoneNumberId || !metaApiSettings.accessToken}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSavingMeta ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSavingMeta ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === 'webhooks' ? (`;

code = code.replace(oldRender, newRender);

fs.writeFileSync('src/components/IntegrationHub.tsx', code);
