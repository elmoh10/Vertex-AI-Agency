const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add state
if (!code.includes('const [chatMessages, setChatMessages] = useState')) {
  code = code.replace(
    /const \[customers, setCustomers\] = useState<any\[\]>\(\[\]\);/,
    "const [customers, setCustomers] = useState<any[]>([]);\n  const [chatMessages, setChatMessages] = useState<any[]>([]);"
  );
}

// 2. Add to fetchState
if (!code.includes('setChatMessages(data.chatMessages || []);')) {
  code = code.replace(
    /setCustomers\(data\.customers \|\| \[\]\);/,
    "setCustomers(data.customers || []);\n        setChatMessages(data.chatMessages || []);"
  );
}

// 3. Update ComplaintsDesk props
code = code.replace(
  /<ComplaintsDesk complaints=\{visibleComplaints\} businesses=\{businesses\} onManageComplaint=\{handleManageComplaint\} currentUser=\{user!\} \/>/,
  "<ComplaintsDesk complaints={visibleComplaints} businesses={businesses} chatMessages={chatMessages} onManageComplaint={handleManageComplaint} currentUser={user!} />"
);

fs.writeFileSync('src/App.tsx', code);
