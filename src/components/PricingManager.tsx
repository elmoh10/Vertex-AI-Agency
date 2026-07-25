import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Crown, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  Mail,
  MessageSquare,
  RefreshCw, 
  TrendingUp, 
  Award, 
  Building, 
  Sparkles, 
  Clock, 
  Calculator,
  Percent,
  CreditCard,
  Check,
  ChevronLeft,
  Edit3,
  X,
  Settings,
  Lock,
  Plus,
  Trash2,
  Save,
  Key
} from 'lucide-react';
import { BusinessConfig, Plan } from '../types';

interface PricingManagerProps {
  businesses: BusinessConfig[];
  onUpdateSubscription: (
    id: string, 
    plan?: string, 
    status?: string, 
    expiry?: string, 
    limit?: number, 
    resetUsage?: boolean
  ) => Promise<boolean>;
  user: { role: 'owner' | 'supervisor'; businessId?: string; name: string };
  paymentRequests?: any[];
  onRefreshData?: () => void;
}

const DEFAULT_PLANS = [
  {
    id: 'trial',
    name: 'الباقة التجريبية',
    priceMonthly: 'مجاناً',
    priceYearly: 'مجاناً',
    period: 'لمدة 7 أيام',
    desc: 'مثالية لتجربة قوة الذكاء الاصطناعي في منشأتك قبل الالتزام الكامل.',
    icon: ShieldCheck,
    color: 'border-slate-800 text-slate-300 bg-slate-900/30',
    iconColor: 'text-slate-400',
    tagColor: 'bg-slate-800 text-slate-300',
    accentColor: 'border-slate-700 hover:border-slate-600',
    features: [
      'وكيل ذكاء اصطناعي أساسي',
      'ربط قناة واحدة (واتساب أو إنستجرام)',
      'حد أقصى: 100 رد ذكاء اصطناعي شهرياً',
      'تتبع الحجوزات يدوياً',
      'لوحة تحكم بسيطة لإدارة المنشأة',
      'دعم فني عبر البريد الإلكتروني'
    ]
  },
  {
    id: 'growth',
    name: 'الباقة المتقدمة',
    priceMonthly: '1,500 ج.م',
    priceYearly: '1,200 ج.م',
    period: 'شهرياً',
    desc: 'الحل الأمثل للمنشآت المتنامية التي تحتاج لأتمتة كاملة للحجوزات والمواعيد.',
    icon: Zap,
    color: 'border-emerald-500 text-emerald-400 bg-emerald-950/20',
    iconColor: 'text-emerald-400',
    tagColor: 'bg-emerald-500 text-slate-950 font-extrabold',
    accentColor: 'border-emerald-500/80 hover:border-emerald-400 shadow-md shadow-emerald-500/5',
    isPopular: true,
    features: [
      'تكامل كامل مع WhatsApp & Instagram',
      'حد أقصى: 1,000 رد ذكاء اصطناعي شهرياً',
      'أتمتة كاملة لجدولة الحجوزات وتأكيد المواعيد',
      'مزامنة تلقائية مع جداول بيانات Google Sheets',
      'استجابة فورية للرسائل (أقل من ثانيتين)',
      'دعم فني سريع عبر الواتساب'
    ]
  },
  {
    id: 'enterprise',
    name: 'الباقة الشاملة',
    priceMonthly: '3,000 ج.م',
    priceYearly: '2,400 ج.م',
    period: 'شهرياً',
    desc: 'إدارة كاملة لخدمة العملاء والشكاوى مع أقصى قدرات الأتمتة المتاحة في وكالتنا.',
    icon: Crown,
    color: 'border-amber-500 text-amber-400 bg-amber-950/20',
    iconColor: 'text-amber-400',
    tagColor: 'bg-amber-500 text-slate-950 font-extrabold',
    accentColor: 'border-amber-500/80 hover:border-amber-400 shadow-md shadow-amber-500/5',
    features: [
      'كل ما تشمله الباقة المتقدمة',
      'ردود ذكاء اصطناعي غير محدودة شهرياً',
      'تفعيل مكتب الشكاوى الذكي (Complaints Desk)',
      'تحليلات متقدمة لبيانات العملاء وتحليل المشاعر',
      'هندسة موجهات مخصصة لهوية علامتك التجارية',
      'مدير حساب تقني مخصص ودعم هاتف 24/7'
    ]
  }
];

export default function PricingManager({ 
  businesses, 
  onUpdateSubscription, 
  user, 
  paymentRequests = [], 
  onRefreshData 
}: PricingManagerProps) {
  const [selectedClient, setSelectedClient] = useState<string>(() => {
    if (user && user.role !== 'owner' && user?.businessId) {
      return user.businessId;
    }
    return businesses[0]?.id || '';
  });

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS as any[]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Admin View State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingPlans, setEditingPlans] = useState<Plan[]>([]);
  const [isSavingPlans, setIsSavingPlans] = useState(false);
  
  // Activation Codes State
  const [activationCodes, setActivationCodes] = useState<any[]>([]);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const fetchActivationCodes = async () => {
    try {
      const res = await fetch('/api/activation-codes');
      const data = await res.json();
      setActivationCodes(data);
    } catch (e) {
      console.error("Failed to fetch codes:", e);
    }
  };

  const generateActivationCode = async (planId: string) => {
    setIsGeneratingCode(true);
    try {
      const res = await fetch('/api/activation-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });
      if (res.ok) {
        await fetchActivationCodes();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      setPlans(data);
      setEditingPlans(data);
    } catch (e) {
      console.error("Failed to fetch plans:", e);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    if (user && user.role === 'owner') {
      fetchActivationCodes();
    }
  }, [user]);

  const handleSavePlans = async () => {
    setIsSavingPlans(true);
    try {
      const res = await fetch('/api/plans/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlans: editingPlans })
      });
      if (res.ok) {
        await fetchPlans();
        setIsAdminMode(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingPlans(false);
    }
  };

  const handleUpdatePlanField = (index: number, field: string, value: any) => {
    const updated = [...editingPlans];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (updated[index] as any)[parent][child] = value;
    } else {
      (updated[index] as any)[field] = value;
    }
    setEditingPlans(updated);
  };

  // Supervisor Checkout Request states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<'trial' | 'growth' | 'enterprise'>('growth');
  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'paypal' | 'visa'>('instapay');
  const [proofNotes, setProofNotes] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Owner Approval states
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCheckoutLoading(true);
    try {
      const response = await fetch('/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: user.businessId,
          planId: checkoutPlan,
          paymentMethod,
          notes: proofNotes
        })
      });
      const data = await response.json();
      if (data.success) {
        setCheckoutSuccess(true);
        if (onRefreshData) onRefreshData();
        setTimeout(() => {
          setIsCheckoutOpen(false);
          setCheckoutSuccess(false);
          setProofNotes('');
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    setApprovalLoading(requestId);
    try {
      const response = await fetch('/api/payment/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
      const data = await response.json();
      if (data.success) {
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovalLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setApprovalLoading(requestId);
    try {
      const response = await fetch('/api/payment/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
      const data = await response.json();
      if (data.success) {
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovalLoading(null);
    }
  };

  React.useEffect(() => {
    if (user && user.role !== 'owner' && user?.businessId) {
      setSelectedClient(user.businessId);
    }
  }, [user, businesses]);

  // Upgrade / Limit warning reminder states
  const [reminderState, setReminderState] = useState<{
    clientId: string;
    type: 'whatsapp' | 'email' | null;
    status: 'idle' | 'sending' | 'success';
  }>({
    clientId: '',
    type: null,
    status: 'idle'
  });

  const triggerReminder = (clientId: string, type: 'whatsapp' | 'email') => {
    setReminderState({
      clientId,
      type,
      status: 'sending'
    });
    
    // Simulate API call or notification dispatch
    setTimeout(() => {
      setReminderState({
        clientId,
        type,
        status: 'success'
      });
      
      // Reset state after 4 seconds
      setTimeout(() => {
        setReminderState({
          clientId: '',
          type: null,
          status: 'idle'
        });
      }, 4000);
    }, 1500);
  };

  // Cost Calculator states
  const [estimatedMessages, setEstimatedMessages] = useState<number>(1200);

  // Modal / Popup states for managing subscription
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalClientId, setModalClientId] = useState('');
  const [modalPlan, setModalPlan] = useState('');
  const [modalStatus, setModalStatus] = useState('');
  const [modalExpiry, setModalExpiry] = useState('');
  const [modalLimit, setModalLimit] = useState(1000);
  const [modalResetUsage, setModalResetUsage] = useState(false);

  const loadBizIntoModal = (biz: BusinessConfig) => {
    setModalClientId(biz.id);
    setModalPlan(biz.subscriptionPlan || 'trial');
    setModalStatus(biz.subscriptionStatus || 'active');
    setModalExpiry(biz.subscriptionExpiry || '2026-07-30');
    setModalLimit(biz.aiResponseLimit || 1000);
    setModalResetUsage(false);
  };

  const openEditModal = (biz: BusinessConfig) => {
    loadBizIntoModal(biz);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveModal = async () => {
    setIsUpdating(modalClientId);
    try {
      await onUpdateSubscription(
        modalClientId,
        modalPlan,
        modalStatus,
        modalExpiry,
        modalLimit,
        modalResetUsage
      );
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error saving subscription details via modal:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const currentClientData = businesses.find(b => b.id === selectedClient);

  const handleUpdate = async (
    id: string, 
    plan?: string, 
    status?: string, 
    expiry?: string, 
    limit?: number, 
    resetUsage?: boolean
  ) => {
    setIsUpdating(id);
    try {
      await onUpdateSubscription(id, plan, status, expiry, limit, resetUsage);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(null);
    }
  };

  const getUsageStats = (biz: BusinessConfig) => {
    const count = biz.aiResponseCount || 0;
    const limit = biz.aiResponseLimit || 1;
    const percentage = Math.min(100, Math.round((count / limit) * 100));
    
    let color = 'bg-emerald-500';
    if (percentage > 90) color = 'bg-rose-500';
    else if (percentage > 70) color = 'bg-amber-500';

    return { percentage, color, count, limit };
  };

  const getCalculatorRecommendation = (messages: number) => {
    if (plans.length === 0) return null;
    
    const sorted = [...plans].sort((a, b) => (a.limits?.messages || 0) - (b.limits?.messages || 0));
    const rec = sorted.find(p => (p.limits?.messages || 0) >= messages) || sorted[sorted.length - 1];
    
    const price = billingCycle === 'monthly' ? Number(rec.priceMonthly) : Number(rec.priceYearly);
    
    return {
      plan: rec.id,
      name: rec.name,
      price: price,
      costEGP: price === 0 ? 'مجاناً' : `${price.toLocaleString()} ج.م / شهرياً`,
      benefits: rec.desc
    };
  };

  const recommended = getCalculatorRecommendation(estimatedMessages);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">الأسعار والاشتراكات</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white">خطط الأسعار واشتراكات عملاء الوكالة</h1>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-2xl">
            هنا يمكنك تتبع وإدارة خطط اشتراك عملاء الوكالة (الشركات المربوطة بمساعد "Vertex AI")، وتغيير التراخيص، ومتابعة استهلاك استهلاك ردود الذكاء الاصطناعي لكل عميل في الوقت الفعلي.
          </p>
          
          {user.role === 'owner' && (
            <div className="pt-2">
              <button
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  isAdminMode 
                    ? 'bg-amber-500 text-slate-950' 
                    : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                }`}
              >
                <Settings className={`w-4 h-4 ${isAdminMode ? 'animate-spin' : ''}`} />
                {isAdminMode ? 'الخروج من وضع الإدارة' : 'إدارة تفاصيل الباقات والأسعار (Global Settings)'}
              </button>
            </div>
          )}
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850 self-start md:self-auto">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            دفع شهري
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              billingCycle === 'yearly'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            دفع سنوي 
            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-black">
              خصم %20
            </span>
          </button>
        </div>
      </div>

      {/* Plans Presentation Grid or Admin Management */}
      {isAdminMode && user.role === 'owner' ? (
        <div className="bg-slate-900/40 border border-amber-500/20 rounded-2xl p-6 space-y-8 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                لوحة التحكم في هيكل الباقات (الأسعار والمميزات)
              </h2>
              <p className="text-xs text-slate-400">أي تعديل هنا سيظهر فوراً لجميع العملاء في صفحة الباقات.</p>
            </div>
            <button
              onClick={handleSavePlans}
              disabled={isSavingPlans}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isSavingPlans ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ التعديلات النهائية
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {editingPlans.map((p, idx) => (
              <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    {p.id === 'trial' ? <ShieldCheck className="w-4 h-4 text-slate-400" /> : p.id === 'growth' ? <Zap className="w-4 h-4 text-emerald-400" /> : <Crown className="w-4 h-4 text-amber-400" />}
                  </div>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handleUpdatePlanField(idx, 'name', e.target.value)}
                    className="bg-transparent border-none text-sm font-black text-white focus:ring-0 p-0 w-full"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">السعر الشهري (ج.م)</label>
                    <input
                      type="text"
                      value={p.priceMonthly}
                      onChange={(e) => handleUpdatePlanField(idx, 'priceMonthly', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">السعر السنوي (ج.م)</label>
                    <input
                      type="text"
                      value={p.priceYearly}
                      onChange={(e) => handleUpdatePlanField(idx, 'priceYearly', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">الوصف</label>
                    <textarea
                      value={p.desc}
                      onChange={(e) => handleUpdatePlanField(idx, 'desc', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 min-h-[60px] focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <label className="text-[10px] text-slate-500 font-bold block border-b border-slate-900 pb-1">الحدود التقنية (Limits)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-slate-600 block">الردود/شهر</label>
                      <input
                        type="number"
                        value={p.limits?.messages}
                        onChange={(e) => handleUpdatePlanField(idx, 'limits.messages', parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-600 block">القنوات</label>
                      <input
                        type="number"
                        value={p.limits?.channels}
                        onChange={(e) => handleUpdatePlanField(idx, 'limits.channels', parseInt(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] font-mono text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={p.limits?.hasComplaints}
                        onChange={(e) => handleUpdatePlanField(idx, 'limits.hasComplaints', e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors">مكتب الشكاوى</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={p.limits?.hasAutomation}
                        onChange={(e) => handleUpdatePlanField(idx, 'limits.hasAutomation', e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors">أتمتة الحجوزات</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold block border-b border-slate-900 pb-1">قائمة المميزات (نصوص)</label>
                  {p.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={f}
                        onChange={(e) => {
                          const updatedFeats = [...p.features];
                          updatedFeats[fIdx] = e.target.value;
                          handleUpdatePlanField(idx, 'features', updatedFeats);
                        }}
                        className="w-full bg-slate-900/50 border border-slate-900 rounded px-2 py-1 text-[10px] text-slate-300"
                      />
                      <button 
                        onClick={() => {
                          const updatedFeats = p.features.filter((_, i) => i !== fIdx);
                          handleUpdatePlanField(idx, 'features', updatedFeats);
                        }}
                        className="text-rose-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updatedFeats = [...p.features, "ميزة جديدة"];
                      handleUpdatePlanField(idx, 'features', updatedFeats);
                    }}
                    className="w-full py-1 border border-dashed border-slate-800 rounded text-[9px] text-slate-500 hover:text-slate-400 hover:border-slate-700 transition-all flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    إضافة ميزة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const PlanIcons: Record<string, any> = {
              trial: ShieldCheck,
              growth: Zap,
              enterprise: Crown
            };
            const PlanIcon = PlanIcons[plan.id] || Sparkles;
          const isCurrentPlan = currentClientData?.subscriptionPlan === plan.id;
          
          // Get beautiful custom card styling based on plan ID
          let cardGradient = "bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800 hover:border-slate-700";
          let badgeStyle = "bg-slate-850 text-slate-300 border border-slate-800";
          
          if (plan.id === 'growth') {
            cardGradient = "bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 shadow-xl shadow-emerald-950/20";
            badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-900/30";
          } else if (plan.id === 'enterprise') {
            cardGradient = "bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/30 hover:border-amber-400 shadow-xl shadow-amber-950/10";
            badgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-900/30";
          }

          return (
            <div 
              key={plan.id}
              className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:scale-[1.01] ${cardGradient}`}
            >
              {/* Highlight Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-500/10">
                  <Sparkles className="w-3 h-3" />
                  الأكثر طلباً واختياراً
                </div>
              )}

              {/* Decorative Background Glows */}
              <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity bg-white/20" />

              <div className="space-y-4">
                {/* Card Top: Icon & Category Badge */}
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl border border-slate-800 bg-slate-950/80 text-white ${plan.iconColor}`}>
                    <PlanIcon className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold ${badgeStyle}`}>
                    {plan.id === 'trial' ? 'فترة مجانية' : plan.id === 'growth' ? 'موصى به للأعمال' : 'أداء غير محدود'}
                  </span>
                </div>

                {/* Plan Info */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                    {plan.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    {plan.desc}
                  </p>
                </div>

                {/* Pricing display section */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-bold block">تكلفة الاشتراك:</span>
                    <span className="text-2xl font-black text-white font-mono tracking-tight">
                      {billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                    </span>
                  </div>
                  <span className="text-[9px] bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-400 font-bold">
                    / {plan.period}
                  </span>
                </div>

                {/* Plan Features Checklist */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] text-slate-500 font-bold block border-b border-slate-850 pb-1.5">مميزات الباقة ومستوى الدعم:</span>
                  <ul className="space-y-2 text-[11px]">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300 leading-relaxed">
                        <span className="p-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mt-0.5 shrink-0">
                          <Check className="w-3 h-3 text-emerald-400" />
                        </span>
                        <span className="group-hover:text-slate-200 transition-colors">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons: Apply & Edit Plan (Customizer popup trigger) */}
              <div className="pt-4 border-t border-slate-850 space-y-2">
                {user && user.role !== 'owner' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutPlan(plan.id as any);
                      setIsCheckoutOpen(true);
                    }}
                    disabled={isCurrentPlan}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 ${
                      isCurrentPlan
                        ? 'bg-slate-950 border border-slate-900 text-slate-500 cursor-not-allowed'
                        : plan.id === 'growth'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/10'
                        : plan.id === 'enterprise'
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200'
                    }`}
                  >
                    {isCurrentPlan ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>باقتك النشطة الحالية ✅</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 shrink-0" />
                        <span>طلب تفعيل وترقية الاشتراك 💳</span>
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentClientData) {
                          const limit = plan.id === 'trial' ? 100 : plan.id === 'growth' ? 1000 : 10000;
                          handleUpdate(currentClientData.id, plan.id, 'active', plan.id === 'trial' ? '2026-07-23' : plan.id === 'growth' ? '2026-08-16' : '2026-11-15', limit);
                        }
                      }}
                      disabled={isCurrentPlan || !currentClientData}
                      className={`w-full py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 ${
                        isCurrentPlan
                          ? 'bg-slate-950 border border-slate-900 text-slate-500 cursor-not-allowed'
                          : !currentClientData
                          ? 'bg-slate-900/50 border border-slate-850/30 text-slate-600 cursor-not-allowed'
                          : plan.id === 'growth'
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/10'
                          : plan.id === 'enterprise'
                          ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {isCurrentPlan ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>الباقة الحالية للمشترك المحدّد</span>
                        </>
                      ) : (
                        <span>تطبيق فوري على العميل المحدّد</span>
                      )}
                    </button>

                    {currentClientData && (
                      <button
                        type="button"
                        onClick={() => {
                          const limit = plan.id === 'trial' ? 100 : plan.id === 'growth' ? 1000 : 10000;
                          const expiry = plan.id === 'trial' ? '2026-07-23' : plan.id === 'growth' ? '2026-08-16' : '2026-11-15';
                          setModalClientId(currentClientData.id);
                          setModalPlan(plan.id);
                          setModalStatus(currentClientData.subscriptionStatus || 'active');
                          setModalExpiry(currentClientData.subscriptionExpiry || expiry);
                          setModalLimit(limit);
                          setModalResetUsage(false);
                          setIsEditModalOpen(true);
                        }}
                        className="w-full py-2 bg-slate-950 hover:bg-slate-900 hover:text-white border border-slate-850/80 rounded-xl text-xs text-slate-400 font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>تعديل وتخصيص تفاصيل الخطة ⚙️</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Subscriptions Management Dashboard */}
        <div className="lg:col-span-7 bg-slate-900/10 border border-slate-900 rounded-2xl p-6 space-y-6">
          {user && user.role !== 'owner' ? (
            /* SUPERVISOR VIEW: Show their company's subscription and payment request history */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    حالة اشتراك منشأتك الحالية
                  </h2>
                  <p className="text-[11px] text-slate-400">تتبع استهلاك ردود الذكاء الاصطناعي وتراخيص شركتك الحالية.</p>
                </div>
              </div>

              {currentClientData ? (
                <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900/60 pb-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">المنشأة والنشاط المربوط:</span>
                      <span className="text-sm font-extrabold text-white">{currentClientData.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <span className="text-[10px] text-slate-500 font-bold block">نوع الباقة الحالية:</span>
                        <span className="text-xs font-black text-emerald-400">
                          {currentClientData.subscriptionPlan === 'trial' ? 'الباقة التجريبية' : currentClientData.subscriptionPlan === 'growth' ? 'الباقة المتقدمة' : 'الباقة الشاملة'}
                        </span>
                      </div>
                      <div className="w-1.5 h-8 bg-slate-900 rounded-full" />
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">حالة الاشتراك:</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                          currentClientData.subscriptionStatus === 'active' 
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' 
                            : 'bg-rose-950/50 text-rose-400 border border-rose-900/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            currentClientData.subscriptionStatus === 'active' ? 'bg-emerald-400' : 'bg-rose-500'
                          }`} />
                          {currentClientData.subscriptionStatus === 'active' ? 'نشط ومفعّل' : 'منتهي الصلاحية'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Progress Bar */}
                  {(() => {
                    const { percentage, color, count, limit } = getUsageStats(currentClientData);
                    const isHighUsage = percentage > 80;
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-bold">معدل استهلاك ردود الذكاء الاصطناعي:</span>
                          <span className="font-mono font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded border border-slate-850">
                            <span className="text-emerald-400">{count.toLocaleString()}</span> / {limit.toLocaleString()} رد
                          </span>
                        </div>

                        <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                          <div 
                            className={`absolute top-0 bottom-0 right-0 rounded-full transition-all duration-500 ${color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{percentage}% تم استهلاكها</span>
                          <span>المتبقي: {(limit - count).toLocaleString()} رد</span>
                        </div>

                        {isHighUsage && (
                          <div className="bg-rose-950/10 border border-rose-900/30 rounded-xl p-3 flex items-start gap-2 animate-pulse">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-rose-200 block">تنبيه: اقتربت من حد الاستهلاك الأقصى!</span>
                              <span className="text-[10px] text-slate-400 block leading-relaxed">
                                لقد استهلكت <span className="text-rose-400 font-bold">{percentage}%</span> من حد باقتك المتاح. يرجى طلب ترقية الباقة بالأعلى لتجنب انقطاع ردود الـ AI التلقائية عن عملائك.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-400">
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-slate-500 block mb-0.5">تاريخ انتهاء الفوترة:</span>
                      <span className="font-mono text-slate-200 font-bold">{currentClientData.subscriptionExpiry || '2026-07-30'}</span>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900">
                      <span className="text-[10px] text-slate-500 block mb-0.5">قنوات الربط النشطة:</span>
                      <span className="text-slate-200 font-bold">WhatsApp, Instagram</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-900">
                  <Building className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                  <span>لم يتم تسجيل بيانات شركتك أو ربطها بالاشتراك بعد.</span>
                </div>
              )}

              {/* supervisor payment requests list */}
              <div className="space-y-3.5 pt-2">
                <div className="border-t border-slate-900 pt-4 flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-300 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    سجل طلبات دفع وتفعيل الاشتراكات الخاصة بك
                  </h3>
                  <span className="text-[10px] bg-slate-950 border border-slate-850 px-2 py-0.5 rounded text-slate-500 font-mono">
                    {paymentRequests.filter(r => r.businessId === user?.businessId).length} طلب
                  </span>
                </div>

                {paymentRequests.filter(r => r.businessId === user?.businessId).length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-slate-500 bg-slate-950/40 border border-slate-900/60 rounded-xl leading-relaxed">
                    <span>لا توجد طلبات تفعيل معلقة أو سابقة للمنشأة حالياً.</span>
                    <span className="block mt-1 text-[10px] text-slate-600">يمكنك تقديم طلب جديد بالضغط على "طلب تفعيل وترقية الاشتراك" أسفل أي باقة بالأعلى.</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-right" dir="rtl">
                    {paymentRequests
                      .filter(r => r.businessId === user?.businessId)
                      .slice()
                      .reverse()
                      .map((req) => {
                        return (
                          <div 
                            key={req.id} 
                            className="bg-slate-950/60 border border-slate-900 hover:border-slate-850 rounded-xl p-3 flex items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  باقة {req.planId === 'trial' ? 'التجريبية' : req.planId === 'growth' ? 'المتقدمة' : 'الشاملة'}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono">
                                  ({req.createdAt ? req.createdAt.split('T')[0] : 'اليوم'})
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 block">
                                وسيلة الدفع: <span className="text-slate-300 font-bold uppercase">{req.paymentMethod}</span>
                                {req.notes && ` • ملاحظات: ${req.notes}`}
                              </span>
                            </div>

                            <div>
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                req.status === 'approved'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
                                  : req.status === 'rejected'
                                  ? 'bg-rose-950/40 text-rose-400 border-rose-900/30'
                                  : 'bg-amber-950/40 text-amber-400 border-amber-900/30 animate-pulse'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  req.status === 'approved' ? 'bg-emerald-400' : req.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-400'
                                }`} />
                                {req.status === 'approved' ? 'تم التفعيل والموافقة' : req.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة والتحقق'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* OWNER VIEW: Original Subscriptions Dashboard with alerting and Payment requests approvals */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" />
                    وحدة التحكم باشتراكات العملاء
                  </h2>
                  <p className="text-[11px] text-slate-400">اختر العميل (الشركة) من القائمة للتحكم في باقته ومتابعة استهلاكه.</p>
                </div>

                {isUpdating && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    جاري التحديث...
                  </span>
                )}
              </div>

              {/* Client Selection Selector buttons */}
              <div className="grid grid-cols-3 gap-2.5">
                {businesses.map((biz) => {
                  const isSelected = selectedClient === biz.id;
                  const { percentage } = getUsageStats(biz);
                  const isHighUsage = percentage > 80;
                  return (
                    <button
                      key={biz.id}
                      onClick={() => setSelectedClient(biz.id)}
                      className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 border-emerald-500 text-white shadow-md shadow-emerald-500/5'
                          : 'bg-slate-950 border-slate-900/80 text-slate-400 hover:border-slate-850 hover:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            biz.subscriptionStatus === 'active' ? 'bg-emerald-400' : 'bg-rose-500'
                          }`} />
                          <span className="text-[11px] font-bold line-clamp-1">{biz.name}</span>
                        </div>
                        {isHighUsage && (
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" title="استهلاك مرتفع (>80%)" />
                        )}
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-850 self-start">
                        الباقة: {biz.subscriptionPlan === 'trial' ? 'التجريبية' : biz.subscriptionPlan === 'growth' ? 'المتقدمة' : 'الشاملة'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {currentClientData ? (
                <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 space-y-6">
                  
                  {/* Profile Client Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-500">ID: {currentClientData.id}</span>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white">{currentClientData.name}</h4>
                        {getUsageStats(currentClientData).percentage > 80 && (
                          <span className="flex items-center gap-1 bg-rose-500/10 border border-rose-900/40 text-rose-400 text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            استهلاك حرج (&gt;80%)
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        تاريخ انتهاء الاشتراك الحالي: <span className="text-white font-mono font-bold">{currentClientData.subscriptionExpiry || '2026-07-30'}</span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <span className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold text-center ${
                        currentClientData.subscriptionStatus === 'active'
                          ? 'bg-emerald-950/60 border border-emerald-900/40 text-emerald-400'
                          : 'bg-rose-950/60 border-rose-900/40 text-rose-400'
                      }`}>
                        {currentClientData.subscriptionStatus === 'active' ? '● اشتراك نشط' : '● منتهي الصلاحية'}
                      </span>

                      <button
                        onClick={() => openEditModal(currentClientData)}
                        className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer active:scale-95"
                      >
                        <Settings className="w-3.5 h-3.5 shrink-0" />
                        <span>تعديل الخطة والاشتراك</span>
                      </button>
                    </div>
                  </div>

                  {/* Usage Progress Tracker */}
                  {(() => {
                    const { percentage, color, count, limit } = getUsageStats(currentClientData);
                    const isHighUsage = percentage > 80;
                    return (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-400">استهلاك ردود الـ AI لهذا الشهر</span>
                          <span className="font-mono text-slate-300 font-bold">
                            <span className="text-white font-black">{count}</span> / {limit} رد ({percentage}%)
                          </span>
                        </div>

                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-[2px] border border-slate-850">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1">
                          <span>إعادة تصفير العداد تلقائياً عند تاريخ الفوترة</span>
                          <button
                            onClick={() => handleUpdate(currentClientData.id, undefined, undefined, undefined, undefined, true)}
                            className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            تصفير العداد يدوياً
                          </button>
                        </div>

                        {/* High usage warning alert box */}
                        {isHighUsage && (
                          <div className="bg-rose-950/10 border border-rose-900/30 rounded-xl p-4 space-y-3 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex items-start gap-2.5 text-right" dir="rtl">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-rose-200 block">تنبيه تخطي حد الاستهلاك الآمن</span>
                                <span className="text-[10px] text-slate-400 block leading-relaxed">
                                  لقد استهلك هذا المشترك <span className="text-rose-400 font-bold font-mono">{percentage}%</span> من حد باقته الحالي. يوصى بإرسال تذكير فوري لترقية الخطة لتفادي انقطاع الخدمة التلقائي.
                                </span>
                              </div>
                            </div>

                            {/* Reminder Actions */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => triggerReminder(currentClientData.id, 'whatsapp')}
                                disabled={reminderState.status === 'sending'}
                                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-900/30 rounded-lg py-1.5 px-3 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                              >
                                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                                <span>تذكير ترقية عبر الواتساب</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => triggerReminder(currentClientData.id, 'email')}
                                disabled={reminderState.status === 'sending'}
                                className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-900/30 rounded-lg py-1.5 px-3 text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                              >
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span>تذكير ترقية عبر البريد</span>
                              </button>
                            </div>

                            {/* Success / Loading Feedbacks */}
                            {reminderState.clientId === currentClientData.id && reminderState.status !== 'idle' && (
                              <div className={`text-center p-2 rounded-lg text-[10px] font-bold border transition-all ${
                                reminderState.status === 'sending'
                                  ? 'bg-slate-950/80 border-slate-850 text-slate-400'
                                  : 'bg-emerald-950/40 border-emerald-900/30 text-emerald-400'
                              }`}>
                                {reminderState.status === 'sending' ? (
                                  <span className="flex items-center justify-center gap-1.5">
                                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
                                    جاري صياغة وإرسال التذكير الآلي...
                                  </span>
                                ) : (
                                  <span>
                                    {reminderState.type === 'whatsapp' 
                                      ? `✅ تم إرسال رسالة تذكير مخصصة إلى واتساب المشترك (${currentClientData.name}) بنجاح!` 
                                      : `✉️ تم إرسال رسالة تذكير وعرض ترقية إلى بريد المشترك (${currentClientData.name}) بنجاح!`
                                    }
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Quick Actions Panel */}
                  <div className="pt-4 border-t border-slate-900/60 space-y-3">
                    <h5 className="text-[11px] font-bold text-slate-300">أدوات تعديل التراخيص الفورية للوكيل:</h5>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      
                      {/* Action 1: Toggle Status Active/Expired */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus = currentClientData.subscriptionStatus === 'active' ? 'expired' : 'active';
                          handleUpdate(currentClientData.id, undefined, nextStatus);
                        }}
                        className={`py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                          currentClientData.subscriptionStatus === 'active'
                            ? 'bg-rose-950/20 border-rose-900/40 text-rose-400 hover:bg-rose-950/40'
                            : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:bg-emerald-950/40'
                        }`}
                      >
                        {currentClientData.subscriptionStatus === 'active' ? 'تعطيل الترخيص مؤقتاً' : 'تفعيل الترخيص فوري'}
                      </button>

                      {/* Action 2: Extend Expiry by 30 days */}
                      <button
                        type="button"
                        onClick={() => {
                          const currentExpiry = currentClientData.subscriptionExpiry || '2026-07-30';
                          const parts = currentExpiry.split('-');
                          if (parts.length === 3) {
                            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                            date.setDate(date.getDate() + 30);
                            const nextExpiry = date.toISOString().split('T')[0];
                            handleUpdate(currentClientData.id, undefined, undefined, nextExpiry);
                          }
                        }}
                        className="py-2 bg-slate-900 border border-slate-850 text-slate-300 hover:bg-slate-850 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        تمديد الترخيص (+30 يوم)
                      </button>

                      {/* Action 3: Upgrade limits by 500 responses */}
                      <button
                        type="button"
                        onClick={() => {
                          const currentLimit = currentClientData.aiResponseLimit || 1000;
                          handleUpdate(currentClientData.id, undefined, undefined, undefined, currentLimit + 500);
                        }}
                        className="py-2 bg-emerald-500/10 border border-emerald-950/60 text-emerald-400 hover:bg-emerald-500/25 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        زيادة سعة الرسائل (+500 رد)
                      </button>

                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-12 text-center text-slate-500">
                  <Building className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                  <span>لا توجد أي منشآت أو شركات لإدارة اشتراكها.</span>
                </div>
              )}

              {/* Payment Requests for Owner */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 space-y-4 mt-6">
                <div className="space-y-0.5 text-right">
                  <h3 className="text-xs font-black text-white flex items-center gap-2 justify-start">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    طلبات تفعيل الاشتراكات الواردة (التفعيل المعلق)
                  </h3>
                  <p className="text-[10px] text-slate-400">تابع وأقر الحوالات البنكية لعملائك لتنشيط باقاتهم المحددة.</p>
                </div>
                
                {paymentRequests.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-slate-500 bg-slate-950/40 border border-slate-900/60 rounded-xl">
                    <span>لا توجد طلبات تفعيل واردة حالياً.</span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {paymentRequests.slice().reverse().map((req) => {
                      const client = businesses.find(b => b.id === req.businessId);
                      const isPending = req.status === 'pending';
                      
                      return (
                        <div key={req.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 text-right" dir="rtl">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{client?.name || 'عميل غير معروف'}</span>
                              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                                باقة: {req.planId === 'trial' ? 'التجريبية' : req.planId === 'growth' ? 'المتقدمة' : 'الشاملة'}
                              </span>
                            </div>
                            
                            {req.notes && (
                              <p className="text-[10px] text-slate-400 bg-slate-950/80 border border-slate-900 p-2 rounded-lg leading-relaxed text-right">
                                <span className="font-bold text-slate-500 block text-[9px] mb-0.5">تفاصيل الحوالة / رقم المعاملة:</span>
                                {req.notes}
                              </p>
                            )}
                            
                            <span className="text-[9px] text-slate-600 block font-mono">
                              معرف الطلب: {req.id} • تاريخ الإرسال: {req.createdAt ? req.createdAt.split('T')[0] : 'اليوم'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 sm:self-center shrink-0">
                            {isPending ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRejectRequest(req.id)}
                                  disabled={approvalLoading !== null}
                                  className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/30 text-rose-400 hover:text-rose-300 border border-rose-900/30 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  {approvalLoading === req.id ? 'جاري...' : 'رفض الطلب ❌'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApproveRequest(req.id)}
                                  disabled={approvalLoading !== null}
                                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/10"
                                >
                                  {approvalLoading === req.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin text-slate-950" />
                                  ) : (
                                    <span>تفعيل وموافقة الحوالة ✅</span>
                                  )}
                                </button>
                              </>
                            ) : (
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                req.status === 'approved' 
                                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
                                  : 'bg-rose-950/20 text-rose-400 border-rose-900/30'
                              }`}>
                                {req.status === 'approved' ? '✓ تم التفعيل بنجاح' : '✗ تم رفض الطلب'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Activation Codes for Owner */}
              <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 space-y-4 mt-6">
                <div className="space-y-0.5 text-right flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black text-white flex items-center gap-2 justify-start">
                      <Key className="w-4 h-4 text-emerald-400" />
                      أكواد تفعيل الاشتراكات
                    </h3>
                    <p className="text-[10px] text-slate-400">قم بتوليد أكواد تفعيل للعملاء لتفعيل باقاتهم مباشرة بعد الدفع.</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      id="codePlanSelect"
                      className="bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-white px-2 py-1 focus:ring-0"
                    >
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button
                      onClick={() => {
                        const select = document.getElementById('codePlanSelect') as HTMLSelectElement;
                        generateActivationCode(select.value);
                      }}
                      disabled={isGeneratingCode}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg text-[10px] transition-all cursor-pointer shadow-md shadow-emerald-500/10 flex items-center gap-1"
                    >
                      {isGeneratingCode ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      توليد كود
                    </button>
                  </div>
                </div>
                
                {activationCodes.length === 0 ? (
                  <div className="p-6 text-center text-[11px] text-slate-500 bg-slate-950/40 border border-slate-900/60 rounded-xl">
                    <span>لا توجد أكواد تفعيل حالياً.</span>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {activationCodes.map((code) => {
                      const plan = plans.find(p => p.id === code.planId);
                      return (
                        <div key={code.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 text-right" dir="rtl">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-emerald-400 font-mono tracking-wider bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/40 select-all">
                                {code.code}
                              </span>
                              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                                باقة: {plan?.name || code.planId}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-600 block font-mono">
                              تاريخ التوليد: {code.createdAt.split('T')[0]}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 sm:self-center shrink-0">
                            {code.isUsed ? (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-slate-950/40 text-slate-500 border-slate-900/50">
                                مستخدم ✓
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border bg-amber-950/20 text-amber-400 border-amber-900/30 animate-pulse">
                                متاح للاستخدام
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Cost Calculator Section */}
        <div className="lg:col-span-5 bg-slate-900/10 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-1.5 border-b border-slate-900 pb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              محاكي التكلفة ومستشار الباقات
            </h2>
            <p className="text-[11px] text-slate-400">حدد حجم الرسائل المتوقع شهرياً لمعرفة الباقة المناسبة تماماً لاحتياجاتك.</p>
          </div>

          <div className="space-y-6 py-2">
            {/* Range Selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-slate-400">عدد الرسائل المستلمة شهرياً</span>
                <span className="font-mono text-emerald-400 font-bold bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/40">
                  {estimatedMessages.toLocaleString()} رسالة / رد
                </span>
              </div>

              <input 
                type="range" 
                min="50" 
                max="6000" 
                step="50"
                value={estimatedMessages}
                onChange={(e) => setEstimatedMessages(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950 rounded-lg h-2 cursor-pointer"
              />

              <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                <span>50</span>
                <span>1,500</span>
                <span>3,000</span>
                <span>4,500</span>
                <span>6,000+</span>
              </div>
            </div>

            {/* Recommendation output card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4">
              <div className="space-y-1">
                <span className="text-[8px] font-bold text-slate-500 block uppercase">الباقة المقترحة:</span>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>{recommended.name}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                {recommended.benefits}
              </p>

              <div className="pt-3 border-t border-slate-900/80 flex items-center justify-between">
                <span className="text-[9px] text-slate-500">التكلفة التقريبية:</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{recommended.costEGP}</span>
              </div>
            </div>

            {/* Savings Badge */}
            <div className="p-3 bg-emerald-500/5 border border-emerald-950/60 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Percent className="w-4 h-4" />
              </div>
              <div className="leading-normal text-[10px]">
                <span className="text-white font-bold block">وفر حتى %20 عند اختيار الدورة السنوية!</span>
                <span className="text-slate-400 block">قم بتحويل دورة الفوترة للسنوي لتخفيض تكلفة الترخيص فورا لجميع عملائك.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900">
            <button
              onClick={() => {
                if (currentClientData) {
                  const targetLimit = estimatedMessages;
                  handleUpdate(currentClientData.id, recommended.plan, 'active', undefined, targetLimit);
                }
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>تطبيق التوصية على العميل المحدّد فوراً</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Checkout and Activation Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-right" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">تفعيل الاشتراك عن طريق كود</h3>
                  <p className="text-[10px] text-slate-400">يرجى دفع قيمة الاشتراك ثم التواصل للحصول على الكود</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                <span className="text-[10px] text-slate-400 font-bold">لإتمام الاشتراك، يرجى تحويل المبلغ عبر انستا باي إلى الحساب التالي:</span>
                <div className="text-lg font-black text-emerald-400 select-all font-mono tracking-wider bg-emerald-950/30 py-2 rounded-lg border border-emerald-900/40">
                  etch2410@instapay
                </div>
                <span className="text-[9px] text-slate-500 block">بعد التحويل، سيقوم المشرف بتزويدك بكود التفعيل الخاص بباقة "{checkoutPlan}".</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">أدخل كود التفعيل هنا</label>
                <input 
                  type="text" 
                  value={proofNotes} // Re-using proofNotes for code input
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder="CODE-XXXX-XXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-center text-emerald-400 font-mono font-bold outline-none focus:border-emerald-500 tracking-widest uppercase"
                />
              </div>

              {checkoutSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-900/40 rounded-xl text-center">
                  <span className="text-xs font-bold text-emerald-400 block">✅ تم تفعيل الاشتراك بنجاح!</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={async () => {
                  setCheckoutLoading(true);
                  try {
                    const res = await fetch('/api/redeem-code', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ code: proofNotes, businessId: user?.businessId })
                    });
                    const data = await res.json();
                    if (data.success) {
                      setCheckoutSuccess(true);
                      if (onRefreshData) onRefreshData();
                      setTimeout(() => {
                        setIsCheckoutOpen(false);
                        setCheckoutSuccess(false);
                        setProofNotes('');
                      }, 2000);
                    } else {
                      alert(data.error || 'الكود غير صحيح أو مستخدم مسبقاً');
                    }
                  } catch (e) {
                    alert('حدث خطأ، يرجى المحاولة مرة أخرى');
                  } finally {
                    setCheckoutLoading(false);
                  }
                }}
                disabled={checkoutLoading || !proofNotes}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
              >
                {checkoutLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>تأكيد الكود وتفعيل الباقة 🚀</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Modal for Plan Customization */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 text-right" dir="rtl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">تعديل خطة واشتراك العميل</h3>
                  <p className="text-[10px] text-slate-400">تخصيص كامل للتراخيص وصلاحيات مساعد الـ AI</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={closeEditModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              {/* Client Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">العميل المستهدف بالتعديل</label>
                <select
                  value={modalClientId}
                  onChange={(e) => {
                    const biz = businesses.find(b => b.id === e.target.value);
                    if (biz) {
                      loadBizIntoModal(biz);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                >
                  {businesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Plan Cards inside Modal */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400">الباقة المطلوبة للعميل</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'trial', name: 'تجريبية', limit: 100 },
                    { id: 'growth', name: 'متقدمة', limit: 1000 },
                    { id: 'enterprise', name: 'شاملة', limit: 10000 }
                  ].map(p => {
                    const isSelected = modalPlan === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          setModalPlan(p.id);
                          setModalLimit(p.limit);
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400 font-bold shadow-md shadow-emerald-500/5'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300'
                        }`}
                      >
                        <span className="text-xs">{p.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono mt-0.5">{p.limit} رد</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status and Expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">حالة الترخيص</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="active">نشط (Active)</option>
                    <option value="expired">منتهي (Expired)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={modalExpiry}
                    onChange={(e) => setModalExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono text-center"
                  />
                </div>
              </div>

              {/* Limit Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400">سعة الردود القصوى شهرياً</label>
                <input
                  type="number"
                  value={modalLimit}
                  onChange={(e) => setModalLimit(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500 font-mono text-center"
                />
              </div>

              {/* Reset Usage */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200 block">تصفير عداد الاستهلاك</span>
                  <span className="text-[9px] text-slate-500 block">سيتم تصفير استهلاك ردود الذكاء الاصطناعي حالياً لتبدأ من 0.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={modalResetUsage} 
                    onChange={(e) => setModalResetUsage(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4.5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-slate-950"></div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-850 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                disabled={isUpdating !== null}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <span>حفظ التعديلات</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
