const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    else if (action === "complete") {
      bookings[index].status = "completed";
      
      // إرسال رسالة شكر وتقييم للعميل
      const message = \`شكراً لزيارتك لـ \${businesses.find(b => b.id === bookings[index].businessId)?.name || 'منشأتنا'} يا \${bookings[index].customerName}. نتمنى أن تكون الخدمة قد نالت إعجابك! نرجو منك تقييم تجربتك عبر الرابط التالي لمساعدتنا على تحسين جودة خدماتنا.\`;
      
      logWebhook("outgoing", "whatsapp", \`إرسال رسالة شكر وتقييم للعميل: \${bookings[index].customerName}\`, { 
        bookingId: id,
        customerPhone: bookings[index].customerPhone,
        message: message 
      }, bookings[index].businessId, "success");
    }`;
    
const replacement = `    else if (action === "complete") {
      bookings[index].status = "completed";
      
      const biz = businesses.find(b => b.id === bookings[index].businessId);
      let message = \`شكراً لزيارتك لـ \${biz?.name || 'منشأتنا'} يا \${bookings[index].customerName}. نتمنى أن تكون الخدمة قد نالت إعجابك! نرجو منك تقييم تجربتك عبر الرابط التالي لمساعدتنا على تحسين جودة خدماتنا.\`;
      
      if (biz && biz.generateInvoiceEnabled) {
        message += \`\\n\\n=== فاتورة إلكترونية ===\\nرقم الحجز: \${bookings[index].id}\\nالخدمة: \${bookings[index].service}\\nالعميل: \${bookings[index].customerName}\\nالتاريخ: \${bookings[index].date}\\nالوقت: \${bookings[index].time}\\nالقيمة الإجمالية: (تُحدد من قبل المركز)\\n====================\`;
      }
      
      // Find the last channel used by this customer
      const customerMsgs = chatMessages.filter(m => m.businessId === bookings[index].businessId && m.customerPhone === bookings[index].customerPhone);
      let channel = "whatsapp"; // Default
      if (customerMsgs.length > 0) {
        // If we want to store channel in message, we might not have it yet. But we know it from webhook logs.
      }
      
      // Let's check webhook logs instead for the channel
      const customerLogs = webhookLogs.filter(l => l.businessId === bookings[index].businessId && l.payload && l.payload.customerPhone === bookings[index].customerPhone);
      if (customerLogs.length > 0) {
        channel = customerLogs[customerLogs.length - 1].channel || "whatsapp";
      }

      logWebhook("outgoing", channel, \`إرسال رسالة شكر وفاتورة للعميل: \${bookings[index].customerName}\`, { 
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

// Wait, the webhook channel is usually derived from the incoming message or default to whatsapp.
// To ensure we get the right channel, we can just broadcast the logWebhook using 'whatsapp' as a placeholder if we don't know, but we should try to extract it from chatMessages if we added a channel property. Did we add channel to ChatMessage? No.

fs.writeFileSync('server.ts', code);
