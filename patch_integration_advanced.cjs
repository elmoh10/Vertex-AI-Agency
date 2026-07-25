const fs = require('fs');
let code = fs.readFileSync('src/components/IntegrationHub.tsx', 'utf8');

if (!code.includes("'advanced'")) {
  code = code.replace(
    /useState<'webhooks' \| 'workflows' \| 'meta_api'>/,
    "useState<'webhooks' | 'workflows' | 'meta_api' | 'advanced'>"
  );
  
  const iconImport = "import { Code2, Workflow, Link2, Copy, CheckCircle2, RefreshCw, Zap, Server, Settings";
  code = code.replace(
    /import \{ Code2, Workflow, Link2, Copy, CheckCircle2, RefreshCw, Zap, Server, Settings/,
    "import { Code2, Workflow, Link2, Copy, CheckCircle2, RefreshCw, Zap, Server, Settings, Terminal, Activity"
  );
  
  const tabButtonSearch = `        <button
          onClick={() => setActiveTab('meta_api')}
          className={\`pb-3 text-sm font-bold transition-colors flex items-center gap-2 \${
            activeTab === 'meta_api' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'
          }\`}
        >
          <Settings className="w-4 h-4" />
          إعدادات Meta API
        </button>
      </div>`;
      
  const tabButtonNew = `        <button
          onClick={() => setActiveTab('meta_api')}
          className={\`pb-3 text-sm font-bold transition-colors flex items-center gap-2 \${
            activeTab === 'meta_api' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-slate-200'
          }\`}
        >
          <Settings className="w-4 h-4" />
          إعدادات Meta API
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={\`pb-3 text-sm font-bold transition-colors flex items-center gap-2 \${
            activeTab === 'advanced' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-slate-400 hover:text-slate-200'
          }\`}
        >
          <Terminal className="w-4 h-4" />
          إعدادات متقدمة
        </button>
      </div>`;
      
  code = code.replace(tabButtonSearch, tabButtonNew);
  
  fs.writeFileSync('src/components/IntegrationHub.tsx', code);
}
