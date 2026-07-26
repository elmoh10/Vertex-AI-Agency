const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      } else if (parsedResult.actionType === "BOOKING") {
        const details = parsedResult.bookingDetails || {};
        bookingCreated = {`;
        
const replacement = `      } else if (parsedResult.actionType === "BOOKING") {
        const details = parsedResult.bookingDetails || {};
        
        // Double check for conflicts
        const isConflict = bookings.some(b => 
          b.businessId === biz.id && 
          (b.status === 'confirmed' || b.status === 'pending') && 
          b.date === details.date && 
          b.time === details.time
        );
        
        if (isConflict) {
          // Force it to a message refusing the booking
          parsedResult.responseText = \`عذراً يا \${details.customerName || senderName}، الموعد المطلوب (\${details.date} الساعة \${details.time}) محجوز مسبقاً. هل يناسبك موعد آخر؟\`;
          parsedResult.actionType = "OTHER";
          parsedResult.actionDetected = false;
        } else {
          bookingCreated = {`;
          
code = code.replace(target, replacement);

const target2 = `        bookings.push(bookingCreated);
        customers[customerIndex].totalBookings += 1;
        
        actionDetailsText = \`تم تسجيل حجز جديد باسم \${bookingCreated.customerName} لخدمة \${bookingCreated.service} بتاريخ \${bookingCreated.date} الساعة \${bookingCreated.time}.\`;`;

const replacement2 = `        bookings.push(bookingCreated);
        customers[customerIndex].totalBookings += 1;
        
        actionDetailsText = \`تم تسجيل حجز جديد باسم \${bookingCreated.customerName} لخدمة \${bookingCreated.service} بتاريخ \${bookingCreated.date} الساعة \${bookingCreated.time}.\`;
        }`; // closing bracket for the else {
        
code = code.replace(target2, replacement2);

fs.writeFileSync('server.ts', code);
