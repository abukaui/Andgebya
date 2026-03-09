import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Plus, Pencil, Trash2, Package,
  ShoppingBag, Eye, EyeOff,
  Loader2, ClipboardList,
  User, MapPin, Star,
  Utensils, Coffee, Box
} from 'lucide-react';
import api from '../services/api';

// Components
import ProductModal from './merchant/ProductModal';
import StatusPill from './merchant/StatusPill';
import ProfileView from './merchant/ProfileView';
import ShopSetup from './merchant/ShopSetup';

// Types
import { Shop, Product, Order, UserProfile } from './merchant/types';

type Tab = 'products' | 'orders' | 'profile';

export default function MerchantDashboard() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Product | null | 'new'>(null);
  const [shopForm, setShopForm] = useState({ name: '', address: '' });
  const [creatingShop, setCreatingShop] = useState(false);
  const [shopError, setShopError] = useState('');

  const loadData = async () => {
    try {
      const [shopRes, profileRes] = await Promise.all([
        api.get('/shops/mine'),
        api.get('/auth/profile')
      ]);

      const fetchedShop = shopRes.data.shop;
      setShop(fetchedShop);
      setProfile(profileRes.data.user);

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
    if (!confirm('Delete this product permanently?')) return;
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
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Ardi Syncing...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <ShopSetup
        shopForm={shopForm}
        setShopForm={setShopForm}
        handleCreateShop={handleCreateShop}
        creatingShop={creatingShop}
        shopError={shopError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-8">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[280px_1fr] min-h-screen">

        {/* Sidenav (Desktop) */}
        <div className="hidden lg:flex flex-col p-8 sticky top-0 h-screen">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Store className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">Ardi.merchant</span>
          </div>

          <nav className="space-y-2 flex-1">
            {([['products', 'Catalog', Package], ['orders', 'Deliveries', ClipboardList], ['profile', 'Profile', User]] as const).map(([tab, label, Icon]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-400 hover:bg-white hover:text-slate-600'
                  }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </nav>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 mt-auto">
            <div className="flex items-center gap-3 mb-1">
              <p className="font-black text-slate-900 truncate">{shop.name}</p>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-black">{shop.rating}</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {shop.address}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 lg:p-12 overflow-y-auto max-w-4xl mx-auto w-full">

          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Store className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-slate-900 truncate max-w-[150px]">{shop.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">
                {shop.is_active ? 'Online' : 'Offline'}
              </span>
              <button onClick={() => setActiveTab('profile')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                <User className="w-5 h-5 text-slate-900" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">Store Catalog</h2>
                    <p className="text-slate-400 font-bold mt-1">Found {products.length} items in your inventory</p>
                  </div>
                  <button
                    onClick={() => setEditProduct('new')}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all"
                  >
                    <Plus className="w-5 h-5" /> New Post
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="bg-white rounded-[3rem] py-24 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
                    <ShoppingBag className="w-20 h-20 mx-auto mb-6 text-slate-100" />
                    <p className="text-2xl font-black text-slate-900">Your shelf is empty</p>
                    <p className="text-slate-400 font-bold mt-2">Add products to start receiving orders.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map(p => (
                      <motion.div
                        key={p.id}
                        layout
                        className="bg-white rounded-[2rem] overflow-hidden border border-slate-50 shadow-xl shadow-slate-200/40 group relative"
                      >
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              {p.category === 'Food' ? <Utensils className="w-12 h-12" /> : p.category === 'Drink' ? <Coffee className="w-12 h-12" /> : <Box className="w-12 h-12" />}
                            </div>
                          )}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${p.category === 'Food' ? 'bg-orange-500/80 text-white' :
                                p.category === 'Drink' ? 'bg-blue-500/80 text-white' :
                                  'bg-slate-800/80 text-white'
                              }`}>
                              {p.category}
                            </span>
                          </div>
                          {!p.is_available && (
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                              <span className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl">
                                Currently Unavailable
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-6">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-black text-slate-900 truncate pr-2">{p.name}</h3>
                            <span className="text-blue-600 font-black whitespace-nowrap">ETB {Number(p.price).toFixed(0)}</span>
                          </div>
                          <p className="text-slate-400 text-sm font-medium line-clamp-2 h-10 mb-6">{p.description || 'No description provided'}</p>

                          <div className="flex items-center gap-2 border-t border-slate-50 pt-5">
                            <button
                              onClick={() => handleToggleAvailability(p)}
                              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${p.is_available ? 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                            >
                              {p.is_available ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
                            </button>
                            <button onClick={() => setEditProduct(p)} className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-slate-900">Incoming Requests</h2>
                  <p className="text-slate-400 font-bold mt-1">{orders.length} deliveries tracked in your shop</p>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white rounded-[3rem] py-24 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
                    <ClipboardList className="w-20 h-20 mx-auto mb-6 text-slate-100" />
                    <p className="text-2xl font-black text-slate-900">No active orders</p>
                    <p className="text-slate-400 font-bold mt-2">New requests will appear here in real-time.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {orders.map(o => (
                      <div key={o.id} className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Package className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-black text-slate-900 text-lg">{o.customer_name}</p>
                            <StatusPill status={o.status} />
                          </div>
                          <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
                            {o.customer_phone}
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Payout</p>
                          <p className="text-2xl font-black text-slate-900">ETB {Number(o.total_amount).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-slate-900">Merchant Center</h2>
                  <p className="text-slate-400 font-bold mt-1">Manage your professional Ardi identity</p>
                </div>
                <ProfileView profile={profile} shop={shop} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Tabbar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex items-center justify-between z-40">
        {[
          ['products', Package],
          ['orders', ClipboardList],
          ['profile', User],
        ].map(([tab, Icon]: any) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 -translate-y-2' : 'text-slate-400'
              }`}
          >
            <Icon className="w-6 h-6 pill-current" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {editProduct !== null && (
          <ProductModal
            shopId={shop.id}
            product={editProduct === 'new' ? null : editProduct as Product}
            onClose={() => setEditProduct(null)}
            onSaved={loadData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
