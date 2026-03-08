import { motion } from 'framer-motion';
import { 
  Navigation, Store, Package, 
  LogOut, ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const CustomerSidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) => {
  const menuItems = [
    { id: 'shop', icon: Store, label: 'Marketplace' },
    { id: 'tracking', icon: Package, label: 'My Deliveries' }
  ];

  return (
    <motion.div 
      animate={{ width: collapsed ? 100 : 280 }}
      className="hidden lg:flex flex-col bg-white border-r border-slate-100 h-screen sticky top-0 transition-all duration-500 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* Logo Area */}
      <div className="p-8 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 shrink-0">
             <Navigation className="text-white w-6 h-6 rotate-45" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Ardi</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Customer</p>
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
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
            {!collapsed && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
            
            {activeTab === item.id && !collapsed && (
               <motion.div layoutId="active-nav-cust" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 mt-auto space-y-2">
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-rose-400 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-bold text-sm">Sign Out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
      >
        <ChevronLeft className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />
      </button>
    </motion.div>
  );
};

export default CustomerSidebar;
