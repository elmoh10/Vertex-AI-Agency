const fs = require('fs');
let code = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');

code = code.replace(
  /\{msg\.actionType === 'HUMAN_HANDOFF' \? <AlertTriangle className=\\"w-3 h-3 text-amber-500 shrink-0\\" \/> : <CheckCircle className=\\"w-3 h-3 text-emerald-400 shrink-0\\" \/>\}/,
  "{msg.actionType === 'HUMAN_HANDOFF' ? <AlertTriangle className=\"w-3 h-3 text-amber-500 shrink-0\" /> : <CheckCircle className=\"w-3 h-3 text-emerald-400 shrink-0\" />}"
);

fs.writeFileSync('src/components/SandboxSimulator.tsx', code);
