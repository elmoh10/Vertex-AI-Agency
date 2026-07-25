const fs = require('fs');
let code = fs.readFileSync('src/components/ComplaintsDesk.tsx', 'utf8');

const searchTarget = `                    </div>
                  </div>
                </div>
              ))}
            </div>`;
            
const replaceNew = `                    </div>
                  </div>
                </div>
                {expandedChats[c.id] && (
                  <div className="p-5 border-t border-slate-850 bg-slate-950/50">
                    <h4 className="text-xs font-bold text-slate-300 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      السياق الكامل للمحادثة قبل وبعد تقديم الشكوى:
                    </h4>
                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                      {chatMessages?.filter(m => m.businessId === c.businessId && m.customerPhone === c.customerPhone).length === 0 ? (
                        <div className="text-center py-6 text-slate-500 text-xs italic">لا توجد محادثات مسجلة سابقة مع هذا العميل.</div>
                      ) : (
                        chatMessages?.filter(m => m.businessId === c.businessId && m.customerPhone === c.customerPhone).map(msg => (
                          <div key={msg.id} className={\`flex flex-col max-w-[85%] \${msg.sender === 'agent' || msg.sender === 'system' ? 'mr-auto' : 'ml-auto'}\`}>
                            <div className={\`p-3 rounded-xl text-xs leading-relaxed shadow-sm \${
                              msg.sender === 'agent' 
                                ? 'bg-slate-800 text-slate-200 rounded-tr-none border border-slate-700' 
                                : msg.sender === 'system'
                                ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-900/50 italic text-[11px] text-center w-full'
                                : 'bg-emerald-600 text-white rounded-tl-none'
                            }\`}>
                              {msg.text}
                            </div>
                            <span className={\`text-[9px] text-slate-500 mt-1 \${msg.sender === 'agent' || msg.sender === 'system' ? 'text-right' : 'text-left'}\`}>
                              {new Date(msg.timestamp).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                </div>
              ))}
            </div>`;

code = code.replace(searchTarget, replaceNew);
fs.writeFileSync('src/components/ComplaintsDesk.tsx', code);
