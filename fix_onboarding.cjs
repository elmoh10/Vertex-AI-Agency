const fs = require('fs');
let code = fs.readFileSync('src/components/OnboardingTour.tsx', 'utf8');

code = code.replace(
  /className=\\{.*?\\}/g,
  match => match.replace(/\\`/g, '`')
);

// specifically fix the problematic lines
code = code.replace(
  /className={\\\`absolute inset-0 bg-gradient-to-br \\\${tourSteps\[step\].color} opacity-30 pointer-events-none\\\`}/,
  "className={`absolute inset-0 bg-gradient-to-br ${tourSteps[step].color} opacity-30 pointer-events-none`}"
);

code = code.replace(
  /className={\\\`h-1.5 rounded-full transition-all duration-300 \\\${idx === step \? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-700'}\\\`}/,
  "className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-700'}`}"
);

code = code.replace(
  /className={\\\`px-4 py-2 text-sm font-bold flex items-center gap-1 transition-colors \\\${step === 0 \? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'}\\\`}/,
  "className={`px-4 py-2 text-sm font-bold flex items-center gap-1 transition-colors ${step === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}"
);

fs.writeFileSync('src/components/OnboardingTour.tsx', code);
