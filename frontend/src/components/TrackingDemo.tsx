import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Package, Bell, User, Star } from 'lucide-react';

export default function TrackingDemo() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Courier is at the shop');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setStatus('Delivered! 🎉');
          return 100;
        }
        if (prev > 40) setStatus('In transit to your location');
        return prev + 1;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const reset = () => {
    setProgress(0);
    setStatus('Courier is at the shop');
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-slate-900 overflow-hidden relative aspect-[9/19]">
      {/* Phone Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20" />
      
      {/* App Header */}
      <div className="bg-white/80 backdrop-blur-md pt-12 pb-4 px-6 sticky top-0 z-10 border-b border-slate-100">
        <div className="flex justify-between items-center text-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Compass className="w-4 h-4 text-blue-600 animate-spin-slow" />
            </div>
            <span className="font-bold text-sm tracking-tight">Active Delivery</span>
          </div>
          <Bell className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Map Content */}
      <div className="h-full bg-slate-50 relative overflow-hidden flex flex-col">
        {/* Abstract Map Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100h400M0 300h400M0 500h400M100 0v800M300 0v800" stroke="#CBD5E1" strokeWidth="2" fill="none" />
            <circle cx="200" cy="400" r="100" stroke="#CBD5E1" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* Tracking Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <motion.path
            d="M 200 600 Q 300 400 200 200"
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <motion.path
            d="M 200 600 Q 300 400 200 200"
            fill="transparent"
            stroke="#2563EB"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ type: "tween" }}
          />
        </svg>

        {/* Pins */}
        <div className="relative flex-1">
          {/* Shop */}
          <div className="absolute top-[200px] left-[200px] -translate-x-1/2 -translate-y-1/2">
            <div className="bg-green-100 p-2 rounded-lg border border-green-200">
              <Package className="w-5 h-5 text-green-600" />
            </div>
          </div>

          {/* User */}
          <div className="absolute top-[600px] left-[200px] -translate-x-1/2 -translate-y-1/2">
            <div className="bg-primary-100 p-2 rounded-lg border border-primary-200 animate-pulse">
              <MapPin className="w-5 h-5 text-primary-600" />
            </div>
          </div>

          {/* Courier Avatar (Moving) */}
          <motion.div 
            className="absolute z-10"
            style={{ 
              top: 600 - (400 * (progress/100)),
              left: 200 + (Math.sin(progress/20) * 30),
              x: '-50%',
              y: '-50%'
            }}
          >
            <div className="bg-white p-1 rounded-full shadow-lg border-2 border-primary-500">
               <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <User className="text-white w-6 h-6" />
               </div>
            </div>
          </motion.div>
        </div>

        {/* Status Card (Floating) */}
        <div className="px-6 pb-24 mt-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">Abebe B.</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-slate-500 font-medium">4.9 · Toyota Vitz</span>
                  </div>
                </div>
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">
                  EN ROUTE
                </div>
              </div>
              
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-slate-800">{status}</p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary-600" 
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium pt-1">
                  <span>Ordered 12:45 PM</span>
                  <span>Est. Arrival 1:15 PM</span>
                </div>
              </div>

              {progress === 100 && (
                <button 
                  onClick={reset}
                  className="w-full mt-4 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Order Again
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-slate-200 rounded-full" />
    </div>
  );
}
