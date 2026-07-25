import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Phone, Tag, Calendar, Activity, MessageSquareWarning, Building2, Filter } from 'lucide-react';
import { Customer, BusinessConfig } from '../types';

interface CRMManagerProps {
  customers: Customer[];
  businesses: BusinessConfig[];
  userRole: 'owner' | 'supervisor';
}

export default function CRMManager({ customers, businesses, userRole }: CRMManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBizId, setSelectedBizId] = useState<string>('all');

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm);
    const matchesBiz = selectedBizId === 'all' || c.businessId === selectedBizId;
    return matchesSearch && matchesBiz;
  }).sort((a, b) => new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime());

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            إدارة علاقات العملاء (CRM)
          </h2>
          <p className="text-slate-400 text-sm mt-1">تتبع عملائك، حلل تفاعلاتهم، وافهم احتياجاتهم بشكل أفضل.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث بالاسم أو الهاتف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl py-2.5 pr-10 pl-4 focus:outline-none focus:border-emerald-500 transition-colors w-full sm:w-64"
            />
          </div>
          
          {userRole === 'owner' && (
            <select
              value={selectedBizId}
              onChange={(e) => setSelectedBizId(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="all">جميع المنشآت</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">إجمالي العملاء</p>
            <p className="text-2xl font-bold text-white">{filteredCustomers.length}</p>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">العملاء النشطين (هذا الشهر)</p>
            <p className="text-2xl font-bold text-white">
              {filteredCustomers.filter(c => new Date(c.lastInteraction) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">متوسط الحجوزات للعميل</p>
            <p className="text-2xl font-bold text-white">
              {filteredCustomers.length > 0 
                ? (filteredCustomers.reduce((acc, curr) => acc + curr.totalBookings, 0) / filteredCustomers.length).toFixed(1) 
                : '0'}
            </p>
          </div>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center">
          <Users className="w-12 h-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-300">لا يوجد عملاء</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-md">لم يتم العثور على أي عملاء يطابقون معايير البحث الخاصة بك.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-950/50 text-slate-400 text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4 rounded-tr-2xl">معلومات العميل</th>
                  {userRole === 'owner' && <th className="px-6 py-4">المنشأة</th>}
                  <th className="px-6 py-4">التفاعلات</th>
                  <th className="px-6 py-4">آخر تواصل</th>
                  <th className="px-6 py-4 rounded-tl-2xl">الوسوم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredCustomers.map((customer) => (
                  <motion.tr 
                    key={customer.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold shrink-0">
                          {customer.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">{customer.name}</div>
                          <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span dir="ltr">{customer.phone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    {userRole === 'owner' && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                          <Building2 className="w-3 h-3" />
                          {businesses.find(b => b.id === customer.businessId)?.name || 'غير معروف'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col" title="الحجوزات">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar className="w-3 h-3"/> حجوزات</span>
                          <span className="font-bold text-slate-200">{customer.totalBookings}</span>
                        </div>
                        <div className="flex flex-col" title="الشكاوى">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1"><MessageSquareWarning className="w-3 h-3"/> شكاوى</span>
                          <span className="font-bold text-slate-200">{customer.totalComplaints}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300">
                        {new Date(customer.lastInteraction).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        {new Date(customer.lastInteraction).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags && customer.tags.map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
