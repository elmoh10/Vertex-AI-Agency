const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const processAgentFunc = `
async function processAgentInteraction(biz: BusinessConfig, message: string, channel: string, senderName: string, senderPhone: string) {
  try {
    const systemPrompt = \`
You are the AI Automation Core for a customer service agency representing: "\${biz.name}".
Your task is to analyze the incoming message and produce an automated, highly-empathetic, and helpful response, as well as extract any business actions (such as reserving/booking an appointment or registering a customer complaint).

Business Configuration for \${biz.name}:
- Type: \${biz.type}
- Services Available: \${biz.services.join(", ")}
- Working Hours: \${biz.workingHours}
- Custom Identity Guidelines: \${biz.systemPrompt}
- Custom Static/Quick Replies (الردود الجاهزة الثابتة للأسئلة المتكررة):
\${biz.quickReplies && biz.quickReplies.length > 0 
  ? biz.quickReplies.map(qr => \`  * السؤال المتكرر: "\${qr.question}" -> الإجابة الثابتة: "\${qr.answer}"\`).join("\\n")
  : "  (لا توجد ردود جاهزة مخصصة حالياً.)"}

Current Date Context: The current local time is \${new Date().toLocaleDateString('ar-SA')} - \${new Date().toLocaleTimeString('ar-SA')}.

You must return a structured JSON response matching the required schema exactly.
If the incoming customer message matches or is conceptually identical/highly similar to one of the questions in the "Custom Static/Quick Replies" list above, you MUST prioritize and use its corresponding static answer EXACTLY as the 'responseText' (or use it as the primary core message).
If the customer wants to book a slot or service, detect it as "BOOKING", extract customer details, match the requested service with one from the lists if possible, parse the requested date (converting absolute expressions like "tomorrow" or "next Sunday" to appropriate format) and requested time.
If the customer expresses severe dissatisfaction, trouble, or files a formal feedback, classify it as "COMPLAINT", estimate the sentiment ("negative") and summarize it.
Otherwise, classify it as "FAQ" or "OTHER" and answer appropriately.
Keep your Arabic conversational response 'responseText' friendly, highly localized, and matching the style of \${biz.name}.
    \`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        responseText: { type: Type.STRING, description: "An elegant, polite response in Arabic representing the brand tone perfectly." },
        actionDetected: { type: Type.BOOLEAN, description: "True if the user requests booking an appointment or files a complaint." },
        actionType: { type: Type.STRING, description: "Type of action: BOOKING, COMPLAINT, FAQ, or OTHER." },
        bookingDetails: {
          type: Type.OBJECT,
          properties: {
            customerName: { type: Type.STRING },
            customerPhone: { type: Type.STRING },
            service: { type: Type.STRING },
            date: { type: Type.STRING },
            time: { type: Type.STRING },
            notes: { type: Type.STRING }
          }
        },
        complaintDetails: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            summary: { type: Type.STRING },
            sentiment: { type: Type.STRING }
          }
        }
      },
      required: ["responseText", "actionDetected", "actionType"]
    };

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const parsedResult = JSON.parse(aiResponse.text || "{}");

    let actionDetailsText = "";
    let bookingCreated: Booking | null = null;
    let complaintCreated: Complaint | null = null;

    if (parsedResult.actionDetected) {
      if (parsedResult.actionType === "BOOKING") {
        const details = parsedResult.bookingDetails || {};
        bookingCreated = {
          id: "b_" + Math.random().toString(36).substr(2, 9),
          businessId: biz.id,
          customerName: details.customerName || senderName || "عميل تجريبي",
          customerPhone: details.customerPhone || senderPhone || "0500000000",
          service: details.service || biz.services[0],
          date: details.date || new Date().toISOString().split('T')[0],
          time: details.time || "17:00",
          status: "pending",
          createdAt: new Date().toISOString(),
          notes: details.notes || ""
        };
        bookings.unshift(bookingCreated);
        actionDetailsText = \`📅 حجز ملقط تلقائياً: \${bookingCreated.service} بتاريخ \${bookingCreated.date} في تمام الساعة \${bookingCreated.time}\`;
        
        if (biz.googleSheetsLinked && biz.googleSheetsId && biz.googleSheetsAccessToken) {
          appendBookingToSheet(biz.googleSheetsAccessToken, biz.googleSheetsId, bookingCreated);
        }
      } else if (parsedResult.actionType === "COMPLAINT") {
        const details = parsedResult.complaintDetails || {};
        complaintCreated = {
          id: "c_" + Math.random().toString(36).substr(2, 9),
          businessId: biz.id,
          customerName: senderName || "عميل تجريبي",
          customerPhone: senderPhone || "0500000000",
          category: details.category || "عام",
          summary: details.summary || message,
          sentiment: (details.sentiment as 'positive'|'neutral'|'negative') || "negative",
          status: "open",
          createdAt: new Date().toISOString(),
          aiResponseDraft: parsedResult.responseText
        };
        complaints.unshift(complaintCreated);
        actionDetailsText = \`⚠️ شكوى مسجلة تلقائياً: \${complaintCreated.category} - بتحليل مشاعر (\${complaintCreated.sentiment === 'negative' ? 'غاضب/سلبي' : 'محايد'})\`;
        
        if (biz.googleSheetsLinked && biz.googleSheetsId && biz.googleSheetsAccessToken) {
          appendComplaintToSheet(biz.googleSheetsAccessToken, biz.googleSheetsId, complaintCreated);
        }
      }
    }

    if (biz.aiResponseCount !== undefined) {
      biz.aiResponseCount += 1;
    } else {
      biz.aiResponseCount = 1;
    }

    return {
      success: true,
      responseText: parsedResult.responseText,
      actionDetected: parsedResult.actionDetected,
      actionType: parsedResult.actionType,
      actionDetailsText,
      booking: bookingCreated,
      complaint: complaintCreated,
      fullAIResult: parsedResult
    };

  } catch (error: any) {
    console.error("Gemini API Error in processing:", error);
    const fallbackResponse = \`أهلاً بك يا أستاذ \${senderName || 'الغالي'}. شكراً لتواصلك مع \${biz.name}. نرجو الانتظار لحظة ريثما يقوم أحد موظفينا بالرد عليك أو يمكنك المحاولة لاحقاً.\`;
    return {
      success: false,
      responseText: fallbackResponse,
      actionDetected: false,
      actionType: "OTHER",
      actionDetailsText: "فشل الاتصال بموديل الذكاء الاصطناعي",
      fullAIResult: { error: String(error.stack || error.message || error) }
    };
  }
}
`;

// Now let's find simulate-chat and replace its inside, and also add webhook post.
// Because it's complex, I'll just append it to the file and rewrite the webhook parts manually.

