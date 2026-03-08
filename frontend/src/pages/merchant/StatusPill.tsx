const StatusPill = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    matched: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-violet-100 text-violet-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusPill;
