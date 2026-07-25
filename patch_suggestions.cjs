const fs = require('fs');
let code = fs.readFileSync('src/components/SandboxSimulator.tsx', 'utf8');

const target = `  const suggestions = [
    {
      label: "📅 حجز موعد طبي (عيادة الأسنان)",
      text: "مرحبا، أرغب في حجز موعد لتنظيف الأسنان غداً الساعة 4 عصراً باسم هشام ورقم جوالي 0503124599",
      bizId: "clinic_1"
    },`;

const replacement = `  const suggestions = [
    {
      label: "📅 حجز موعد طبي (عيادة الأسنان)",
      text: "مرحبا، أرغب في حجز موعد لتنظيف الأسنان غداً الساعة 4 عصراً باسم هشام ورقم جوالي 0503124599",
      bizId: "clinic_1"
    },
    {
      label: "🧑‍💼 طلب تحويل لموظف بشري",
      text: "أحتاج التحدث مع موظف بشري لو سمحت، واجهتني مشكلة وأحتاج مساعدة حقيقية.",
      bizId: "clinic_1"
    },`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/SandboxSimulator.tsx', code);
