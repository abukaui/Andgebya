import { PaymentRecord } from './types';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface Props {
  records: PaymentRecord[];
}

export default function PaymentRecordsList({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <p className="font-bold">No payment records found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-500" />
        Financial Audit Log
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100">
              <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction / Method</th>
              <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer / Shop</th>
              <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</th>
              <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Fee</th>
              <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Escrow Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 text-xs font-bold text-slate-500">
                  {new Date(record.created_at).toLocaleDateString()}
                  <br />
                  <span className="text-[10px] text-slate-400">{new Date(record.created_at).toLocaleTimeString()}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-sm font-mono">{record.transaction_id}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${record.payment_method === 'telebirr' ? 'text-violet-600' : 'text-emerald-600'}`}>
                      {record.payment_method.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="font-bold text-slate-900 text-sm block">{record.customer_name}</span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    → {record.shop_name}
                  </span>
                </td>
                <td className="py-4 px-4 font-black text-slate-900">
                  ETB {Number(record.total_paid).toFixed(2)}
                </td>
                <td className="py-4 px-4 font-black text-emerald-600">
                  + ETB {Number(record.platform_fee).toFixed(2)}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    record.status === 'held_in_escrow' 
                      ? 'bg-amber-100 text-amber-700'
                      : record.status === 'released'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {record.status === 'held_in_escrow' && <ShieldAlert className="w-3 h-3" />}
                    {record.status.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
