import { Wallet } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  currency?: string;
}

export default function BalanceCard({ balance = 0, currency = 'ETB' }: BalanceCardProps) {
  return (
    <div className="mx-6 p-10 bg-white dark:bg-[#0a111b] rounded-[2.5rem] border border-slate-100 dark:border-slate-900 shadow-xl dark:shadow-2xl relative overflow-hidden group">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-[-10%] w-[150px] h-[150px] bg-emerald-500/10 dark:bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[100px] h-[100px] bg-blue-500/5 dark:bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] opacity-80">
            DEPOSIT BALANCE
          </p>
          <button className="px-6 py-2.5 bg-emerald-500 dark:bg-emerald-400 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white dark:text-[#020817] text-xs font-black rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all hover:scale-105 active:scale-95">
            Top Up
          </button>
        </div>

        <div className="flex items-baseline gap-3">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            {balance.toLocaleString()}
          </h2>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {currency}
          </span>
        </div>
      </div>
    </div>
  );
}
