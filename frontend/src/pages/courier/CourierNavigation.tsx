import { motion } from 'framer-motion';
import { Home, ClipboardList, Wallet, User } from 'lucide-react';

interface CourierNavigationProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export default function CourierNavigation({ activeTab, setActiveTab }: CourierNavigationProps) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'HOME' },
    { id: 'tasks', icon: ClipboardList, label: 'TASKS' },
    { id: 'map', icon: Wallet, label: 'WALLET' },
    { id: 'settings', icon: User, label: 'PROFILE' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#0a111b]/80 backdrop-blur-2xl border-t border-slate-100 dark:border-slate-900 px-6 py-4 flex items-center justify-between z-50">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-all ${
              isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <div className={`relative p-2 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/10' : ''}`}>
              <tab.icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
              {isActive && (
                <motion.div 
                  layoutId="active-nav-dot" 
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 dark:bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" 
                />
              )}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
