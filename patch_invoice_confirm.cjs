const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    if (action === "confirm") bookings[index].status = "confirmed";`;
    
const replacement = `    if (action === "confirm") {
      bookings[index].status = "confirmed";
      const biz = businesses.find(b => b.id === bookings[index].businessId);
      
      let message = \`تم تأكيد حجزك بنجاح يا \${bookings[index].customerName} في \${biz?.name || 'منشأتنا'}.\`;
      if (biz && biz.generateInvoiceEnabled) {
        message += \`\\n\\n=== فاتورة إلكترونية ===\\nرقم الحجز: \${bookings[index].id}\\nالخدمة: \${bookings[index].service}\\nالعميل: \${bookings[index].customerName}\\nالتاريخ: \${bookings[index].date}\\nالوقت: \${bookings[index].time}\\nالقيمة الإجمالية: (تُحدد من قبل المركز)\\n====================\`;
      }
      
      logWebhook("outgoing", "whatsapp", \`إرسال تأكيد الحجز (وفاتورة) للعميل: \${bookings[index].customerName}\`, { 
        bookingId: id,
        customerPhone: bookings[index].customerPhone,
        message: message 
      }, bookings[index].businessId, "success");
      
      chatMessages.push({
        id: "msg_" + Math.random().toString(36).substr(2, 9),
        businessId: bookings[index].businessId,
        customerPhone: bookings[index].customerPhone,
        sender: "system",
        text: message,
        timestamp: new Date().toISOString()
      });
    }`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
