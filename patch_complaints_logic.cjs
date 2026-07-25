const fs = require('fs');
let code = fs.readFileSync('src/components/ComplaintsDesk.tsx', 'utf8');

// 1. Add expandedChats state
if (!code.includes('const [expandedChats, setExpandedChats] = useState')) {
  code = code.replace(
    /const \[editingCategoryId, setEditingCategoryId\] = useState<string \| null>\(null\);/,
    "const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);\n  const [expandedChats, setExpandedChats] = useState<Record<string, boolean>>({});"
  );
}

// 2. Add icons import
code = code.replace(
  /MessageSquareWarning/g,
  "MessageSquareWarning, MessageCircle, Clock, ChevronDown, ChevronUp"
);

// 3. Insert toggle button in Col 2
const col2Target = `                  {/* Col 2: Text Description & Raw Log */}
                  <div className="lg:col-span-1 space-y-2">
                    <span className="text-xs text-slate-500 font-bold block">مضمون الشكوى المسجل:</span>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-200 leading-relaxed font-sans italic">
                      &ldquo;{c.summary}&rdquo;
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      رصدت في: {new Date(c.createdAt).toLocaleString('ar-SA')}
                    </span>
                  </div>`;
                  
const col2New = `                  {/* Col 2: Text Description & Raw Log */}
                  <div className="lg:col-span-1 space-y-2 flex flex-col justify-between h-full">
                    <div className="space-y-2">
                      <span className="text-xs text-slate-500 font-bold block">مضمون الشكوى المسجل:</span>
                      <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs text-slate-200 leading-relaxed font-sans italic">
                        &ldquo;{c.summary}&rdquo;
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        رصدت في: {new Date(c.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setExpandedChats(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                        className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-slate-300 text-[11px] font-bold rounded-lg transition-all"
                      >
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                          عرض سجل المحادثة الكامل
                        </span>
                        {expandedChats[c.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>`;
                  
code = code.replace(col2Target, col2New);

// 4. Append chat history block
const chatBlockTarget = `              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;

const chatBlockNew = `                </div>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;
                  
code = code.replace(/                <\/div>\s*\}\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/, chatBlockNew);

fs.writeFileSync('src/components/ComplaintsDesk.tsx', code);
