const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const t1 = `    services: ["تنظيف الأسنان وتبييضها", "حشو وعلاج العصب", "تركيبات وتجميل الأسنان (ابتسامة هوليود)", "زراعة وتقويم الأسنان", "استشارة وفحص عام"],`;
const r1 = `    services: [{name: "تنظيف الأسنان وتبييضها", price: "200 SAR"}, {name: "حشو وعلاج العصب", price: "500 SAR"}, {name: "تركيبات وتجميل الأسنان (ابتسامة هوليود)", price: "1000 SAR"}, {name: "زراعة وتقويم الأسنان", price: "2000 SAR"}, {name: "استشارة وفحص عام", price: "50 SAR"}],`;

const t2 = `    services: ["حجز طاولة أفراد/عائلات", "استفسار عن منيو الأكلات والأسعار", "طلب توصيل خارجي", "تلقي الشكاوى والاقتراحات"],`;
const r2 = `    services: [{name: "حجز طاولة أفراد/عائلات", price: "100 SAR"}, {name: "استفسار عن منيو الأكلات والأسعار", price: ""}, {name: "طلب توصيل خارجي", price: "20 SAR"}, {name: "تلقي الشكاوى والاقتراحات", price: ""}],`;

const t3 = `    services: ["حجز ركن المذاكرة والعمل الهادئ", "طلب بوكسات القهوة المفلترة والحلويات", "حجز غرفة الاجتماعات الخاصة", "تسجيل الشكاوى الفنية والخدمية"],`;
const r3 = `    services: [{name: "حجز ركن المذاكرة والعمل الهادئ", price: "30 SAR/ساعة"}, {name: "طلب بوكسات القهوة المفلترة والحلويات", price: "150 SAR"}, {name: "حجز غرفة الاجتماعات الخاصة", price: "200 SAR/ساعة"}, {name: "تسجيل الشكاوى الفنية والخدمية", price: ""}],`;

const t4 = `    services: ["الخدمة الأساسية الأولى", "الخدمة الثانية"],`;
const r4 = `    services: [{name: "الخدمة الأساسية الأولى", price: ""}, {name: "الخدمة الثانية", price: ""}],`;

code = code.replace(t1, r1);
code = code.replace(t2, r2);
code = code.replace(t3, r3);
code = code.replace(t4, r4);

const t5 = `const { id, name, systemPrompt, welcomeMessage, services, workingHours, quickReplies, googleSheetsId, googleSheetsLinked, googleSheetsAccessToken, whatsappSenderNumber, instagramAccountId, instagramAccessToken, facebookPageId, facebookAccessToken, telegramBotToken, welcomeMessageEnabled, autoPilotEnabled, generateInvoiceEnabled, inventoryUrl, inventoryType } = req.body;`;
const r5 = `const { id, name, systemPrompt, welcomeMessage, services, workingHours, quickReplies, googleSheetsId, googleSheetsLinked, googleSheetsAccessToken, whatsappSenderNumber, instagramAccountId, instagramAccessToken, facebookPageId, facebookAccessToken, telegramBotToken, wasenderAccessToken, wasenderWebhookSecret, welcomeMessageEnabled, autoPilotEnabled, generateInvoiceEnabled, inventoryUrl, inventoryType } = req.body;`;

const t6 = `      facebookAccessToken: facebookAccessToken !== undefined ? facebookAccessToken : businesses[index].facebookAccessToken,`;
const r6 = `      facebookAccessToken: facebookAccessToken !== undefined ? facebookAccessToken : businesses[index].facebookAccessToken,
      wasenderAccessToken: wasenderAccessToken !== undefined ? wasenderAccessToken : businesses[index].wasenderAccessToken,
      wasenderWebhookSecret: wasenderWebhookSecret !== undefined ? wasenderWebhookSecret : businesses[index].wasenderWebhookSecret,`;

code = code.replace(t5, r5);
code = code.replace(t6, r6);

// Patch processAgentInteraction
const t7 = `- Services Available: \${biz.services.join(", ")}`;
const r7 = `- Services Available: \${biz.services.map(s => s.name + (s.price ? ' (' + s.price + ')' : '')).join(", ")}`;

code = code.replace(t7, r7);

const t8 = `          service: details.service || biz.services[0],`;
const r8 = `          service: details.service || (biz.services[0] ? biz.services[0].name : "غير محدد"),`;

code = code.replace(t8, r8);

fs.writeFileSync('server.ts', code);
