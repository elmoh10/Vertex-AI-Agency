import React, { useState } from 'react';
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
  Lock
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

  // Dynamic server url detection
  const serverBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://api.youragency.com';
  const whatsappWebhookUrl = `${serverBaseUrl}/api/webhooks/whatsapp`;
  const instagramWebhookUrl = `${serverBaseUrl}/api/webhooks/instagram`;
  const facebookWebhookUrl = `${serverBaseUrl}/api/webhooks/facebook`;
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

  const nodeJsCodeSnippet = `// Node.js Express handler to connect Meta (WhatsApp/Instagram) to Vertex AI Agency Core
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "${verifyToken}";
const VERTEX_AGENCY_API = "${serverBaseUrl}/api/simulate-chat";

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

app.listen(3000, () => console.log('Your production Vertex AI Agency Webhook is ready!'));`;

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-emerald-400" />
          مركز المطورين والربط التقني المباشر (Integration Hub)
        </h2>
        <p className="text-xs text-slate-400">
          استخدم هذه النهايات البرمجية وعقد الـ Webhooks لربط حسابات عملائك الحقيقية في واتساب بزنس أو إنستجرام مع نظام الوكالة بنجاح.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Webhook URLs and details (2 columns) */}
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
                { id: 'instagram', label: 'إنستجرام', color: 'bg-[#E1306C]' },
                { id: 'facebook', label: 'ماسنجر فيسبوك', color: 'bg-[#0084FF]' }
              ].map(platform => {
                const isLimited = platform.id !== 'whatsapp' && isChannelsLimited;
                const status = connectStatus[platform.id];
                
                return (
                  <button
                    key={platform.id}
                    onClick={() => simulateConnect(platform.id)}
                    disabled={isLimited || status !== 'idle'}
                    className={`relative overflow-hidden group flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                      isLimited ? 'opacity-50 grayscale border-slate-800 cursor-not-allowed' :
                      status === 'connected' ? 'border-emerald-500 bg-emerald-950/20' :
                      `border-slate-800 hover:border-slate-700 bg-slate-950 hover:${platform.color}/10`
                    }`}
                  >
                    {isLimited && (
                      <div className="absolute top-1 left-1">
                        <Lock className="w-3 h-3 text-amber-500" />
                      </div>
                    )}
                    <span className={`w-8 h-8 rounded-full mb-2 flex items-center justify-center text-white ${
                      status === 'connected' ? 'bg-emerald-500' : platform.color
                    }`}>
                      {status === 'connecting' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 
                       status === 'connected' ? <Check className="w-4 h-4" /> : 
                       <Globe className="w-4 h-4" />}
                    </span>
                    <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">
                      {status === 'connecting' ? 'جاري الربط...' : 
                       status === 'connected' ? 'تم الربط بنجاح' : 
                       `ربط ${platform.label}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Endpoints panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-3">
              <Globe className="w-4 h-4 text-emerald-400" />
              روابط استقبال الويب-هوك النشطة حالياً (Active Live Endpoints)
            </h3>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 space-y-4 text-xs">
              
              {/* WhatsApp Webhook row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">نهاية ويبهوك واتساب بزنس (WhatsApp Cloud API Webhook)</span>
                  <button 
                    onClick={() => handleCopy(whatsappWebhookUrl, 'url')}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer transition-all"
                  >
                    {copiedText === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedText === 'url' ? 'تم النسخ' : 'نسخ الرابط'}
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-left select-all truncate">
                  {whatsappWebhookUrl}
                </div>
              </div>

              {/* Instagram Webhook row */}
              <div className={`space-y-2 relative ${isChannelsLimited ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 flex items-center gap-2">
                    نهاية ويبهوك إنستجرام (Instagram Graph API Webhook)
                    {isChannelsLimited && (
                      <span className="bg-amber-500/10 text-amber-400 text-[9px] px-2 py-0.5 rounded border border-amber-900/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        يتطلب ترقية الباقة
                      </span>
                    )}
                  </span>
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-left truncate">
                  {isChannelsLimited ? '••••••••••••••••••••••••••••••••••••' : instagramWebhookUrl}
                </div>
              </div>

              {/* Facebook Webhook row */}
              <div className={`space-y-2 relative ${isChannelsLimited ? 'opacity-50 grayscale' : ''}`}>
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

              {/* Verify Token Row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">رمز التحقق الأمني في ميتا (Meta Verification Token)</span>
                  <button 
                    onClick={() => handleCopy(verifyToken, 'token')}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 cursor-pointer transition-all"
                  >
                    {copiedText === 'token' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedText === 'token' ? 'تم النسخ' : 'نسخ الرمز'}
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-300 font-mono text-left font-bold select-all">
                  {verifyToken}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  &bull; أدخل هذا الرمز في إعدادات المطورين (Meta App Dashboard) للتحقق من الاتصال التلقائي بنجاح.
                </span>
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
              <button 
                onClick={() => handleCopy(nodeJsCodeSnippet, 'nodeCode')}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer transition-all"
              >
                {copiedText === 'nodeCode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedText === 'nodeCode' ? 'تم نسخ الشفرة' : 'نسخ الكود بالكامل'}
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
                  توجه إلى بوابة المطورين <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">Meta Developers</a> وأنشئ تطبيقاً جديداً من نوع &ldquo;Business&rdquo;.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white flex items-center gap-1">
                  <span className="w-5 h-5 bg-slate-800 text-emerald-400 font-mono font-bold rounded-full flex items-center justify-center text-[10px]">٢</span>
                  تفعيل واتساب بزنس (WhatsApp)
                </h4>
                <p className="text-slate-400 pr-6 text-[11px]">
                  أضف منتج &ldquo;WhatsApp&rdquo; لتطبيقك، وستحصل على رقم هاتف تجريبي ورمز اختبار فوري (Access Token).
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

    </div>
  );
}
