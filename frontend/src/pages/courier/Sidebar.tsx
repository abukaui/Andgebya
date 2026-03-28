import { motion } from 'framer-motion';
import { 
  Home, ClipboardList, Wallet, User, ShieldCheck,
  LogOut, Navigation, ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'tasks', icon: ClipboardList, label: 'Tasks' },
    { id: 'kyc', icon: ShieldCheck, label: 'Verification' },
    { id: 'map', icon: Wallet, label: 'Wallet' },
    { id: 'settings', icon: User, label: 'Profile' },
  ];

  return (
    <motion.div 
      animate={{ width: collapsed ? 80 : 280 }}
      className="hidden lg:flex flex-col bg-slate-50 dark:bg-[#0a111b] border-r border-slate-100 dark:border-slate-900 h-screen sticky top-0 transition-all z-30 shadow-sm dark:shadow-2xl"
    >
      {/* Brand Area */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-[#020817] rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner shrink-0 group hover:border-emerald-500/30 transition-colors">
             <Navigation className="text-emerald-500 dark:text-emerald-400 w-6 h-6 rotate-45" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Ardi</h1>
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest leading-none">Fleet Partner</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative ${
              activeTab === item.id 
                ? 'bg-emerald-500 text-white dark:text-[#020817]' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-900/50'
            }`}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
            {!collapsed && <span className="font-black text-sm tracking-tight">{item.label}</span>}
            
            {activeTab === item.id && !collapsed && (
               <motion.div layoutId="active-nav-desktop" className="absolute left-0 w-1.5 h-6 bg-emerald-600 dark:bg-white rounded-r-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 mt-auto">
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/5 transition-all group"
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="font-black text-sm tracking-tight">Disconnect</span>}
        </button>
      </div>

      {/* Collapse Action */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-[#0a111b] border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-40"
      >
        <ChevronLeft className={`w-4 h-4 text-slate-400 dark:text-white transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />
      </button>
    </motion.div>
  );
}
