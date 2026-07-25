import React from 'react';
import { User, CreditCard, Building } from 'lucide-react';
import { BusinessConfig } from '../types';

interface UserProfileProps {
  user: { name: string; role: 'owner' | 'supervisor'; businessId?: string };
  business?: BusinessConfig;
}

export default function UserProfile({ user, business }: UserProfileProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <User className="w-5 h-5 text-emerald-400" />
        الملف الشخصي للمشرف
      </h2>
      
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-xl text-slate-300 font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{user.name}</h3>
            <p className="text-slate-500 text-xs">مشرف منشأة</p>
          </div>
        </div>

        {business && (
          <div className="space-y-4 pt-4">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              تفاصيل المنشأة المربوطة
            </h4>
            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500">اسم المنشأة</p>
                <p className="text-sm font-bold text-white">{business.name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500">الباقة الحالية</p>
                <p className="text-sm font-bold text-emerald-400">{business.subscriptionPlan || 'غير مفعلة'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
