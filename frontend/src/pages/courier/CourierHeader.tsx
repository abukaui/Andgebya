import { motion } from 'framer-motion';
import { User } from 'lucide-react';

interface CourierHeaderProps {
  profile: any;
  isOnline: boolean;
  onToggle: () => void;
  isToggling: boolean;
}

export default function CourierHeader({ profile, isOnline, onToggle, isToggling }: CourierHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-6 bg-white dark:bg-[#020817] sticky top-0 z-30 border-b border-slate-50 dark:border-slate-900 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-3">
        {/* Profile Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            {profile?.profile_image_url ? (
              <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="text-slate-400 w-6 h-6" />
            )}
          </div>
          {/* Status Dot */}
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#020817] ${isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-500'}`} />
        </div>

        {/* User Info */}
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
            {profile?.full_name || 'Ardi Courier'}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            PARTNER PORTAL
          </p>
        </div>
      </div>

      {/* Online/Offline Toggle Pill */}
      <button
        onClick={onToggle}
        disabled={isToggling}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 border ${
          isOnline 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20' 
            : 'bg-slate-50 dark:bg-slate-800/10 text-slate-500 border-slate-200 dark:border-slate-800/20'
        } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-500'}`} />
        <span className="text-[10px] font-black uppercase tracking-[0.1em]">
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
      </button>
    </header>
  );
}
