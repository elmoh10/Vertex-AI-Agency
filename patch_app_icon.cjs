const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /User\n} from 'lucide-react';/,
  "User,\n  Users\n} from 'lucide-react';"
);

fs.writeFileSync('src/App.tsx', code);
