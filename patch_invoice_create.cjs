const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    // Simulate sending automatic reminder upon creation
    logWebhook("system", "whatsapp", \`تم إرسال رسالة تأكيد وتذكير تلقائي للعميل: \${newBooking.customerName}\`, { bookingId: newBooking.id }, newBooking.businessId, "success");`;
    
const replacement = `    // Simulate sending automatic reminder upon creation
    let confirmMsg = \`تم حجز موعدك بنجاح يا \${newBooking.customerName} في \${biz?.name || 'منشأتنا'}.\`;
    if (biz && biz.generateInvoiceEnabled) {
      confirmMsg += \`\\n\\n=== فاتورة إلكترونية ===\\nرقم الحجز: \${newBooking.id}\\nالخدمة: \${newBooking.service}\\nالعميل: \${newBooking.customerName}\\nالتاريخ: \${newBooking.date}\\nالوقت: \${newBooking.time}\\nالقيمة الإجمالية: (تُحدد من قبل المركز)\\n====================\`;
    }
    
    logWebhook("system", "whatsapp", \`تم إرسال رسالة تأكيد وفاتورة تلقائية للعميل: \${newBooking.customerName}\`, { bookingId: newBooking.id, message: confirmMsg }, newBooking.businessId, "success");
    
    chatMessages.push({
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      businessId: newBooking.businessId,
      customerPhone: newBooking.customerPhone,
      sender: "system",
      text: confirmMsg,
      timestamp: new Date().toISOString()
    });`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
