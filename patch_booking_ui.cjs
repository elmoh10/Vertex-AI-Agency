const fs = require('fs');
let code = fs.readFileSync('src/components/BookingsManager.tsx', 'utf8');

const target = `<button
                      onClick={() => onManageBooking(b.id, 'remind')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      إرسال تذكير
                    </button>`;

const replacement = `<button
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
                    </button>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/BookingsManager.tsx', code);
