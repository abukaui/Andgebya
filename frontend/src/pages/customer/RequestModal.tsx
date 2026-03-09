import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, X, Loader2, Package, Navigation, DollarSign } from 'lucide-react';
import { CatalogProduct } from './types';
import api from '../../services/api';

interface RequestModalProps {
  product: CatalogProduct;
  onClose: () => void;
  onSuccess: (delivery: any) => void;
}

const RequestModal = ({ product, onClose, onSuccess }: RequestModalProps) => {
  const [dropoffLat, setDropoffLat] = useState('');
  const [dropoffLng, setDropoffLng] = useState('');
  const [packageDetails, setPackageDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-fetch current location for dropoff
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDropoffLat(pos.coords.latitude.toString());
        setDropoffLng(pos.coords.longitude.toString());
        setError('');
      },
      () => {
        setError('Failed to get location. Please enter manually.');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Guard: ensure the shop has GPS coordinates stored
    if (product.lat == null || product.lng == null) {
      setError('This shop does not have GPS coordinates set up. Please ask the merchant to update their shop location.');
      setIsSubmitting(false);
      return;
    }

    try {
      const deliveryFee = 50.00; // Mock base fee
      const totalAmount = Number(product.price) + deliveryFee;

      const res = await api.post('/delivery/request', {
        shop_id: product.shop_id,
        pickup_lat: product.lat, // Assuming backend provides this now
        pickup_lng: product.lng,
        dropoff_lat: Number(dropoffLat),
        dropoff_lng: Number(dropoffLng),
        total_amount: totalAmount,
        delivery_fee: deliveryFee,
        package_details: packageDetails || `1x ${product.name}`
      });

      onSuccess(res.data.delivery);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to request delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8 pr-12">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Confirm Delivery</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Order <span className="font-bold text-slate-700 dark:text-slate-200">{product.name}</span> from {product.shop_name}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 flex items-start gap-3">
            <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-rose-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pickup Readonly */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Pickup Location</span>
            </div>
            <p className="font-bold text-slate-900 dark:text-white pl-11">{product.shop_address}</p>
          </div>

          {/* Dropoff Input */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-700 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Dropoff Coordinates</span>
              </div>
              <button
                type="button"
                onClick={useCurrentLocation}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
              >
                <Navigation className="w-3 h-3" /> Use GPS
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pl-11">
              <input
                type="number" step="any" required
                placeholder="Latitude (e.g. 9.03)"
                className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-600"
                value={dropoffLat} onChange={e => setDropoffLat(e.target.value)}
              />
              <input
                type="number" step="any" required
                placeholder="Longitude (e.g. 38.74)"
                className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-600"
                value={dropoffLng} onChange={e => setDropoffLng(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-700 focus-within:border-blue-400 transition-all">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Delivery Instructions (Optional)</label>
            <textarea
              placeholder="Gate code, apartment number, etc."
              className="w-full bg-slate-50 dark:bg-slate-700 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-600 resize-none h-20"
              value={packageDetails} onChange={e => setPackageDetails(e.target.value)}
            />
          </div>

          {/* Price Breakdown */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex justify-between text-sm font-bold text-slate-500 dark:text-slate-400">
              <span>Item Total</span>
              <span>ETB {Number(product.price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-500 dark:text-slate-400">
              <span>Delivery Fee</span>
              <span>ETB 50.00</span>
            </div>
            <div className="flex justify-between items-center text-xl font-black text-slate-900 dark:text-white pt-2 border-t border-slate-50 dark:border-slate-800 mt-2">
              <span>Total Payment</span>
              <span>ETB {(Number(product.price) + 50).toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 rounded-[1.5rem] bg-slate-900 text-white font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-600 shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <><DollarSign className="w-5 h-5" /> Confirm & Request Courier</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default RequestModal;
