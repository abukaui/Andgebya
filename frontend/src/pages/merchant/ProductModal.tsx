import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { Product } from './types';

interface ProductModalProps {
  shopId: string;
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

const ProductModal = ({ shopId, product, onClose, onSaved }: ProductModalProps) => {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    category: product?.category || 'Food',
    image_url: product?.image_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (product) {
        await api.patch(`/shops/products/${product.id}`, { ...form, price: parseFloat(form.price) });
      } else {
        await api.post(`/shops/${shopId}/products`, { ...form, price: parseFloat(form.price) });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-blue-400" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              {product ? 'Update Item' : 'Add New Item'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">Fill in the details for your catalog</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Name</label>
              <input
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Delicious Dish..."
                className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold"
                required
              />
            </div>
            
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
              <select
                value={form.category} 
                onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}
                className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold appearance-none"
              >
                <option value="Food">Food</option>
                <option value="Drink">Drink</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price (ETB)</label>
              <input
                type="number" step="0.01" min="0"
                value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
                className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
            <textarea
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What makes this item special?"
              rows={3}
              className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none resize-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image URL</label>
            <input
              value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-semibold"
            />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 text-red-600 text-sm bg-red-50 rounded-2xl p-4 border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </motion.div>
          )}

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={saving} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {product ? 'Update Content' : 'Post to Catalog'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductModal;
