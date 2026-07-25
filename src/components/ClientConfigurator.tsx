import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Settings2, 
  Plus, 
  Trash2, 
  Sparkles,
  Receipt, 
  Info,
  Clock,
  Phone,
  MessageSquareCode,
  Building,
  MessageCircle,
  Instagram,
  FileSpreadsheet,
  RefreshCw,
  Unlink,
  Link2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { BusinessConfig, WebhookLog, QuickReply } from '../types';
import { googleSignIn } from '../lib/firebase';

interface ClientConfiguratorProps {
  businesses: BusinessConfig[];
  webhookLogs: WebhookLog[];
  onUpdateBusiness: (updated: BusinessConfig) => Promise<boolean>;
  onCreateBusiness: (name: string, type: string) => Promise<void>;
  onDeleteBusiness: (id: string) => Promise<void>;
  currentUser: { role: 'owner' | 'supervisor'; businessId?: string; name: string };
}

export default function ClientConfigurator({ 
  businesses, 
  webhookLogs,
  onUpdateBusiness,
  onCreateBusiness,
  onDeleteBusiness,
  currentUser
}: ClientConfiguratorProps) {
  
  const [selectedBizId, setSelectedBizId] = useState<string>(businesses[0]?.id || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [newBizName, setNewBizName] = useState('');
  const [newBizType, setNewBizType] = useState('clinic');

  // Find selected business
  const currentBiz = businesses.find(b => b.id === selectedBizId);

  // Helper to check channel status based on webhook logs
  const getChannelStatus = (bizId: string, channel: 'whatsapp' | 'instagram') => {
    const channelLogs = webhookLogs.filter(log => log.businessId === bizId && log.channel === channel);
    if (channelLogs.length === 0) {
      return { 
        status: 'disconnected', 
        label: 'غير متصل', 
        color: 'text-slate-500 bg-slate-950/60 border-slate-850', 
        dotColor: 'bg-slate-600'
      };
    }
    
    const sorted = [...channelLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const latest = sorted[0];

    if (latest.status === 'success') {
      return { 
        status: 'connected', 
        label: 'نشط ومتصل', 
        color: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40', 
        dotColor: 'bg-emerald-400 animate-pulse'
      };
    } else {
      return { 
        status: 'error', 
        label: 'خطأ بالاتصال', 
        color: 'text-rose-400 bg-rose-950/30 border-rose-900/40', 
        dotColor: 'bg-rose-500'
      };
    }
  };

  // Form states
  const [name, setName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [welcomeMessageEnabled, setWelcomeMessageEnabled] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [newService, setNewService] = useState('');

  // Quick Replies states
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Google Sheets Integration states
  const [googleSheetsId, setGoogleSheetsId] = useState('');
  const [googleSheetsLinked, setGoogleSheetsLinked] = useState(false);
  const [googleSheetsAccessToken, setGoogleSheetsAccessToken] = useState('');

  // Social Media Configuration states
  const [whatsappSenderNumber, setWhatsappSenderNumber] = useState('');
  const [instagramAccountId, setInstagramAccountId] = useState('');
  const [instagramAccessToken, setInstagramAccessToken] = useState('');
  const [facebookPageId, setFacebookPageId] = useState('');
  const [facebookAccessToken, setFacebookAccessToken] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [autoPilotEnabled, setAutoPilotEnabled] = useState(false);
  const [generateInvoiceEnabled, setGenerateInvoiceEnabled] = useState(false);

  const [isLinkingSheets, setIsLinkingSheets] = useState(false);
  const [sheetsError, setSheetsError] = useState('');
  const [sheetsSuccessMsg, setSheetsSuccessMsg] = useState('');
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Sync selectedBizId when businesses list loads
  useEffect(() => {
    if (!selectedBizId && businesses.length > 0) {
      setSelectedBizId(businesses[0].id);
    }
  }, [businesses, selectedBizId]);

  // Sync form states when selected business or businesses list changes (to get latest data)
  useEffect(() => {
    if (selectedBizId) {
      const biz = businesses.find(b => b.id === selectedBizId);
      if (biz) {
        setName(biz.name || '');
        setWelcomeMessage(biz.welcomeMessage || '');
        setWelcomeMessageEnabled(biz.welcomeMessageEnabled || false);
        setSystemPrompt(biz.systemPrompt || '');
        setWorkingHours(biz.workingHours || '');
        setServices(biz.services || []);
        setQuickReplies(biz.quickReplies || []);
        setGoogleSheetsId(biz.googleSheetsId || '');
        setGoogleSheetsLinked(biz.googleSheetsLinked || false);
        setGoogleSheetsAccessToken(biz.googleSheetsAccessToken || '');
        setWhatsappSenderNumber(biz.whatsappSenderNumber || '');
        setInstagramAccountId(biz.instagramAccountId || '');
        setInstagramAccessToken(biz.instagramAccessToken || '');
        setFacebookPageId(biz.facebookPageId || '');
        setFacebookAccessToken(biz.facebookAccessToken || '');
        setTelegramBotToken(biz.telegramBotToken || '');
        setAutoPilotEnabled(biz.autoPilotEnabled || false);
        setGenerateInvoiceEnabled(biz.generateInvoiceEnabled || false);
        setSaveStatus('idle');
        setSheetsError('');
        setSheetsSuccessMsg('');
      }
    }
  }, [selectedBizId, businesses]);

  // Handle business tab change
  const handleSelectBusiness = (id: string) => {
    setSelectedBizId(id);
  };

  const handleCreate = async () => {
    if (!newBizName) return;
    await onCreateBusiness(newBizName, newBizType);
    setNewBizName('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المنشأة؟')) {
      await onDeleteBusiness(id);
      if (selectedBizId === id) setSelectedBizId(businesses[0]?.id || '');
    }
  };

  // Add a new service
  const handleAddService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };

  // Remove a service
  const handleRemoveService = (indexToRemove: number) => {
    setServices(services.filter((_, idx) => idx !== indexToRemove));
  };

  // Add a new Quick Reply
  const handleAddQuickReply = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      const newReply: QuickReply = {
        id: 'qr_' + Date.now(),
        question: newQuestion.trim(),
        answer: newAnswer.trim()
      };
      setQuickReplies([...quickReplies, newReply]);
      setNewQuestion('');
      setNewAnswer('');
    }
  };

  // Remove a Quick Reply
  const handleRemoveQuickReply = (idToRemove: string) => {
    setQuickReplies(quickReplies.filter(qr => qr.id !== idToRemove));
  };

  // Google Sheets integration handler functions
  const handleAutoCreateSheets = async () => {
    setIsLinkingSheets(true);
    setSheetsError('');
    setSheetsSuccessMsg('');
    try {
      const authResult = await googleSignIn();
      if (!authResult) {
        throw new Error('فشل تسجيل الدخول باستخدام Google');
      }

      const response = await fetch('/api/business/sheets/auto-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedBizId, accessToken: authResult.accessToken })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setGoogleSheetsId(data.spreadsheetId);
        setGoogleSheetsLinked(true);
        setGoogleSheetsAccessToken(authResult.accessToken);
        
        // Save to backend config instantly
        const updatedConfig: BusinessConfig = {
          ...currentBiz,
          googleSheetsId: data.spreadsheetId,
          googleSheetsLinked: true,
          googleSheetsAccessToken: authResult.accessToken
        };
        await onUpdateBusiness(updatedConfig);
        setSheetsSuccessMsg('تم تأسيس وربط ورقة عمل Google Sheets للمنشأة بنجاح! 🎉');
      } else {
        throw new Error(data.error || 'فشل خادم التأسيس في إنشاء الملف');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setSheetsError('تم إغلاق نافذة تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      } else {
        setSheetsError(err.message || 'حدث خطأ أثناء الاتصال بـ Google Sheets');
      }
    } finally {
      setIsLinkingSheets(false);
    }
  };

  const handleManualLinkSheets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleSheetsId.trim()) {
      setSheetsError('يرجى إدخال معرف SpreadSheet ID صالح');
      return;
    }

    setIsLinkingSheets(true);
    setSheetsError('');
    setSheetsSuccessMsg('');

    try {
      const updatedConfig: BusinessConfig = {
        ...currentBiz,
        googleSheetsId: googleSheetsId.trim(),
        googleSheetsLinked: true
      };
      
      const success = await onUpdateBusiness(updatedConfig);
      if (success) {
        setGoogleSheetsLinked(true);
        setSheetsSuccessMsg('تم ربط ورقة عمل Google Sheets بنجاح!');
      } else {
        throw new Error('فشل تحديث المنشأة بالخادم');
      }
    } catch (err: any) {
      setSheetsError(err.message || 'حدث خطأ أثناء حفظ الربط اليدوي');
    } finally {
      setIsLinkingSheets(false);
    }
  };

  const handleUnlinkSheets = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء ربط ورقة عمل Google Sheets؟ لن تضيع البيانات القديمة في ورقة العمل ولكن سيتوقف إرسال البيانات الجديدة تلقائياً.')) {
      return;
    }

    setIsLinkingSheets(true);
    setSheetsError('');
    setSheetsSuccessMsg('');

    try {
      const updatedConfig: BusinessConfig = {
        ...currentBiz,
        googleSheetsId: '',
        googleSheetsLinked: false,
        googleSheetsAccessToken: ''
      };
      
      const success = await onUpdateBusiness(updatedConfig);
      if (success) {
        setGoogleSheetsId('');
        setGoogleSheetsLinked(false);
        setGoogleSheetsAccessToken('');
        setSheetsSuccessMsg('تم إلغاء ربط ورقة عمل Google Sheets بنجاح.');
      } else {
        throw new Error('فشل التحديث بالخادم');
      }
    } catch (err: any) {
      setSheetsError(err.message || 'حدث خطأ أثناء إلغاء الربط');
    } finally {
      setIsLinkingSheets(false);
    }
  };

  const handleSyncAllSheets = async () => {
    setIsSyncingAll(true);
    setSheetsError('');
    setSheetsSuccessMsg('');
    try {
      const response = await fetch('/api/business/sheets/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedBizId, accessToken: googleSheetsAccessToken })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSheetsSuccessMsg(data.message || 'تم مزامنة كافة البيانات السابقة بنجاح! 📊');
      } else {
        throw new Error(data.error || 'فشلت المزامنة، يرجى تجديد ربط حساب Google أولاً لتحديث صلاحية الوصول.');
      }
    } catch (err: any) {
      console.error(err);
      setSheetsError(err.message || 'حدث خطأ أثناء المزامنة، يرجى تحديث الاتصال بـ Google.');
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBiz) return;

    setIsSaving(true);
    setSaveStatus('idle');

    const updatedConfig: BusinessConfig = {
      ...currentBiz,
      name,
      welcomeMessage,
      welcomeMessageEnabled,
      systemPrompt,
      workingHours,
      services,
      quickReplies,
      googleSheetsId,
      googleSheetsLinked,
      googleSheetsAccessToken,
      whatsappSenderNumber,
      instagramAccountId,
      instagramAccessToken,
      facebookPageId,
      facebookAccessToken,
      telegramBotToken,
      autoPilotEnabled,
      generateInvoiceEnabled
    };

    const success = await onUpdateBusiness(updatedConfig);
    setIsSaving(false);
    if (success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  };

  if (!currentBiz) {
    return <div className="text-white text-center py-10" dir="rtl">تحميل بيانات الأعمال...</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-400" />
            تخصيص وكلاء الذكاء الاصطناعي للمشتركين
          </h2>
          <p className="text-xs text-slate-400">
            اضبط هوية المساعد، رسالة الترحيب والخدمات المتاحة لكل عميل مسجل بوكالتك ليقوم الـ AI بخدمتهم فورياً.
          </p>
        </div>
      </div>

      {/* Business switcher tabs as smart cards */}
      {currentUser.role === 'owner' && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6">
          <h3 className="text-sm font-bold text-white mb-4">إضافة منشأة جديدة</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newBizName} 
              onChange={e => setNewBizName(e.target.value)}
              placeholder="اسم المنشأة"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs"
            />
            <select value={newBizType} onChange={e => setNewBizType(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs">
              <option value="clinic">عيادة</option>
              <option value="restaurant">مطعم</option>
              <option value="cafe">مقهى</option>
            </select>
            <button onClick={handleCreate} className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">إضافة</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {businesses.map((biz) => {
          const waStatus = getChannelStatus(biz.id, 'whatsapp');
          const igStatus = getChannelStatus(biz.id, 'instagram');
          const isSelected = selectedBizId === biz.id;

          return (
            <div
              key={biz.id}
              onClick={() => handleSelectBusiness(biz.id)}
              className={`p-4 rounded-xl transition-all border cursor-pointer flex flex-col justify-between space-y-3 active:scale-[0.99] relative overflow-hidden group select-none ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/5'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="absolute top-2 right-2">
                {currentUser.role === 'owner' && (
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(biz.id); }} className="text-rose-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500" />
              )}
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500">ID: {biz.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    isSelected ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isSelected ? 'نشط حالياً' : 'تعديل الإعدادات'}
                  </span>
                </div>
                
                <h3 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5 group-hover:text-emerald-400 transition-colors">
                  <Building className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {biz.name}
                </h3>
              </div>

              {/* API Smart Status indicators */}
              <div className="pt-2.5 border-t border-slate-850/60 grid grid-cols-2 gap-1.5 text-[9px]">
                {/* WhatsApp */}
                <div className={`flex flex-col p-1.5 rounded border leading-tight ${waStatus.color}`}>
                  <div className="flex items-center gap-1 font-bold mb-0.5">
                    <MessageCircle className="w-2.5 h-2.5 shrink-0" />
                    <span>WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-90">
                    <span className={`w-1 h-1 rounded-full ${waStatus.dotColor}`} />
                    <span>{waStatus.label}</span>
                  </div>
                </div>

                {/* Instagram */}
                <div className={`flex flex-col p-1.5 rounded border leading-tight ${igStatus.color}`}>
                  <div className="flex items-center gap-1 font-bold mb-0.5">
                    <Instagram className="w-2.5 h-2.5 shrink-0" />
                    <span>Instagram</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-90">
                    <span className={`w-1 h-1 rounded-full ${igStatus.dotColor}`} />
                    <span>{igStatus.label}</span>
                  </div>
                </div>
              </div>
            </div>
  );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Editor Form (2 columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Business Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">اسم العلامة التجارية / المنشأة</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors"
                required
              />
            </div>

                        {/* Welcome Message */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 block">رسالة الترحيب التلقائية (عند أول تواصل)</label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">تفعيل الإرسال التلقائي</span>
                  <button
                    type="button"
                    onClick={() => setWelcomeMessageEnabled(!welcomeMessageEnabled)}
                    className={`w-10 h-5 rounded-full p-1 transition-all flex items-center ${welcomeMessageEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </button>
                </div>
              </div>
              <input 
                type="text"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                disabled={!welcomeMessageEnabled}
                className={`w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors ${!welcomeMessageEnabled && 'opacity-50 cursor-not-allowed'}`}
                required={welcomeMessageEnabled}
              />
              <span className="text-[10px] text-slate-500 block">تُرسل تلقائياً كرسالة أولى للعميل عند بدء المحادثة، قبل تدخل الذكاء الاصطناعي.</span>
            </div>

            {/* AI System Instructions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">تخصيص لهجة وأسلوب رد الذكاء الاصطناعي (System Prompt)</label>
                <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono">Gemini Core 3.5</span>
              </div>
              <textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors resize-none leading-relaxed"
                required
                placeholder="اكتب هنا التعليمات الموجهة للذكاء الاصطناعي لتغيير أسلوب تواصله..."
              />
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-400 leading-normal">
                  <strong>تخصيص الهوية والأسلوب:</strong> اكتب هنا القواعد والتعليمات التي تود من المساعد اتباعها. على سبيل المثال: يمكنك أمره بالتحدث باللهجة السعودية، أو بأسلوب رسمي ووقور، أو أسلوب شبابي ومرح، بالإضافة إلى تزويده بالأسعار والمعلومات الخاصة بالعمل التجاري.
                </p>
              </div>
            </div>

            {/* Services Customizer */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">الخدمات أو الفروع المتاحة للأتمتة</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="مثال: حجز موعد كشف، تنظيف أسنان..."
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors"
                />
                <button 
                  type="button"
                  onClick={handleAddService}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl border border-slate-700 cursor-pointer active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tag clouds */}
              <div className="flex flex-wrap gap-2 pt-2">
                {services.map((svc, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                  >
                    <span>{svc}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveService(idx)}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Replies Customizer */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <MessageSquareCode className="w-4 h-4 text-emerald-400" />
                  قوالب ردود ذكية (Smart Response Templates)
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  قم بتعريف إجابات ثابتة ومباشرة للأسئلة المتكررة لعميلك، بحيث يلتزم بها الذكاء الاصطناعي بشكل دقيق ومباشر عند توجيه السؤال له.
                </p>
              </div>

              {/* Template Suggestions */}
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
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">السؤال المتوقع أو الشائع</label>
                    <input 
                      type="text"
                      placeholder="مثال: هل توجد مواقف سيارات؟"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">قالب الرد الذكي المعتمد للذكاء الاصطناعي</label>
                    <input 
                      type="text"
                      placeholder="مثال: نعم، تتوفر مواقف مجانية واسعة أمام المبنى."
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddQuickReply}
                    disabled={!newQuestion.trim() || !newAnswer.trim()}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-40 text-emerald-400 border border-emerald-900/40 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة كقالب للرد</span>
                  </button>
                </div>
              </div>

              {/* Quick replies lists */}
              <div className="space-y-2">
                {quickReplies.length === 0 ? (
                  <div className="text-center p-6 bg-slate-950/40 rounded-xl border border-slate-900 text-xs text-slate-500">
                    لم تقم بإضافة قوالب ردود ذكية مخصصة بعد لهذا المشترك. سيستخدم الـ AI المعلومات العامة في الرد.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {quickReplies.map((qr) => (
                      <div 
                        key={qr.id}
                        className="p-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-850/60 rounded-xl flex items-start justify-between gap-3 transition-all"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <p className="text-xs font-bold text-slate-200 truncate">{qr.question}</p>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed pl-3">{qr.answer}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuickReply(qr.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/20 transition-all cursor-pointer shrink-0"
                          title="حذف الرد"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Working Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">أوقات العمل المعتمدة للحجوزات</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-100 outline-none transition-colors"
                    required
                  />
                  <Clock className="w-4 h-4 text-slate-500 absolute top-3.5 right-3.5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">صيغة رقم الهاتف المقترحة للتحقق</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={currentBiz.phonePlaceholder}
                    disabled
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-500 rounded-xl pl-4 pr-10 py-3 text-sm outline-none cursor-not-allowed"
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute top-3.5 right-3.5" />
                </div>
              </div>
            </div>

            {/* Auto Pilot Integration Section */}
            <div className="border-t border-slate-800/80 pt-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    تفعيل ميزة الأتمتة الكاملة (Auto-Pilot)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    يسمح للذكاء الاصطناعي بقراءة تقويم المنشأة، عرض المواعيد المتاحة للعميل، وتأكيد الحجز فوراً، مع إرسال تذكير تلقائي قبل الموعد بـ 24 ساعة.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoPilotEnabled(!autoPilotEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${autoPilotEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}
                >
                  <div className="w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>
            {/* Automatic Invoice Generation (Clinics & Restaurants only) */}
            {(currentBiz.type === 'clinic' || currentBiz.type === 'restaurant') && (
              <div className="border-t border-slate-800/80 pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="space-y-1 pr-4 max-w-lg">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-slate-200">إصدار فاتورة تلقائية للعميل</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      عند التفعيل، سيقوم الذكاء الاصطناعي بإنشاء فاتورة نصية تلقائية وإرسالها للعميل فور إتمام عملية الحجز أو بعد تنفيذ الخدمة.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGenerateInvoiceEnabled(!generateInvoiceEnabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${generateInvoiceEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            )}

            {/* Social Media Integration Section */}
            <div className="border-t border-slate-800/80 pt-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  إعدادات منصات التواصل الاجتماعي
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  قم بضبط إعدادات الربط لكل منصة لتفعيل التواصل المباشر وإرسال التنبيهات.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">رقم واتساب للإرسال</label>
                  <input 
                    type="text"
                    placeholder="مثال: 9665XXXXXXXX"
                    value={whatsappSenderNumber}
                    onChange={(e) => setWhatsappSenderNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">معرف حساب انستجرام</label>
                  <input 
                    type="text"
                    value={instagramAccountId}
                    onChange={(e) => setInstagramAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">رمز دخول (Access Token) انستجرام</label>
                  <input 
                    type="text"
                    value={instagramAccessToken}
                    onChange={(e) => setInstagramAccessToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">معرف صفحة فيسبوك</label>
                  <input 
                    type="text"
                    value={facebookPageId}
                    onChange={(e) => setFacebookPageId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">رمز دخول (Access Token) فيسبوك</label>
                  <input 
                    type="text"
                    value={facebookAccessToken}
                    onChange={(e) => setFacebookAccessToken(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                </div>
              
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400">توكن بوت تليجرام (Telegram Bot Token)</label>
                  <input 
                    type="text"
                    value={telegramBotToken}
                    onChange={(e) => setTelegramBotToken(e.target.value)}
                    placeholder="مثال: 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  />
                  {telegramBotToken && (
                    <div className="mt-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-emerald-500 mb-2">
                        رابط الويبهوك الخاص بك: 
                        <span className="font-mono text-emerald-400 mr-1 select-all break-all">
                          {window.location.origin}/api/webhooks/telegram/{selectedBizId}
                        </span>
                      </div>
                      <button 
                        onClick={async () => {
                          try {
                            const url = `https://api.telegram.org/bot${telegramBotToken}/setWebhook?url=${window.location.origin}/api/webhooks/telegram/${selectedBizId}`;
                            const res = await fetch(url);
                            const data = await res.json();
                            if (data.ok) {
                              alert('تم ربط تليجرام وتفعيل الويبهوك بنجاح! 🚀');
                            } else {
                              alert('حدث خطأ أثناء الربط: ' + data.description);
                            }
                          } catch (e) {
                            alert('فشل الاتصال بخوادم تليجرام.');
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded flex items-center gap-1 transition-all"
                      >
                        تفعيل الربط تلقائياً
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Google Sheets Integration Section */}
            <div className="border-t border-slate-800/80 pt-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  ربط وتكامل Google Sheets
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  قم بربط هذه المنشأة بجدول بيانات Google Sheets لتخزين ومزامنة كافة بيانات الحجوزات والشكاوى الواردة تلقائياً أولاً بأول.
                </p>
              </div>

              {sheetsError && (
                <div className="p-3.5 bg-rose-950/30 border border-rose-900/40 rounded-xl flex items-start gap-2 text-rose-400 text-xs font-semibold" dir="rtl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{sheetsError}</span>
                </div>
              )}

              {sheetsSuccessMsg && (
                <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/40 rounded-xl flex items-start gap-2 text-emerald-400 text-xs font-semibold" dir="rtl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{sheetsSuccessMsg}</span>
                </div>
              )}

              {googleSheetsLinked ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400 font-sans">التكامل نشط ومتصل تلقائياً</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans">
                        معرف جدول البيانات: <span className="font-mono text-slate-300 font-bold">{googleSheetsId}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      <a 
                        href={`https://docs.google.com/spreadsheets/d/${googleSheetsId}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>فتح جدول البيانات</span>
                      </a>
                      
                      <button
                        type="button"
                        onClick={handleSyncAllSheets}
                        disabled={isSyncingAll}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-900/30 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                        <span>{isSyncingAll ? 'جاري المزامنة...' : 'مزامنة البيانات السابقة'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleUnlinkSheets}
                        disabled={isLinkingSheets}
                        className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-950/60 text-rose-400 text-[11px] font-bold rounded-lg border border-rose-900/30 transition-colors flex items-center gap-1.5"
                      >
                        <Unlink className="w-3.5 h-3.5" />
                        <span>إلغاء الربط</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/60 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      <strong>نصيحة التشغيل:</strong> عند تلقي أي حجز أو شكوى جديدة من واتساب، إنستجرام، أو تليجرام للعميل، سيتم تدوينها فوراً وفي غضون أجزاء من الثانية بصفحة "الحجوزات" أو صفحة "الشكاوى والاقتراحات" بجدول البيانات المتصل.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Column 1: Auto create */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">الخيار الأول (مستحسن)</span>
                      <h5 className="text-xs font-bold text-white">التأسيس التلقائي السريع</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        سيقوم النظام بتسجيل الدخول بـ Google، وإنشاء ملف Google Sheet منسق يحتوي تلقائياً على جداول منفصلة للحجوزات والشكاوى وربطه بالمنشأة فوراً بضغطة زر.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoCreateSheets}
                      disabled={isLinkingSheets}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 disabled:opacity-40 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isLinkingSheets ? 'جاري الربط والتأسيس...' : 'إنشاء وربط ملف جديد تلقائياً'}</span>
                    </button>
                  </div>

                  {/* Column 2: Manual link */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">الخيار الثاني</span>
                      <h5 className="text-xs font-bold text-white">ربط ورقة عمل حالية يدوياً</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        إذا كان لديك ورقة عمل Google Sheets تم إنشاؤها مسبقاً، يمكنك لصق معرّف ورقة العمل (Spreadsheet ID) هنا للربط المباشر.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="أدخل Spreadsheet ID هنا..."
                        value={googleSheetsId}
                        onChange={(e) => setGoogleSheetsId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-[10px] text-slate-100 outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleManualLinkSheets}
                        disabled={isLinkingSheets || !googleSheetsId.trim()}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>تأكيد الربط اليدوي</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status alerts and Submit */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-5">
              <div>
                {saveStatus === 'success' && (
                  <span className="text-emerald-400 text-xs font-bold bg-emerald-950/40 border border-emerald-900 px-3 py-1.5 rounded-lg animate-pulse">
                    &bull; تم حفظ وتحديث إعدادات المساعد الذكي بنجاح!
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-rose-400 text-xs font-bold bg-rose-950/40 border border-rose-900 px-3 py-1.5 rounded-lg">
                    فشل الاتصال بالخادم، يرجى المحاولة لاحقاً.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-55 transition-all text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/10 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'جاري الحفظ...' : 'تحديث إعدادات الوكيل'}
              </button>
            </div>

          </form>
        </div>

        {/* Live Card Preview (1 column) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              البروفايل البرمجي للوكيل
            </h3>
            
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block">معرف المنشأة في الوكالة (Business ID)</span>
                <span className="font-mono text-xs text-slate-300 font-bold">{currentBiz.id}</span>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-400 block font-bold">الترحيب الافتراضي المتكامل:</span>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 relative text-xs text-slate-200 leading-relaxed font-sans">
                  <div className="absolute -top-2 right-4 bg-slate-800 text-[9px] px-1.5 py-0.5 rounded text-emerald-400 border border-slate-700 font-bold">
                    أول رسالة
                  </div>
                  {welcomeMessage}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-400 block font-bold">ملخص قدرات الأتمتة المتاحة للروبوت:</span>
                <div className="space-y-1.5">
                  {services.map((svc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span>{svc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>مواعيد قبول الحجوزات:</span>
                </div>
                <p className="text-xs text-slate-200 font-semibold">{workingHours}</p>
              </div>

              {/* Quick Replies list in Live Preview */}
              <div className="space-y-2 border-t border-slate-800/80 pt-3.5">
                <span className="text-xs text-slate-400 block font-bold">قوالب الردود الذكية المبرمجة ({quickReplies.length}):</span>
                {quickReplies.length === 0 ? (
                  <span className="text-[10px] text-slate-500 block">لا توجد قوالب ردود ذكية مخصصة لهذا المشترك.</span>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {quickReplies.map((qr) => (
                      <div key={qr.id} className="p-2 bg-slate-950 rounded-lg border border-slate-850 text-[10px] leading-relaxed">
                        <span className="font-bold text-emerald-400 block">س: {qr.question}</span>
                        <span className="text-slate-300 block mt-0.5">ج: {qr.answer}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3.5 border-t border-slate-800 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 block flex items-center gap-1">
                  <MessageSquareCode className="w-3.5 h-3.5 text-emerald-400" />
                  حالة قنوات تواصل المساعد (APIs):
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* WhatsApp Info */}
                  {(() => {
                    const wa = getChannelStatus(currentBiz.id, 'whatsapp');
                    return (
                      <div className={`p-2 rounded-lg border flex flex-col justify-between space-y-1 text-[10px] ${wa.color}`}>
                        <div className="flex items-center gap-1 font-bold">
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp API</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold">
                          <span className={`w-1 h-1 rounded-full ${wa.dotColor}`} />
                          <span>{wa.label}</span>
                        </div>
                      </div>
  );
                  })()}

                  {/* Instagram Info */}
                  {(() => {
                    const ig = getChannelStatus(currentBiz.id, 'instagram');
                    return (
                      <div className={`p-2 rounded-lg border flex flex-col justify-between space-y-1 text-[10px] ${ig.color}`}>
                        <div className="flex items-center gap-1 font-bold">
                          <Instagram className="w-3 h-3 text-pink-400" />
                          <span>Instagram API</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold">
                          <span className={`w-1 h-1 rounded-full ${ig.dotColor}`} />
                          <span>{ig.label}</span>
                        </div>
                      </div>
  );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
