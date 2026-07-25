const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const processAgentFunc = `
async function processAgentInteraction(biz, message, channel, senderName, senderPhone) {
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
    let bookingCreated = null;
    let complaintCreated = null;

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
          sentiment: details.sentiment || "negative",
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

  } catch (error) {
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

// Replace simulate-chat
const simulateChatRegex = /app\.post\("\/api\/simulate-chat", async \(req, res\) => \{[\s\S]*?(?=app\.get\("\/api\/activation-codes")/;

const newSimulateChat = `app.post("/api/simulate-chat", async (req, res) => {
  const { businessId, message, channel, senderName, senderPhone } = req.body;
  const biz = businesses.find(b => b.id === businessId);
  if (!biz) {
    return res.status(404).json({ error: "العمل المحدد غير متوفر" });
  }

  const incomingPayload = {
    object: channel === "whatsapp" ? "whatsapp_business_account" : "instagram_account",
    entry: [
      {
        id: "entry_id_123",
        time: Math.floor(Date.now() / 1000),
        messaging: [
          {
            sender: { id: senderPhone || "simulated_user_id" },
            recipient: { id: "agency_account_id" },
            timestamp: Date.now(),
            message: {
              mid: "mid." + Math.random().toString(36).substring(2, 12),
              text: message,
              profile: { name: senderName || "عميل تجريبي" }
            }
          }
        ]
      }
    ]
  };

  logWebhook("incoming", channel, \`مستلم عبر \${channel === 'whatsapp' ? 'واتساب' : 'إنستجرام'}: "\${message}"\`, incomingPayload, biz.id, "success");

  const result = await processAgentInteraction(biz, message, channel, senderName, senderPhone);

  const outgoingPayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: senderPhone || "simulated_user_id",
    type: "text",
    text: { body: result.responseText },
    metadata: {
      processed_by: "Vertex_AI_Agency_v3.5",
      latency_ms: 450,
      action_triggered: result.actionDetected ? result.actionType : "NONE"
    }
  };

  logWebhook("outgoing", channel, \`رد ملقى عبر \${channel === 'whatsapp' ? 'واتساب' : 'إنستجرام'}\`, outgoingPayload, biz.id, "success");

  res.json(result);
});

`;

code = code.replace(simulateChatRegex, newSimulateChat);

const webhookRegex = /app\.post\("\/api\/webhooks\/whatsapp", \(req, res\) => \{[\s\S]*?res\.status\(200\)\.send\("EVENT_RECEIVED"\);\n\}\);/;

const newWebhook = `app.post("/api/webhooks/whatsapp", async (req, res) => {
  const body = req.body;
  logWebhook("incoming", "whatsapp", "طلب ويبهوك حقيقي مستلم من Meta Cloud API", body);
  res.status(200).send("EVENT_RECEIVED");

  try {
    if (body.object === "whatsapp_business_account" && body.entry) {
      for (const entry of body.entry) {
        for (const change of entry.changes || []) {
          if (change.value && change.value.messages) {
            const metadata = change.value.metadata;
            const messages = change.value.messages;
            const contacts = change.value.contacts;

            for (const message of messages) {
              if (message.type === "text") {
                const text = message.text.body;
                const senderPhone = message.from;
                const senderName = contacts && contacts[0] ? contacts[0].profile.name : "عميل";
                const phoneNumberId = metadata?.phone_number_id;

                const biz = businesses.find(b => b.whatsappSenderNumber === phoneNumberId) || businesses[0];
                if (!biz) continue;

                const result = await processAgentInteraction(biz, text, "whatsapp", senderName, senderPhone);

                if (process.env.META_ACCESS_TOKEN && phoneNumberId) {
                  await fetch(\`https://graph.facebook.com/v17.0/\${phoneNumberId}/messages\`, {
                    method: 'POST',
                    headers: {
                      'Authorization': \`Bearer \${process.env.META_ACCESS_TOKEN}\`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      messaging_product: 'whatsapp',
                      to: senderPhone,
                      type: 'text',
                      text: { body: result.responseText }
                    })
                  });
                  logWebhook("outgoing", "whatsapp", \`تم إرسال رد تلقائي إلى \${senderPhone}\`, { responseText: result.responseText }, biz.id, "success");
                } else {
                  logWebhook("system", "whatsapp", "تم معالجة الرسالة ولكن META_ACCESS_TOKEN غير متوفر لإرسال الرد الحقيقي", result, biz.id, "success");
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing real webhook:", error);
    logWebhook("system", "whatsapp", "خطأ أثناء معالجة الويبهوك الحقيقي", { error: String(error) }, null, "failed");
  }
});
`;

code = code.replace(webhookRegex, newWebhook);

// Insert processAgentFunc right before newSimulateChat
code = code.replace('app.post("/api/simulate-chat"', processAgentFunc + '\napp.post("/api/simulate-chat"');

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts");
