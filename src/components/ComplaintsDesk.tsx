import React, { useState } from 'react';
import { 
  MessageSquareWarning, 
  User, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Send, 
  Heart,
  Frown,
  Meh,
  Sparkles,
  Building2,
  AlertOctagon,
  Tag,
  Search,
  SlidersHorizontal,
  Edit2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Complaint, BusinessConfig } from '../types';

interface ComplaintsDeskProps {
  complaints: Complaint[];
  businesses: BusinessConfig[];
  onManageComplaint: (id: string, action: 'resolve' | 'review' | 'update', updates?: any) => Promise<boolean>;
  currentUser?: { role: 'owner' | 'supervisor'; businessId?: string };
}

const DEFAULT_CATEGORIES = [
  "تقني",
  "خدمة عملاء",
  "تأخير",
  "تأخير التوصيل",
  "معاملة الاستقبال",
  "جودة الخدمات",
  "الأسعار والدفع",
  "عام"
];

export default function ComplaintsDesk({ 
  complaints, 
  businesses, 
  onManageComplaint,
  currentUser
}: ComplaintsDeskProps) {
  
  const activeBiz = businesses.find(b => b.id === currentUser?.businessId);
  const isLocked = currentUser?.role === 'supervisor' && activeBiz?.subscriptionPlan !== 'enterprise';

  const [filterBizId, setFilterBizId] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [editedDraftText, setEditedDraftText] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-fade-in p-8 bg-slate-900/20 border border-slate-900 rounded-3xl" dir="rtl">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-10 animate-pulse" />
          <div className="relative w-20 h-20 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center shadow-2xl">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
        </div>
        <div className="max-w-md space-y-3">
          <h2 className="text-2xl font-black text-white">مكتب الشكاوى غير متوفر في باقتك الحالية</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            ميزة "مكتب الشكاوى الذكي" متوفرة حصرياً لعملاء <span className="text-amber-500 font-bold">الباقة الشاملة</span>. تتيح لك هذه الميزة رصد استياء العملاء تلقائياً وتحليل مشاعرهم وتقديم مسودات اعتذار فورية.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-6 py-3 flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block font-bold">الميزة المفقودة:</span>
              <span className="text-xs font-bold text-slate-200">التحليل الآلي لمشاعر العملاء ورضاهم</span>
            </div>
          </div>
        </div>
        <button className="mt-4 bg-amber-500 hover:bg-amber-600 text-slate-950 px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-lg shadow-amber-500/10 active:scale-95">
          ترقية الاشتراك للباقة الشاملة الآن
        </button>
      </div>
    );
  }

  const getBizName = (id: string) => {
    return businesses.find(b => b.id === id)?.name || "عمل تجاري غير معروف";
  };

  // Extract all unique categories present in actual complaints
  const activeCategories = Array.from(new Set(complaints.map(c => c.category || "عام")));
  
  // Combine defaults and active categories for filters, keeping unique values
  const allAvailableCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...activeCategories]));

  const filteredComplaints = complaints.filter(c => {
    const matchesBiz = filterBizId === 'all' || c.businessId === filterBizId;
    const matchesCategory = filterCategory === 'all' || (c.category || "عام") === filterCategory;
    const matchesSearch = 
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.customerPhone.includes(searchQuery) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBiz && matchesCategory && matchesSearch;
  });

  const handleStartEditDraft = (comp: Complaint) => {
    setEditingResponseId(comp.id);
    setEditedDraftText(comp.aiResponseDraft);
  };

  const handleSaveDraft = async (id: string) => {
    const success = await onManageComplaint(id, 'update', { aiResponseDraft: editedDraftText });
    if (success) {
      setEditingResponseId(null);
    }
  };

  const handleResolve = async (id: string) => {
    await onManageComplaint(id, 'resolve');
  };

  const handleUpdateCategory = async (id: string, newCategory: string) => {
    const success = await onManageComplaint(id, 'update', { category: newCategory });
    if (success) {
      setEditingCategoryId(null);
    }
  };

  // Helper colors for classification categories
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'تقني':
        return 'bg-blue-950/70 text-blue-300 border-blue-900';
      case 'تأخير':
      case 'تأخير التوصيل':
        return 'bg-amber-950/70 text-amber-300 border-amber-900';
      case 'خدمة عملاء':
      case 'معاملة الاستقبال':
        return 'bg-purple-950/70 text-purple-300 border-purple-900';
      case 'جودة الخدمات':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-900';
      case 'الأسعار والدفع':
        return 'bg-rose-950/70 text-rose-300 border-rose-900';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquareWarning className="w-5 h-5 text-emerald-400" />
          مكتب الشكاوى الذكي ورضا العملاء (Grievances Desk)
        </h2>
        <p className="text-xs text-slate-400">
          تلقى وتتبع الشكاوى التي يلتقطها الذكاء الاصطناعي من رسائل العملاء، واستعرض تحليل المشاعر وصيغ الاعتذار والتعويض المقترحة فورياً.
        </p>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Right Sidebar Filter (Takes 1 Column) */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Quick Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-slate-400 block flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              البحث الذكي في الشكاوى
            </span>
            <input 
              type="text"
              placeholder="ابحث بالاسم، الرقم، المضمون..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none transition-all"
            />
          </div>

          {/* Business filter side section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 block border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              الفرز حسب المنشأة
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setFilterBizId('all')}
                className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  filterBizId === 'all' 
                    ? 'bg-slate-800 text-white border border-slate-700' 
                    : 'text-slate-400 hover:bg-slate-950/50 hover:text-slate-200'
                }`}
              >
                <span>الكل</span>
                <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-500">{complaints.length}</span>
              </button>
              {businesses.map(b => {
                const count = complaints.filter(c => c.businessId === b.id).length;
                return (
                  <button
                    key={b.id}
                    onClick={() => setFilterBizId(b.id)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      filterBizId === b.id 
                        ? 'bg-slate-800 text-white border border-slate-700' 
                        : 'text-slate-400 hover:bg-slate-950/50 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-500">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories Filter side section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-slate-300 block border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
              تصنيف الشكاوى الآلي
            </span>
            <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto custom-scrollbar">
              <button
                onClick={() => setFilterCategory('all')}
                className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  filterCategory === 'all' 
                    ? 'bg-slate-800 text-white border border-slate-700' 
                    : 'text-slate-400 hover:bg-slate-950/50 hover:text-slate-200'
                }`}
              >
                <span>جميع التصنيفات</span>
                <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-500">{complaints.length}</span>
              </button>
              {allAvailableCategories.map(cat => {
                const count = complaints.filter(c => (c.category || "عام") === cat).length;
                if (count === 0 && !DEFAULT_CATEGORIES.includes(cat)) return null; // hide custom empty ones
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      filterCategory === cat 
                        ? 'bg-slate-800 text-white border border-slate-700' 
                        : 'text-slate-400 hover:bg-slate-950/50 hover:text-slate-200'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[10px] text-slate-500">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Complaints Main Panel (Takes 3 Columns) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Active filter statuses indicators */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <div>
              <span>الشكاوى المعروضة بناءً على الفرز: </span>
              <strong className="text-white font-mono">{filteredComplaints.length}</strong>
              <span> شكوى</span>
            </div>
            {(filterBizId !== 'all' || filterCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setFilterBizId('all');
                  setFilterCategory('all');
                  setSearchQuery('');
                }}
                className="text-emerald-400 hover:underline cursor-pointer text-[11px]"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>

          {/* Complaints List */}
          {filteredComplaints.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl text-center flex flex-col items-center justify-center space-y-3">
              <Heart className="w-12 h-12 text-slate-700 animate-pulse" />
              <h4 className="font-bold text-slate-300">لا توجد شكاوى متطابقة مع خيارات البحث</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-normal">
                كل شيء ممتاز! جرب تعديل الكلمات البحثية أو تحديد فلاتر تصفية أخرى.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((c) => (
                <div 
                  key={c.id}
                  className={`bg-slate-900 border transition-all rounded-xl p-5 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start ${
                    c.status === 'resolved' 
                      ? 'border-slate-800/80 opacity-75' 
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Col 1: Complaint Metadata & Sentiment */}
                  <div className="lg:col-span-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-1 rounded font-bold flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-emerald-400" />
                        {getBizName(c.businessId)}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'resolved' 
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-900' 
                          : c.status === 'reviewing' 
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-900' 
                          : 'bg-rose-950/60 text-rose-300 border border-rose-900'
                      }`}>
                        {c.status === 'resolved' ? 'محلولة ومغلقة' : c.status === 'reviewing' ? 'تحت المراجعة' : 'جديدة قيد الانتظار'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" />
                        {c.customerName}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {c.customerPhone}
                      </p>
                    </div>

                    {/* Sentiment Gauge */}
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-850/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 text-emerald-400" />
                          التصنيف الآلي:
                        </span>
                        
                        {editingCategoryId === c.id ? (
                          <select
                            value={c.category || "عام"}
                            onChange={(e) => handleUpdateCategory(c.id, e.target.value)}
                            className="bg-slate-900 border border-slate-750 text-slate-200 text-[11px] rounded px-1.5 py-0.5 outline-none cursor-pointer"
                          >
                            {allAvailableCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          <span 
                            onClick={() => setEditingCategoryId(c.id)}
                            className={`font-bold text-[10px] px-2 py-0.5 border rounded cursor-pointer flex items-center gap-1 hover:brightness-110 active:scale-95 transition-all ${getCategoryColor(c.category || "عام")}`}
                            title="انقر لتعديل التصنيف يدوياً"
                          >
                            {c.category || "عام"}
                            <Edit2 className="w-2.5 h-2.5 opacity-60" />
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">تحليل المشاعر التلقائي:</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.sentiment === 'negative' 
                          ? 'bg-rose-950 text-rose-300 border border-rose-900' 
                          : c.sentiment === 'neutral' 
                          ? 'bg-slate-850 text-slate-300' 
                          : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {c.sentiment === 'negative' ? (
                          <>
                            <Frown className="w-3 h-3 text-rose-400" />
                            غاضب / مستاء جداً
                          </>
                        ) : c.sentiment === 'neutral' ? (
                          <>
                            <Meh className="w-3 h-3 text-slate-400" />
                            محايد
                          </>
                        ) : (
                          <>
                            <Heart className="w-3 h-3 text-emerald-400" />
                            إيجابي
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Col 2: Text Description & Raw Log */}
                  <div className="lg:col-span-1 space-y-2">
                    <span className="text-xs text-slate-500 font-bold block">مضمون الشكوى المسجل:</span>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-200 leading-relaxed font-sans italic">
                      &ldquo;{c.summary}&rdquo;
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      رصدت في: {new Date(c.createdAt).toLocaleString('ar-SA')}
                    </span>
                  </div>

                  {/* Col 3: AI response automation draft preview */}
                  <div className="lg:col-span-1 space-y-3 bg-slate-950/60 p-4 border border-slate-850 rounded-xl flex flex-col justify-between h-full">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        مسودة رد الاعتذار والتعويض (AI Draft):
                      </span>
                      
                      {editingResponseId === c.id ? (
                        <textarea 
                          value={editedDraftText}
                          onChange={(e) => setEditedDraftText(e.target.value)}
                          rows={4}
                          className="w-full bg-slate-950 border border-emerald-500 rounded-lg p-2.5 text-xs text-slate-100 outline-none leading-relaxed resize-none"
                        />
                      ) : (
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          {c.aiResponseDraft}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-850 flex gap-2 items-center justify-end">
                      {c.status !== 'resolved' && (
                        <>
                          {editingResponseId === c.id ? (
                            <button
                              onClick={() => handleSaveDraft(c.id)}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-bold rounded-md cursor-pointer transition-all"
                            >
                              حفظ التعديل
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEditDraft(c)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-[11px] font-bold rounded-md cursor-pointer transition-all border border-slate-700"
                            >
                              تعديل الرد
                            </button>
                          )}

                          <button
                            onClick={() => handleResolve(c.id)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-bold rounded-md cursor-pointer active:scale-95 transition-all flex items-center gap-1 shadow-md shadow-emerald-500/10"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            حل المشكلة وإغلاق التذكرة
                          </button>
                        </>
                      )}

                      {c.status === 'resolved' && (
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          تم حلها وإرضاء العميل بنجاح
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
