import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Moon, Sun, Bell, Settings as SettingsIcon,
  Store as StoreIcon, Navigation, Shield, Check, UserIcon, Loader2
} from 'lucide-react';
import api from '../services/api';
import { useSettings } from '../context/SettingsContext';

interface SettingsProps {
  role: 'customer' | 'merchant' | 'courier';
  userName?: string;
  userEmail?: string;
  initialSettings?: any;
}

export default function SettingsView({ role, userName, userEmail, initialSettings }: SettingsProps) {
  const { theme, language, setTheme, setLanguage, t } = useSettings();

  // Role Specific State
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [autoAcceptOn, setAutoAcceptOn] = useState(false);
  const [navApp, setNavApp] = useState<'google' | 'waze'>('google');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with initialSettings if provided (usually from parent profile fetch)
  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.pushEnabled !== undefined) setPushEnabled(initialSettings.pushEnabled);
      if (initialSettings.smsEnabled !== undefined) setSmsEnabled(initialSettings.smsEnabled);
      if (initialSettings.autoAcceptOn !== undefined) setAutoAcceptOn(initialSettings.autoAcceptOn);
      if (initialSettings.navApp) setNavApp(initialSettings.navApp);
    }
  }, [initialSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const settingsPayload = {
        theme,
        language,
        pushEnabled,
        smsEnabled,
        autoAcceptOn,
        navApp
      };
      
      await api.put('/auth/profile', { settings: settingsPayload });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const languages = ['English', 'Amharic', 'Oromic'];
  const RoleIcon = role === 'courier' ? Navigation : role === 'merchant' ? StoreIcon : UserIcon;

  return (
    <div className="max-w-4xl mx-auto w-full p-4 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Header Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 dark:bg-slate-800 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 transition-colors" />
        
        <div className="flex items-start gap-6 relative z-10">
          <div className="w-20 h-20 bg-slate-900 dark:bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 dark:shadow-none shrink-0 transition-colors">
             <RoleIcon className={`text-white w-10 h-10 ${role === 'courier' ? 'rotate-45' : ''}`} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{userName || 'User Settings'}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{userEmail || 'Manage your Ardi experience.'}</p>
            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
               <Shield className="w-3 h-3 text-slate-500 dark:text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{role} Account</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Universal Settings */}
        <div className="space-y-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors">
             <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 transition-colors">
                <SettingsIcon className="w-5 h-5 text-slate-400" /> {t('settings.title')}
             </h2>
             
             {/* Theme Toggle */}
             <div className="mb-8">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">{t('settings.theme')}</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl transition-colors">
                   <button 
                     onClick={() => setTheme('light')}
                     className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                       theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                     }`}
                   >
                     <Sun className="w-4 h-4" /> {t('common.light')}
                   </button>
                   <button 
                     onClick={() => setTheme('dark')}
                     className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                       theme === 'dark' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                     }`}
                   >
                     <motion.div initial={false} animate={{ rotate: theme === 'dark' ? 0 : 90 }}>
                        <Moon className="w-4 h-4" />
                     </motion.div>
                     {t('common.dark')}
                   </button>
                </div>
             </div>

             {/* Language Selection */}
             <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 lowercase">
                   <Globe className="w-4 h-4 text-slate-400" /> {t('settings.language')}
                </label>
                <div className="space-y-2">
                   {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang as any)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          language === lang 
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10' 
                            : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                         <span className={`font-bold text-sm ${language === lang ? 'text-blue-900 dark:text-blue-400' : 'text-slate-700 dark:text-slate-400'}`}>
                            {lang}
                         </span>
                         {language === lang && (
                            <motion.div layoutId="check-lang" className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                               <Check className="w-3 h-3 text-white" />
                            </motion.div>
                         )}
                      </button>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Role Specific Settings */}
        <div className="space-y-8">
          
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors">
             <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 transition-colors">
                <Bell className="w-5 h-5 text-slate-400" /> 
                {role === 'customer' ? 'Notifications' : 'Operations'}
             </h2>

             {/* Customer Specific */}
             {role === 'customer' && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Push Notifications</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Delivery tracking and order updates</p>
                     </div>
                     <button 
                       onClick={() => setPushEnabled(!pushEnabled)}
                       className={`w-12 h-6 rounded-full transition-colors relative ${pushEnabled ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                     >
                        <motion.div 
                          className="w-4 h-4 bg-white rounded-full absolute top-1"
                          animate={{ left: pushEnabled ? '26px' : '4px' }}
                        />
                     </button>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">SMS Alerts</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Critical courier messages</p>
                     </div>
                     <button 
                       onClick={() => setSmsEnabled(!smsEnabled)}
                       className={`w-12 h-6 rounded-full transition-colors relative ${smsEnabled ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                     >
                        <motion.div 
                          className="w-4 h-4 bg-white rounded-full absolute top-1"
                          animate={{ left: smsEnabled ? '26px' : '4px' }}
                        />
                     </button>
                   </div>
                </div>
             )}

             {/* Merchant Specific */}
             {role === 'merchant' && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <div className="pr-4">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Auto-Accept Orders</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Automatically confirm incoming requests without manual approval.</p>
                     </div>
                     <button 
                       onClick={() => setAutoAcceptOn(!autoAcceptOn)}
                       className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${autoAcceptOn ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                     >
                        <motion.div 
                          className="w-4 h-4 bg-white rounded-full absolute top-1"
                          animate={{ left: autoAcceptOn ? '26px' : '4px' }}
                        />
                     </button>
                   </div>

                   <hr className="border-slate-100 dark:border-slate-800" />
                   
                   <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm mb-3">Store State</p>
                      <button className="w-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-sm py-4 rounded-2xl border border-transparent hover:border-rose-200 transition-all shadow-sm">
                         Emergency Pause Sales
                      </button>
                   </div>
                </div>
             )}

             {/* Courier Specific */}
             {role === 'courier' && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                     <div className="pr-4">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Auto-Accept Dispatch</p>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Automatically win matches when broadcasting</p>
                     </div>
                     <button 
                       onClick={() => setAutoAcceptOn(!autoAcceptOn)}
                       className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${autoAcceptOn ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                     >
                        <motion.div 
                          className="w-4 h-4 bg-white rounded-full absolute top-1"
                          animate={{ left: autoAcceptOn ? '26px' : '4px' }}
                        />
                     </button>
                   </div>

                   <hr className="border-slate-100 dark:border-slate-800" />

                   <div>
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">Navigation Preference</label>
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl transition-colors">
                         <button 
                           onClick={() => setNavApp('google')}
                           className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                             navApp === 'google' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                           }`}
                         >
                           Google Maps
                         </button>
                         <button 
                           onClick={() => setNavApp('waze')}
                           className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                             navApp === 'waze' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                           }`}
                         >
                           Waze
                         </button>
                      </div>
                   </div>
                </div>
             )}

          </div>
          
          <div className="text-center">
             <button 
               onClick={handleSave}
               disabled={saving}
               className={`px-8 py-4 text-white font-black rounded-2xl shadow-xl transition-all w-full md:w-auto flex items-center justify-center gap-3 ${
                 saveSuccess ? 'bg-emerald-500 shadow-emerald-100' : 'bg-slate-900 dark:bg-blue-600 shadow-slate-200 dark:shadow-none hover:scale-[1.02]'
               }`}
             >
                {saving ? (
                   <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
                ) : saveSuccess ? (
                   <><Check className="w-5 h-5" /> Saved!</>
                ) : (
                   t('settings.save')
                )}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
