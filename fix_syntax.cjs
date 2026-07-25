const fs = require('fs');
let code = fs.readFileSync('src/components/BookingsManager.tsx', 'utf8');

const oldStr = `      <button className="bg-amber-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-lg whitespace-nowrap">
            الترقية لباقة أعلى
          </button>
        </div>
      )}`;

const newStr = `      {showAutomationWarning && (
        <div className="bg-amber-950/40 border border-amber-900/50 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              ميزة الأتمتة غير مفعلة
            </h4>
            <p className="text-xs text-amber-500/80">
              باقتك الحالية لا تدعم الرد الآلي وتأكيد المواعيد تلقائياً. المواعيد هنا ستكون للإدارة اليدوية فقط.
            </p>
          </div>
          <button className="bg-amber-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-lg whitespace-nowrap">
            الترقية لباقة أعلى
          </button>
        </div>
      )}`;

code = code.replace(oldStr, newStr);

fs.writeFileSync('src/components/BookingsManager.tsx', code);
