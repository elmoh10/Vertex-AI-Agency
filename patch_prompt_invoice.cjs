const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /\$\{\(biz\.type === 'clinic' \|\| biz\.type === 'restaurant'\) && biz\.generateInvoiceEnabled/g,
  "${biz.generateInvoiceEnabled"
);

fs.writeFileSync('server.ts', code);
