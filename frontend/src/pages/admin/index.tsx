import { useState, useEffect } from 'react';
import { Users, DollarSign, LogOut, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import PaymentRecordsList from './PaymentRecordsList';
import CourierManagement from './CourierManagement';
import { AdminProfile, PaymentRecord, AdminCourier } from './types';

export default function AdminDashboard() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [couriers, setCouriers] = useState<AdminCourier[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'couriers'>('payments');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [profileRes, paymentsRes, couriersRes] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/admin/payment-records'),
        api.get('/admin/couriers')
      ]);
      setProfile(profileRes.data.user);
      setPaymentRecords(paymentsRes.data.records);
      setCouriers(couriersRes.data.couriers);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totalEscrow = paymentRecords
    .filter(r => r.status === 'held_in_escrow')
    .reduce((sum, r) => sum + Number(r.total_paid), 0);

  const totalPlatformFees = paymentRecords
    .filter(r => r.status === 'released')
    .reduce((sum, r) => sum + Number(r.platform_fee), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 flex flex-col hidden lg:flex">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-black text-xl text-slate-900 shadow-lg shadow-amber-500/20">
            A
          </div>
          <span className="text-xl font-black tracking-tight">Ardi Admin</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'payments' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <DollarSign className="w-5 h-5" />
            Financials (Escrow)
          </button>
          <button 
            onClick={() => setActiveTab('couriers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${activeTab === 'couriers' ? 'bg-amber-500/10 text-amber-500' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            Courier Management
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10">
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all font-bold"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ardi Command Center</h1>
              <p className="text-slate-500 font-medium mt-1">Manage platform financials and courier bonds.</p>
            </div>
            {profile && (
              <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{profile.full_name}</p>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{profile.role}</p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 font-bold">
                  {profile.full_name.charAt(0)}
                </div>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 flex items-center justify-center rounded-2xl mb-4">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-500">Funds in Escrow</p>
                <p className="text-3xl font-black text-slate-900 mt-1">ETB {totalEscrow.toFixed(2)}</p>
             </div>
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-2xl mb-4">
                  <DollarSign className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-500">Platform Fees Collected</p>
                <p className="text-3xl font-black text-slate-900 mt-1">ETB {totalPlatformFees.toFixed(2)}</p>
             </div>
             <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-500">Total Couriers</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{couriers.length}</p>
             </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 min-h-[500px]">
            {activeTab === 'payments' ? (
              <PaymentRecordsList records={paymentRecords} />
            ) : (
              <CourierManagement 
                couriers={couriers} 
                onCourierUpdate={() => loadData()} // Reload to show new bond amount
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
