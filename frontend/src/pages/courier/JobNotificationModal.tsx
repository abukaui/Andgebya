import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, Check, X, AlertCircle } from 'lucide-react';

export interface Job {
  id: string;
  shop_id: string;
  total_amount: string;
  delivery_fee: string;
  created_at: string;
  pickup_lng: number;
  pickup_lat: number;
  dropoff_lng: number;
  dropoff_lat: number;
  distance_to_pickup: number;
}

interface JobNotificationModalProps {
  job: Job;
  onAccept: (jobId: string) => Promise<void>;
  onReject: () => void;
}

export default function JobNotificationModal({ job, onAccept, onReject }: JobNotificationModalProps) {
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      onReject();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, job.id, onReject]);

  const handleAccept = async () => {
    setIsAccepting(true);
    setError(null);
    try {
      await onAccept(job.id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept job');
      setIsAccepting(false);
      // Wait a bit then reject if it failed (e.g. someone else took it)
      setTimeout(() => onReject(), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">New Delivery!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Incoming Request</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black">
                <Clock className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
              <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  className="h-full bg-rose-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pickup Distance</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  {(job.distance_to_pickup / 1000).toFixed(1)} km away
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 text-center border border-blue-100/50 dark:border-blue-900/20">
              <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Your Potential Earnings</p>
              <p className="text-4xl font-black text-blue-600 dark:text-blue-400">ETB {job.delivery_fee}</p>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => onReject()}
              disabled={isAccepting}
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" /> Ignore
            </button>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="flex-[2] py-4 px-6 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:translate-y-0"
            >
              {isAccepting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" /> Accept Job
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
