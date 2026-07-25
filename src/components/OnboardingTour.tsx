import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, CheckCircle2, ChevronLeft, ChevronRight, X, Sparkles, Smartphone, Terminal, Code2 } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  
  const tourSteps = [
    {
      title: "مرحباً بك في Vertex AI",
      description: "منصتك المتكاملة لإدارة أعمالك بالذكاء الاصطناعي. دعنا نأخذك في جولة سريعة للتعرف على أهم الميزات.",
      icon: <Bot className="w-12 h-12 text-emerald-400" />,
      color: "from-emerald-500/20 to-emerald-900/20"
    },
    {
      title: "الربط مع المنصات",
      description: "من خلال قسم 'مركز الربط' يمكنك بسهولة ربط المنصة بحساباتك في واتساب، تليجرام، وانستجرام للرد التلقائي على عملائك.",
      icon: <Smartphone className="w-12 h-12 text-blue-400" />,
      color: "from-blue-500/20 to-blue-900/20"
    },
    {
      title: "محاكي الذكاء الاصطناعي",
      description: "جرب المحادثات واستمتع بضبط إعدادات الذكاء الاصطناعي في 'المحاكي' قبل تفعيلها للعملاء بشكل حي.",
      icon: <Terminal className="w-12 h-12 text-purple-400" />,
      color: "from-purple-500/20 to-purple-900/20"
    },
    {
      title: "تخصيص الهوية",
      description: "اضبط نبرة الصوت والمعلومات الخاصة بمنشأتك في قسم 'إعدادات المنشآت' لضمان ردود تتناسب مع هويتك.",
      icon: <Code2 className="w-12 h-12 text-amber-400" />,
      color: "from-amber-500/20 to-amber-900/20"
    }
  ];

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" dir="rtl">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${tourSteps[step].color} opacity-30 pointer-events-none`} />
          
          <button 
            onClick={onComplete}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <div className="p-4 bg-slate-950/50 rounded-2xl shadow-inner backdrop-blur-md border border-slate-800">
              {tourSteps[step].icon}
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                {step === 0 && <Sparkles className="w-5 h-5 text-emerald-400" />}
                {tourSteps[step].title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                {tourSteps[step].description}
              </p>
            </div>

            {/* Pagination dots */}
            <div className="flex gap-2 pt-4">
              {tourSteps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? 'w-6 bg-emerald-500' : 'w-1.5 bg-slate-700'}`} 
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center w-full justify-between pt-6 border-t border-slate-800/50">
              <button
                onClick={handlePrev}
                disabled={step === 0}
                className={`px-4 py-2 text-sm font-bold flex items-center gap-1 transition-colors ${step === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </button>
              
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-sm font-bold rounded-xl flex items-center gap-1 transition-colors shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                {step === tourSteps.length - 1 ? (
                  <>
                    ابدأ الآن
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    التالي
                    <ChevronLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
