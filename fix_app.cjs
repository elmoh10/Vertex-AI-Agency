const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [showTour, setShowTour] = useState(false);')) {
  code = code.replace(
    /const \[user, setUser\] = useState<\{ role: 'owner' \| 'supervisor'; businessId\?: string; name: string \} \| null>\(null\);/,
    "const [user, setUser] = useState<{ role: 'owner' | 'supervisor'; businessId?: string; name: string } | null>(null);\n  const [showTour, setShowTour] = useState(false);"
  );
}

fs.writeFileSync('src/App.tsx', code);
