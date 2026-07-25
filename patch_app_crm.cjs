const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
if (!code.includes('import CRMManager')) {
  code = code.replace(
    /import UserProfile from '\.\/components\/UserProfile';/,
    "import UserProfile from './components/UserProfile';\nimport CRMManager from './components/CRMManager';"
  );
}

// 2. Add state
if (!code.includes('const [customers, setCustomers] = useState')) {
  code = code.replace(
    /const \[complaints, setComplaints\] = useState<Complaint\[\]>\(\[\]\);/,
    "const [complaints, setComplaints] = useState<Complaint[]>([]);\n  const [customers, setCustomers] = useState<any[]>([]);"
  );
}

// 3. Add to fetchState
if (!code.includes('setCustomers(data.customers || []);')) {
  code = code.replace(
    /setComplaints\(data\.complaints \|\| \[\]\);/,
    "setComplaints(data.complaints || []);\n        setCustomers(data.customers || []);"
  );
}

// 4. Add to navItems
if (!code.includes("id: 'crm'")) {
  const crmNavItem = `
  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'crm', label: 'العملاء (CRM)', icon: Users },
    { id: 'config', label: 'إعدادات المنشآت', icon: Settings },`;
  
  code = code.replace(
    /const navItems = \[\n\s*\{ id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard \},\n\s*\{ id: 'config', label: 'إعدادات المنشآت', icon: Settings \},/,
    crmNavItem
  );
}

// 5. Add to renderContent
if (!code.includes("case 'crm':")) {
  const renderCrm = `
      case 'crm':
        return <CRMManager customers={customers} businesses={businesses} userRole={user?.role} />;
      case 'config':`;
  
  code = code.replace(
    /case 'config':/,
    renderCrm
  );
}

fs.writeFileSync('src/App.tsx', code);
