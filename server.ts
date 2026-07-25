import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { google } from "googleapis";
import { BusinessConfig, Booking, Complaint, WebhookLog, ChatMessage, ActivationCode, Plan } from "./src/types.js";
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

dotenv.config();

// Lazy initialization for Firebase Admin
let db: Firestore | null = null;

function getDb(): Firestore {
  if (!db) {
    initializeApp({
      credential: applicationDefault(),
    });
    db = getFirestore();
  }
  return db;
}

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI SDK Server-Side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Mock/In-Memory database state
let businesses: BusinessConfig[] = [
  {
    id: "clinic_1",
    name: "العيادة المتميزة لطب الأسنان",
    type: "clinic",
    iconName: "Stethoscope",
    systemPrompt: "أنت المساعد الذكي لعيادة الأسنان المتميزة. هدفك مساعدة المرضى في حجز مواعيد، والإجابة عن تساؤلاتهم بلباقة وسرعة، وتسجيل شكاويهم إن وجدت. المواعيد المتاحة يومياً من 1 ظهراً وحتى 9 مساءً. حافظ على الردود مختصرة واحترافية وبلهجة ودية جداً، وقدم المساعدة الكاملة.",
    welcomeMessage: "مرحباً بك في العيادة المتميزة لطب الأسنان! كيف يمكن لمساعدنا الذكي خدمتك اليوم؟ يمكنك حجز موعد، الاستفسار عن الخدمات، أو رفع شكوى.",
    services: ["تنظيف الأسنان وتبييضها", "حشو وعلاج العصب", "تركيبات وتجميل الأسنان (ابتسامة هوليود)", "زراعة وتقويم الأسنان", "استشارة وفحص عام"],
    workingHours: "يومياً من 1:00 ظهراً حتى 9:00 مساءً (الجمعة مغلق)",
    phonePlaceholder: "05XXXXXXXX",
    subscriptionPlan: "growth",
    subscriptionStatus: "active",
    subscriptionExpiry: "2026-08-10",
    aiResponseCount: 342,
    aiResponseLimit: 1000,
    quickReplies: [
      { id: "qr_c1", question: "ما هي أسعار كشف الأسنان؟", answer: "سعر الكشف والاستشارة العامة هو 150 جنيهاً مصرياً، ويكون مجانياً بالكامل في حال البدء بالخطة العلاجية مباشرة." },
      { id: "qr_c2", question: "أين تقع عيادتكم؟", answer: "موقعنا الرئيسي في وسط البلد، شارع قصر العيني، أمام معهد السكر، الدور الرابع." }
    ]
  },
  {
    id: "restaurant_1",
    name: "مطعم لقمة وهيل الشعبي",
    type: "restaurant",
    iconName: "Utensils",
    systemPrompt: "أنت المساعد الذكي لمطعم لقمة وهيل الشعبي الفاخر. ترحب بالعملاء بأحر العبارات وتساعدهم في حجز طاولات للعشاء أو الغداء، وتوفير منيو الطعام، وتسجيل شكاوى الجودة أو خدمة التوصيل. المنيو المتوفر: كبسة لحم حاشي، برياني دجاج، جريش، مرقوق، كنافة نابلسية ومشروبات باردة/ساخنة. الحجز متاح من 12 ظهراً إلى 12 ليلاً.",
    welcomeMessage: "يا هلا والله بضيفنا الغالي في مطعم لقمة وهيل! 🍲 حاب تحجز طاولة لعائلتك الكريمة، أو تبي تستفسر عن المنيو والطلبات？ يسعدني مساعدتك!",
    services: ["حجز طاولة أفراد/عائلات", "استفسار عن منيو الأكلات والأسعار", "طلب توصيل خارجي", "تلقي الشكاوى والاقتراحات"],
    workingHours: "يومياً من 12:00 ظهراً حتى 12:00 منتصف الليل",
    phonePlaceholder: "05XXXXXXXX",
    subscriptionPlan: "trial",
    subscriptionStatus: "active",
    subscriptionExpiry: "2026-07-20",
    aiResponseCount: 142,
    aiResponseLimit: 150,
    quickReplies: [
      { id: "qr_r1", question: "هل يتوفر لديكم قسم عائلات بخصوصية؟", answer: "نعم بكل تأكيد! يتوفر لدينا في مطعم لقمة وهيل قسم خاص وعائلي مغلق بالكامل ومزود بسواتر لضمان أعلى مستويات الخصوصية والراحة لعائلتك الكريمة." },
      { id: "qr_r2", question: "هل اللحوم المستخدمة طازجة؟", answer: "جميع لحومنا بلدية طازجة 100% نختارها بعناية فائقة يومياً ونقوم بطهيها على الطريقة الشعبية الأصيلة وبأيدي أمهر الطهاة." }
    ]
  },
  {
    id: "cafe_1",
    name: "مقهى رواق وسكينة",
    type: "cafe",
    iconName: "Coffee",
    systemPrompt: "أنت المساعد الذكي لمقهى رواق وسكينة. تتميز بالأسلوب الراقي جداً والهدوء والمصطلحات المريحة. تساعد الرواد في حجز أركان الدراسة الهادئة أو غرف الاجتماعات، وطلب بوكسات القهوة الفاخرة للمناسبات، وتلقي الشكاوى بروح ملؤها التفهم والود والاعتذار.",
    welcomeMessage: "أهلاً بك في رواق وسكينة.. حيث لكل كوب قهوة حكاية وهدوء☕. كيف يمكنني إضفاء السكينة على يومك ومساعدتك في حجز ركن خاص أو طلب بوكس قهوة؟",
    services: ["حجز ركن المذاكرة والعمل الهادئ", "طلب بوكسات القهوة المفلترة والحلويات", "حجز غرفة الاجتماعات الخاصة", "تسجيل الشكاوى الفنية والخدمية"],
    workingHours: "على مدار 24 ساعة",
    phonePlaceholder: "05XXXXXXXX",
    subscriptionPlan: "enterprise",
    subscriptionStatus: "active",
    subscriptionExpiry: "2026-11-15",
    aiResponseCount: 1240,
    aiResponseLimit: 5000,
    quickReplies: [
      { id: "qr_f1", question: "ما هي سرعة الانترنت في ركن المذاكرة؟", answer: "نوفر لعملائنا في ركن المذاكرة والعمل الهادئ شبكة إنترنت فايبر فائقة السرعة تصل إلى 300 ميجابت/ثانية وهي مجانية تماماً لتسهيل دراستكم وأعمالكم." },
      { id: "qr_f2", question: "هل يمكن حجز المقهى للمناسبات الخاصة؟", answer: "نعم، يسعدنا ذلك! نتيح لكم خيار حجز المقهى بالكامل أو غرف الاجتماعات الخاصة لمناسباتكم مع توفير بوفيه قهوة وحلويات مخصص." }
    ]
  }
];

let bookings: Booking[] = [
  {
    id: "b_1",
    businessId: "clinic_1",
    customerName: "عبدالرحمن بن سعود",
    customerPhone: "0501234567",
    service: "حشو وعلاج العصب",
    date: "2026-07-17",
    time: "17:30",
    status: "confirmed",
    createdAt: "2026-07-15T14:30:00Z",
    notes: "يعاني من ألم مستمر منذ يومين"
  },
  {
    id: "b_2",
    businessId: "restaurant_1",
    customerName: "سارة الأحمد",
    customerPhone: "0559876543",
    service: "حجز طاولة أفراد/عائلات",
    date: "2026-07-16",
    time: "20:00",
    status: "pending",
    createdAt: "2026-07-15T18:22:00Z",
    notes: "طاولة عائلية لـ 5 أشخاص - هادئة"
  },
  {
    id: "b_3",
    businessId: "cafe_1",
    customerName: "المهندس خالد العتيبي",
    customerPhone: "0544112233",
    service: "حجز غرفة الاجتماعات الخاصة",
    date: "2026-07-18",
    time: "10:00",
    status: "confirmed",
    createdAt: "2026-07-16T08:00:00Z",
    notes: "يحتاج شاشة عرض وسبورة ذكية"
  }
];

let complaints: Complaint[] = [
  {
    id: "c_1",
    businessId: "restaurant_1",
    customerName: "فيصل الحربي",
    customerPhone: "0566778899",
    category: "تأخير التوصيل",
    summary: "الطلب تأخر أكثر من ساعة ونصف عن الموعد المحدد ووصل بارداً جداً.",
    sentiment: "negative",
    status: "open",
    createdAt: "2026-07-15T21:15:00Z",
    aiResponseDraft: "أهلاً بك يا أستاذ فيصل. نعتذر منك بشدة عن هذا التأخير غير المقبول ووصول الطعام بارداً. تم تسجيل شكواك برقم #4012 وسيتم الاتصال بك فوراً من قبل مدير قسم الجودة لتعويضك وحل المشكلة. لقمة وهيل تلتزم دائماً برضاكم."
  },
  {
    id: "c_2",
    businessId: "clinic_1",
    customerName: "منى القحطاني",
    customerPhone: "0533445566",
    category: "معاملة الاستقبال",
    summary: "الانتظار بالعيادة زاد عن 45 دقيقة بالرغم من وجود حجز مسبق، وموظفة الاستقبال كانت فظة في التعامل.",
    sentiment: "negative",
    status: "reviewing",
    createdAt: "2026-07-16T11:40:00Z",
    aiResponseDraft: "أختنا الكريمة منى، نأسف بشدة لتجربتك في صالة الانتظار وعن أسلوب موظفتنا. هذا السلوك لا يمثل قيم عيادتنا المتميزة. تم توجيه الشكوى لمدير العيادة للمراجعة واتخاذ اللازم فوراً وتفادي حدوث ذلك مجدداً."
  }
];

let webhookLogs: WebhookLog[] = [
  {
    id: "l_init_wa_clinic",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    direction: "system",
    channel: "whatsapp",
    event: "تم التحقق من اتصال WhatsApp Cloud API للعيادة",
    payload: { status: "active", verified_at: new Date(Date.now() - 3600000).toISOString() },
    businessId: "clinic_1",
    status: "success"
  },
  {
    id: "l_init_ig_clinic",
    timestamp: new Date(Date.now() - 3400000).toISOString(),
    direction: "system",
    channel: "instagram",
    event: "تم التحقق من ربط Instagram Webhook للعيادة",
    payload: { status: "active", verified_at: new Date(Date.now() - 3400000).toISOString() },
    businessId: "clinic_1",
    status: "success"
  },
  {
    id: "l_init_wa_rest",
    timestamp: new Date(Date.now() - 3000000).toISOString(),
    direction: "system",
    channel: "whatsapp",
    event: "تم التحقق من اتصال WhatsApp Cloud API لقمة وهيل",
    payload: { status: "active", verified_at: new Date(Date.now() - 3000000).toISOString() },
    businessId: "restaurant_1",
    status: "success"
  },
  {
    id: "l_init_ig_rest",
    timestamp: new Date(Date.now() - 2800000).toISOString(),
    direction: "system",
    channel: "instagram",
    event: "تم التحقق من ربط Instagram Webhook لقمة وهيل",
    payload: { status: "active", verified_at: new Date(Date.now() - 2800000).toISOString() },
    businessId: "restaurant_1",
    status: "success"
  },
  {
    id: "l_init_wa_cafe",
    timestamp: new Date(Date.now() - 2400000).toISOString(),
    direction: "system",
    channel: "whatsapp",
    event: "تم التحقق من اتصال WhatsApp Cloud API لرواق وسكينة",
    payload: { status: "active", verified_at: new Date(Date.now() - 2400000).toISOString() },
    businessId: "cafe_1",
    status: "success"
  },
  {
    id: "l_init_ig_cafe",
    timestamp: new Date(Date.now() - 2200000).toISOString(),
    direction: "system",
    channel: "instagram",
    event: "تم التحقق من ربط Instagram Webhook لرواق وسكينة",
    payload: { status: "active", verified_at: new Date(Date.now() - 2200000).toISOString() },
    businessId: "cafe_1",
    status: "success"
  },
  {
    id: "l_1",
    timestamp: new Date().toISOString(),
    direction: "system",
    channel: "webhook_verification",
    event: "تفعيل الخدمة بنجاح",
    payload: { status: "active", verified_at: new Date().toISOString(), scopes: ["whatsapp_business_messaging", "instagram_manage_messages"] }
  }
];

let activationCodes: ActivationCode[] = [];

// Helper to push to webhook logs
function logWebhook(
  direction: 'incoming' | 'outgoing' | 'system', 
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'webhook_verification' | 'billing', 
  event: string, 
  payload: any,
  businessId?: string,
  status?: 'success' | 'failed'
) {
  const newLog: WebhookLog = {
    id: "l_" + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    direction,
    channel,
    event,
    payload,
    businessId,
    status
  };
  webhookLogs.unshift(newLog);
  if (webhookLogs.length > 50) webhookLogs.pop(); // limit size
}

// Google Sheets API helpers
function getSheetsClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.sheets({ version: 'v4', auth: oauth2Client });
}

async function createNewSpreadsheet(accessToken: string, title: string) {
  const sheets = getSheetsClient(accessToken);
  const resource = {
    properties: {
      title: title,
    },
    sheets: [
      {
        properties: {
          title: "الحجوزات",
          gridProperties: {
            frozenRowCount: 1,
          }
        }
      },
      {
        properties: {
          title: "الشكاوى والاقتراحات",
          gridProperties: {
            frozenRowCount: 1,
          }
        }
      },
      {
        properties: {
          title: "بيانات العملاء",
          gridProperties: {
            frozenRowCount: 1,
          }
        }
      }
    ]
  };
  
  const response = await sheets.spreadsheets.create({
    requestBody: resource,
    fields: 'spreadsheetId,spreadsheetUrl'
  });

  const spreadsheetId = response.data.spreadsheetId;
  if (!spreadsheetId) {
    throw new Error("Failed to create spreadsheet");
  }

  // Populate headers for "الحجوزات"
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'الحجوزات'!A1:I1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [["معرف الحجز", "اسم العميل", "رقم الهاتف", "الخدمة المطلوبة", "التاريخ", "الوقت", "الحالة", "ملاحظات", "تاريخ الإنشاء"]]
    }
  });

  // Populate headers for "الشكاوى والاقتراحات"
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'الشكاوى والاقتراحات'!A1:I1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [["معرف الشكوى", "اسم العميل", "رقم الهاتف", "التصنيف", "ملخص الشكوى", "تحليل المشاعر", "الحالة", "رد الذكاء الاصطناعي المقترح", "تاريخ الإنشاء"]]
    }
  });

  // Populate headers for "بيانات العملاء"
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'بيانات العملاء'!A1:D1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [["اسم العميل", "رقم الهاتف", "آخر تفاعل", "عدد التفاعلات"]]
    }
  });

  return {
    spreadsheetId: response.data.spreadsheetId,
    spreadsheetUrl: response.data.spreadsheetUrl
  };
}

async function appendBookingToSheet(accessToken: string, spreadsheetId: string, booking: Booking) {
  try {
    const sheets = getSheetsClient(accessToken);
    const values = [
      [
        booking.id,
        booking.customerName,
        booking.customerPhone,
        booking.service,
        booking.date,
        booking.time,
        booking.status === "confirmed" ? "مؤكد" : booking.status === "cancelled" ? "ملغى" : booking.status === "completed" ? "مكتمل" : "معلق",
        booking.notes || "",
        new Date(booking.createdAt).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })
      ]
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "'الحجوزات'!A:I",
      valueInputOption: "USER_ENTERED",
      requestBody: { values }
    });
    console.log(`Successfully appended booking ${booking.id} to sheet ${spreadsheetId}`);
  } catch (error) {
    console.error(`Failed to append booking to Google Sheets:`, error);
  }
}

async function appendComplaintToSheet(accessToken: string, spreadsheetId: string, complaint: Complaint) {
  try {
    const sheets = getSheetsClient(accessToken);
    const values = [
      [
        complaint.id,
        complaint.customerName,
        complaint.customerPhone,
        complaint.category,
        complaint.summary,
        complaint.sentiment === "negative" ? "سلبي/غاضب" : complaint.sentiment === "neutral" ? "محايد" : "إيجابي",
        complaint.status === "resolved" ? "تم الحل" : complaint.status === "reviewing" ? "قيد المراجعة" : "مفتوح",
        complaint.aiResponseDraft || "",
        new Date(complaint.createdAt).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })
      ]
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "'الشكاوى والاقتراحات'!A:I",
      valueInputOption: "USER_ENTERED",
      requestBody: { values }
    });
    console.log(`Successfully appended complaint ${complaint.id} to sheet ${spreadsheetId}`);
  } catch (error) {
    console.error(`Failed to append complaint to Google Sheets:`, error);
  }
}

// REST endpoints
interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: 'owner' | 'supervisor';
  businessId?: string;
}

let users: User[] = [
  {
    id: "u_owner_1",
    username: "Etch",
    passwordHash: "Etch2410#",
    name: "هشام (صاحب الوكالة)",
    role: "owner"
  },
  {
    id: "u_clinic",
    username: "clinic@vertex.ai",
    passwordHash: "123456",
    name: "د. أحمد (مشرف العيادة)",
    role: "supervisor",
    businessId: "clinic_1"
  },
  {
    id: "u_rest",
    username: "rest@vertex.ai",
    passwordHash: "123456",
    name: "أبو سارة (مشرف المطعم)",
    role: "supervisor",
    businessId: "restaurant_1"
  },
  {
    id: "u_cafe",
    username: "cafe@vertex.ai",
    passwordHash: "123456",
    name: "أستاذ خالد (مشرف المقهى)",
    role: "supervisor",
    businessId: "cafe_1"
  }
];

// Dynamic Plan Configuration (Manageable by Admin/Owner)
let agencyPlans = [
  {
    id: 'trial',
    name: 'الباقة التجريبية',
    priceMonthly: 0,
    priceYearly: 0,
    period: 'لمدة 7 أيام',
    desc: 'مثالية لتجربة قوة الذكاء الاصطناعي في منشأتك قبل الالتزام الكامل.',
    features: [
      'وكيل ذكاء اصطناعي أساسي',
      'ربط قناة واحدة (واتساب أو إنستجرام)',
      'حد أقصى: 100 رد ذكاء اصطناعي شهرياً',
      'تتبع الحجوزات يدوياً',
      'لوحة تحكم بسيطة لإدارة المنشأة',
      'دعم فني عبر البريد الإلكتروني'
    ],
    limits: {
      messages: 100,
      channels: 1,
      hasComplaints: false,
      hasAutomation: false
    }
  },
  {
    id: 'growth',
    name: 'الباقة المتقدمة',
    priceMonthly: 1500,
    priceYearly: 1200,
    period: 'شهرياً',
    desc: 'الحل الأمثل للمنشآت المتنامية التي تحتاج لأتمتة كاملة للحجوزات والمواعيد.',
    features: [
      'تكامل كامل مع WhatsApp & Instagram',
      'حد أقصى: 1,000 رد ذكاء اصطناعي شهرياً',
      'أتمتة كاملة لجدولة الحجوزات وتأكيد المواعيد',
      'مزامنة تلقائية مع جداول بيانات Google Sheets',
      'استجابة فورية للرسائل (أقل من ثانيتين)',
      'دعم فني سريع عبر الواتساب'
    ],
    limits: {
      messages: 1000,
      channels: 2,
      hasComplaints: false,
      hasAutomation: true
    }
  },
  {
    id: 'enterprise',
    name: 'الباقة الشاملة',
    priceMonthly: 3000,
    priceYearly: 2400,
    period: 'شهرياً',
    desc: 'إدارة كاملة لخدمة العملاء والشكاوى مع أقصى قدرات الأتمتة المتاحة في وكالتنا.',
    features: [
      'كل ما تشمله الباقة المتقدمة',
      'ردود ذكاء اصطناعي غير محدودة شهرياً',
      'تفعيل مكتب الشكاوى الذكي (Complaints Desk)',
      'تحليلات متقدمة لبيانات العملاء وتحليل المشاعر',
      'هندسة موجهات مخصصة لهوية علامتك التجارية',
      'مدير حساب تقني مخصص ودعم هاتف 24/7'
    ],
    limits: {
      messages: 10000,
      channels: 2,
      hasComplaints: true,
      hasAutomation: true
    }
  }
];

interface PaymentRequest {
  id: string;
  businessId: string;
  businessName: string;
  planId: string;
  paymentMethod: 'instapay' | 'paypal' | 'visa';
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  transactionProof?: string;
}

let paymentRequests: PaymentRequest[] = [
  {
    id: "pay_1",
    businessId: "restaurant_1",
    businessName: "مطعم لقمة وهيل الشعبي",
    planId: "growth",
    paymentMethod: "instapay",
    amount: "49 دولار شهرياً",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    transactionProof: "تحويل انستا باي إلى هاتف: 01011223344 بقيمة 2450 جنيه مصري"
  }
];


app.get("/api/health/ai", (req, res) => {
  res.json({ connected: !!process.env.GEMINI_API_KEY });
});

app.get("/api/state", (req, res) => {
  const { businessId, role } = req.query;
  console.log("Query params:", req.query);
  
  if (role !== 'owner' && businessId) {
    const filteredBusinesses = businesses.filter(b => b.id === businessId);
    const filteredBookings = bookings.filter(b => b.businessId === businessId);
    const filteredComplaints = complaints.filter(c => c.businessId === businessId);
    const filteredWebhookLogs = webhookLogs.filter(l => l.businessId === businessId || !l.businessId);
    const filteredPaymentRequests = paymentRequests.filter(p => p.businessId === businessId);
    
    return res.json({
      businesses: filteredBusinesses,
      bookings: filteredBookings,
      complaints: filteredComplaints,
      webhookLogs: filteredWebhookLogs,
      paymentRequests: filteredPaymentRequests
    });
  }

  res.json({
    businesses,
    bookings,
    complaints,
    webhookLogs,
    paymentRequests
  });
});

// Authentication Routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === password);
  if (user) {
    return res.json({ success: true, user });
  }
  res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
});

app.post("/api/auth/register", (req, res) => {
  const { name, username, password, businessName, businessType } = req.body;
  
  if (!name || !username || !password || !businessName || !businessType) {
    return res.status(400).json({ error: "يرجى ملء جميع الحقول المطلوبة" });
  }

  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: "البريد الإلكتروني مسجل بالفعل" });
  }

  const businessId = "biz_" + Math.random().toString(36).substr(2, 9);
  
  const newBusiness: BusinessConfig = {
    id: businessId,
    name: businessName,
    type: businessType as any,
    iconName: businessType === 'clinic' ? 'Stethoscope' : businessType === 'restaurant' ? 'Utensils' : businessType === 'cafe' ? 'Coffee' : 'Award',
    systemPrompt: `أنت مساعد ذكي للمنشأة ${businessName}. هدفك مساعدة العملاء والإجابة عن استفساراتهم بلباقة وسرعة وتسهيل حجز المواعيد.`,
    welcomeMessage: `مرحباً بك في ${businessName}! يسعدنا خدمتك اليوم بمساعدنا الذكي.`,
    services: ["الخدمة الأساسية الأولى", "الخدمة الثانية"],
    workingHours: "يومياً من 9 صباحاً حتى 9 مساءً",
    phonePlaceholder: "05XXXXXXXX",
    subscriptionPlan: undefined,
    subscriptionStatus: "inactive",
    subscriptionExpiry: undefined,
    aiResponseCount: 0,
    aiResponseLimit: 150,
    quickReplies: []
  };

  businesses.push(newBusiness);

  const newUser: User = {
    id: "u_" + Math.random().toString(36).substr(2, 9),
    username,
    passwordHash: password,
    name,
    role: "supervisor",
    businessId
  };

  users.push(newUser);

  logWebhook("system", "whatsapp", `تسجيل مشرف جديد: ${name} لشركة ${businessName}`, { user_id: newUser.id, business_id: businessId }, businessId, "success");

  res.json({ success: true, user: newUser });
});

// Subscription Payment Requests API
app.post("/api/payment/request", (req, res) => {
  const { businessId, planId, paymentMethod, transactionProof, amount } = req.body;
  const biz = businesses.find(b => b.id === businessId);
  if (!biz) {
    return res.status(404).json({ error: "المنشأة غير موجودة" });
  }

  const newRequest: PaymentRequest = {
    id: "pay_" + Math.random().toString(36).substr(2, 9),
    businessId,
    businessName: biz.name,
    planId,
    paymentMethod,
    amount,
    status: "pending",
    createdAt: new Date().toISOString(),
    transactionProof
  };

  paymentRequests.unshift(newRequest);
  
  // Update business's subscription status to pending
  biz.subscriptionStatus = "pending_activation";
  biz.subscriptionPlan = planId;

  logWebhook(
    "system", 
    "whatsapp", 
    `تم تقديم طلب دفع معلق لشركة: ${biz.name} (باقة: ${planId}) عبر ${paymentMethod}`, 
    newRequest, 
    businessId, 
    "success"
  );

  res.json({ success: true, paymentRequest: newRequest });
});

app.post("/api/payment/approve", (req, res) => {
  const { requestId } = req.body;
  const reqIndex = paymentRequests.findIndex(p => p.id === requestId);
  if (reqIndex === -1) {
    return res.status(404).json({ error: "طلب الدفع غير موجود" });
  }

  const paymentReq = paymentRequests[reqIndex];
  paymentReq.status = "approved";

  const bizIndex = businesses.findIndex(b => b.id === paymentReq.businessId);
  if (bizIndex !== -1) {
    const limit = paymentReq.planId === 'trial' ? 150 : paymentReq.planId === 'growth' ? 1000 : 5000;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    businesses[bizIndex] = {
      ...businesses[bizIndex],
      subscriptionPlan: paymentReq.planId,
      subscriptionStatus: "active",
      subscriptionExpiry: expiryDate.toISOString().split('T')[0],
      aiResponseLimit: limit,
      aiResponseCount: 0
    };

    logWebhook(
      "system", 
      "whatsapp", 
      `تم الموافقة والتنشيط اليدوي للاشتراك من صاحب الوكالة: ${businesses[bizIndex].name}`, 
      { plan: paymentReq.planId, limit, expiry: businesses[bizIndex].subscriptionExpiry }, 
      paymentReq.businessId, 
      "success"
    );
  }

  res.json({ success: true, paymentRequest: paymentReq });
});

app.post("/api/payment/reject", (req, res) => {
  const { requestId } = req.body;
  const reqIndex = paymentRequests.findIndex(p => p.id === requestId);
  if (reqIndex === -1) {
    return res.status(404).json({ error: "طلب الدفع غير موجود" });
  }

  const paymentReq = paymentRequests[reqIndex];
  paymentReq.status = "rejected";

  const bizIndex = businesses.findIndex(b => b.id === paymentReq.businessId);
  if (bizIndex !== -1) {
    businesses[bizIndex].subscriptionStatus = "inactive";
  }

  logWebhook(
    "system", 
    "whatsapp", 
    `تم رفض طلب دفع الاشتراك لشركة: ${paymentReq.businessName}`, 
    { requestId }, 
    paymentReq.businessId, 
    "failed"
  );

  res.json({ success: true, paymentRequest: paymentReq });
});

// Update Business Configuration
app.post("/api/business/update", (req, res) => {
  const { id, name, systemPrompt, welcomeMessage, services, workingHours, quickReplies, googleSheetsId, googleSheetsLinked, googleSheetsAccessToken, whatsappSenderNumber, instagramAccountId, instagramAccessToken, facebookPageId, facebookAccessToken, telegramBotToken, welcomeMessageEnabled, autoPilotEnabled, generateInvoiceEnabled } = req.body;
  const index = businesses.findIndex(b => b.id === id);
  if (index !== -1) {
    businesses[index] = {
      ...businesses[index],
      name: name || businesses[index].name,
      systemPrompt: systemPrompt || businesses[index].systemPrompt,
      welcomeMessage: welcomeMessage || businesses[index].welcomeMessage,
      welcomeMessageEnabled: welcomeMessageEnabled !== undefined ? welcomeMessageEnabled : businesses[index].welcomeMessageEnabled,
      autoPilotEnabled: autoPilotEnabled !== undefined ? autoPilotEnabled : businesses[index].autoPilotEnabled,
      generateInvoiceEnabled: generateInvoiceEnabled !== undefined ? generateInvoiceEnabled : businesses[index].generateInvoiceEnabled,
      services: services || businesses[index].services,
      workingHours: workingHours || businesses[index].workingHours,
      quickReplies: quickReplies !== undefined ? quickReplies : businesses[index].quickReplies,
      googleSheetsId: googleSheetsId !== undefined ? googleSheetsId : businesses[index].googleSheetsId,
      googleSheetsLinked: googleSheetsLinked !== undefined ? googleSheetsLinked : businesses[index].googleSheetsLinked,
      googleSheetsAccessToken: googleSheetsAccessToken !== undefined ? googleSheetsAccessToken : businesses[index].googleSheetsAccessToken,
      whatsappSenderNumber: whatsappSenderNumber !== undefined ? whatsappSenderNumber : businesses[index].whatsappSenderNumber,
      instagramAccountId: instagramAccountId !== undefined ? instagramAccountId : businesses[index].instagramAccountId,
      instagramAccessToken: instagramAccessToken !== undefined ? instagramAccessToken : businesses[index].instagramAccessToken,
      facebookPageId: facebookPageId !== undefined ? facebookPageId : businesses[index].facebookPageId,
      facebookAccessToken: facebookAccessToken !== undefined ? facebookAccessToken : businesses[index].facebookAccessToken,
      telegramBotToken: telegramBotToken !== undefined ? telegramBotToken : businesses[index].telegramBotToken
    };
    logWebhook("system", "whatsapp", `تحديث إعدادات عميل: ${businesses[index].name}`, { updated_fields: Object.keys(req.body) }, id, "success");
    return res.json({ success: true, business: businesses[index] });
  }
  res.status(404).json({ error: "المنشأة غير موجودة" });
});

// Plans Management
app.get("/api/plans", (req, res) => {
  res.json(agencyPlans);
});

app.post("/api/plans/update", (req, res) => {
  const { newPlans } = req.body;
  if (newPlans && Array.isArray(newPlans)) {
    agencyPlans = newPlans;
    logWebhook("system", "billing", "تحديث شامل لهيكل الباقات من قبل المسؤول", { plansCount: newPlans.length }, "system", "success");
    return res.json({ success: true, plans: agencyPlans });
  }
  res.status(400).json({ error: "بيانات الباقات غير صالحة" });
});

// Subscription Management
app.post("/api/subscription/update", (req, res) => {
  const { id, plan, status, expiry, limit, resetUsage } = req.body;
  const index = businesses.findIndex(b => b.id === id);
  if (index !== -1) {
    if (plan) businesses[index].subscriptionPlan = plan;
    if (status) businesses[index].subscriptionStatus = status;
    if (expiry) businesses[index].subscriptionExpiry = expiry;
    if (limit !== undefined) businesses[index].aiResponseLimit = limit;
    if (resetUsage) businesses[index].aiResponseCount = 0;
    
    logWebhook("system", "billing", `تحديث اشتراك: ${businesses[index].name}`, { plan, status, expiry, limit, resetUsage }, id, "success");
    return res.json({ success: true, business: businesses[index] });
  }
  res.status(404).json({ error: "المنشأة غير موجودة" });
});

// Create Business
app.post("/api/business/create", (req, res) => {
  const { name, type } = req.body;
  const businessId = "biz_" + Math.random().toString(36).substr(2, 9);
  
  const newBusiness: BusinessConfig = {
    id: businessId,
    name: name,
    type: type,
    iconName: type === 'clinic' ? 'Stethoscope' : type === 'restaurant' ? 'Utensils' : type === 'cafe' ? 'Coffee' : 'Award',
    systemPrompt: `أنت مساعد ذكي للمنشأة ${name}.`,
    welcomeMessage: `مرحباً بك في ${name}!`,
    services: [],
    workingHours: "9:00 - 21:00",
    phonePlaceholder: "05XXXXXXXX",
    subscriptionStatus: "inactive",
    aiResponseCount: 0,
    aiResponseLimit: 150,
    quickReplies: []
  };

  businesses.push(newBusiness);
  res.json({ success: true, business: newBusiness });
});

// Delete Business
app.post("/api/business/delete", (req, res) => {
  const { id } = req.body;
  const index = businesses.findIndex(b => b.id === id);
  if (index !== -1) {
    businesses.splice(index, 1);
    // Also remove associated users
    users = users.filter(u => u.businessId !== id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "المنشأة غير موجودة" });
  }
});

// Auto-create Google Sheet for a Business
app.post("/api/business/sheets/auto-create", async (req, res) => {
  const { id, accessToken } = req.body;
  const biz = businesses.find(b => b.id === id);
  if (!biz) {
    return res.status(404).json({ error: "المنشأة غير موجودة" });
  }

  if (!accessToken) {
    return res.status(400).json({ error: "لم يتم توفير رمز مصادقة Google Sheets" });
  }

  try {
    const title = `Vertex AI - ورقة عمل منشأة: ${biz.name}`;
    const { spreadsheetId, spreadsheetUrl } = await createNewSpreadsheet(accessToken, title);
    
    biz.googleSheetsId = spreadsheetId;
    biz.googleSheetsAccessToken = accessToken;
    biz.googleSheetsLinked = true;

    logWebhook("system", "whatsapp", `تم تأسيس وإنشاء ورقة عمل Google Sheets تلقائياً للمنشأة: ${biz.name}`, { spreadsheetId, spreadsheetUrl }, id, "success");

    res.json({ success: true, spreadsheetId, spreadsheetUrl, business: biz });
  } catch (error: any) {
    console.error("Failed auto sheets creation:", error);
    logWebhook("system", "whatsapp", `فشل إنشاء ورقة عمل Google Sheets تلقائياً للمنشأة: ${biz.name}`, { error: error.message }, id, "failed");
    res.status(500).json({ error: `فشل إنشاء ورقة العمل: ${error.message}` });
  }
});

// Full Manual Sync of Business Bookings and Complaints to Google Sheets
app.post("/api/business/sheets/sync-all", async (req, res) => {
  const { id, accessToken } = req.body;
  const biz = businesses.find(b => b.id === id);
  if (!biz) {
    return res.status(404).json({ error: "المنشأة غير موجودة" });
  }

  const tokenToUse = accessToken || biz.googleSheetsAccessToken;
  if (!tokenToUse) {
    return res.status(400).json({ error: "لم يتم توفير رمز مصادقة Google Sheets" });
  }

  if (!biz.googleSheetsId) {
    return res.status(400).json({ error: "لم يتم ربط ورقة عمل Google Sheets لهذه المنشأة" });
  }

  try {
    const sheets = getSheetsClient(tokenToUse);
    
    // Check if the spreadsheet is accessible
    try {
      await sheets.spreadsheets.get({ spreadsheetId: biz.googleSheetsId });
    } catch (e: any) {
      return res.status(400).json({ error: `فشل الوصول لورقة العمل: ${e.message}. يرجى التحقق من معرف ورقة العمل وصلاحيات الوصول.` });
    }

    const bizBookings = bookings.filter(b => b.businessId === id);
    const bizComplaints = complaints.filter(c => c.businessId === id);

    // Sync bookings if any
    if (bizBookings.length > 0) {
      const bookingValues = bizBookings.map(b => [
        b.id,
        b.customerName,
        b.customerPhone,
        b.service,
        b.date,
        b.time,
        b.status === "confirmed" ? "مؤكد" : b.status === "cancelled" ? "ملغى" : b.status === "completed" ? "مكتمل" : "معلق",
        b.notes || "",
        new Date(b.createdAt).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })
      ]);
      
      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: biz.googleSheetsId,
          range: "'الحجوزات'!A:I",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: bookingValues }
        });
      } catch (e) {
        // Tab might be missing, let's create and write headers, then try again
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: biz.googleSheetsId,
            requestBody: {
              requests: [
                { addSheet: { properties: { title: "الحجوزات" } } }
              ]
            }
          });
          await sheets.spreadsheets.values.update({
            spreadsheetId: biz.googleSheetsId,
            range: "'الحجوزات'!A1:I1",
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [["معرف الحجز", "اسم العميل", "رقم الهاتف", "الخدمة المطلوبة", "التاريخ", "الوقت", "الحالة", "ملاحظات", "تاريخ الإنشاء"]]
            }
          });
          await sheets.spreadsheets.values.append({
            spreadsheetId: biz.googleSheetsId,
            range: "'الحجوزات'!A:I",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: bookingValues }
          });
        } catch (err) {
          console.error("Failed to recover 'الحجوزات' tab during sync:", err);
        }
      }
    }

    // Sync complaints if any
    if (bizComplaints.length > 0) {
      const complaintValues = bizComplaints.map(c => [
        c.id,
        c.customerName,
        c.customerPhone,
        c.category,
        c.summary,
        c.sentiment === "negative" ? "سلبي/غاضب" : c.sentiment === "neutral" ? "محايد" : "إيجابي",
        c.status === "resolved" ? "تم الحل" : c.status === "reviewing" ? "قيد المراجعة" : "مفتوح",
        c.aiResponseDraft || "",
        new Date(c.createdAt).toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })
      ]);

      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: biz.googleSheetsId,
          range: "'الشكاوى والاقتراحات'!A:I",
          valueInputOption: "USER_ENTERED",
          requestBody: { values: complaintValues }
        });
      } catch (e) {
        // Tab might be missing, let's create and write headers, then try again
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: biz.googleSheetsId,
            requestBody: {
              requests: [
                { addSheet: { properties: { title: "الشكاوى والاقتراحات" } } }
              ]
            }
          });
          await sheets.spreadsheets.values.update({
            spreadsheetId: biz.googleSheetsId,
            range: "'الشكاوى والاقتراحات'!A1:I1",
            valueInputOption: "USER_ENTERED",
            requestBody: {
              values: [["معرف الشكوى", "اسم العميل", "رقم الهاتف", "التصنيف", "ملخص الشكوى", "تحليل المشاعر", "الحالة", "رد الذكاء الاصطناعي المقترح", "تاريخ الإنشاء"]]
            }
          });
          await sheets.spreadsheets.values.append({
            spreadsheetId: biz.googleSheetsId,
            range: "'الشكاوى والاقتراحات'!A:I",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: complaintValues }
          });
        } catch (err) {
          console.error("Failed to recover 'الشكاوى والاقتراحات' tab during sync:", err);
        }
      }
    }

    logWebhook("system", "whatsapp", `مزامنة يدوية ناجحة لكافة بيانات الحجوزات والشكاوى مع Google Sheets للمنشأة: ${biz.name}`, { bookings_synced: bizBookings.length, complaints_synced: bizComplaints.length }, id, "success");

    res.json({ success: true, message: `تم مزامنة ${bizBookings.length} حجز و ${bizComplaints.length} شكوى بنجاح!` });
  } catch (error: any) {
    console.error("Failed full sheets sync:", error);
    logWebhook("system", "whatsapp", `فشل مزامنة البيانات مع Google Sheets للمنشأة: ${biz.name}`, { error: error.message }, id, "failed");
    res.status(500).json({ error: `فشل المزامنة: ${error.message}` });
  }
});

// Update Business Subscription & Plan
app.post("/api/business/subscription/update", (req, res) => {
  const { id, subscriptionPlan, subscriptionStatus, subscriptionExpiry, aiResponseLimit, resetUsage } = req.body;
  const index = businesses.findIndex(b => b.id === id);
  if (index !== -1) {
    const updated = { ...businesses[index] };
    if (subscriptionPlan !== undefined) updated.subscriptionPlan = subscriptionPlan;
    if (subscriptionStatus !== undefined) updated.subscriptionStatus = subscriptionStatus;
    if (subscriptionExpiry !== undefined) updated.subscriptionExpiry = subscriptionExpiry;
    if (aiResponseLimit !== undefined) updated.aiResponseLimit = aiResponseLimit;
    if (resetUsage) updated.aiResponseCount = 0;

    businesses[index] = updated;

    logWebhook(
      "system", 
      "whatsapp", 
      `تحديث اشتراك العميل: ${updated.name} (باقة: ${updated.subscriptionPlan})`, 
      { 
        plan: updated.subscriptionPlan, 
        status: updated.subscriptionStatus, 
        expiry: updated.subscriptionExpiry,
        limit: updated.aiResponseLimit 
      }, 
      id, 
      "success"
    );

    return res.json({ success: true, business: updated });
  }
  res.status(404).json({ error: "العمل غير موجود" });
});

// Manage Bookings
app.post("/api/bookings/manage", (req, res) => {
  const { id, action, ...updates } = req.body; // action: 'confirm' | 'cancel' | 'complete' | 'create'
  
  if (action === "create") {
    const newBooking: Booking = {
      id: "b_" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: "pending", 
      ...updates
    };

    const biz = businesses.find(b => b.id === newBooking.businessId);
    
    // Auto Pilot Logic
    if (biz && biz.autoPilotEnabled) {
      newBooking.status = "confirmed";
      logWebhook("system", "whatsapp", `تم تأكيد الحجز تلقائياً (Auto-Pilot) للعميل: ${newBooking.customerName}`, { bookingId: newBooking.id }, newBooking.businessId, "success");
    }

    bookings.unshift(newBooking);

    // Simulate sending automatic reminder upon creation
    logWebhook("system", "whatsapp", `تم إرسال رسالة تأكيد وتذكير تلقائي للعميل: ${newBooking.customerName}`, { bookingId: newBooking.id }, newBooking.businessId, "success");

    // Sync to Google Sheets if linked
    if (biz && biz.googleSheetsLinked && biz.googleSheetsId && biz.googleSheetsAccessToken) {
      appendBookingToSheet(biz.googleSheetsAccessToken, biz.googleSheetsId, newBooking);
    }

    logWebhook("system", "whatsapp", `إضافة حجز تلقائي: ${newBooking.customerName}`, newBooking, newBooking.businessId, "success");
    return res.json({ success: true, booking: newBooking });
  }

  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    if (action === "confirm") bookings[index].status = "confirmed";
    else if (action === "cancel") bookings[index].status = "cancelled";
    else if (action === "complete") bookings[index].status = "completed";
    else if (action === "remind") {
      bookings[index].reminderSent = true;
      logWebhook("system", "whatsapp", `تم إرسال رسالة تذكير للعميل: ${bookings[index].customerName} بموعده`, { bookingId: id }, bookings[index].businessId, "success");
      return res.json({ success: true, booking: bookings[index], message: "تم إرسال التذكير بنجاح" });
    }
    else if (action === "update") {
      bookings[index] = { ...bookings[index], ...updates };
    }
    logWebhook("system", "whatsapp", `تحديث حالة حجز: ${bookings[index].customerName}`, { id, status: bookings[index].status }, bookings[index].businessId, "success");
    return res.json({ success: true, booking: bookings[index] });
  }
  res.status(404).json({ error: "الحجز غير موجود" });
});

// Manage Complaints
app.post("/api/complaints/manage", (req, res) => {
  const { id, action, ...updates } = req.body; // action: 'resolve' | 'review' | 'create'
  
  if (action === "create") {
    const newComplaint: Complaint = {
      id: "c_" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      status: "open",
      ...updates
    };
    complaints.unshift(newComplaint);

    // Sync to Google Sheets if linked
    const biz = businesses.find(b => b.id === newComplaint.businessId);
    if (biz && biz.googleSheetsLinked && biz.googleSheetsId && biz.googleSheetsAccessToken) {
      appendComplaintToSheet(biz.googleSheetsAccessToken, biz.googleSheetsId, newComplaint);
    }

    logWebhook("system", "whatsapp", `إضافة شكوى يدوية: ${newComplaint.customerName}`, newComplaint, newComplaint.businessId, "success");
    return res.json({ success: true, complaint: newComplaint });
  }

  const index = complaints.findIndex(c => c.id === id);
  if (index !== -1) {
    if (action === "resolve") complaints[index].status = "resolved";
    else if (action === "review") complaints[index].status = "reviewing";
    else if (action === "update") {
      complaints[index] = { ...complaints[index], ...updates };
    }
    logWebhook("system", "whatsapp", `تحديث حالة شكوى: ${complaints[index].customerName}`, { id, status: complaints[index].status }, complaints[index].businessId, "success");
    return res.json({ success: true, complaint: complaints[index] });
  }
  res.status(404).json({ error: "الشكوى غير موجودة" });
});

// Reset simulation state
app.post("/api/reset", (req, res) => {
  bookings = [
    {
      id: "b_1",
      businessId: "clinic_1",
      customerName: "عبدالرحمن بن سعود",
      customerPhone: "0501234567",
      service: "حشو وعلاج العصب",
      date: "2026-07-17",
      time: "17:30",
      status: "confirmed",
      createdAt: "2026-07-15T14:30:00Z",
      notes: "يعاني من ألم مستمر منذ يومين"
    },
    {
      id: "b_2",
      businessId: "restaurant_1",
      customerName: "سارة الأحمد",
      customerPhone: "0559876543",
      service: "حجز طاولة أفراد/عائلات",
      date: "2026-07-16",
      time: "20:00",
      status: "pending",
      createdAt: "2026-07-15T18:22:00Z",
      notes: "طاولة عائلية لـ 5 أشخاص - هادئة"
    },
    {
      id: "b_3",
      businessId: "cafe_1",
      customerName: "المهندس خالد العتيبي",
      customerPhone: "0544112233",
      service: "حجز غرفة الاجتماعات الخاصة",
      date: "2026-07-18",
      time: "10:00",
      status: "confirmed",
      createdAt: "2026-07-16T08:00:00Z",
      notes: "يحتاج شاشة عرض وسبورة ذكية"
    }
  ];

  complaints = [
    {
      id: "c_1",
      businessId: "restaurant_1",
      customerName: "فيصل الحربي",
      customerPhone: "0566778899",
      category: "تأخير التوصيل",
      summary: "الطلب تأخر أكثر من ساعة ونصف عن الموعد المحدد ووصل بارداً جداً.",
      sentiment: "negative",
      status: "open",
      createdAt: "2026-07-15T21:15:00Z",
      aiResponseDraft: "أهلاً بك يا أستاذ فيصل. نعتذر منك بشدة عن هذا التأخير غير المقبول ووصول الطعام بارداً. تم تسجيل شكواك برقم #4012 وسيتم الاتصال بك فوراً من قبل مدير قسم الجودة لتعويضك وحل المشكلة. لقمة وهيل تلتزم دائماً برضاكم."
    },
    {
      id: "c_2",
      businessId: "clinic_1",
      customerName: "منى القحطاني",
      customerPhone: "0533445566",
      category: "معاملة الاستقبال",
      summary: "الانتظار بالعيادة زاد عن 45 دقيقة بالرغم من وجود حجز مسبق، وموظفة الاستقبال كانت فظة في التعامل.",
      sentiment: "negative",
      status: "reviewing",
      createdAt: "2026-07-16T11:40:00Z",
      aiResponseDraft: "أختنا الكريمة منى، نأسف بشدة لتجربتك في صالة الانتظار وعن أسلوب موظفتنا. هذا السلوك لا يمثل قيم عيادتنا المتميزة. تم توجيه الشكوى لمدير العيادة للمراجعة واتخاذ اللازم فوراً وتفادي حدوث ذلك مجدداً."
    }
  ];

  webhookLogs = [
    {
      id: "l_1",
      timestamp: new Date().toISOString(),
      direction: "system",
      channel: "webhook_verification",
      event: "إعادة ضبط المحاكاة بنجاح",
      payload: { status: "reset_completed", timestamp: new Date().toISOString() }
    }
  ];

  res.json({ success: true, bookings, complaints, webhookLogs });
});

// Real-time AI simulation engine endpoint

async function processAgentInteraction(biz, message, channel, senderName, senderPhone) {
  let isFirstContact = false;
  const customerKey = `${biz.id}_${channel}_${senderPhone}`;
  if (!knownCustomers.has(customerKey)) {
    knownCustomers.add(customerKey);
    isFirstContact = true;
  }
  try {
    const systemPrompt = `
You are the AI Automation Core for a customer service agency representing: "${biz.name}".
Your task is to analyze the incoming message and produce an automated, highly-empathetic, and helpful response, as well as extract any business actions (such as reserving/booking an appointment or registering a customer complaint).

Business Configuration for ${biz.name}:
- Type: ${biz.type}
- Services Available: ${biz.services.join(", ")}
- Working Hours: ${biz.workingHours}
- Custom Identity Guidelines: ${biz.systemPrompt}
- Custom Static/Quick Replies (الردود الجاهزة الثابتة للأسئلة المتكررة):
${biz.quickReplies && biz.quickReplies.length > 0 
  ? biz.quickReplies.map(qr => `  * السؤال المتكرر: "${qr.question}" -> الإجابة الثابتة: "${qr.answer}"`).join("\n")
  : "  (لا توجد ردود جاهزة مخصصة حالياً.)"}

Current Date Context: The current local time is ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA')}.

You must return a structured JSON response matching the required schema exactly.
If the incoming customer message matches or is conceptually identical/highly similar to one of the questions in the "Custom Static/Quick Replies" list above, you MUST prioritize and use its corresponding static answer EXACTLY as the 'responseText' (or use it as the primary core message).
If the customer wants to book a slot or service, detect it as "BOOKING", extract customer details, match the requested service with one from the lists if possible, parse the requested date (converting absolute expressions like "tomorrow" or "next Sunday" to appropriate format) and requested time.
If the customer expresses severe dissatisfaction, trouble, or files a formal feedback, classify it as "COMPLAINT", estimate the sentiment ("negative") and summarize it.
Otherwise, classify it as "FAQ" or "OTHER" and answer appropriately.
Keep your Arabic conversational response 'responseText' friendly, highly localized, and matching the style of ${biz.name}.
${(biz.type === 'clinic' || biz.type === 'restaurant') && biz.generateInvoiceEnabled 
  ? `CRITICAL: The Automatic Invoice feature is ENABLED. If this is a successful BOOKING, you MUST include a clean, text-based invoice/receipt (فاتورة/إيصال) at the end of your 'responseText'. The invoice should look like a real receipt with dashes, including the Business Name, Customer Name, Service, Date, Time, and a placeholder for Price/Total (e.g. 0.00 SAR). Make it look professional.` 
  : ''}
    `;

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
        actionDetailsText = `📅 حجز ملقط تلقائياً: ${bookingCreated.service} بتاريخ ${bookingCreated.date} في تمام الساعة ${bookingCreated.time}`;
        
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
        actionDetailsText = `⚠️ شكوى مسجلة تلقائياً: ${complaintCreated.category} - بتحليل مشاعر (${complaintCreated.sentiment === 'negative' ? 'غاضب/سلبي' : 'محايد'})`;
        
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
    const fallbackResponse = `أهلاً بك يا أستاذ ${senderName || 'الغالي'}. شكراً لتواصلك مع ${biz.name}. نرجو الانتظار لحظة ريثما يقوم أحد موظفينا بالرد عليك أو يمكنك المحاولة لاحقاً.`;
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

app.post("/api/simulate-chat", async (req, res) => {
  const { businessId, message, channel, senderName, senderPhone } = req.body;
  const biz = businesses.find(b => b.id === businessId);
  if (!biz) {
    return res.status(404).json({ error: "العمل المحدد غير متوفر" });
  }

  const incomingPayload = {
    object: channel === "whatsapp" ? "whatsapp_business_account" : (channel === 'telegram' ? "telegram_bot" : "instagram_account"),
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

  logWebhook("incoming", channel, `مستلم عبر ${channel === 'whatsapp' ? 'واتساب' : (channel === 'telegram' ? 'تليجرام' : 'إنستجرام')}: "${message}"`, incomingPayload, biz.id, "success");

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

  logWebhook("outgoing", channel, `رد ملقى عبر ${channel === 'whatsapp' ? 'واتساب' : (channel === 'telegram' ? 'تليجرام' : 'إنستجرام')}`, outgoingPayload, biz.id, "success");

  res.json(result);
});

app.get("/api/activation-codes", (req, res) => {
  res.json(activationCodes);
});

app.post("/api/activation-codes", (req, res) => {
  const { planId } = req.body;
  if (!planId) return res.status(400).json({ error: "Missing planId" });
  
  // Generate a random 8-character code
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const newCode: ActivationCode = {
    id: `code_${Date.now()}`,
    code,
    planId,
    isUsed: false,
    createdAt: new Date().toISOString()
  };
  
  activationCodes.unshift(newCode);
  res.json(newCode);
});

app.post("/api/redeem-code", (req, res) => {
  const { code, businessId } = req.body;
  if (!code || !businessId) return res.status(400).json({ error: "Missing code or businessId" });
  
  const foundCode = activationCodes.find(c => c.code === code && !c.isUsed);
  if (!foundCode) return res.status(400).json({ error: "Invalid or already used code" });
  
  const bizIndex = businesses.findIndex(b => b.id === businessId);
  if (bizIndex === -1) return res.status(404).json({ error: "Business not found" });
  
  // Mark code as used
  foundCode.isUsed = true;
  foundCode.usedAt = new Date().toISOString();
  foundCode.usedBy = businessId;
  
  // Update business subscription
  businesses[bizIndex] = {
    ...businesses[bizIndex],
    subscriptionPlan: foundCode.planId,
    subscriptionStatus: 'active',
    subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days for now
  };
  
  logWebhook('system', 'billing', 'تم تفعيل الاشتراك بكود التفعيل', { planId: foundCode.planId, code }, businessId, 'success');
  
  res.json({ success: true, business: businesses[bizIndex], planId: foundCode.planId });
});

// Actual Webhook verification & handler
app.get("/api/webhooks/whatsapp", (req, res) => {
  const verifyToken = process.env.META_VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      logWebhook("system", "whatsapp", "طلب تفعيل Webhook من Meta (تم التحقق بنجاح)", { query: req.query });
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification token mismatch");
  }
  return res.status(400).send("Bad Request");
});

app.post("/api/webhooks/whatsapp", async (req, res) => {
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
                  await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      messaging_product: 'whatsapp',
                      to: senderPhone,
                      type: 'text',
                      text: { body: result.responseText }
                    })
                  });
                  logWebhook("outgoing", "whatsapp", `تم إرسال رد تلقائي إلى ${senderPhone}`, { responseText: result.responseText }, biz.id, "success");
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



app.post("/api/webhooks/telegram/:businessId", async (req, res) => {
  const { businessId } = req.params;
  const body = req.body;
  
  res.status(200).send("OK");
  
  try {
    const biz = businesses.find(b => b.id === businessId);
    if (!biz || !biz.telegramBotToken) return;

    if (body.message && body.message.text) {
      const text = body.message.text;
      const senderId = body.message.chat.id.toString();
      const senderName = body.message.from.first_name || "عميل";

      logWebhook("incoming", "telegram", `رسالة تليجرام من ${senderName}: "${text}"`, body, biz.id, "success");

      const result = await processAgentInteraction(biz, text, "telegram", senderName, senderId);

      // Send response via Telegram API
      await fetch(`https://api.telegram.org/bot${biz.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: senderId,
          text: result.responseText
        })
      });

      logWebhook("outgoing", "telegram", `تم إرسال رد تلقائي إلى ${senderId} عبر تليجرام`, { responseText: result.responseText }, biz.id, "success");
    }
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    logWebhook("system", "telegram", "خطأ أثناء معالجة ويبهوك تليجرام", { error: String(error) }, businessId, "failed");
  }
});

app.get("/api/webhooks/instagram", (req, res) => {
  const verifyToken = "VERTEX_AI_AGENCY_TOKEN_2026";
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      logWebhook("system", "instagram", "طلب تفعيل Webhook من Meta لإنستجرام (ناجح)", { query: req.query });
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification token mismatch");
  }
  res.status(400).send("Bad Request");
});

// Periodic Reminder Check
setInterval(() => {
  const now = new Date();
  bookings.forEach(b => {
    if (b.status === 'confirmed' && !b.reminderSent) {
      const bookingDate = new Date(`${b.date}T${b.time}`);
      const timeDiff = bookingDate.getTime() - now.getTime();
      // Check if it's within 24 hours (86400000ms)
      if (timeDiff > 0 && timeDiff <= 86400000) {
          logWebhook("system", "whatsapp", `تذكير تلقائي (Auto-Pilot): موعدك غداً ${b.time} مع ${b.customerName}`, { bookingId: b.id }, b.businessId, "success");
          b.reminderSent = true;
      }
    }
  });
}, 60000); // Every minute

// Vite dev & production router integration
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from dist/.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

init();
