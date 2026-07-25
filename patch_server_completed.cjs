const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const completeLogicTarget = `    else if (action === "complete") bookings[index].status = "completed";`;
const completeLogicNew = `    else if (action === "complete") {
      bookings[index].status = "completed";
      
      // إرسال رسالة شكر وتقييم للعميل
      const message = \`شكراً لزيارتك لـ \${businesses.find(b => b.id === bookings[index].businessId)?.name || 'منشأتنا'} يا \${bookings[index].customerName}. نتمنى أن تكون الخدمة قد نالت إعجابك! نرجو منك تقييم تجربتك عبر الرابط التالي لمساعدتنا على تحسين جودة خدماتنا.\`;
      
      logWebhook("outgoing", "whatsapp", \`إرسال رسالة شكر وتقييم للعميل: \${bookings[index].customerName}\`, { 
        bookingId: id,
        customerPhone: bookings[index].customerPhone,
        message: message 
      }, bookings[index].businessId, "success");
    }`;

code = code.replace(completeLogicTarget, completeLogicNew);
fs.writeFileSync('server.ts', code);
