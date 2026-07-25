import re

with open('src/components/PricingManager.tsx', 'r') as f:
    content = f.read()

# We want to find the exact start of the owner payment request list
# It starts around line 1011 (where we inserted it)
start_marker = "{/* Payment Requests for Owner */}"
calc_marker = "{/* Cost Calculator Section */}"

start_idx = content.find(start_marker)
end_idx = content.find(calc_marker)

if start_idx != -1 and end_idx != -1:
    print("Found sections.")
    
    # Wait, the problem is in between them. Let's see what is there now.
    snippet = content[start_idx:end_idx]
    
    # We will replace the entire block between start_marker and calc_marker with the correct code.
    correct_code = """{/* Payment Requests for Owner */}
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

            </div>
          )}
        </div>

        """
    
    new_content = content[:start_idx] + correct_code + content[end_idx:]
    with open('src/components/PricingManager.tsx', 'w') as f:
        f.write(new_content)
    print("Fixed file.")
else:
    print("Could not find markers.")
