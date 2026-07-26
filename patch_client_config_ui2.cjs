const fs = require('fs');
let code = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');

const t1 = `{services.map((svc, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                  >
                    <span>{svc}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}`;

const r1 = `{services.map((svc, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                  >
                    <span>{svc.name} {svc.price ? \`(\${svc.price})\` : ''}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}`;

code = code.replace(t1, r1);

const t2 = `{services.map((svc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span>{svc}</span>
                    </div>
                  ))}`;
                  
const r2 = `{services.map((svc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span>{svc.name} {svc.price ? \`(\${svc.price})\` : ''}</span>
                    </div>
                  ))}`;
                  
code = code.replace(t2, r2);

const t3 = `<input 
                  type="text"
                  placeholder="مثال: حجز موعد كشف، تنظيف أسنان..."
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors"
                />`;

const r3 = `<input 
                  type="text"
                  placeholder="الخدمة (مثال: تنظيف أسنان)"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-[2] bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors"
                />
                <input 
                  type="text"
                  placeholder="السعر (مثال: 200 ريال)"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors"
                />`;
                
code = code.replace(t3, r3);

fs.writeFileSync('src/components/ClientConfigurator.tsx', code);
