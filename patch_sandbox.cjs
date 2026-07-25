const fs = require('fs');
let code = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');

code = code.replace(
  /isActionTriggered: response.actionDetected,\n\s*actionDetails: response.actionDetailsText/,
  "isActionTriggered: response.actionDetected,\n        actionDetails: response.actionDetailsText,\n        actionType: response.actionType"
);

code = code.replace(
  /<CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" \/>/,
  "{msg.actionType === 'HUMAN_HANDOFF' ? <AlertTriangle className=\\\"w-3 h-3 text-amber-500 shrink-0\\\" /> : <CheckCircle className=\\\"w-3 h-3 text-emerald-400 shrink-0\\\" />}"
);

code = code.replace(
  /<div className="mt-2 pt-2 border-t border-emerald-900 text-\[10px\] text-emerald-400 font-semibold flex items-center gap-1 bg-slate-950\/40 px-2 py-1 rounded">/,
  "<div className={`mt-2 pt-2 border-t text-[10px] font-semibold flex items-center gap-1 bg-slate-950/40 px-2 py-1 rounded ${msg.actionType === 'HUMAN_HANDOFF' ? 'border-amber-900 text-amber-500' : 'border-emerald-900 text-emerald-400'}`}>"
);

fs.writeFileSync('src/components/SandboxSimulator.tsx', code);
