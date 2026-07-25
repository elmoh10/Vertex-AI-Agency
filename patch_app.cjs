const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import OnboardingTour')) {
  code = code.replace(
    /import UserProfile from '\.\/components\/UserProfile';/,
    "import UserProfile from './components/UserProfile';\nimport OnboardingTour from './components/OnboardingTour';"
  );
}

if (!code.includes('const [showTour, setShowTour] = useState(false);')) {
  code = code.replace(
    /const \[user, setUser\] = useState<any>\(null\);/,
    "const [user, setUser] = useState<any>(null);\n  const [showTour, setShowTour] = useState(false);"
  );
}

if (!code.includes('vertex_tour_seen')) {
  code = code.replace(
    /if \(user\) \{/,
    "if (user) {\n      if (!localStorage.getItem('vertex_tour_seen')) {\n        setShowTour(true);\n      }"
  );
}

if (!code.includes('<OnboardingTour')) {
  code = code.replace(
    /<\/div>\n    <\/div>\n  \);\n\}/,
    `      </div>\n      {showTour && (\n        <OnboardingTour \n          onComplete={() => {\n            setShowTour(false);\n            localStorage.setItem('vertex_tour_seen', 'true');\n          }} \n        />\n      )}\n    </div>\n  );\n}`
  );
}

fs.writeFileSync('src/App.tsx', code);
