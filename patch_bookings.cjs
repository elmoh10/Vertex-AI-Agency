const fs = require('fs');
let code = fs.readFileSync('src/components/BookingsManager.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(\) => onManageBooking\(b.id, 'complete'\)\}/g,
  `onClick={async () => {
                              const success = await onManageBooking(b.id, 'complete');
                              if (success) {
                                alert('تم إنهاء الموعد بنجاح، وجاري إرسال رسالة شكر وطلب تقييم للعميل آلياً.');
                              }
                            }}`
);

fs.writeFileSync('src/components/BookingsManager.tsx', code);
