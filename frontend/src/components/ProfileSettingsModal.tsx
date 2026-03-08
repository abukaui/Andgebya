import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, Loader2, Save, User, Phone } from 'lucide-react';
import api from '../services/api';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  profile_image_url?: string;
}

interface ProfileSettingsModalProps {
  user: UserProfile;
  onClose: () => void;
  onSuccess: (updatedUser: UserProfile) => void;
}

const ProfileSettingsModal = ({ user, onClose, onSuccess }: ProfileSettingsModalProps) => {
  const [fullName, setFullName] = useState(user.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number || '');
  const [profileImage, setProfileImage] = useState(user.profile_image_url || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Conversion to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setError('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.put('/auth/profile', {
        full_name: fullName,
        phone_number: phoneNumber,
        profile_image_url: profileImage
      });
      onSuccess(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h2>
          <p className="text-slate-500 font-medium mt-1">Update your personal details</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100 flex items-start gap-3">
             <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-rose-500" />
             {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center mb-8">
             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
               <div className="w-28 h-28 rounded-[2rem] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                 {profileImage ? (
                   <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl font-black text-slate-300">{fullName.charAt(0)}</span>
                 )}
                 <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                   <Camera className="w-8 h-8 text-white" />
                 </div>
               </div>
               <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                 <Camera className="w-4 h-4" />
               </div>
             </div>
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
               accept="image/*" 
               className="hidden" 
             />
             <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">Tap to change avatar</p>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
              <div className="flex items-center gap-3 mb-1">
                 <User className="w-4 h-4 text-slate-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</span>
              </div>
              <input 
                type="text" required
                className="w-full bg-transparent border-none outline-none font-bold text-slate-900 pl-7 placeholder:text-slate-300"
                value={fullName} onChange={e => setFullName(e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
              <div className="flex items-center gap-3 mb-1">
                 <Phone className="w-4 h-4 text-slate-400" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Phone Number</span>
              </div>
              <input 
                type="tel" required
                className="w-full bg-transparent border-none outline-none font-bold text-slate-900 pl-7 placeholder:text-slate-300"
                value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
              />
            </div>

             {/* Email Readonly */}
             <div className="bg-slate-50 opacity-60 rounded-2xl p-4 border border-transparent">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Email Address (Read Only)</span>
              <p className="font-bold text-slate-600 truncate">{user.email}</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 rounded-[1.5rem] bg-blue-600 text-white font-black flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all disabled:opacity-50 mt-8"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <><Save className="w-5 h-5" /> Save Changes</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSettingsModal;
