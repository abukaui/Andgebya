import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

// Redesigned Components
import Sidebar from './Sidebar';
import CourierHeader from './CourierHeader';
import BalanceCard from './BalanceCard';
import CourierStats from './CourierStats';
import JobRequestCard from './JobRequestCard';
import CourierNavigation from './CourierNavigation';
import VerificationAlert from './VerificationAlert';

// Existing Views
import DocumentUpload from './DocumentUpload';
import TasksView from './TasksView';
import ProfileSettingsModal from '../../components/ProfileSettingsModal';
import SettingsView from '../../components/SettingsView';
import { useSettings } from '../../context/SettingsContext';
import { Job } from './JobNotificationModal';

// Types
import { CourierProfile } from './types';

type CourierTab = 'dashboard' | 'tasks' | 'map' | 'kyc' | 'settings';

export default function ProfessionalCourierDashboard() {
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const { } = useSettings();
  const [activeTab, setActiveTab] = useState<CourierTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState<Job | null>(null);

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

    try {
      await api.post('/courier/location', { lat, lng });
    } catch (err) {
      console.error('Location push failed:', err);
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('GPS Error: Hardware not found');
      return;
    }

    navigator.geolocation.getCurrentPosition(pushLocation, (err) => {
      console.error(`GPS Auth: ${err.message}`);
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
    if (profile && !profile.is_verified) {
      if (profile.kyc_status === 'pending') {
        alert('Your verification is currently under review by Ardi admins. You will be notified once approved.');
      } else {
        alert('Identity verification required. Please complete the verification process to go online.');
      }
      return;
    }
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

  // -- Job Polling Logic --
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const pollJobs = async () => {
      if (!isOnline || activeJob) return;
      try {
        const { data } = await api.get('/delivery/available');
        if (data.jobs && data.jobs.length > 0) {
          setActiveJob(data.jobs[0]);
        }
      } catch (err) {
        console.error('Failed to poll jobs', err);
      }
    };

    if (isOnline) {
      interval = setInterval(pollJobs, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnline, activeJob]);

  const handleAcceptJob = async (jobId: string) => {
    try {
      await api.post(`/delivery/${jobId}/accept`);
      setActiveJob(null);
      loadProfile();
    } catch (err: any) {
      throw err;
    }
  };

  const handleRejectJob = () => {
    setActiveJob(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020817] gap-8">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        />
        <div className="text-center">
           <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em] mb-2 animate-pulse">Initializing Hub Core</p>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Protocol Premium-V2.1 Active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020817] flex overflow-hidden lg:pb-0 pb-24 transition-colors duration-500">
      {/* Sidebar (Desktop) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => setActiveTab(t)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Framework */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative scrollbar-hide">
        {/* Top Header (Shared) */}
        <CourierHeader 
          profile={profile} 
          isOnline={isOnline} 
          onToggle={handleToggle}
          isToggling={isToggling}
        />

        {/* Content Portal */}
        <main className="flex-1 max-w-7xl mx-auto w-full py-8 space-y-8">
           <AnimatePresence mode="wait">
             {activeTab === 'dashboard' && (
                <motion.div 
                   key="dashboard"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="space-y-8"
                >
                  {/* Balance Card */}
                  <BalanceCard 
                    balance={profile?.balance ?? 250} 
                    currency={profile?.settings?.currency || 'ETB'} 
                  />

                  {/* Stats Overview */}
                  <CourierStats 
                    rating={profile?.rating ?? 4.8} 
                    completed={profile?.completed_deliveries ?? 128} 
                    earnings={profile?.total_earnings ?? 0}
                    hours={profile?.total_hours ?? 0}
                  />

                  {/* Verification Alert (shown if NOT verified AND NOT pending) */}
                  {profile && !profile.is_verified && profile.kyc_status !== 'pending' && (
                    <VerificationAlert onAction={() => setActiveTab('kyc')} />
                  )}

                  {/* Job Request or Trip Card */}
                  <div className="space-y-6">
                    {activeJob && (
                      <JobRequestCard 
                        job={activeJob} 
                        onAccept={handleAcceptJob} 
                        onReject={handleRejectJob}
                        isAccepting={isToggling}
                      />
                    )}

                    {!activeJob && (
                      <div className="mx-6 p-10 bg-white dark:bg-[#0a111b] rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-900 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-[#020817] rounded-2xl flex items-center justify-center mb-4 transition-colors">
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                             <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             </div>
                          </motion.div>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Listening for Dispatches</h4>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 px-12 leading-relaxed">
                          Your telemetry is broadcasted to nearby hubs. Keep station online for high-priority matches.
                        </p>
                      </div>
                    )}

                    {/* Recent History Shortcut */}
                    <div className="mx-6 p-6 bg-white dark:bg-[#0a111b] rounded-[2rem] border border-slate-100 dark:border-slate-900 shadow-sm dark:shadow-none flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-none">Last Trip</p>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Bole to Piazza • 12 mins</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 dark:text-white">+32 ETB</p>
                        <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">COMPLETED</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
             )}

             {activeTab === 'tasks' && (
                <motion.div 
                   key="tasks"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                >
                   <TasksView />
                </motion.div>
             )}

             {activeTab === 'kyc' && (
                <motion.div 
                   key="kyc"
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.98 }}
                >
                   <DocumentUpload 
                     status={profile?.kyc_status} 
                     onUploadSuccess={loadProfile} 
                   />
                </motion.div>
             )}
             
             {activeTab === 'map' && (
                <motion.div 
                   key="map"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="mx-6 bg-slate-900 rounded-[3rem] p-1 h-[600px] relative overflow-hidden shadow-2xl border border-slate-800"
                >
                   <div className="absolute inset-0 bg-[#020817] flex items-center justify-center">
                      <div className="text-center">
                        <motion.div 
                          animate={{ opacity: [0.3, 0.6, 0.3] }} 
                          transition={{ duration: 4, repeat: Infinity }}
                          className="w-96 h-96 border border-emerald-500/10 rounded-full flex items-center justify-center"
                        >
                           <div className="w-64 h-64 border border-emerald-500/20 rounded-full flex items-center justify-center">
                              <div className="w-32 h-32 border border-emerald-500/30 rounded-full bg-emerald-500/5 shadow-[0_0_100px_rgba(16,185,129,0.1)]" />
                           </div>
                        </motion.div>
                        <p className="font-black text-emerald-400 uppercase tracking-[0.4em] mt-8">GIST Tiles Active</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Connecting to Ardi-GIS Registry Sub-system...</p>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeTab === 'settings' && (
                <motion.div 
                   key="settings"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                >
                   <SettingsView 
                     role="courier" 
                     userName={profile?.full_name} 
                     userEmail={profile?.email} 
                     initialSettings={profile?.settings}
                   />
                </motion.div>
             )}
           </AnimatePresence>

           {/* Profile Modal */}
           {isProfileModalOpen && profile && (
              <ProfileSettingsModal 
                 user={profile as any}
                 onClose={() => setIsProfileModalOpen(false)}
                 onSuccess={(updatedUser) => {
                   setProfile(updatedUser as any);
                   setIsProfileModalOpen(false);
                 }}
              />
           )}
        </main>

        {/* Bottom Navigation (Mobile) */}
        <CourierNavigation 
          activeTab={activeTab} 
          setActiveTab={(t) => setActiveTab(t)} 
        />
      </div>
    </div>
  );
}
