const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /else if \(action === "remind"\) \{\s*\/\/ Simulate sending a reminder\s*logWebhook\("system", "whatsapp", `تم إرسال رسالة تذكير للعميل: \$\{bookings\[index\]\.customerName\} بموعده`, \{ bookingId: id \}, bookings\[index\]\.businessId, "success"\);\s*return res\.json\(\{ success: true, booking: bookings\[index\], message: "تم إرسال التذكير بنجاح" \}\);\s*\}/,
  `else if (action === "remind") {
      bookings[index].reminderSent = true;
      logWebhook("system", "whatsapp", \`تم إرسال رسالة تذكير للعميل: \${bookings[index].customerName} بموعده\`, { bookingId: id }, bookings[index].businessId, "success");
      return res.json({ success: true, booking: bookings[index], message: "تم إرسال التذكير بنجاح" });
    }`
);

fs.writeFileSync('server.ts', code);
