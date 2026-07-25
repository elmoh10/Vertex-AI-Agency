import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot,
  LayoutDashboard,
  Settings,
  Smartphone,
  Calendar,
  MessageSquareWarning,
  Code2,
  Sparkles,
  Activity,
  Menu,
  X,
  Home,
  Bell,
  BellOff,
  CreditCard,
  AlertCircle,
  User
} from 'lucide-react';

// Components
import DashboardOverview from './components/DashboardOverview';
import ClientConfigurator from './components/ClientConfigurator';
import BookingsManager from './components/BookingsManager';
import ComplaintsDesk from './components/ComplaintsDesk';
import SandboxSimulator from './components/SandboxSimulator';
import IntegrationHub from './components/IntegrationHub';
import PricingManager from './components/PricingManager';
import UserProfile from './components/UserProfile';
import OnboardingTour from './components/OnboardingTour';

import { BusinessConfig, Booking, Complaint, WebhookLog, Plan } from './types';
function App() {
  const [businesses, setBusinesses] = useState<BusinessConfig[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<{ role: 'owner' | 'supervisor'; businessId?: string; name: string } | null>(null);
  const [showTour, setShowTour] = useState(false);

  // Login/Register state
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBusinessName, setRegBusinessName] = useState('');
  const [regBusinessType, setRegBusinessType] = useState('clinic');
  
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');

  const prevBookingsRef = useRef<string[]>([]);
  const prevComplaintsRef = useRef<string[]>([]);
  const isFirstLoadRef = useRef(true);
  const [notifications, setNotifications] = useState(true);

  const fetchState = async () => {
    try {
      const url = new URL('/api/state', window.location.origin);
      if (user?.role && user?.role !== 'owner' && user?.businessId) {
        url.searchParams.append('role', user.role);
        url.searchParams.append('businessId', user.businessId);
      }
      const response = await fetch(url.toString());
      const data = await response.json();
      
      const newBookings = data.bookings || [];
      const newComplaints = data.complaints || [];

      if (!isFirstLoadRef.current && notifications) {
        newBookings.forEach((b: Booking) => {
          if (!prevBookingsRef.current.includes(b.id)) {
            // new booking
            // Optional: alert or toast
          }
        });
        newComplaints.forEach((c: Complaint) => {
          if (!prevComplaintsRef.current.includes(c.id)) {
            // new complaint
          }
        });
      }
      
      prevBookingsRef.current = newBookings.map((b: Booking) => b.id);
      prevComplaintsRef.current = newComplaints.map((c: Complaint) => c.id);
      isFirstLoadRef.current = false;

      setBusinesses(data.businesses || []);
      setBookings(newBookings);
      setComplaints(newComplaints);
      setWebhookLogs(data.webhookLogs || []);
    } catch (error) {
      console.error('Failed to fetch state:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      setPlans(data);
    } catch (e) {
      console.error("Failed to fetch plans:", e);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (user) {
      if (!localStorage.getItem('vertex_tour_seen')) {
        setShowTour(true);
      }
      fetchState();
      const interval = setInterval(fetchState, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setError(data.error || 'فشل تسجيل الدخول');
      }
    } catch (err) {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          username: regEmail,
          password: regPassword,
          businessName: regBusinessName,
          businessType: regBusinessType
        })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setError(data.error || 'فشل إنشاء الحساب');
      }
    } catch (err) {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBusiness = async (updated: BusinessConfig): Promise<boolean> => {
    try {
      const response = await fetch('/api/business/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (response.ok) {
        fetchState();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleManageBooking = async (id: string, action: 'confirm' | 'cancel' | 'complete' | 'create' | 'remind', updates?: any) => {
    try {
      const response = await fetch('/api/bookings/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...updates })
      });
      if (response.ok) {
        fetchState();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleManageComplaint = async (id: string, action: 'resolve' | 'review' | 'update', updates?: any): Promise<boolean> => {
    try {
      const response = await fetch('/api/complaints/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...updates })
      });
      if (response.ok) {
        fetchState();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleResetSimulator = async () => {
    if (user?.role !== 'owner') return;
    setIsResetting(true);
    try {
      const response = await fetch('/api/reset', { method: 'POST' });
      if (response.ok) {
        fetchState();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleUpdateSubscription = async (
    id: string, 
    plan?: string, 
    status?: string, 
    expiry?: string, 
    limit?: number, 
    resetUsage?: boolean
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/subscription/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, plan, status, expiry, limit, resetUsage })
      });
      if (response.ok) {
        fetchState();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleTriggerSimulation = async (
    businessId: string, 
    message: string, 
    channel: 'whatsapp' | 'instagram',
    senderName: string,
    senderPhone: string,
  ): Promise<{ 
      success: boolean; 
      responseText: string; 
      actionDetected: boolean; 
      actionType: string; 
      actionDetailsText: string; 
      booking: Booking; 
      complaint: Complaint; 
      fullAIResult: any; 
  }> => {
    try {
      const response = await fetch('/api/simulate-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, message, channel, senderName, senderPhone })
      });
      if (!response.ok) {
        throw new Error('Simulation failed');
      }
      return await response.json();
    } catch (e) {
      console.error('Error triggering simulation:', e);
      return {
        success: false,
        responseText: 'عذراً، حدث خطأ أثناء الاتصال بالمحاكي.',
        actionDetected: false,
        actionType: '',
        actionDetailsText: '',
        booking: {} as Booking,
        complaint: {} as Complaint,
        fullAIResult: {}
      };
    }
  };

  const handleCreateBusiness = async (name: string, type: string) => {
    try {
      await fetch('/api/business/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      });
      fetchState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    try {
      await fetch('/api/business/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchState();
    } catch (e) {
      console.error(e);
    }
  };

  const activeBusiness = user?.role !== 'owner' ? businesses.find(b => b.id === user?.businessId) : undefined;
  const currentPlan = activeBusiness ? plans.find(p => p.id === activeBusiness.subscriptionPlan) : undefined;
  const hasComplaints = user?.role === 'owner' || (currentPlan && currentPlan.limits?.hasComplaints);
  
  const visibleBookings = user?.role === 'owner' ? bookings : bookings.filter(b => b.businessId === user?.businessId);
  const visibleComplaints = user?.role === 'owner' ? complaints : complaints.filter(c => c.businessId === user?.businessId);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-right" dir="rtl">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
              <Bot className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white text-center">Vertex AI Agency</h1>
            <p className="text-slate-400 text-sm mt-2 text-center">منصة ادارة المنشات بالذكاء الاصطناعي</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setLoginMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMode === 'login' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-300'}`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setLoginMode('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMode === 'register' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-300'}`}
            >
              إنشاء حساب
            </button>
          </div>

          {error && (
            <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded-xl text-xs text-rose-400 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {loginMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">البريد الإلكتروني</label>
                <input type="text" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500" dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">كلمة المرور</label>
                <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500" dir="ltr" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs mt-2">
                {loading ? 'جاري التحقق...' : 'دخول'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">الاسم</label>
                <input type="text" required value={regName} onChange={e => setRegName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">البريد الإلكتروني</label>
                <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500" dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">كلمة المرور</label>
                <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500" dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">اسم المنشأة</label>
                <input type="text" required value={regBusinessName} onChange={e => setRegBusinessName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1.5">النشاط</label>
                <select value={regBusinessType} onChange={e => setRegBusinessType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-emerald-500">
                  <option value="clinic">عيادة</option>
                  <option value="restaurant">مطعم</option>
                  <option value="cafe">مقهى</option>
                  <option value="service">خدمات</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs mt-2">
                {loading ? 'جاري التأسيس...' : 'إنشاء الحساب'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'config', label: 'تهيئة العملاء', icon: Settings },
    { id: 'bookings', label: 'إدارة الحجوزات', icon: Calendar },
    ...(hasComplaints ? [{ id: 'complaints', label: 'مكتب الشكاوى', icon: MessageSquareWarning }] : []),
    { id: 'simulator', label: 'محاكي الذكاء الاصطناعي', icon: Sparkles },
    { id: 'integrations', label: 'الربط والقنوات', icon: Smartphone },
    { id: 'pricing', label: 'الباقات والاشتراكات', icon: CreditCard },
    ...(user?.role === 'supervisor' ? [{ id: 'profile', label: 'ملفي الشخصي', icon: User }] : [])
  ];

  const renderContent = () => {
    let content;
    switch (activeTab) {
      case 'dashboard':
        content = <DashboardOverview bookings={visibleBookings} complaints={visibleComplaints} webhookLogs={webhookLogs} onNavigate={setActiveTab} onReset={handleResetSimulator} isResetting={isResetting} user={user} />;
        break;
      case 'config':
        content = <ClientConfigurator businesses={businesses} webhookLogs={webhookLogs} onUpdateBusiness={handleUpdateBusiness} onCreateBusiness={handleCreateBusiness} onDeleteBusiness={handleDeleteBusiness} currentUser={user!} />;
        break;
      case 'profile':
        content = <UserProfile user={user!} business={activeBusiness} />;
        break;
      case 'bookings':
        content = <BookingsManager bookings={visibleBookings} businesses={businesses} plans={plans} onManageBooking={handleManageBooking} currentUser={user!} />;
        break;
      case 'complaints':
        content = <ComplaintsDesk complaints={visibleComplaints} businesses={businesses} onManageComplaint={handleManageComplaint} currentUser={user!} />;
        break;
      case 'simulator':
        content = <SandboxSimulator businesses={businesses} onTriggerSimulation={handleTriggerSimulation} onRefreshData={fetchState} />;
        break;
      case 'integrations':
        content = <IntegrationHub businesses={businesses} plans={plans} currentUser={user} />;
        break;
      case 'pricing':
        content = <PricingManager businesses={businesses} onUpdateSubscription={handleUpdateSubscription} user={user!} />;
        break;
      default:
        content = <DashboardOverview bookings={visibleBookings} complaints={visibleComplaints} webhookLogs={webhookLogs} onNavigate={setActiveTab} onReset={handleResetSimulator} isResetting={isResetting} user={user} />;
        break;
    }
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-sm">Vertex AI</h2>
            <p className="text-[10px] text-slate-500">Agency Platform v3.5</p>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === item.id ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.role === 'owner' ? 'مدير الوكالة' : 'مشرف منشأة'}</p>
              </div>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="w-full py-2 text-xs font-bold text-rose-400 hover:bg-rose-950 hover:text-rose-300 rounded-lg transition-colors">
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header (Mobile) */}
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-500" />
            <h2 className="font-black text-sm">Vertex AI</h2>
          </div>
          {/* Mobile menu toggle would go here */}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {renderContent()}
        </div>
            </div>
      {showTour && (
        <OnboardingTour 
          onComplete={() => {
            setShowTour(false);
            localStorage.setItem('vertex_tour_seen', 'true');
          }} 
        />
      )}
    </div>
  );
}

export default App;
