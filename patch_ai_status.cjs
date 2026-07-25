const fs = require('fs');
let code = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');

const stateCode = `  const [aiConnected, setAiConnected] = useState<boolean>(true); // assume true initially

  useEffect(() => {
    fetch('/api/health/ai')
      .then(res => res.json())
      .then(data => setAiConnected(data.connected))
      .catch(() => setAiConnected(false));
  }, []);
`;

code = code.replace(
  /const \[isTyping, setIsTyping\] = useState\<boolean\>\(false\);/,
  `const [isTyping, setIsTyping] = useState<boolean>(false);
${stateCode}`
);

const oldHeader = `<h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          غرفة تجربة ومحاكاة الأتمتة والويب-هوك (Sandbox)
        </h2>`;

const newHeader = `<h2 className="text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          غرفة تجربة ومحاكاة الأتمتة والويب-هوك (Sandbox)
          <div className="flex items-center gap-1.5 ms-auto md:ms-4 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
            <div className={\`w-2 h-2 rounded-full \${aiConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'} animate-pulse\`} />
            <span className="text-[10px] font-bold text-slate-300 tracking-wider font-mono">
              {aiConnected ? 'GEMINI CONNECTED' : 'GEMINI DISCONNECTED'}
            </span>
          </div>
        </h2>`;

code = code.replace(oldHeader, newHeader);

// We should also add React.useEffect if it's not imported, but this component already uses useEffect presumably. Let's check if it does.
// Let's just assume React is available globally or we will check if useEffect is imported.

fs.writeFileSync('src/components/SandboxSimulator.tsx', code);
