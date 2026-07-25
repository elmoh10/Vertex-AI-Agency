const fs = require('fs');
let code = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');

const regex = /\/\* Quick Replies Customizer \*\/[\s\S]*?(?=<\!-- Google Sheets Integration)/;
const replacement = `            {/* Smart Response Templates */}
            <div className="space-y-4 pt-4 border-t border-slate-800/80">
              <div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <MessageSquareCode className="w-4 h-4 text-emerald-400" />
                  قوالب ردود ذكية (Smart Response Templates)
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  قم بتعريف إجابات ثابتة ومباشرة للأسئلة المتكررة لعميلك، بحيث يلتزم بها الذكاء الاصطناعي عند توجيه السؤال له (مثل: ساعات العمل، الموقع الجغرافي).
                </p>
              </div>

              {/* Template Suggestions */}
              <div className="flex flex-wrap gap-2 mb-2">
                <button 
                  type="button"
                  onClick={() => {
                    setNewQuestion('ما هي ساعات العمل لديكم؟');
                    setNewAnswer('نعمل من الأحد للخميس من الساعة 9 صباحاً حتى 5 مساءً.');
                  }}
                  className="text-[10px] bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  + قالب ساعات العمل
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setNewQuestion('أين يقع مقركم؟ / ما هو عنوانكم؟');
                    setNewAnswer('يقع مقرنا الرئيسي في الرياض، حي العليا، شارع التحلية.');
                  }}
                  className="text-[10px] bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  + قالب العنوان والموقع
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setNewQuestion('هل تتوفر خدمة التوصيل؟');
                    setNewAnswer('نعم، نوفر خدمة التوصيل لجميع مناطق المملكة خلال 3-5 أيام عمل.');
                  }}
                  className="text-[10px] bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  + قالب خدمة التوصيل
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

            `;
code = code.replace(regex, replacement);
fs.writeFileSync('src/components/ClientConfigurator.tsx', code);
