import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Phone, 
  FileText,
  PlusCircle,
  Building2,
  Sparkles,
  Bell
} from 'lucide-react';
import { Booking, BusinessConfig, Plan } from '../types';

interface BookingsManagerProps {
  bookings: Booking[];
  businesses: BusinessConfig[];
  plans: Plan[];
  onManageBooking: (id: string, action: 'confirm' | 'cancel' | 'complete' | 'create' | 'remind', updates?: any) => Promise<boolean>;
  currentUser?: { role: 'owner' | 'supervisor'; businessId?: string };
}

export default function BookingsManager({ 
  bookings, 
  businesses, 
  plans,
  onManageBooking,
  currentUser
}: BookingsManagerProps) {
  
  const activeBiz = businesses.find(b => b.id === currentUser?.businessId);
  const currentPlan = activeBiz ? plans.find(p => p.id === activeBiz.subscriptionPlan) : undefined;
  
  // Show automation warning if user is a supervisor and their plan hasAutomation: false
  const hasAutomation = currentUser?.role === 'owner' || (currentPlan && currentPlan.limits?.hasAutomation);
  const showAutomationWarning = currentUser?.role === 'supervisor' && !hasAutomation;
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBizId, setFilterBizId] = useState<string>('all');
  const [isAddingManual, setIsAddingManual] = useState<boolean>(false);

  // Manual booking form states
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newBizId, setNewBizId] = useState(businesses[0]?.id || '');
  const [newService, setNewService] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Find business names helper
  const getBizName = (id: string) => {
    return businesses.find(b => b.id === id)?.name || "عمل تجاري غير معروف";
  };

  // Filter and search bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesBiz = filterBizId === 'all' || b.businessId === filterBizId;
    const matchesSearch = 
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.customerPhone.includes(searchQuery);
    return matchesBiz && matchesSearch;
  });

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone || !newDate || !newTime) return;

    const currentSelectedBiz = businesses.find(b => b.id === newBizId);
    const serviceName = newService || currentSelectedBiz?.services[0] || "استفسار عام";

    const success = await onManageBooking("", "create", {
      businessId: newBizId,
      customerName: newCustName,
      customerPhone: newCustPhone,
      service: serviceName,
      date: newDate,
      time: newTime,
      notes: newNotes
    });

    if (success) {
      setIsAddingManual(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewNotes('');
      setNewDate('');
      setNewTime('');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            سجل وجدول المواعيد الآلية واليدوية
          </h2>
          <p className="text-xs text-slate-400">
            شاهد وتحكّم بجميع المواعيد التي تم جدولتها وتأكيدها تلقائياً بواسطة المساعد الذكي أو قم بإضافتها يدوياً.
          </p>
        </div>

        <button
          onClick={() => setIsAddingManual(!isAddingManual)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/15 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          {isAddingManual ? "إغلاق النموذج" : "إضافة موعد يدوي"}
        </button>
      </div>

      {showAutomationWarning && (
        <div className="bg-amber-950/20 border border-amber-900/40 rounded-2xl p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-right">
              <h4 className="text-sm font-black text-amber-400">الأتمتة الكاملة للحجوزات متوقفة</h4>
              <p className="text-[10px] text-slate-400">باقتك الحالية لا تدعم أتمتة الحجوزات. المساعد الذكي سيقوم فقط بجمع البيانات ولن يقوم بتأكيد الحجوزات تلقائياً.</p>
            </div>
          </div>
          <button className="bg-amber-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-lg whitespace-nowrap">
            الترقية لباقة أعلى
          </button>
        </div>
      )}

      {/* Add manual booking modal/form */}
      {isAddingManual && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-850 pb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            نموذج تسجيل موعد جديد يدوي بالكامل
          </h3>
          <form onSubmit={handleCreateManualBooking} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">اسم العميل</label>
              <input 
                type="text" 
                placeholder="مثال: عبدالرحمن القحطاني"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">رقم الهاتف</label>
              <input 
                type="text" 
                placeholder="مثال: 05XXXXXXXX"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 font-mono text-left"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">المنشأة المستهدفة</label>
              <select
                value={newBizId}
                onChange={(e) => {
                  setNewBizId(e.target.value);
                  setNewService('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">الخدمة المطلوبة</label>
              <select
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="">-- اختر من قائمة الخدمات --</option>
                {businesses.find(b => b.id === newBizId)?.services.map((svc, i) => (
                  <option key={i} value={svc}>{svc}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">تاريخ الحجز</label>
              <input 
                type="date" 
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 text-right"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">الوقت المحدد</label>
              <input 
                type="time" 
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500 text-right"
                required
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">ملاحظات الحجز الإضافية</label>
              <input 
                type="text" 
                placeholder="مثال: يفضل الجلوس بالخارج، يحتاج تبييض..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="md:col-span-3 pt-2 text-left">
              <button 
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer active:scale-95 transition-all"
              >
                تسجيل وحفظ الموعد
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and search bar controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            فلترة المنشأة:
          </span>
          <button
            onClick={() => setFilterBizId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
              filterBizId === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            الكل
          </button>
          {businesses.map(b => (
            <button
              key={b.id}
              onClick={() => setFilterBizId(b.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                filterBizId === b.id ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input 
            type="text"
            placeholder="ابحث باسم العميل أو جواله..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-200 outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute top-3 right-3.5" />
        </div>
      </div>

      {/* Table & Cards List of Bookings */}
      {filteredBookings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl text-center flex flex-col items-center justify-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-700 animate-pulse" />
          <h4 className="font-bold text-slate-300">لا يوجد مواعيد متطابقة</h4>
          <p className="text-xs text-slate-500 max-w-xs leading-normal">
            لم نجد أي مواعيد مجدولة حالياً تحت الفلترة المحددة. يمكنك تجربة المحاكاة وتسجيل حجز جديد لترتسم النتيجة هنا!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((b) => (
            <div 
              key={b.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header status */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {getBizName(b.businessId)}
                  </span>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    b.status === 'confirmed' 
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-900' 
                      : b.status === 'completed' 
                      ? 'bg-blue-950/60 text-blue-300 border border-blue-900' 
                      : b.status === 'cancelled'
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-900'
                      : 'bg-amber-950/60 text-amber-300 border border-amber-900'
                  }`}>
                    {b.status === 'confirmed' ? 'مؤكد' : b.status === 'completed' ? 'منجز' : b.status === 'cancelled' ? 'ملغي' : 'معلق آلي'}
                  </span>
                </div>

                {/* Patient / Client details */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                    {b.customerName}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {b.customerPhone}
                  </p>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>الخدمة: <strong>{b.service}</strong></span>
                  </p>
                </div>

                {/* Date & Time parameters */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="space-y-0.5 border-l border-slate-800">
                    <span className="text-[10px] text-slate-500 block">التاريخ المجدول</span>
                    <span className="font-bold text-slate-300 font-mono">{b.date}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 block">الوقت</span>
                    <span className="font-bold text-slate-300 font-mono">{b.time}</span>
                  </div>
                </div>

                {b.notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded border border-slate-850/50">
                    &bull; {b.notes}
                  </p>
                )}
              </div>

              {/* Booking Actions */}
              <div className="pt-3 border-t border-slate-850 flex gap-2 items-center justify-end">
                {b.status === 'pending' && (
                  <button
                    onClick={() => onManageBooking(b.id, 'confirm')}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تأكيد الموعد
                  </button>
                )}

                {b.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => onManageBooking(b.id, 'remind')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      إرسال تذكير
                    </button>
                    <button
                      onClick={() => onManageBooking(b.id, 'complete')}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      وضع كمنجز
                    </button>
                  </>
                )}

                {b.status !== 'cancelled' && b.status !== 'completed' && (
                  <button
                    onClick={() => onManageBooking(b.id, 'cancel')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 text-xs font-semibold rounded-lg cursor-pointer transition-all flex items-center gap-1 border border-slate-700"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    إلغاء الموعد
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
