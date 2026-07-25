const fs = require('fs');
let code = fs.readFileSync('src/components/ClientConfigurator.tsx', 'utf8');

code = code.replace(
  '<label className="text-[10px] font-bold text-slate-400">معرف صفحة فيسبوك</label>',
  '<label className="text-[10px] font-bold text-slate-400">معرف صفحة فيسبوك (اختياري)</label>'
);

code = code.replace(
  '<label className="text-[10px] font-bold text-slate-400">معرف حساب انستجرام</label>',
  '<label className="text-[10px] font-bold text-slate-400">معرف حساب انستجرام (اختياري)</label>'
);

fs.writeFileSync('src/components/ClientConfigurator.tsx', code);
