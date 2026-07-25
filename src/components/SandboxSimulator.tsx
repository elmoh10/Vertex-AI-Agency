import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Smartphone, 
  Terminal, 
  Code2, 
  RefreshCw, 
  HelpCircle,
  Sparkles,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { BusinessConfig, ChatMessage, Booking, Complaint } from '../types';

interface SandboxSimulatorProps {
  businesses: BusinessConfig[];
  onTriggerSimulation: (
    businessId: string, 
    message: string, 
    channel: 'whatsapp' | 'instagram' | 'telegram' | 'facebook',
    senderName: string,
    senderPhone: string
  ) => Promise<{
    success: boolean;
    responseText: string;
    actionDetected: boolean;
    actionType: string;
    actionDetailsText: string;
    booking: Booking | null;
    complaint: Complaint | null;
    fullAIResult: any;
  }>;
  onRefreshData: () => void;
}

export default function SandboxSimulator({ 
  businesses, 
  onTriggerSimulation,
  onRefreshData
}: SandboxSimulatorProps) {
  
  const [selectedBizId, setSelectedBizId] = useState<string>(businesses[0]?.id || '');
  const [channel, setChannel] = useState<'whatsapp' | 'instagram' | 'telegram'>('whatsapp');
  const [senderName, setSenderName] = useState<string>('هشام المطلق');
  const [senderPhone, setSenderPhone] = useState<string>('0503124599');
  const [userInput, setUserInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [aiConnected, setAiConnected] = useState<boolean>(true); // assume true initially

  useEffect(() => {
    fetch('/api/health/ai')
      .then(res => res.json())
      .then(data => setAiConnected(data.connected))
      .catch(() => setAiConnected(false));
  }, []);


  // Chat message history inside the phone simulator
    const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('sandboxChatHistories');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('sandboxChatHistories', JSON.stringify(chatHistories));
  }, [chatHistories]);

  // Active technical log details for the right screen
  const [activeLog, setActiveLog] = useState<{
    incomingWebhook: any;
    aiExtractionResult: any;
    outgoingWebhook: any;
    actionMessage: string;
  } | null>(null);

  const currentBiz = businesses.find(b => b.id === selectedBizId);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested test messages
  const suggestions = [
    {
      label: "📅 حجز موعد طبي (عيادة الأسنان)",
      text: "مرحبا، أرغب في حجز موعد لتنظيف الأسنان غداً الساعة 4 عصراً باسم هشام ورقم جوالي 0503124599",
      bizId: "clinic_1"
    },
    {
      label: "🧑‍💼 طلب تحويل لموظف بشري",
      text: "أحتاج التحدث مع موظف بشري لو سمحت، واجهتني مشكلة وأحتاج مساعدة حقيقية.",
      bizId: "clinic_1"
    },
    {
      label: "🍲 حجز طاولة غداء (المطعم)",
      text: "السلام عليكم، هل يمكن حجز طاولة عائلية لـ 4 أشخاص اليوم الساعة 9 مساءً؟",
      bizId: "restaurant_1"
    },
    {
      label: "☕ حجز ركن دراسة (الكافيه)",
      text: "حاب أحجز ركن المذاكرة الهادئ غداً الساعة 10 صباحاً لمدة ساعتين",
      bizId: "cafe_1"
    },
    {
      label: "⚠️ تقديم شكوى تأخير (المطعم)",
      text: "يا جماعة طلبي صار له ساعة ونصف ما وصل والتوصيل سيء جداً والأكل بيوصل بارد!",
      bizId: "restaurant_1"
    },
    {
      label: "💬 سؤال عام عن المواعيد (العيادة)",
      text: "مرحبا، ايش أوقات العمل والدوام عندكم في عيادة الأسنان؟ وهل تفتحون الجمعة؟",
      bizId: "clinic_1"
    }
  ];

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, isTyping]);

  // Initial welcome message setting
  useEffect(() => {
    if (currentBiz && !chatHistories[currentBiz.id]) {
      setChatHistories(prev => ({
        ...prev,
        [currentBiz.id]: [
          {
            id: 'welcome',
            sender: 'agent',
            text: currentBiz.welcomeMessage,
            timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));
    }
  }, [selectedBizId, currentBiz]);

  // Handle business selection change
  const handleBizChange = (id: string) => {
    setSelectedBizId(id);
    // Find suggestion for this business if available to match inputs
    const match = suggestions.find(s => s.bizId === id);
    if (match) {
      setUserInput('');
    }
  };

  // Triggering Suggestion click
  const handleApplySuggestion = (text: string, bizId: string) => {
    setSelectedBizId(bizId);
    setUserInput(text);
  };

  // Submit message to the Express server-side Gemini logic
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || !currentBiz) return;

    const messageText = userInput.trim();
    setUserInput('');
    setIsTyping(true);

    const currentTimeString = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

    // 1. Add client user message to phone simulator chat
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'customer',
      text: messageText,
      timestamp: currentTimeString
    };

    setChatHistories(prev => ({
      ...prev,
      [currentBiz.id]: [...(prev[currentBiz.id] || []), userMsg]
    }));

    // Trigger mock incoming webhook visual
    const mockIncomingPayload = {
      object: channel === "whatsapp" ? "whatsapp_business_account" : "instagram_account",
      entry: [
        {
          id: "entry_meta_987",
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { display_phone_number: "16505551234", phone_id: "1098273" },
                contacts: [{ profile: { name: senderName }, wa_id: senderPhone }],
                messages: [
                  {
                    from: senderPhone,
                    id: "wamid.HBgLNDkwMT...",
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    text: { body: messageText },
                    type: "text"
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    setActiveLog({
      incomingWebhook: mockIncomingPayload,
      aiExtractionResult: { status: "processing", message: "جاري استدعاء Gemini AI لتحليل محتوى الرسالة وتفكيك القصد..." },
      outgoingWebhook: null,
      actionMessage: "جاري المعالجة..."
    });

    try {
      // 2. Fire backend endpoint
      const response = await onTriggerSimulation(
        currentBiz.id,
        messageText,
        channel,
        senderName,
        senderPhone
      );

      setIsTyping(false);

      // 3. Add AI reply to chat
      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'agent',
        text: response.responseText,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        isActionTriggered: response.actionDetected,
        actionDetails: response.actionDetailsText,
        actionType: response.actionType
      };

      setChatHistories(prev => ({
        ...prev,
        [currentBiz.id]: [...(prev[currentBiz.id] || []), botMsg]
      }));

      // Update right-side technical tracer
      setActiveLog({
        incomingWebhook: mockIncomingPayload,
        aiExtractionResult: response.fullAIResult || { error: "Failed to load detailed structured metadata" },
        outgoingWebhook: {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: senderPhone,
          type: "text",
          text: { body: response.responseText },
          metadata: {
            processed_by: "Vertex_AI_Automation_v3.5",
            api_status: "SENT",
            action_registered: response.actionDetected ? response.actionType : "NONE"
          }
        },
        actionMessage: response.actionDetected 
          ? response.actionDetailsText 
          : "✅ لا يوجد إجراء يستدعي الحفظ (استفسار عام تمت الإجابة عليه بنجاح)"
      });

      // Reload databases stats
      onRefreshData();

    } catch (err) {
      setIsTyping(false);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'system',
        text: "فشل في تسليم الرسالة للخادم الرقمي. تأكد من تفعيل مفتاح Gemini API في لوحة الأسرار.",
        timestamp: currentTimeString
      };
      setChatHistories(prev => ({
        ...prev,
        [currentBiz.id]: [...(prev[currentBiz.id] || []), errorMsg]
      }));
    }
  };

  const activeMessages = chatHistories[selectedBizId] || [];

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Title block */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          غرفة تجربة ومحاكاة الأتمتة والويب-هوك (Sandbox)
          <div className="flex items-center gap-1.5 ms-auto md:ms-4 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
            <div className={`w-2 h-2 rounded-full ${aiConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'} animate-pulse`} />
            <span className="text-[10px] font-bold text-slate-300 tracking-wider font-mono">
              {aiConnected ? 'GEMINI CONNECTED' : 'GEMINI DISCONNECTED'}
            </span>
          </div>
        </h2>
        <p className="text-xs text-slate-400">
          اكتب رسائل تجريبية كأنك عميل يراسل المنشأة عبر واتساب أو إنستجرام أو تليجرام وتتبع فوراً كيف يقوم الذكاء الاصطناعي بالرد وتسجيل العمليات وتحديث السجلات تقنياً.
        </p>
      </div>

      {/* Simulator Inputs Config Row */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 block">العقد التجاري المختار (المنشأة)</label>
          <select 
            value={selectedBizId}
            onChange={(e) => handleBizChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
          >
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 block">قناة الإرسال المفعلة</label>
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              type="button"
              onClick={() => setChannel('whatsapp')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer ${
                channel === 'whatsapp' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              واتساب WhatsApp
            </button>
            <button 
              type="button"
              onClick={() => setChannel('instagram')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer ${
                channel === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              إنستجرام IG
            </button>
            <button 
              type="button"
              onClick={() => setChannel('telegram')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer ${
                channel === 'telegram' ? 'bg-[#0088cc] text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              تليجرام Telegram
            </button>
            <button 
              type="button"
              onClick={() => setChannel('facebook')}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-md transition-all cursor-pointer ${
                channel === 'facebook' ? 'bg-[#0084FF] text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              فيسبوك
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 block">اسم المرسل التجريبي (العميل)</label>
          <input 
            type="text" 
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 block">رقم هاتف المرسل التجريبي</label>
          <input 
            type="text" 
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono text-left"
          />
        </div>
      </div>

      {/* Suggested Quick Test Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 block flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          سيناريوهات فحص سريعة (انقر للاختبار الفوري):
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySuggestion(s.text, s.bizId)}
              className="text-[11px] bg-slate-900/80 hover:bg-slate-800 active:scale-95 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Splitscreen Mobile Phone & Developer Tracer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left Column: Simulated Phone */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center relative min-h-[580px] shadow-2xl">
          <div className="absolute top-2 w-32 h-4 bg-slate-800 rounded-full" /> {/* phone notch */}

          <div className="w-full h-full flex flex-col bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden mt-6 flex-1 max-w-sm">
            {/* Phone Chat Header */}
            <div className={`p-3 text-white flex items-center justify-between border-b ${
              channel === 'whatsapp' ? 'bg-emerald-950/90 border-emerald-900' : (channel === 'telegram' ? 'bg-blue-950/90 border-blue-900' : (channel === 'facebook' ? 'bg-[#0084FF]/20 border-[#0084FF]/50' : 'bg-gradient-to-r from-purple-950/90 to-pink-950/90 border-purple-900'))
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold">
                  {channel === 'whatsapp' ? 'WA' : (channel === 'telegram' ? 'TG' : (channel === 'facebook' ? 'FB' : 'IG'))}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{currentBiz.name}</h4>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[9px] text-emerald-400">مساعد ذكي نشط تلقائياً</span>
                  </div>
                </div>
              </div>

              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من مسح السجل والبدء من جديد؟')) {
                      setChatHistories(prev => ({ ...prev, [selectedBizId]: [] }));
                      setActiveLog(null);
                    }
                  }}
                  className="bg-slate-900/60 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 p-1.5 rounded-md transition-colors"
                  title="مسح السجل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-bold">
                  {channel === 'whatsapp' ? 'واتساب' : (channel === 'telegram' ? 'تليجرام' : (channel === 'facebook' ? 'فيسبوك' : 'إنستجرام'))}
                </div>
              </div>

            </div>

            {/* Chat message list screen */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 text-slate-200 text-xs flex flex-col min-h-[360px] max-h-[380px] custom-scrollbar">
              
              {activeMessages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`max-w-[85%] p-3 leading-relaxed relative space-y-1.5 shadow-sm ${
                    msg.sender === 'customer' 
                      ? 'bg-emerald-600 text-white self-start rounded-2xl rounded-tr-sm' 
                      : msg.sender === 'agent'
                      ? 'bg-slate-800 text-slate-100 self-end rounded-2xl rounded-tl-sm border border-slate-700'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 text-center text-[11px] self-center w-full max-w-full rounded-lg'
                  }`}
                >
                  <p>{msg.text}</p>
                  
                  {msg.isActionTriggered && msg.actionDetails && (
                    <div className={`mt-2 pt-2 border-t text-[10px] font-semibold flex items-center gap-1 bg-slate-950/40 px-2 py-1 rounded ${msg.actionType === 'HUMAN_HANDOFF' ? 'border-amber-900 text-amber-500' : 'border-emerald-900 text-emerald-400'}`}>
                      {msg.actionType === 'HUMAN_HANDOFF' ? <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" /> : <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />}
                      <span>{msg.actionDetails}</span>
                    </div>
                  )}

                  <span className="text-[9px] text-slate-500 block text-left font-mono">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="bg-slate-800 border border-slate-700 text-slate-300 self-end rounded-2xl rounded-tl-sm p-3 max-w-[85%] flex items-center gap-2 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">جاري الكتابة...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="اكتب ردك هنا كمستخدم..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-200 outline-none rounded-xl px-3.5 py-2.5 text-xs transition-colors"
              />
              <button 
                type="submit"
                disabled={!userInput.trim() || isTyping}
                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 rounded-xl text-slate-950 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Webhook Log Tracer */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              راصد عمليات الذكاء الاصطناعي والويب-هوك (AI Webhook Tracer)
            </h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
              Live Thread
            </span>
          </div>

          {activeLog ? (
            <div className="flex-1 flex flex-col space-y-4 text-xs font-mono">
              
              {/* Triggered Action Alert */}
              <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                activeLog.actionMessage.startsWith('📅') || activeLog.actionMessage.includes('ناجح')
                  ? 'bg-emerald-950/40 border-emerald-900 text-emerald-300' 
                  : activeLog.actionMessage.startsWith('⚠️')
                  ? 'bg-rose-950/40 border-rose-900 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <Code2 className="w-4 h-4 shrink-0" />
                <span className="font-sans font-bold text-[11px]">{activeLog.actionMessage}</span>
              </div>

              {/* Step 1: Raw Webhook Message Received */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-blue-400 font-bold flex items-center gap-1 font-sans">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    1. ويبهوك وارد من ميتا (Meta Incoming Webhook)
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 text-[10px] max-h-36 overflow-y-auto text-slate-400 custom-scrollbar">
                  <pre>{JSON.stringify(activeLog.incomingWebhook, null, 2)}</pre>
                </div>
              </div>

              {/* Step 2: AI Parsing Result */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-purple-400 font-bold flex items-center gap-1 font-sans">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    2. معالجة وتفكيك المضمون بـ Gemini 3.5-Flash
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 text-[10px] max-h-40 overflow-y-auto text-slate-400 custom-scrollbar">
                  <pre>{JSON.stringify(activeLog.aiExtractionResult, null, 2)}</pre>
                </div>
              </div>

              {/* Step 3: Raw Webhook Message Replied */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 font-sans">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    3. رد ويبهوك صادر للعميل (Outgoing Response payload)
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-850 rounded-lg p-3 text-[10px] max-h-36 overflow-y-auto text-slate-400 custom-scrollbar">
                  {activeLog.outgoingWebhook ? (
                    <pre>{JSON.stringify(activeLog.outgoingWebhook, null, 2)}</pre>
                  ) : (
                    <span className="text-slate-600 italic">بانتظار المعالجة...</span>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-10 text-center space-y-3">
              <div className="p-4 bg-slate-950 rounded-full border border-slate-850 text-slate-400">
                <Terminal className="w-10 h-10 opacity-60" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="font-bold text-slate-300 font-sans text-sm">راصد العمليات فارغ حالياً</h4>
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  قم باختيار سيناريو فحص سريع أو اكتب رسالة في الهاتف للمحاكاة وتتبع خطوات الاتصال بالذكاء الاصطناعي.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
