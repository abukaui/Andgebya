import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, AlertTriangle, ShieldCheck, FileMinus, X, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { AdminCourier } from './types';

interface CourierProps {
  couriers: AdminCourier[];
  onCourierUpdate: () => void;
}

export default function CourierManagement({ couriers, onCourierUpdate }: CourierProps) {
  const [selectedCourier, setSelectedCourier] = useState<AdminCourier | null>(null);

  return (
    <div>
      <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-500" />
        Courier Bond Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {couriers.map((courier) => (
          <div key={courier.id} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                  {courier.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-900">{courier.full_name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">{courier.vehicle_type}</p>
                </div>
              </div>
              {courier.is_verified ? (
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              )}
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Bond Balance</p>
              <p className={`text-2xl font-black ${Number(courier.bond_amount) < 1000 ? 'text-rose-600' : 'text-slate-900'}`}>
                ETB {Number(courier.bond_amount).toFixed(2)}
              </p>
              {Number(courier.bond_amount) < 1000 && (
                <p className="text-xs text-rose-500 font-bold mt-1">Bond is critically low</p>
              )}
            </div>

            <button
              onClick={() => setSelectedCourier(courier)}
              className="w-full py-3 bg-white border-2 border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group"
            >
              <FileMinus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Deduct from Bond
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedCourier && (
          <BondDeductionModal
            courier={selectedCourier}
            onClose={() => setSelectedCourier(null)}
            onSuccess={() => {
              setSelectedCourier(null);
              onCourierUpdate();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Bond Deduction Modal ──────────────────────────────────────────────────

function BondDeductionModal({ courier, onClose, onSuccess }: { courier: AdminCourier; onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (Number(amount) > Number(courier.bond_amount)) {
      setError('Cannot deduct more than the current bond balance.');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Please provide a detailed reason (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/admin/courier/${courier.id}/deduct-bond`, {
        amount: Number(amount),
        reason: reason.trim()
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to deduct bond.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-rose-600">Deduct Bond</h2>
            <button onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Target Courier</p>
            <p className="font-black text-slate-900">{courier.full_name}</p>
            <p className="text-sm text-slate-600 mt-1">Current Balance: <span className="font-bold underline text-slate-900">ETB {Number(courier.bond_amount).toFixed(2)}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deduction Amount (ETB)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 100.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Deduction</label>
              <textarea
                placeholder="Explain why this deduction is being made..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-50 transition-all resize-none"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 rounded-2xl bg-rose-600 text-white font-black text-base flex items-center justify-center gap-3 hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Deduction'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
