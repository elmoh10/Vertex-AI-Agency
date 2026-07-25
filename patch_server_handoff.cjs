const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'Otherwise, classify it as "FAQ" or "OTHER" and answer appropriately.',
  'If the customer explicitly requests to speak with a human agent, or if there is an absolute necessity where the AI cannot fulfill the request, classify it as "HUMAN_HANDOFF".\nOtherwise, classify it as "FAQ" or "OTHER" and answer appropriately.'
);

code = code.replace(
  'description: "Type of action: BOOKING, COMPLAINT, FAQ, or OTHER."',
  'description: "Type of action: BOOKING, COMPLAINT, HUMAN_HANDOFF, FAQ, or OTHER."'
);

const actionHandlingOld = `      if (parsedResult.actionType === "BOOKING") {
        const details = parsedResult.bookingDetails || {};
        bookingCreated = {`;
const actionHandlingNew = `      if (parsedResult.actionType === "HUMAN_HANDOFF") {
        actionDetailsText = "تم تحويل المحادثة إلى موظف بشري بناءً على طلب العميل أو للضرورة.";
      } else if (parsedResult.actionType === "BOOKING") {
        const details = parsedResult.bookingDetails || {};
        bookingCreated = {`;

code = code.replace(actionHandlingOld, actionHandlingNew);

fs.writeFileSync('server.ts', code);
