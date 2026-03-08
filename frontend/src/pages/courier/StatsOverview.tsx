import { motion } from 'framer-motion';
import { TrendingUp, Package, Star, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Card = ({ icon: Icon, label, value, trend, trendValue, color, secondaryLabel }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group"
  >
    <div className={`absolute -right-8 -top-8 w-32 h-32 opacity-[0.03] transition-transform group-hover:scale-110 ${color}`}>
       <Icon className="w-full h-full" />
    </div>

    <div className="flex items-start justify-between mb-8">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6 ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trendValue}%
        </div>
      )}
    </div>

    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
        {secondaryLabel && <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{secondaryLabel}</span>}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    </div>
  </motion.div>
);

const StatsOverview = ({ earnings = 0, deliveries = 0, rating = 5.0, hours = 0 }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card 
        icon={TrendingUp}
        label="Monthly Payout"
        value={earnings}
        secondaryLabel="ETB"
        trend="up"
        trendValue="12.5"
        color="bg-emerald-600 text-white"
      />
      <Card 
        icon={Package}
        label="Completed Drops"
        value={deliveries}
        trend="up"
        trendValue="8.1"
        color="bg-blue-600 text-white"
      />
      <Card 
        icon={Star}
        label="Service Rating"
        value={rating.toFixed(1)}
        color="bg-amber-500 text-white"
      />
      <Card 
        icon={Clock}
        label="Total Road Time"
        value={hours.toFixed(1)}
        secondaryLabel="HRS"
        color="bg-violet-600 text-white"
      />
    </div>
  );
};

export default StatsOverview;
