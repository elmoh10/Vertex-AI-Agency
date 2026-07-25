const fs = require('fs');
let code = fs.readFileSync('src/components/BookingsManager.tsx', 'utf8');

code = code.replace(
  /          \}\)\}\n        <\/div>\n      \)\}\n    <\/div>\n  \);\n\}/,
  "          ))}\n        </div>\n      )}\n      </div>\n      )}\n    </div>\n  );\n}"
);

fs.writeFileSync('src/components/BookingsManager.tsx', code);
