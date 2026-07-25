const fs = require('fs');
let code = fs.readFileSync('src/components/IntegrationHub.tsx', 'utf8');

if (!code.includes('const [advancedSettings, setAdvancedSettings]')) {
  code = code.replace(
    /const \[isSavingMeta, setIsSavingMeta\] = useState\(false\);/,
    "const [isSavingMeta, setIsSavingMeta] = useState(false);\n  const [advancedSettings, setAdvancedSettings] = useState({ whatsappWebhookUrl: '', instagramWebhookUrl: '', debuggingEnabled: false });"
  );
  
  const target = `      ) : activeTab === 'meta_api' ? (`;
  
  const replacement = `      ) : activeTab === 'advanced' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-rose-400" />
                  إعدادات Webhook المتقدمة
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Webhook URL (مخصص)</label>
                  <input
                    type="text"
                    placeholder="https://your-domain.com/webhook/whatsapp"
                    value={advancedSettings.whatsappWebhookUrl}
                    onChange={(e) => setAdvancedSettings(prev => ({ ...prev, whatsappWebhookUrl: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-rose-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">اتركه فارغاً لاستخدام الرابط الافتراضي الخاص بالمنصة.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Instagram Webhook URL (مخصص)</label>
                  <input
                    type="text"
                    placeholder="https://your-domain.com/webhook/instagram"
                    value={advancedSettings.instagramWebhookUrl}
                    onChange={(e) => setAdvancedSettings(prev => ({ ...prev, instagramWebhookUrl: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-rose-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">اتركه فارغاً لاستخدام الرابط الافتراضي الخاص بالمنصة.</p>
                </div>
                
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-bold text-slate-200">وضع التشخيص (Debugging Mode)</label>
                    <p className="text-[10px] text-slate-400">تفعيل لعرض جميع رسائل الـ Webhooks الواردة والصادرة لحظياً.</p>
                  </div>
                  <button 
                    onClick={() => setAdvancedSettings(prev => ({ ...prev, debuggingEnabled: !prev.debuggingEnabled }))}
                    className={\`relative inline-flex h-5 w-9 items-center rounded-full transition-colors \${advancedSettings.debuggingEnabled ? 'bg-rose-500' : 'bg-slate-700'}\`}
                  >
                    <span className={\`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform \${advancedSettings.debuggingEnabled ? '-translate-x-4' : 'translate-x-1'}\`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className={\`bg-slate-900 border \${advancedSettings.debuggingEnabled ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.1)]' : 'border-slate-800'} rounded-xl p-6 h-[500px] flex flex-col\`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className={\`w-4 h-4 \${advancedSettings.debuggingEnabled ? 'text-rose-400 animate-pulse' : 'text-slate-500'}\`} />
                  وحدة التحكم (Terminal / Live Logs)
                </h3>
                <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${advancedSettings.debuggingEnabled ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-400'}\`}>
                  {advancedSettings.debuggingEnabled ? 'نشط الآن' : 'متوقف'}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 font-mono text-[10px]">
                {!advancedSettings.debuggingEnabled ? (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">
                    قم بتفعيل وضع التشخيص لعرض البيانات.
                  </div>
                ) : webhookLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">
                    بانتظار وصول البيانات...
                  </div>
                ) : (
                  webhookLogs.slice(0, 50).map((log, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-850/50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={\`px-1.5 py-0.5 rounded \${
                          log.direction === 'incoming' ? 'bg-blue-950/50 text-blue-400' : 
                          log.direction === 'outgoing' ? 'bg-purple-950/50 text-purple-400' : 
                          'bg-slate-800 text-slate-400'
                        }\`}>
                          {log.direction.toUpperCase()}
                        </span>
                        <span className="text-slate-300">[{log.channel}]</span>
                        <span className="text-slate-500 ml-auto">{new Date(log.timestamp).toLocaleTimeString('ar-SA')}</span>
                      </div>
                      <div className="text-slate-400 break-all">
                        {log.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'meta_api' ? (`;
      
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/IntegrationHub.tsx', code);
}
