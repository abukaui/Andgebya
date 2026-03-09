import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Check, X, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

interface ShopLocationModalProps {
  shopId: string;
  currentLat?: number | null;
  currentLng?: number | null;
  onClose: () => void;
  onSaved: (lat: number, lng: number) => void;
}

export default function ShopLocationModal({ shopId, currentLat, currentLng, onClose, onSaved }: ShopLocationModalProps) {
  const [lat, setLat] = useState(currentLat?.toString() ?? '');
  const [lng, setLng] = useState(currentLng?.toString() ?? '');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setIsDetecting(false);
      },
      () => {
        setError('Could not detect location. Please enter coordinates manually.');
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setError('Please enter valid numeric coordinates.');
      return;
    }
    if (parsedLat < -90 || parsedLat > 90) {
      setError('Latitude must be between -90 and 90.');
      return;
    }
    if (parsedLng < -180 || parsedLng > 180) {
      setError('Longitude must be between -180 and 180.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await api.patch(`/shops/${shopId}`, { lat: parsedLat, lng: parsedLng });
      setSuccess(true);
      setTimeout(() => {
        onSaved(parsedLat, parsedLng);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save location.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Set Shop Location</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-0.5">Required for delivery matching</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* GPS Detect Button */}
          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-black hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all mb-6 disabled:opacity-60"
          >
            {isDetecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
            {isDetecting ? 'Detecting your location...' : 'Use My Current Location (GPS)'}
          </button>

          {/* Hint */}
          <p className="text-center text-xs font-bold text-slate-400 dark:text-slate-500 mb-6 -mt-2">
            — or enter coordinates manually —
          </p>

          {/* Coordinate Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 9.0350"
                value={lat}
                onChange={e => setLat(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                placeholder="e.g. 38.7469"
                value={lng}
                onChange={e => setLng(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 transition-all"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !lat || !lng || success}
            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-base flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-100 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {success ? (
              <><Check className="w-5 h-5" /> Location Saved!</>
            ) : isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><MapPin className="w-5 h-5" /> Save Location</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
