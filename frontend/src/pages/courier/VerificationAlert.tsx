import { ShieldAlert, ArrowRight } from 'lucide-react';

interface VerificationAlertProps {
  onAction: () => void;
}

export default function VerificationAlert({ onAction }: VerificationAlertProps) {
  return (
    <div className="mx-6 p-6 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
      {/* Background Icon */}
      <div className="absolute right-[-20px] top-[-20px] opacity-[0.05] group-hover:scale-110 transition-transform">
        <ShieldAlert className="w-40 h-40 text-amber-500" />
      </div>

      <div className="flex items-center gap-5 relative z-10 text-center md:text-left">
        <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
          <ShieldAlert className="w-7 h-7 text-amber-600 dark:text-amber-500 animate-pulse" />
        </div>
        <div>
          <h4 className="text-lg font-black text-amber-900 dark:text-amber-500 tracking-tight leading-none">
            Verification Required
          </h4>
          <p className="text-sm font-bold text-amber-700 dark:text-amber-600/60 mt-2 max-w-md">
            Your account is currently restricted. You must complete the identity verification process to start receiving delivery requests.
          </p>
        </div>
      </div>

      <button
        onClick={onAction}
        className="w-full md:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-3 relative z-10 group/btn"
      >
        Complete Verification
        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
