const fs = require('fs');

const code = `import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  HelpCircle, 
  Terminal, 
  ShieldCheck, 
  Globe, 
  Sparkles,
  RefreshCw,
  Cpu,
  Lock,
  ArrowLeft,
  Plus,
  Trash2,
  Workflow
} from 'lucide-react';
import { BusinessConfig, Plan } from '../types';

interface IntegrationHubProps {
  businesses: BusinessConfig[];
  plans: Plan[];
  currentUser?: { role: 'owner' | 'supervisor'; businessId?: string };
}

export default function IntegrationHub({ businesses, plans, currentUser }: IntegrationHubProps) {  
  const activeBiz = businesses.find(b => b.id === currentUser?.businessId);
  const currentPlan = activeBiz ? plans.find(p => p.id === activeBiz.subscriptionPlan) : undefined;  
  const maxChannels = currentPlan?.limits?.channels || 1;
  const isChannelsLimited = currentUser?.role === 'supervisor' && maxChannels < 2;

  const [copiedText, setCopiedText] = useState<'url' | 'token' | 'nodeCode' | null>(null);
  const [connectStatus, setConnectStatus] = useState<{ [key: string]: 'idle' | 'connecting' | 'connected' }>({
    whatsapp: 'idle',
    instagram: 'idle',
    facebook: 'idle'
  });

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
  };

  // Dynamic server url detection
  const serverBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://api.youragency.com';
  const whatsappWebhookUrl = \`\${serverBaseUrl}/api/webhooks/whatsapp\`;
  const instagramWebhookUrl = \`\${serverBaseUrl}/api/webhooks/instagram\`;
  const facebookWebhookUrl = \`\${serverBaseUrl}/api/webhooks/facebook\`;
  const verifyToken = "VERTEX_AI_AGENCY_TOKEN_2026";

  const handleCopy = (text: string, type: 'url' | 'token' | 'nodeCode') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 3000);
  };

  const simulateConnect = (platform: string) => {
    setConnectStatus(prev => ({ ...prev, [platform]: 'connecting' }));
    setTimeout(() => {
      setConnectStatus(prev => ({ ...prev, [platform]: 'connected' }));
    }, 2000);
  };

  const nodeJsCodeSnippet = \`// Node.js Express handler to connect Meta (WhatsApp/Instagram) to Vertex AI Agency Core
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "\${verifyToken}";
const VERTEX_AGENCY_API = "\${serverBaseUrl}/api/simulate-chat";

// 1. Meta Webhook Verification Endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// 2. Capture WhatsApp & Instagram Message Event Payloads
app.post('/webhook', async (req, res) => {
  const body = req.body;  
  // Verify it is a message payload
  if (body.object && body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
    const msgData = body.entry[0].changes[0].value.messages[0];
    const customerText = msgData.text?.body;
    const senderPhone = msgData.from;
    const senderName = body.entry[0].changes[0].value.contacts?.[0]?.profile?.name || "عميل واتساب";
    
    // Proxy the request to our AI Agency engine to analyze intent and reply
    const aiResponse = await fetch(VERTEX_AGENCY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: "clinic_1", // Select business configuration profile
        message: customerText,
        channel: "whatsapp",
        senderName: senderName,
        senderPhone: senderPhone
      })
    });
    const aiResult = await aiResponse.json();
    console.log("AI Agent auto-replied and registered actions: ", aiResult.actionDetailsText);
  }
  res.status(200).send("EVENT_RECEIVED");
});
app.listen(3000, () => console.log('Your production Vertex AI Agency Webhook is ready!'));\`;

  return (
    <div className="space-y-6" dir="rtl">      
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-emerald-400" />
          مركز التكامل والربط التقني (Integration Hub)
        </h2>
        <p className="text-xs text-slate-400 mt-2">
          إدارة ربط القنوات وإعدادات الأتمتة لجميع قنوات المنشأة.
        </p>
      </div>

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
          <div className="lg:col-span-2 space-y-6">          
            {/* Quick Connect Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                الربط السريع بخطوة واحدة (One-Click Connect)
              </h3>
              <p className="text-[11px] text-slate-400">
                قم بربط قنواتك على منصات ميتا (Meta) بنقرة واحدة لتفعيل الذكاء الاصطناعي مباشرة دون الحاجة لضبط الإعدادات المعقدة.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { id: 'whatsapp', label: 'واتساب أعمال', color: 'bg-[#25D366]' },
                  { id: 'instagram', label: 'إنستجرام', color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]' },
                  { id: 'facebook', label: 'فيسبوك ماسنجر', color: 'bg-[#0084FF]' },
                ].map(platform => (
                  <button 
                    key={platform.id}
                    onClick={() => simulateConnect(platform.id)}
                    className="flex flex-col items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-all cursor-pointer"
                  >
                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg \${platform.color}\`}>
                      {platform.label.substring(0, 1)}
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">{platform.label}</span>
                    {connectStatus[platform.id] === 'connected' ? (
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> تم الربط</span>
                    ) : connectStatus[platform.id] === 'connecting' ? (
                      <span className="text-[9px] text-slate-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> جاري...</span>
                    ) : (
                      <span className="text-[9px] text-slate-500">غير متصل</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Webhook Endpoints Manual Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-3">
                <Globe className="w-4 h-4 text-emerald-400" />
                بيانات الويب-هوك للربط اليدوي (Webhook URLs)
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">نهاية ويبهوك واتساب (WhatsApp Webhook)</span>
                    <button onClick={() => handleCopy(whatsappWebhookUrl, 'url')} className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer">
                      {copiedText === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      نسخ الرابط
                    </button>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-left truncate">{whatsappWebhookUrl}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">نهاية ويبهوك إنستجرام (Instagram Webhook)</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-left truncate">{instagramWebhookUrl}</div>
                </div>

                <div className="space-y-2">
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
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">رمز التحقق الأمني في ميتا (Meta Verification Token)</span>
                    <button onClick={() => handleCopy(verifyToken, 'token')} className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer">
                      {copiedText === 'token' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      نسخ الرمز
                    </button>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-left font-bold select-all">{verifyToken}</div>
                  <span className="text-[10px] text-slate-500 block">&bull; أدخل هذا الرمز في إعدادات المطورين (Meta App Dashboard) للتحقق من الاتصال التلقائي بنجاح.</span>
                </div>
              </div>
            </div>

            {/* Node JS Middleware snippet code */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  شفرة الـ Middleware البرمجية لتكامل الأنظمة (Node.js & Express)
                </h3>
                <button onClick={() => handleCopy(nodeJsCodeSnippet, 'nodeCode')} className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer transition-all">
                  {copiedText === 'nodeCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  نسخ الكود بالكامل
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                قم بتنزيل أو نسخ الكود البرمجي البرمجي التالي ووضعه في خادم شركتك المحلي أو السحابي لتوصيل واتساب بزنس مباشرة مع محرك وكالتنا الذكية.
              </p>
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 text-[11px] font-mono text-slate-400 max-h-96 overflow-y-auto overflow-x-auto text-left custom-scrollbar" dir="ltr">
                <pre>{nodeJsCodeSnippet}</pre>
              </div>
            </div>
          </div>

          {/* Right Column: Instructions / Meta Developer panel (1 column) */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                كيفية الربط بحساب Meta الحقيقي؟
              </h3>
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1">
                    <span className="w-5 h-5 bg-slate-800 text-emerald-400 font-mono font-bold rounded-full flex items-center justify-center text-[10px]">١</span>
                    تسجيل حساب مطور Meta
                  </h4>
                  <p className="text-slate-400 pr-6 text-[11px]">
                    توجه إلى بوابة المطورين <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">Meta Developers</a> وأنشئ تطبيقاً جديداً من نوع “Business”.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1">
                    <span className="w-5 h-5 bg-slate-800 text-emerald-400 font-mono font-bold rounded-full flex items-center justify-center text-[10px]">٢</span>
                    تفعيل واتساب بزنس (WhatsApp)
                  </h4>
                  <p className="text-slate-400 pr-6 text-[11px]">
                    أضف منتج “WhatsApp” لتطبيقك، وستحصل على رقم هاتف تجريبي ورمز اختبار فوري (Access Token).
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1">
                    <span className="w-5 h-5 bg-slate-800 text-emerald-400 font-mono font-bold rounded-full flex items-center justify-center text-[10px]">٣</span>
                    تهيئة الويب هوك (Configuration)
                  </h4>
                  <p className="text-slate-400 pr-6 text-[11px]">
                    اذهب إلى تبويب Webhooks في إعدادات التطبيق، والصق <strong>رابط الويب-هوك النشط</strong> المتوفر في هذه الصفحة، ثم اكتب <strong>رمز التحقق الأمني</strong>.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white flex items-center gap-1">
                    <span className="w-5 h-5 bg-slate-800 text-emerald-400 font-mono font-bold rounded-full flex items-center justify-center text-[10px]">٤</span>
                    الاشتراك في أحداث الرسائل
                  </h4>
                  <p className="text-slate-400 pr-6 text-[11px]">
                    اشترك في حدث <code>messages</code> لكي يقوم فيسبوك بإرسال كل رسالة يستقبلها الرقم التجاري إلى وكالتك الذكية فوراً.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800 bg-slate-950/40 p-3 rounded-lg border border-dashed border-slate-800 flex items-start gap-2.5">
                  <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    <strong>ملحوظة فنية:</strong> إن لوحة المحاكاة بغرفة التجريب تحاكي بدقة متناهية نفس التدفق وسلسلة البيانات للطلبات الحقيقية لميتا لتوفر عليك عناء التطوير الأولي وتجربة السيناريوهات.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
fs.writeFileSync('src/components/IntegrationHub.tsx', code);
