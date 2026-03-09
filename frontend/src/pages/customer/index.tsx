import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Loader2, Search, Menu, X, Bell, Package } from 'lucide-react';
import api from '../../services/api';

// Components
import SearchBar from './SearchBar';
import ProductCard from './ProductCard';
import RequestModal from './RequestModal';
import ProfileSettingsModal from '../../components/ProfileSettingsModal';
import CustomerSidebar from './CustomerSidebar';
import SettingsView from '../../components/SettingsView';

// Types
import { CatalogProduct, CustomerProfile } from './types';

type CustomerTab = 'shop' | 'tracking' | 'profile' | 'settings';

export default function CustomerDashboard() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Layout State
  const [activeTab, setActiveTab] = useState<CustomerTab>('shop');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadData = async () => {
    try {
      const [profileRes, catalogRes] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/shops/catalog')
      ]);
      setProfile(profileRes.data.user);
      setCatalog(catalogRes.data.catalog);
    } catch (err) {
      console.error('Failed to load customer data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // -- Memoized Filtering Engine --
  const filteredCatalog = useMemo(() => {
    return catalog.filter(product => {
      // 1. Category Filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
      
      // 2. Search Query (Name or Description)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = (product.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      
      // 3. Location Filter (Shop Address)
      if (locationFilter) {
        const locQuery = locationFilter.toLowerCase();
        if (!product.shop_address.toLowerCase().includes(locQuery)) return false;
      }

      return true;
    });
  }, [catalog, searchQuery, selectedCategory, locationFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Ardi Networking...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden transition-colors">
      {/* Sidebar Shell */}
      <CustomerSidebar 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setMobileMenuOpen(false); }}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Framework */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Premium Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20 h-20 px-8 flex items-center justify-between shadow-[0_2px_24px_rgba(0,0,0,0.02)] transition-colors">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center">
                 <Navigation className="text-white w-4 h-4 rotate-45" />
              </div>
              <span className="font-black text-slate-900">Ardi</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 border-r border-slate-100 pr-6 mr-6">
              <div className="flex flex-col items-end leading-none">
                  <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight">{profile?.full_name}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Prime Member</p>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 font-black overflow-hidden shadow-sm transition-colors"
              >
                {profile?.profile_image_url ? (
                   <img src={profile?.profile_image_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                   profile?.full_name?.charAt(0) || '?'
                )}
              </button>
            </div>
            
            <button className="relative p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Content Portal */}
        <main className="flex-1 p-8 lg:p-12 space-y-12">
           <AnimatePresence mode="wait">
             {activeTab === 'shop' && (
                <motion.div 
                   key="shop"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                >
                  {/* Dynamic Greeting */}
                  <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Discover local <span className="text-blue-600">favorites.</span>
                      </h2>
                      <p className="text-slate-500 font-medium mt-4 text-lg">
                        Get anything delivered in minutes by Ardi's verified fleet.
                      </p>
                    </div>
                  </div>

                  {/* Global Search & Filters */}
                  <SearchBar 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    locationFilter={locationFilter}
                    setLocationFilter={setLocationFilter}
                  />

                  {/* Catalog Grid */}
                  <div className="mb-8">
                     <h3 className="text-xl font-black text-slate-900 dark:text-white">
                       {selectedCategory === 'All' ? 'Trending Now' : `${selectedCategory} Selection`}
                     </h3>
                     <p className="text-slate-400 font-bold text-sm mt-1">{filteredCatalog.length} results available</p>
                  </div>

                  {filteredCatalog.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] py-32 text-center border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
                       <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                         <Search className="w-10 h-10 text-slate-300" />
                       </div>
                       <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Nothing found</p>
                       <p className="text-slate-500 font-medium mt-3 text-lg max-w-md mx-auto">
                         We couldn't find any products matching your current filters. Try adjusting your search criteria.
                       </p>
                       <button 
                         onClick={() => {
                           setSearchQuery('');
                           setLocationFilter('');
                           setSelectedCategory('All');
                         }}
                         className="mt-8 px-8 py-3 bg-blue-50 text-blue-600 font-black rounded-xl hover:bg-blue-100 transition-colors"
                       >
                         Clear All Filters
                       </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      <AnimatePresence>
                        {filteredCatalog.map(product => (
                          <ProductCard 
                            key={product.id} 
                            product={product} 
                            onOrderClick={setSelectedProduct} 
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
             )}

             {activeTab === 'tracking' && (
                <motion.div 
                   key="tracking"
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.98 }}
                >
                   <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none text-center py-32 transition-colors">
                      <Package className="w-16 h-16 mx-auto mb-6 text-slate-300" />
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white">Your Deliveries</h3>
                      <p className="text-slate-500 mt-3 font-medium">Tracking module is currently under construction.</p>
                   </div>
                </motion.div>
             )}

             {activeTab === 'settings' && (
                <motion.div 
                   key="settings"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                >
                   <SettingsView 
                     role="customer" 
                     userName={profile?.full_name} 
                     userEmail={profile?.email} 
                     initialSettings={profile?.settings}
                   />
                </motion.div>
             )}
           </AnimatePresence>

           {/* Mobile Menu Backdrop */}
           <AnimatePresence>
             {mobileMenuOpen && (
                <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }}
                   className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 lg:hidden"
                   onClick={() => setMobileMenuOpen(false)}
                />
             )}
           </AnimatePresence>
        </main>
      </div>

      {/* Delivery Request Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <RequestModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onSuccess={(delivery) => {
               setSelectedProduct(null);
               alert(`Delivery requested successfully! ID: ${delivery.id}`);
               // TODO: Redirect to tracking view
            }}
          />
        )}

        {isProfileModalOpen && profile && (
          <ProfileSettingsModal 
            user={profile as any}
            onClose={() => setIsProfileModalOpen(false)}
            onSuccess={(updatedUser) => {
              setProfile(updatedUser as any);
              setIsProfileModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
