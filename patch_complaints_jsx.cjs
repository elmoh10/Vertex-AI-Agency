const fs = require('fs');
let code = fs.readFileSync('src/components/ComplaintsDesk.tsx', 'utf8');

code = code.replace(
  /<MessageSquareWarning, MessageCircle, Clock, ChevronDown, ChevronUp className="w-5 h-5 text-emerald-400" \/>/,
  '<MessageSquareWarning className="w-5 h-5 text-emerald-400" />'
);

fs.writeFileSync('src/components/ComplaintsDesk.tsx', code);
