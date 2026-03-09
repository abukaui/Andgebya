import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Check, X, Loader2, AlertCircle, CreditCard, ChevronRight } from 'lucide-react';
import api from '../../services/api';

interface PaymentModalProps {
  deliveryId: string;
  totalAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = 'telebirr' | 'cbe_birr';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; color: string; bg: string }[] = [
  { id: 'telebirr', label: 'Telebirr', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
  { id: 'cbe_birr', label: 'CBE Birr', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
];

export default function PaymentModal({ deliveryId, totalAmount, onClose, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('telebirr');
  const [txnId, setTxnId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnId.trim() || txnId.trim().length < 4) {
      setError('Please enter a valid transaction ID (minimum 4 characters).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post(`/delivery/${deliveryId}/confirm-payment`, {
        transaction_id: txnId.trim(),
        payment_method: method,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl overflow-hidden"
      >
        {/* Handle bar (mobile) */}
        <div className="sm:hidden w-full flex justify-center pt-4 pb-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Confirm Payment</h2>
              <p className="text-slate-500 dark:text-slate-400 font-bold mt-1">
                Enter your mobile money receipt ID
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Due Banner */}
          <div className="mb-6 p-5 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount to Pay</p>
              <p className="text-3xl font-black text-white dark:text-slate-900">ETB {totalAmount.toFixed(2)}</p>
            </div>
            <CreditCard className="w-8 h-8 text-slate-500 dark:text-slate-400" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method Toggle */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`py-4 px-5 rounded-2xl border-2 text-sm font-black flex items-center justify-center gap-2 transition-all ${
                      method === m.id
                        ? `${m.bg} ${m.color} border-current shadow-sm`
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    {m.label}
                    {method === m.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction ID Input */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Transaction ID / Reference</p>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={method === 'telebirr' ? 'e.g. TLB-20240309-XXXX' : 'e.g. CBE-TXN-XXXXXXXX'}
                  value={txnId}
                  onChange={(e) => { setTxnId(e.target.value); setError(''); }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all pr-12"
                />
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-2 pl-1">
                Find this in your {method === 'telebirr' ? 'Telebirr' : 'CBE Birr'} app under "Transaction History"
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || success || !txnId.trim()}
              className={`w-full py-5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50 disabled:translate-y-0 hover:-translate-y-0.5 active:translate-y-0 ${
                success
                  ? 'bg-emerald-500 text-white shadow-emerald-200'
                  : 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200 hover:shadow-blue-200'
              }`}
            >
              {success ? (
                <><Check className="w-5 h-5" /> Payment Confirmed! ✓</>
              ) : isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Smartphone className="w-5 h-5" /> Confirm Payment</>
              )}
            </button>
          </form>

          <p className="text-center text-[10px] font-bold text-slate-400 mt-5">
            Your payment is held securely in escrow until delivery is confirmed.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
