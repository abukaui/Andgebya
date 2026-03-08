import { useState } from 'react';
import { User, LogOut, ChevronRight, Store, ShoppingBag, Settings } from 'lucide-react';
import { UserProfile, Shop } from './types';
import ProfileSettingsModal from '../../components/ProfileSettingsModal';

interface ProfileViewProps {
  profile: UserProfile | null;
  shop: Shop | null;
  onProfileUpdate?: (updatedProfile: UserProfile) => void;
}

const ProfileView = ({ profile, shop, onProfileUpdate }: ProfileViewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!profile) return null;
  return (
    <div className="space-y-6 relative">
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black overflow-hidden shadow-lg">
              {profile.profile_image_url ? (
                <img src={profile.profile_image_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.full_name.charAt(0)
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">{profile.full_name}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{profile.role}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-12 h-12 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-2xl flex items-center justify-center transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid gap-6">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
              <p className="font-bold text-slate-900">{profile.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
              <p className="font-bold text-slate-900">{profile.phone_number}</p>
            </div>
          </div>

          {shop && (
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shop Status</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{shop.name}</p>
                  <span className={`w-2 h-2 rounded-full ${shop.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-xl shadow-slate-200/50">
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-rose-50 rounded-[1.5rem] group transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-black text-slate-900">Sign Out of Ardi</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-400" />
        </button>
      </div>

      {isModalOpen && (
        <ProfileSettingsModal 
          user={profile as any}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(updatedUser: UserProfile) => {
            if (onProfileUpdate) onProfileUpdate(updatedUser);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ProfileView;
