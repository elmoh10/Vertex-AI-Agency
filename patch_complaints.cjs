const fs = require('fs');
let code = fs.readFileSync('src/components/ComplaintsDesk.tsx', 'utf8');

if (!code.includes('chatMessages?: any[];')) {
  code = code.replace(
    /interface ComplaintsDeskProps \{/,
    "interface ComplaintsDeskProps {\n  chatMessages?: any[];"
  );
  
  code = code.replace(
    /export default function ComplaintsDesk\(\{ \n  complaints, \n  businesses, \n  onManageComplaint,\n  currentUser\n\}: ComplaintsDeskProps\) \{/,
    "export default function ComplaintsDesk({ \n  complaints, \n  businesses, \n  chatMessages = [], \n  onManageComplaint,\n  currentUser\n}: ComplaintsDeskProps) {"
  );
  
  code = code.replace(
    /export default function ComplaintsDesk\(\{ complaints, businesses, onManageComplaint, currentUser \}: ComplaintsDeskProps\) \{/,
    "export default function ComplaintsDesk({ complaints, businesses, chatMessages = [], onManageComplaint, currentUser }: ComplaintsDeskProps) {"
  );
  
  fs.writeFileSync('src/components/ComplaintsDesk.tsx', code);
}
