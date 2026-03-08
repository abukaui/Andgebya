import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Navigation, Loader2, MapPin, Search } from 'lucide-react';
import api from '../../services/api';

// Components
import SearchBar from './SearchBar';
import ProductCard from './ProductCard';
import RequestModal from './RequestModal';
import ProfileSettingsModal from '../../components/ProfileSettingsModal';

// Types
import { CatalogProduct, CustomerProfile } from './types';

type CustomerTab = 'shop' | 'tracking' | 'profile';

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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 shadow-[0_4px_32px_rgba(0,0,0,0.02)]">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
               <Navigation className="text-white w-5 h-5 rotate-45" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter">Ardi</h1>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Marketplace</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end leading-none">
                <p className="text-xs font-black text-slate-900 tracking-tight">{profile?.full_name}</p>
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
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="max-w-[1400px] mx-auto px-6 py-12">
        
        {/* Dynamic Greeting */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
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
           <h3 className="text-xl font-black text-slate-900">
             {selectedCategory === 'All' ? 'Trending Now' : `${selectedCategory} Selection`}
           </h3>
           <p className="text-slate-400 font-bold text-sm mt-1">{filteredCatalog.length} results available</p>
        </div>

        {filteredCatalog.length === 0 ? (
          <div className="bg-white rounded-[3rem] py-32 text-center border border-slate-100 shadow-xl shadow-slate-200/50">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search className="w-10 h-10 text-slate-300" />
             </div>
             <p className="text-3xl font-black text-slate-900 tracking-tight">Nothing found</p>
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
      </main>

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
