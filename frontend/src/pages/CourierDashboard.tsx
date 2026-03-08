import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Wifi, WifiOff, Navigation, 
  Shield, Star, Package, TrendingUp, Clock, 
  AlertCircle, CheckCircle2, Loader2
} from 'lucide-react';
import api from '../services/api';

// -- Types --
interface CourierProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  is_available: boolean;
  kyc_status: string;
  bond_amount: number;
  is_verified: boolean;
  last_active: string | null;
  lat: number | null;
  lng: number | null;
}

interface GeoCoords {
  lat: number;
  lng: number;
}

// -- Sub-components --
const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-2xl font-black text-slate-900">{value}</p>
    <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
  </div>
);

const StatusBadge = ({ isOnline }: { isOnline: boolean }) => (
  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
    isOnline 
      ? 'bg-green-100 text-green-700 border border-green-200' 
      : 'bg-slate-100 text-slate-500 border border-slate-200'
  }`}>
    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
    {isOnline ? 'Online' : 'Offline'}
  </div>
);

// -- Main Dashboard --
export default function CourierDashboard() {
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [pingCount, setPingCount] = useState(0);

  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // -- Fetch profile on mount --
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/courier/profile');
        setProfile(data.profile);
        setIsOnline(data.profile.is_available ?? false);
      } catch {
        // Profile may not exist yet, that's OK
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // -- Push location to server --
  const pushLocation = useCallback(async (position: GeolocationPosition) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setCoords({ lat, lng });

    try {
      await api.post('/courier/location', { lat, lng });
      setLastUpdate(new Date());
      setPingCount(p => p + 1);
    } catch (err) {
      console.error('Location push failed:', err);
    }
  }, []);

  // -- Start / Stop Location Service --
  const startLocationTracking = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }

    // Immediately get position
    navigator.geolocation.getCurrentPosition(pushLocation, (err) => {
      setGeoError(`GPS Error: ${err.message}`);
    }, { enableHighAccuracy: true });

    // Then push every 10 seconds
    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(pushLocation, undefined, {
        enableHighAccuracy: true,
        maximumAge: 5000,
      });
    }, 10000);
  }, [pushLocation]);

  const stopLocationTracking = useCallback(() => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // -- Toggle Online/Offline --
  const handleToggle = async () => {
    setIsToggling(true);
    const newStatus = !isOnline;

    try {
      await api.patch('/courier/availability', { is_available: newStatus });
      setIsOnline(newStatus);

      if (newStatus) {
        startLocationTracking();
      } else {
        stopLocationTracking();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setIsToggling(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => () => stopLocationTracking(), [stopLocationTracking]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
              <Navigation className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-slate-900 leading-none">Courier Hub</p>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Ardi Delivery Network</p>
            </div>
          </div>
          <StatusBadge isOnline={isOnline} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-black">
                {profile?.full_name?.charAt(0) ?? 'C'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{profile?.full_name ?? 'Courier'}</h2>
              <p className="text-slate-500 text-sm">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {profile?.is_verified ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <AlertCircle className="w-3 h-3" /> KYC Pending
                  </span>
                )}
                <span className="text-slate-200">·</span>
                <span className="flex items-center gap-1 text-xs font-bold text-primary-600">
                  <Shield className="w-3 h-3" /> Bond: ETB {profile?.bond_amount?.toFixed(2) ?? '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <div className={`rounded-2xl p-5 transition-colors duration-500 ${
            isOnline ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-slate-900 text-base">
                  {isOnline ? 'You are Online' : 'You are Offline'}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {isOnline 
                    ? 'Location is broadcasting every 10s' 
                    : 'Toggle on to start receiving delivery requests'
                  }
                </p>
              </div>
              <button
                onClick={handleToggle}
                disabled={isToggling}
                className={`relative w-16 h-9 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 ${
                  isOnline 
                    ? 'bg-green-500 focus:ring-green-200' 
                    : 'bg-slate-300 focus:ring-slate-200'
                } ${isToggling ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ background: isOnline ? '#22c55e' : '#cbd5e1' }}
              >
                <motion.div 
                  className="absolute top-1 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center"
                  animate={{ left: isOnline ? 'calc(100% - 32px)' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {isToggling 
                    ? <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                    : isOnline 
                      ? <Wifi className="w-3.5 h-3.5 text-green-500" />
                      : <WifiOff className="w-3.5 h-3.5 text-slate-400" />
                  }
                </motion.div>
              </button>
            </div>

            {/* GPS Status Row */}
            <AnimatePresence>
              {isOnline && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  {geoError ? (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p className="font-medium">{geoError}</p>
                    </div>
                  ) : coords ? (
                    <div className="bg-white/70 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-semibold">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span>Broadcasting GPS Position</span>
                        <span className="ml-auto text-xs text-slate-400">{pingCount} pings sent</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-500">
                        <span className="bg-slate-50 px-3 py-1.5 rounded-lg">LAT: {coords.lat.toFixed(6)}</span>
                        <span className="bg-slate-50 px-3 py-1.5 rounded-lg">LNG: {coords.lng.toFixed(6)}</span>
                      </div>
                      {lastUpdate && (
                        <p className="text-xs text-slate-400 text-right">
                          Last sync: {lastUpdate.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Acquiring GPS signal…</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            icon={Package} 
            label="Deliveries Today" 
            value="—" 
            color="bg-blue-50 text-blue-600"
          />
          <StatCard 
            icon={TrendingUp} 
            label="Earnings (ETB)" 
            value="—" 
            color="bg-green-50 text-green-600"
          />
          <StatCard 
            icon={Star} 
            label="Rating" 
            value="5.0" 
            color="bg-yellow-50 text-yellow-600"
          />
          <StatCard 
            icon={Clock} 
            label="Hours Online" 
            value="—" 
            color="bg-purple-50 text-purple-600"
          />
        </div>

        {/* KYC Notice */}
        {!profile?.is_verified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Complete Your Fayda KYC</p>
              <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                Upload your Fayda National ID and pay your Courier-Bond™ security deposit to start accepting deliveries.
              </p>
              <button className="mt-3 text-sm font-bold text-amber-700 underline underline-offset-2">
                Complete KYC →
              </button>
            </div>
          </div>
        )}

        {/* Signout */}
        <button
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="w-full py-3 rounded-2xl text-sm font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
