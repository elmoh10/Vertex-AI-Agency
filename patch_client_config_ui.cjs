const fs = require('fs');
let code = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');

const t1 = `              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="مثال: حجز موعد كشف، تنظيف أسنان..."
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors"
                />
                <button 
                  type="button"
                  onClick={handleAddService}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-3 rounded-xl transition-colors whitespace-nowrap"
                >
                  إضافة
                </button>
              </div>

              {/* Tag clouds */}
              <div className="flex flex-wrap gap-2 pt-2">
                {services.map((svc, idx) => (
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
                ))}
              </div>`;

const r1 = `              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="الخدمة (مثال: حشو العصب)"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-[2] bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors"
                />
                <input 
                  type="text"
                  placeholder="السعر (اختياري، مثلاً: 200 ريال)"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors"
                />
                <button 
                  type="button"
                  onClick={handleAddService}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-3 rounded-xl transition-colors whitespace-nowrap"
                >
                  إضافة
                </button>
              </div>

              {/* Tag clouds */}
              <div className="flex flex-wrap gap-2 pt-2">
                {services.map((svc, idx) => (
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
                ))}
              </div>`;

code = code.replace(t1, r1);
fs.writeFileSync('src/components/ClientConfigurator.tsx', code);
