import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Loader2, MapPin, Radio, Activity } from 'lucide-react';
import { GeoCoords } from './types';

interface ControlCenterProps {
  isOnline: boolean;
  isToggling: boolean;
  handleToggle: () => void;
  coords: GeoCoords | null;
  pingCount: number;
}

const ControlCenter = ({
  isOnline,
  isToggling,
  handleToggle,
  coords,
  pingCount
}: ControlCenterProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Primary Toggle Card */}
      <div className={`lg:col-span-2 rounded-[3rem] p-10 transition-all duration-700 border shadow-2xl relative overflow-hidden ${
        isOnline 
          ? 'bg-slate-900 border-slate-800 shadow-slate-200' 
          : 'bg-white border-slate-100 shadow-slate-200/20'
      }`}>
        {isOnline && (
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Radio className="w-48 h-48 text-blue-500 animate-pulse" />
           </div>
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 block ${isOnline ? 'text-blue-400' : 'text-slate-400'}`}>
                System Deployment Status
              </span>
              <h3 className={`text-4xl font-black tracking-tighter transition-colors duration-500 ${isOnline ? 'text-white' : 'text-slate-900'}`}>
                {isOnline ? 'Mission Active' : 'Station Dormant'}
              </h3>
            </div>
            
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`group relative w-24 h-12 rounded-full transition-all duration-500 ${
                isOnline ? 'bg-blue-600' : 'bg-slate-100 border border-slate-200'
              } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
            >
              <motion.div 
                className={`absolute top-1.5 w-9 h-9 rounded-full shadow-xl flex items-center justify-center z-10 transition-colors ${
                  isOnline ? 'bg-white' : 'bg-slate-400'
                }`}
                animate={{ left: isOnline ? 'calc(100% - 42px)' : '6px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                {isToggling ? (
                  <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                ) : isOnline ? (
                  <Activity className="w-5 h-5 text-blue-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-white" />
                )}
              </motion.div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className={`p-6 rounded-[2rem] border transition-colors ${
              isOnline ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'
            }`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isOnline ? 'text-slate-500' : 'text-slate-400'}`}>Telemetry Feed</p>
              <AnimatePresence mode="wait">
                {isOnline ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {coords ? (
                      <div className="space-y-4">
                         <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-white font-mono">{coords.lat.toFixed(4)}°</span>
                            <span className="text-[10px] font-bold text-blue-400 uppercase">Latitude</span>
                         </div>
                         <div className="flex justify-between items-end">
                            <span className="text-2xl font-black text-white font-mono">{coords.lng.toFixed(4)}°</span>
                            <span className="text-[10px] font-bold text-blue-400 uppercase">Longitude</span>
                         </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-xs font-bold uppercase tracking-widest">Awaiting Fix...</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <p className="text-sm font-bold text-slate-300 italic text-center py-4">Sensors Disconnected</p>
                )}
              </AnimatePresence>
            </div>

            <div className={`p-6 rounded-[2rem] border transition-colors ${
              isOnline ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'
            }`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isOnline ? 'text-slate-500' : 'text-slate-400'}`}>Live Health</p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Network Latency</span>
                    <span className={`text-xs font-black ${isOnline ? 'text-emerald-400' : 'text-slate-300'}`}>24ms</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Data Pings</span>
                    <span className={`text-xs font-black ${isOnline ? 'text-white' : 'text-slate-300'}`}>{pingCount}</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1 mt-2">
                    <motion.div 
                      animate={{ width: isOnline ? '100%' : '0%' }}
                      className="bg-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Status Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none flex flex-col justify-between transition-colors">
        <div className="space-y-6">
           <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center text-blue-600">
              <MapPin className="w-8 h-8" />
           </div>
           <div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Addis Ababa Core</h4>
              <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-1">Operational sector: BOLE</p>
           </div>
        </div>

        <div className="pt-8 border-t border-slate-50 mt-8">
           <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Dispatcher Online</span>
           </div>
           <p className="text-xs text-slate-400 font-medium leading-relaxed">System syncing with PostGIS GIST index for sub-300ms matching.</p>
        </div>
      </div>
    </div>
  );
};

export default ControlCenter;
