import { motion } from 'framer-motion';
import { Store, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface ShopSetupProps {
  shopForm: { name: string; address: string };
  setShopForm: React.Dispatch<React.SetStateAction<{ name: string; address: string }>>;
  handleCreateShop: (e: React.FormEvent) => Promise<void>;
  creatingShop: boolean;
  shopError: string;
}

const ShopSetup = ({ shopForm, setShopForm, handleCreateShop, creatingShop, shopError }: ShopSetupProps) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-12 w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16" />
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
          <Store className="text-white w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Open Your Shop</h1>
        <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed">Join the Ardi network of reliable merchants and start reaching thousands of customers.</p>

        <form onSubmit={handleCreateShop} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Professional Shop Name</label>
            <input
              value={shopForm.name} onChange={e => setShopForm(f => ({ ...f, name: e.target.value }))}
              placeholder="The Royal Bistro"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-lg"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Primary Physical Address</label>
            <input
              value={shopForm.address} onChange={e => setShopForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Kazanchis, Grand Mall Level 2"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-lg"
              required
            />
          </div>
          {shopError && (
            <div className="flex items-center gap-3 text-red-600 font-bold bg-red-50 rounded-2xl p-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {shopError}
            </div>
          )}
          <button type="submit" disabled={creatingShop} className="w-full py-5 bg-blue-600 text-white font-black text-xl rounded-[1.5rem] shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
            {creatingShop ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
            Launch My Shop
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ShopSetup;
