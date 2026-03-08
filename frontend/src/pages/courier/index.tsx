import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, Bell, 
  Search, ShieldCheck, Menu, X
} from 'lucide-react';
import api from '../../services/api';

// Professional Dashboard Components
import Sidebar from './Sidebar';
import StatsOverview from './StatsOverview';
import ControlCenter from './ControlCenter';
import ProfileSection from './ProfileSection';
import DocumentUpload from './DocumentUpload';

// Types
import { CourierProfile, GeoCoords } from './types';

type CourierTab = 'dashboard' | 'map' | 'kyc';

export default function ProfessionalCourierDashboard() {
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<CourierTab>('dashboard');
  const [pingCount, setPingCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -- Load Profile --
  const loadProfile = async () => {
    try {
      const { data } = await api.get('/courier/profile');
      setProfile(data.profile);
      setIsOnline(data.profile.is_available ?? false);
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  // -- GPS Broadcasting --
  const pushLocation = useCallback(async (position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setCoords({ lat, lng });

    try {
      await api.post('/courier/location', { lat, lng });
      setLastUpdate(new Date());
      setPingCount(p => p + 1);
    } catch (err) {
      console.error('Location push failed:', err);
    }
  }, []);

  const startTracking = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('GPS Error: Hardware not found');
      return;
    }

    navigator.geolocation.getCurrentPosition(pushLocation, (err) => {
      setGeoError(`GPS Auth: ${err.message}`);
    }, { enableHighAccuracy: true });

    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(pushLocation, undefined, {
        enableHighAccuracy: true,
        maximumAge: 5000,
      });
    }, 10000);
  }, [pushLocation]);

  const stopTracking = useCallback(() => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  }, []);

  const handleToggle = async () => {
    setIsToggling(true);
    const newStatus = !isOnline;
    try {
      await api.patch('/courier/availability', { is_available: newStatus });
      setIsOnline(newStatus);
      if (newStatus) startTracking(); else stopTracking();
    } catch (err: any) {
      alert(err.response?.data?.error || 'System override failed');
    } finally {
      setIsToggling(false);
    }
  };

  useEffect(() => () => stopTracking(), [stopTracking]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 gap-8">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
        />
        <div className="text-center">
           <p className="text-xs font-black text-blue-400 uppercase tracking-[0.4em] mb-2 animate-pulse">Initializing Hub Core</p>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Protocol 9.5-ESCROW Active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Shell */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setMobileMenuOpen(false); }}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        profileName={profile?.full_name}
      />

      {/* Main Framework */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-20 h-20 px-8 flex items-center justify-between shadow-[0_2px_24px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 bg-slate-50 rounded-2xl text-slate-600"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
            
            <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                 placeholder="Search station logs..." 
                 className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 w-48"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 border-r border-slate-100 pr-6 mr-6">
               <div className="flex flex-col items-end leading-none">
                  <p className="text-xs font-black text-slate-900 tracking-tight">{profile?.full_name}</p>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                    {profile?.is_verified ? 'Verified Partner' : 'KYC Required'}
                  </p>
               </div>
               <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black">
                  {profile?.full_name.charAt(0)}
               </div>
            </div>
            
            <button className="relative p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Content Portal */}
        <main className="flex-1 p-8 lg:p-12 space-y-12">
           {/* Section Header */}
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                 <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    <span>Ardi Fleet</span>
                    <span>/</span>
                    <span className="text-blue-600">Hub Overview</span>
                 </nav>
                 <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                    Good Morning, {profile?.full_name.split(' ')[0]} ⚡
                 </h2>
                 <p className="text-slate-500 font-medium mt-4 text-lg">System health is nominal. You have 0 pending dispatch requests.</p>
              </div>

              <div className="flex items-center gap-4">
                {profile?.is_verified ? (
                  <div className="px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-black text-emerald-700 tracking-tight">Security Cleared</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setActiveTab('kyc')}
                    className="px-6 py-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3 hover:bg-amber-100 transition-colors"
                  >
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-black text-amber-700 tracking-tight">Resolve KYC Fix</span>
                  </button>
                )}
              </div>
           </div>

           <AnimatePresence mode="wait">
             {activeTab === 'dashboard' && (
               <motion.div 
                 key="dashboard"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="space-y-12"
               >
                 <StatsOverview 
                   earnings={0} 
                   deliveries={0} 
                   rating={5.0} 
                   hours={0} 
                 />

                 <ControlCenter 
                   isOnline={isOnline}
                   isToggling={isToggling}
                   handleToggle={handleToggle}
                   coords={coords}
                   geoError={geoError}
                   pingCount={pingCount}
                   lastUpdate={lastUpdate}
                 />

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ProfileSection profile={profile} />
                    
                    {/* Placeholder for Recent Activity */}
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/20">
                       <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Dispatch Activity</h4>
                       <div className="flex flex-col items-center justify-center py-12 text-center opacity-30 select-none border-2 border-dashed border-slate-50 rounded-[2rem]">
                          <Navigation className="w-16 h-16 mb-4 text-slate-300" />
                          <p className="font-black text-lg text-slate-400">No recent logs recorded</p>
                          <p className="text-xs font-bold mt-2">Go online to start receiving matches</p>
                       </div>
                    </div>
                 </div>
               </motion.div>
             )}

             {activeTab === 'kyc' && (
               <motion.div 
                 key="kyc"
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
               >
                 <DocumentUpload />
               </motion.div>
             )}
             
             {activeTab === 'map' && (
                <motion.div 
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-900 rounded-[3rem] p-1 gradient-border h-[600px] relative overflow-hidden shadow-2xl"
                >
                   {/* Map Integration Logic Placeholder */}
                   <div className="absolute inset-0 bg-[#0c111d] flex items-center justify-center">
                      <div className="text-center">
                        <motion.div 
                          animate={{ opacity: [0.3, 0.6, 0.3] }} 
                          transition={{ duration: 4, repeat: Infinity }}
                          className="w-96 h-96 border border-blue-500/10 rounded-full flex items-center justify-center"
                        >
                           <div className="w-64 h-64 border border-blue-500/20 rounded-full flex items-center justify-center">
                              <div className="w-32 h-32 border border-blue-500/30 rounded-full bg-blue-500/5 shadow-[0_0_100px_rgba(59,130,246,0.1)]" />
                           </div>
                        </motion.div>
                        <p className="font-black text-blue-400 uppercase tracking-[0.4em] mt-8">Vector Tiles Mask Active</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Connecting to Ardi-GIS Registry...</p>
                      </div>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>

           {/* Mobile Menu Backdrop */}
           <AnimatePresence>
             {mobileMenuOpen && (
                <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 lg:hidden"
                   onClick={() => setMobileMenuOpen(false)}
                />
             )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
