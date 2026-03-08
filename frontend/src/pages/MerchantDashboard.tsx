import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Plus, Pencil, Trash2, Package,
  ShoppingBag, Eye, EyeOff, X,
  Loader2, AlertCircle, CheckCircle2, ClipboardList
} from 'lucide-react';
import api from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Shop { id: string; name: string; address: string; rating: number; is_active: boolean; }
interface Product { id: string; name: string; description: string; price: number; image_url: string; is_available: boolean; }
interface Order { id: string; status: string; total_amount: number; customer_name: string; customer_phone: string; created_at: string; }

type Tab = 'products' | 'orders';

// ─── Product Form Modal ───────────────────────────────────────────────────────
const ProductModal = ({ shopId, product, onClose, onSaved }: {
  shopId: string;
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name *</label>
            <input
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Injera with Tibs"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Short description..."
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Price (ETB) *</label>
            <input
              type="number" step="0.01" min="0"
              value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Image URL</label>
            <input
              value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Status Pill ─────────────────────────────────────────────────────────────
const StatusPill = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    matched: 'bg-blue-100 text-blue-700',
    in_transit: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${colors[status] || 'bg-slate-100 text-slate-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function MerchantDashboard() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null | 'new'>('');
  const [shopForm, setShopForm] = useState({ name: '', address: '' });
  const [creatingShop, setCreatingShop] = useState(false);
  const [shopError, setShopError] = useState('');

  const loadData = async () => {
    try {
      const shopRes = await api.get('/shops/mine');
      const fetchedShop = shopRes.data.shop;
      setShop(fetchedShop);

      if (fetchedShop) {
        const [prodRes, ordRes] = await Promise.all([
          api.get(`/shops/${fetchedShop.id}/products`),
          api.get(`/shops/${fetchedShop.id}/orders`),
        ]);
        setProducts(prodRes.data.products);
        setOrders(ordRes.data.orders);
      }
    } catch (err) {
      console.error('Failed to load shop data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setShopError('');
    setCreatingShop(true);
    try {
      await api.post('/shops', shopForm);
      await loadData();
    } catch (err: any) {
      setShopError(err.response?.data?.error || 'Failed to create shop');
    } finally {
      setCreatingShop(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/shops/products/${productId}`);
      setProducts(p => p.filter(x => x.id !== productId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      await api.patch(`/shops/products/${product.id}`, { is_available: !product.is_available });
      setProducts(p => p.map(x => x.id === product.id ? { ...x, is_available: !x.is_available } : x));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // ── No shop yet ─────────────────────────────────────────────────────────────
  if (!shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl border border-slate-100">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Store className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Create Your Shop</h1>
          <p className="text-slate-500 mb-8 text-sm">Set up your shop on Ardi to start selling and managing deliveries.</p>

          <form onSubmit={handleCreateShop} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Shop Name *</label>
              <input
                value={shopForm.name} onChange={e => setShopForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Abebe's Restaurant"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Address *</label>
              <input
                value={shopForm.address} onChange={e => setShopForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Bole Road, Addis Ababa"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            {shopError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
                <AlertCircle className="w-4 h-4" /> {shopError}
              </div>
            )}
            <button type="submit" disabled={creatingShop} className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 flex items-center justify-center gap-2">
              {creatingShop ? <Loader2 className="w-5 h-5 animate-spin" /> : <Store className="w-5 h-5" />}
              Create Shop
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Store className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-slate-900 leading-none">{shop.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{shop.address}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${shop.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {shop.is_active ? '● Open' : '● Closed'}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-2xl">
          {([['products', 'Products', Package], ['orders', 'Orders', ClipboardList]] as const).map(([tab, label, Icon]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
              {tab === 'orders' && orders.filter(o => o.status === 'pending').length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* PRODUCTS Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900">{products.length} Products</h2>
              <button
                onClick={() => setEditProduct('new')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-semibold">No products yet</p>
                <p className="text-sm mt-1">Add your first product to start selling</p>
              </div>
            ) : (
              <div className="grid gap-3">
                <AnimatePresence>
                  {products.map(p => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4"
                    >
                      <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-slate-400" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900 truncate">{p.name}</p>
                            {p.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{p.description}</p>}
                          </div>
                          <span className="font-black text-slate-900 whitespace-nowrap">ETB {p.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleAvailability(p)}
                          className={`p-2 rounded-lg ${p.is_available ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'}`}
                          title={p.is_available ? 'Mark Unavailable' : 'Mark Available'}
                        >
                          {p.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setEditProduct(p)} className="p-2 rounded-lg text-slate-500 bg-slate-50 hover:bg-blue-50 hover:text-blue-600">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2 rounded-lg text-slate-500 bg-slate-50 hover:bg-red-50 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ORDERS Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-black text-slate-900 mb-4">{orders.length} Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-semibold">No orders yet</p>
                <p className="text-sm mt-1">Orders will appear here once customers request deliveries</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {orders.map(o => (
                  <div key={o.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-slate-900">{o.customer_name}</p>
                        <p className="text-xs text-slate-400">{o.customer_phone}</p>
                      </div>
                      <StatusPill status={o.status} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{new Date(o.created_at).toLocaleString()}</span>
                      <span className="font-black text-slate-900">ETB {parseFloat(o.total_amount as any).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {(editProduct === 'new' || (editProduct && editProduct !== '')) && (
          <ProductModal
            shopId={shop.id}
            product={editProduct === 'new' ? null : editProduct as Product}
            onClose={() => setEditProduct('')}
            onSaved={loadData}
          />
        )}
      </AnimatePresence>

      {/* Logout */}
      <div className="max-w-3xl mx-auto px-5 pb-8">
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="w-full py-3 rounded-2xl text-sm font-bold text-slate-400 border border-slate-200 hover:bg-slate-50"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
