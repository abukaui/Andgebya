import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Store, Star, Utensils, Coffee, Box } from 'lucide-react';
import { CatalogProduct } from './types';

interface ProductCardProps {
  product: CatalogProduct;
  onOrderClick: (product: CatalogProduct) => void;
}

const ProductCard = ({ product, onOrderClick }: ProductCardProps) => {
  return (
    <motion.div 
      layout
      whileHover={{ y: -5 }}
      className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20 group relative"
    >
      <div className="relative h-56 bg-slate-100 overflow-hidden">
        {product.image_url ? (
          <img 
             src={product.image_url} 
             alt={product.name} 
             className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            {product.category === 'Food' ? <Utensils className="w-16 h-16" /> : 
             product.category === 'Drink' ? <Coffee className="w-16 h-16" /> : 
             <Box className="w-16 h-16" />}
          </div>
        )}
        
        {/* Category Tag */}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
            product.category === 'Food' ? 'bg-orange-500 text-white' : 
            product.category === 'Drink' ? 'bg-blue-500 text-white' : 
            'bg-slate-800 text-white'
          }`}>
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2 gap-4">
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{product.name}</h3>
          <span className="text-blue-600 font-black text-xl whitespace-nowrap">
            ETB {Number(product.price).toFixed(0)}
          </span>
        </div>
        
        <p className="text-slate-500 text-sm font-medium line-clamp-2 min-h-[40px] mb-6">
          {product.description || 'No description provided for this item.'}
        </p>

        {/* Shop Info Footer */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full -mr-8 -mt-8 opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
               <div className="flex items-center gap-2">
                 <Store className="w-4 h-4 text-slate-400" />
                 <span className="font-bold text-slate-700 text-sm truncate max-w-[120px]">{product.shop_name}</span>
               </div>
               <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                 <Star className="w-3 h-3 fill-current" />
                 <span className="text-[10px] font-black">{product.shop_rating}</span>
               </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
               <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
               <span className="text-xs text-slate-500 font-medium truncate">{product.shop_address}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => onOrderClick(product)}
          className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white font-black rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all group/btn"
        >
          <ShoppingBag className="w-5 h-5 group-hover/btn:-translate-y-1 transition-transform" />
          Order Delivery Now
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
