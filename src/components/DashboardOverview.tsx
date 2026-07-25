import React from 'react';
import { 
  Building2, 
  CalendarCheck, 
  MessageSquareWarning, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Clock,
  Sparkles,
  Bot,
  MessageSquareQuote,
  Target,
  ShoppingBag,
  Bell
} from 'lucide-react';
import { Booking, Complaint, WebhookLog } from '../types';

interface DashboardProps {
  bookings?: Booking[];
  complaints?: Complaint[];
  webhookLogs?: WebhookLog[];
  onNavigate: (tab: string) => void;
  onReset: () => void;
  isResetting: boolean;
  user: { role: 'owner' | 'supervisor'; businessId?: string; name: string } | null;
}

export default function DashboardOverview({ 
  bookings = [], 
  complaints = [], 
  webhookLogs = [], 
  onNavigate,
  onReset,
  isResetting,
  user
}: DashboardProps) {
  
  // Calculate stats
  const activeClients = 3;
  if (!bookings || !complaints || !webhookLogs) return null;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const activeComplaints = complaints.filter(c => c.status !== 'resolved').length;
  const totalLogs = webhookLogs.length;

  // New Analytics Stats (Simulated)
  const mostRepeatedQuestion = "ما هي قائمة الأسعار؟";
  const conversionRate = "78%";
  const mostDemandedService = "باقة تجربة كاملة";
  const followUpEnabled = true;
  const followUpCount = 42;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-emerald-400 text-xs font-semibold rounded-full border border-slate-700">
              <Sparkles className="w-3 h-3" />
              Vertex AI Agency
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white font-sans">
              لوحة تحكم وكيل الأتمتة الذكي <span className="text-emerald-400">Vertex AI</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              منصة ادارة المنشات بالذكاء الاصطناعي
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-start md:self-center">
            <button 
              onClick={() => onNavigate('simulator')}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              ابدأ المحاكاة الآن
            </button>
            <button 
              onClick={onReset}
              disabled={isResetting}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-55 active:scale-95 transition-all text-slate-300 font-medium rounded-xl text-sm border border-slate-700 cursor-pointer"
            >
              {isResetting ? 'جاري الضبط...' : 'إعادة ضبط البيانات'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1 - Only visible to owners */}
        {user?.role === 'owner' && (
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-400">العملاء النشطون (الشركات)</span>
              <div className="p-2.5 bg-slate-800 text-blue-400 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-white">03</span>
              <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400">
                <ArrowUpRight className="w-3.5 h-3.5" />
                100% جاهز
              </span>
            </div>
            <p className="text-xs text-slate-500">عيادات، مطاعم، كافيهات متكاملة</p>
          </div>
        )}

        {/* Stat Card 2 */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">إجمالي الحجوزات المؤتمتة</span>
            <div className="p-2.5 bg-slate-800 text-emerald-400 rounded-lg">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{totalBookings}</span>
            <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{totalBookings * 20}% نمو
            </span>
          </div>
          <p className="text-xs text-slate-500">{pendingBookings} حجوزات بانتظار التأكيد</p>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">الشكاوى الملتقطة والمحللة</span>
            <div className="p-2.5 bg-slate-800 text-rose-400 rounded-lg">
              <MessageSquareWarning className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{complaints.length}</span>
            <span className="inline-flex items-center gap-0.5 text-xs text-slate-400">
              {activeComplaints === 0 ? 'مكتمل' : `${activeComplaints} قيد المعالجة`}
            </span>
          </div>
          <p className="text-xs text-slate-500">محللة بالذكاء الاصطناعي مع ردود جاهزة</p>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">الاستجابة التلقائية للشبكة</span>
            <div className="p-2.5 bg-slate-800 text-emerald-400 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">99.8%</span>
            <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
              متوسط الرد &lt; 2ث
            </span>
          </div>
          <p className="text-xs text-slate-500">أكثر من {totalLogs} أحداث وبيانات ويبهوك اليوم</p>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[10px] text-slate-400">أكثر سؤال تكراراً</span>
          <div className="flex items-center gap-2 text-emerald-400">
            <MessageSquareQuote className="w-5 h-5" />
            <span className="text-sm font-bold text-white line-clamp-1">{mostRepeatedQuestion}</span>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[10px] text-slate-400">نسبة التحويل</span>
          <div className="flex items-center gap-2 text-emerald-400">
            <Target className="w-5 h-5" />
            <span className="text-xl font-bold text-white">{conversionRate}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[10px] text-slate-400">أكثر خدمة مطلوبة</span>
          <div className="flex items-center gap-2 text-emerald-400">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-bold text-white">{mostDemandedService}</span>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[10px] text-slate-400">ميزة Follow-up</span>
          <div className="flex items-center gap-2 text-emerald-400">
            <Bell className="w-5 h-5" />
            <span className={`text-xs font-bold ${followUpEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
              {followUpEnabled ? 'مفعلة' : 'غير مفعلة'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">تم إرسال {followUpCount} رسالة متابعة</p>
        </div>
      </div>


      {/* Visual Chart and Live Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Performance Graph (2/3 columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                معدل الاستجابة والتحويل التلقائي للعملاء
              </h3>
              <p className="text-xs text-slate-400">
                مقارنة بين عدد الرسائل المستلمة والحجوزات الناجحة التي تمت بالكامل عبر الروبوت الذكي.
              </p>
            </div>
          </div>

          {/* Custom Beautiful SVG Graph to represent traffic */}
          <div className="relative h-64 w-full bg-slate-950/40 rounded-lg border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-4 left-4 flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-400 rounded-full" />
                الرسائل المستلمة (واتساب/انستجرام)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                المواعيد المحجوزة آلياً
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="w-full h-44 mt-6">
              <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                  </linearGradient>
                  <linearGradient id="bookedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeDasharray="3,3" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#1e293b" strokeDasharray="3,3" />

                {/* Received Line Fill */}
                <path d="M 0,130 Q 80,40 160,80 T 320,30 T 500,50 L 500,150 L 0,150 Z" fill="url(#receivedGrad)" />
                {/* Received Line */}
                <path d="M 0,130 Q 80,40 160,80 T 320,30 T 500,50" fill="none" stroke="#10b981" strokeWidth="3" />

                {/* Booked Line Fill */}
                <path d="M 0,145 Q 85,100 170,120 T 330,85 T 500,95 L 500,150 L 0,150 Z" fill="url(#bookedGrad)" />
                {/* Booked Line */}
                <path d="M 0,145 Q 85,100 170,120 T 330,85 T 500,95" fill="none" stroke="#3b82f6" strokeWidth="3" />

                {/* Dots */}
                <circle cx="160" cy="80" r="4" fill="#10b981" />
                <circle cx="320" cy="30" r="4" fill="#10b981" />
                <circle cx="500" cy="50" r="4" fill="#10b981" />

                <circle cx="170" cy="120" r="4" fill="#3b82f6" />
                <circle cx="330" cy="85" r="4" fill="#3b82f6" />
                <circle cx="500" cy="95" r="4" fill="#3b82f6" />
              </svg>
            </div>

            {/* Days axis labels */}
            <div className="flex justify-between text-slate-500 text-[10px] px-2 font-mono" dir="ltr">
              <span>Sat</span>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Live Webhook Log Feed (1/3 columns) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 flex flex-col h-[352px]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              نشاط الـ Webhooks المباشر
            </h3>
            <button 
              onClick={() => onNavigate('integration')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              عرض الربط البرمجي
            </button>
          </div>

          {/* Logs scrollable container */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {webhookLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-10">
                <Activity className="w-8 h-8 opacity-40 mb-2" />
                <span className="text-xs">لا يوجد نشاط مسجل بعد</span>
              </div>
            ) : (
              webhookLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="p-2.5 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg text-xs space-y-1 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.direction === 'incoming' 
                        ? 'bg-blue-950 text-blue-300 border border-blue-800' 
                        : log.direction === 'outgoing' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {log.direction === 'incoming' ? 'وارد' : log.direction === 'outgoing' ? 'صادر' : 'نظام'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-200 line-clamp-1">{log.event}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    قناة: {log.channel === 'whatsapp' ? 'واتساب' : log.channel === 'instagram' ? 'إنستجرام' : 'التحقق'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Integration Business Cards Quick Links - Only visible to owners */}
      {user?.role === 'owner' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-white">العملاء النشطون حالياً على قنوات وكالتك</h3>
            
            <button 
              onClick={() => onNavigate('pricing')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-900 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>عرض خطط الأسعار والاشتراكات &larr;</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 hover:border-blue-900/40 p-5 rounded-xl flex items-start gap-4 transition-all">
              <div className="p-3 bg-blue-950 text-blue-400 rounded-xl border border-blue-900">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">العيادة المتميزة للأسنان</h4>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-900 px-1.5 py-0.5 rounded-full font-bold">نشط</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">أتمتة الحجوزات الطبية وجدولة المواعيد للأسنان مع التوجيه السلس.</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-850/40">
                  <button onClick={() => onNavigate('agents')} className="text-xs text-blue-400 font-bold hover:underline cursor-pointer">
                    تعديل الوكيل &larr;
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">الباقة: متقدمة</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 hover:border-emerald-900/40 p-5 rounded-xl flex items-start gap-4 transition-all">
              <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-900">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">مطعم لقمة وهيل</h4>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-900 px-1.5 py-0.5 rounded-full font-bold">نشط</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">الرد الفوري بالمنيو الشعبي وحجز طاولات الأفراد والعائلات وحساب التوصيل.</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-850/40">
                  <button onClick={() => onNavigate('agents')} className="text-xs text-emerald-400 font-bold hover:underline cursor-pointer">
                    تعديل الوكيل &larr;
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">الباقة: تجريبية</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 hover:border-purple-900/40 p-5 rounded-xl flex items-start gap-4 transition-all">
              <div className="p-3 bg-purple-950 text-purple-400 rounded-xl border border-purple-900">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">مقهى رواق وسكينة</h4>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-900 px-1.5 py-0.5 rounded-full font-bold">نشط</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">حجز غرف الاجتماعات وجلسات العمل والدراسة الهادئة، وبيع بوكسات القهوة.</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-850/40">
                  <button onClick={() => onNavigate('agents')} className="text-xs text-purple-400 font-bold hover:underline cursor-pointer">
                    تعديل الوكيل &larr;
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">الباقة: شاملة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
