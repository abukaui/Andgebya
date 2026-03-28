import { Star, Package, Clock, TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
}

const StatCard = ({ icon: Icon, label, value, color = 'text-emerald-500' }: StatCardProps) => (
  <div className="bg-white dark:bg-[#0a111b] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-900 shadow-lg dark:shadow-xl flex flex-col items-center justify-center text-center transition-transform hover:scale-105">
    <div className={`p-4 rounded-2xl bg-slate-50 dark:bg-[#020817] mb-4 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
  </div>
);

interface CourierStatsProps {
  rating: number;
  completed: number;
  earnings?: number;
  hours?: number;
}

export default function CourierStats({ rating = 0, completed = 0, earnings = 0, hours = 0 }: CourierStatsProps) {
  return (
    <div className="mx-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        icon={Star} 
        label="RATING" 
        value={rating.toFixed(1)} 
        color="text-amber-400"
      />
      <StatCard 
        icon={Package} 
        label="COMPLETED" 
        value={completed} 
        color="text-emerald-400"
      />
      {/* These additional stats can be shown on desktop or as needed */}
      <StatCard 
        icon={TrendingUp} 
        label="EARNINGS" 
        value={`$${earnings}`} 
        color="text-blue-400"
      />
      <StatCard 
        icon={Clock} 
        label="HOURS" 
        value={hours} 
        color="text-indigo-400"
      />
    </div>
  );
}
