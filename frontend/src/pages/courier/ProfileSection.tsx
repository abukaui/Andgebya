import { Shield, CheckCircle2, AlertCircle, Star, TrendingUp, Package, Clock } from 'lucide-react';
import { CourierProfile } from './types';

interface ProfileSectionProps {
  profile: CourierProfile | null;
}

const StatCard = ({ icon: Icon, label, value, color, secondaryLabel }: any) => (
  <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none group hover:-translate-y-1 transition-all duration-300">
    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="space-y-1">
      <div className="flex items-end gap-2">
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
        {secondaryLabel && <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5">{secondaryLabel}</span>}
      </div>
      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

const ProfileSection = ({ profile }: ProfileSectionProps) => {
  if (!profile) return null;

  return (
    <div className="space-y-8">
      {/* Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/30 dark:shadow-none relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-full -mr-16 -mt-16" />
        
        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-900 to-slate-700 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-slate-200 ring-8 ring-white">
            {profile.full_name.charAt(0)}
          </div>
          
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profile.full_name}</h2>
            <p className="text-slate-400 dark:text-slate-500 font-bold mt-1">{profile.email}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
              {profile.is_verified ? (
                <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" /> Trusted Partner
                </span>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-2xl text-xs font-black uppercase tracking-widest border border-amber-100">
                  <AlertCircle className="w-4 h-4" /> Identity Pending
                </span>
              )}
              <span className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-2xl text-xs font-black uppercase tracking-widest border border-blue-100">
                <Shield className="w-4 h-4" /> Bond: ETB {Number(profile.bond_amount).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Net Earnings" 
          value="0" 
          secondaryLabel="ETB"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard 
          icon={Package} 
          label="Total Drops" 
          value="0" 
          color="bg-blue-50 text-blue-600"
        />
        <StatCard 
          icon={Star} 
          label="Performance" 
          value="5.0" 
          color="bg-amber-50 text-amber-600"
        />
        <StatCard 
          icon={Clock} 
          label="Road Time" 
          value="0.0" 
          secondaryLabel="HRS"
          color="bg-violet-50 text-violet-600"
        />
      </div>
    </div>
  );
};

export default ProfileSection;
