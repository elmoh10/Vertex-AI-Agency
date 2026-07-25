const fs = require('fs');
let code = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');

const target = `    // Trigger mock incoming webhook visual
    const mockIncomingPayload = {
      object: channel === "whatsapp" ? "whatsapp_business_account" : "instagram_account",
      entry: [
        {
          id: "entry_meta_987",
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: "whatsapp",
                metadata: { display_phone_number: "16505551234", phone_id: "1098273" },
                contacts: [{ profile: { name: senderName }, wa_id: senderPhone }],
                messages: [
                  {
                    from: senderPhone,
                    id: "wamid.HBg...",
                    timestamp: Math.floor(Date.now() / 1000),
                    text: { body: userInput },
                    type: "text"
                  }
                ]
              }
            }
          ]
        }
      ]
    };`;

const replacement = `    // Trigger mock incoming webhook visual
    const mockIncomingPayload = {
      object: channel === "whatsapp" ? "whatsapp_business_account" : (channel === 'telegram' ? 'telegram_bot' : (channel === 'facebook' ? 'page' : 'instagram_account')),
      entry: [
        {
          id: "entry_meta_987",
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: "messages",
              value: {
                messaging_product: channel === 'whatsapp' ? 'whatsapp' : (channel === 'facebook' ? 'messenger' : channel),
                metadata: { display_phone_number: "16505551234", phone_id: "1098273" },
                contacts: [{ profile: { name: senderName }, wa_id: senderPhone }],
                messages: [
                  {
                    from: senderPhone,
                    id: "wamid.HBg...",
                    timestamp: Math.floor(Date.now() / 1000),
                    text: { body: userInput },
                    type: "text"
                  }
                ]
              }
            }
          ]
        }
      ]
    };`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/SandboxSimulator.tsx', code);
