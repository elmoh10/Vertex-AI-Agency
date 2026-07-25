const fs = require('fs');
let code = fs.readFileSync('src/components/BookingsManager.tsx', 'utf8');

// Header replacement
code = code.replace(
  /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">[\s\S]*?<\/div>\s*<\/div>/,
  `      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-400" />
            إدارة الحجوزات والمواعيد
          </h2>
          <p className="text-sm text-slate-400">
            تابع كافة حجوزات عملائك من جميع المنشآت مع إمكانية الفلترة والمتابعة وإرسال التذكيرات.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={\`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer \${viewMode === 'list' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'}\`}
          >
            القائمة
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={\`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer \${viewMode === 'calendar' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'}\`}
          >
            التقويم
          </button>
        </div>
      </div>`
);

// Add states
code = code.replace(
  /const \[searchQuery, setSearchQuery\] = useState<string>\(''\);/,
  "const [searchQuery, setSearchQuery] = useState<string>('');\n  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');\n  const [currentMonth, setCurrentMonth] = useState(new Date());\n  const [selectedDate, setSelectedDate] = useState<Date | null>(null);"
);

// We need to add Calendar UI
const renderCalendar = `
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = monthStart;
    const endDate = monthEnd;

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const startDayIndex = getDay(monthStart); // 0 (Sun) to 6 (Sat)
    
    // Arabic week days starting from Sunday
    const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            &larr; الشهر السابق
          </button>
          <h3 className="text-lg font-bold text-white">
            {format(currentMonth, 'MMMM yyyy', { locale: arSA })}
          </h3>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            الشهر التالي &rarr;
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-500 pb-2">
              {day}
            </div>
          ))}
          
          {/* Empty slots for first week */}
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={\`empty-\${i}\`} className="h-24 bg-slate-950/20 rounded-xl border border-slate-800/30"></div>
          ))}

          {/* Days */}
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayBookings = filteredBookings.filter(b => b.date === dateStr);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div 
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={\`h-24 rounded-xl border p-1.5 cursor-pointer transition-all flex flex-col gap-1 \${
                  isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }\`}
              >
                <div className="flex justify-between items-start">
                  <span className={\`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold \${
                    isToday(day) ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
                  }\`}>
                    {format(day, 'd')}
                  </span>
                  {dayBookings.length > 0 && (
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 rounded-full">
                      {dayBookings.length}
                    </span>
                  )}
                </div>
                
                {/* Dots for bookings */}
                <div className="flex-1 flex flex-col gap-1 mt-1 overflow-hidden">
                  {dayBookings.slice(0, 3).map((b, i) => (
                    <div 
                      key={i} 
                      className={\`w-full h-1.5 rounded-full \${
                        b.status === 'confirmed' ? 'bg-emerald-400' :
                        b.status === 'completed' ? 'bg-blue-400' :
                        b.status === 'cancelled' ? 'bg-rose-400' : 'bg-amber-400'
                      }\`}
                    />
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-[9px] text-slate-500 text-center font-bold">+{dayBookings.length - 3}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
`;

// Insert renderCalendar function right before the return statement of BookingsManager
code = code.replace(
  /return \(\s*<div className="space-y-6" dir="rtl">/,
  renderCalendar + "\n  return (\n    <div className=\"space-y-6\" dir=\"rtl\">"
);

// We need to change the rendering part
const renderLogic = `
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          {renderCalendar()}
          {/* Selected Date Bookings */}
          {selectedDate && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">
                حجوزات يوم {format(selectedDate, 'dd MMMM yyyy', { locale: arSA })}
              </h3>
              {filteredBookings.filter(b => b.date === format(selectedDate, 'yyyy-MM-dd')).length === 0 ? (
                 <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center flex flex-col items-center justify-center space-y-3">
                   <Calendar className="w-8 h-8 text-slate-700" />
                   <h4 className="font-bold text-slate-400">لا يوجد حجوزات في هذا اليوم</h4>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Reuse the list mapping logic */}
                  {filteredBookings.filter(b => b.date === format(selectedDate, 'yyyy-MM-dd')).map((b) => (
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
                          <span className={\`px-2 py-0.5 rounded text-[10px] font-bold \${
                            b.status === 'confirmed' 
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-900' 
                              : b.status === 'completed' 
                              ? 'bg-blue-950/60 text-blue-300 border border-blue-900' 
                              : b.status === 'cancelled'
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-900'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-900'
                          }\`}>
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
                              onClick={async () => {
                                const success = await onManageBooking(b.id, 'remind');
                                if (success) {
                                  alert('تم إرسال التذكير بنجاح عبر الواتساب');
                                }
                              }}
                              disabled={b.reminderSent}
                              className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 \${
                                b.reminderSent 
                                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                                  : "bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer active:scale-95"
                              }\`}
                            >
                              <Bell className="w-3.5 h-3.5" />
                              {b.reminderSent ? "تم التذكير" : "إرسال تذكير"}
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
          )}
        </div>
      )}
`;

code = code.replace(
  /\{\/\* Table & Cards List of Bookings \*\/\}/,
  "{/* Table & Cards List of Bookings */}\n" + renderLogic + "\n      {viewMode === 'list' && ("
);

// Close the `{viewMode === 'list' && (...` wrapper at the very bottom before closing div
code = code.replace(
  /        <\/div>\n      \)\}\n    <\/div>/,
  "        </div>\n      )}\n      )}\n    </div>"
);

fs.writeFileSync('src/components/BookingsManager.tsx', code);
