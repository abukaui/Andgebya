import { motion } from 'framer-motion';
import { Package, Clock, Shield, ArrowRight } from 'lucide-react';
import { Job } from './JobNotificationModal';

interface JobRequestCardProps {
  job: Job;
  onAccept: (jobId: string) => Promise<void>;
  onReject: () => void;
  isAccepting: boolean;
}

export default function JobRequestCard({ job, onAccept, onReject, isAccepting }: JobRequestCardProps) {
  return (
    <div className="mx-6 p-8 bg-white dark:bg-[#0a111b] rounded-[2.5rem] border border-slate-100 dark:border-slate-900 shadow-xl dark:shadow-2xl relative overflow-hidden group">
      {/* Dynamic Background Element */}
      <div className="absolute top-[-20%] left-[-10%] w-[200px] h-[200px] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-50 dark:bg-[#020817] rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner group-hover:border-emerald-500/30 transition-colors">
              <Package className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">New Delivery Request</h3>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                Electronics Item • {(job.distance_to_pickup / 1000).toFixed(1)} km away
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">EST. PAY</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none">{job.delivery_fee} <span className="text-xs">ETB</span></p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 dark:bg-[#020817] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 opacity-60" />
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">ITEM VALUE</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">180 ETB</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-[#020817] p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 opacity-60" />
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">TIME LIMIT</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">25 mins</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onAccept(job.id)}
          disabled={isAccepting}
          className="w-full py-5 bg-emerald-500 dark:bg-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 text-white dark:text-[#020817] text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(52,211,153,0.2)] transition-all flex items-center justify-center gap-3 group/btn"
        >
          {isAccepting ? (
            <div className="w-6 h-6 border-2 border-white/30 dark:border-[#020817]/30 border-t-white dark:border-t-[#020817] rounded-full animate-spin" />
          ) : (
            <>
              ACCEPT JOB
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
