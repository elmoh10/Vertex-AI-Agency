const fs = require('fs');
let code = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');

const stateInit = `  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('sandboxChatHistories');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('sandboxChatHistories', JSON.stringify(chatHistories));
  }, [chatHistories]);`;

code = code.replace(
  /const \[chatHistories, setChatHistories\] = useState\<Record\<string, ChatMessage\[\]\>\>\(\{\}\);/,
  stateInit
);

// clear history logic
const clearButtonHtml = `
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من مسح السجل والبدء من جديد؟')) {
                      setChatHistories(prev => ({ ...prev, [selectedBizId]: [] }));
                      setActiveLog(null);
                    }
                  }}
                  className="bg-slate-900/60 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 p-1.5 rounded-md transition-colors"
                  title="مسح السجل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className="text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-bold">
                  {channel === 'whatsapp' ? 'واتساب' : (channel === 'telegram' ? 'تليجرام' : 'إنستجرام')}
                </div>
              </div>
`;

code = code.replace(
  /<div className="text-\[10px\] bg-slate-800\/80 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-bold">[\s\S]*?<\/div>/,
  clearButtonHtml
);

fs.writeFileSync('src/components/SandboxSimulator.tsx', code);
