import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

const DocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);

  const handleSimulateUpload = () => {
    if (!frontImage || !backImage) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
    }, 2500);
  };

  const UploadBox = ({ label, side, current, set }: { label: string, side: 'front' | 'back', current: string | null, set: (val: string) => void }) => (
    <div 
      onClick={() => set(`${side}_id_v4.jpg`)}
      className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-8 text-center transition-all duration-300 ${
        current 
          ? 'border-emerald-500/50 bg-emerald-500/5' 
          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 hover:bg-emerald-500/5'
      }`}
    >
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all ${
        current ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:text-emerald-500'
      }`}>
        {current ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
      </div>
      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{label}</p>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em]">
        {current ? current : 'Tap to upload'}
      </p>
      
      {/* Decorative Corner */}
      <div className="absolute top-4 right-4 text-slate-200 dark:text-slate-800 group-hover:text-emerald-500/20 transition-colors">
        <ImageIcon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="bg-white dark:bg-[#0a111b] rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-900 shadow-xl dark:shadow-2xl transition-all relative overflow-hidden">
        {/* Progress Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-900">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: success ? '100%' : (frontImage || backImage ? '50%' : '0%') }}
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Fayda ID Verification</h3>
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-2">
              Ethiopian National ID is required for fleet activation.
            </p>
          </div>
          {success && (
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Verified</span>
            </div>
          )}
        </div>

        {!success ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadBox 
                label="Front Side" 
                side="front" 
                current={frontImage} 
                set={setFrontImage} 
              />
              <UploadBox 
                label="Back Side" 
                side="back" 
                current={backImage} 
                set={setBackImage} 
              />
            </div>

            <button
              onClick={handleSimulateUpload}
              disabled={uploading || !frontImage || !backImage}
              className={`w-full py-5 rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center gap-4 ${
                uploading || !frontImage || !backImage
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-1 active:scale-[0.98]'
              }`}
            >
              {uploading ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Verifying Credentials...</>
              ) : (
                <><FileText className="w-6 h-6" /> Complete Verification</>
              )}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/20 relative"
          >
            <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-emerald-500/40">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">Submission Received</p>
            <p className="text-slate-400 font-bold mt-2">Ardi admins are reviewing your documents</p>
            <div className="mt-8 px-8 py-4 bg-white dark:bg-[#020817] rounded-3xl flex items-center gap-4 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-slate-100 dark:border-slate-800 shadow-sm">
              <AlertCircle className="w-5 h-5 text-amber-500" /> 
              Estimated Review: 2-4 Hours
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-white dark:bg-[#0a111b] rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-900 shadow-xl transition-all">
        <h4 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <div className="w-1 h-6 bg-emerald-500 rounded-full" />
          General Guidelines
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {[
            'All text on the ID must be clearly readable',
            'Capture all four corners of the physical card',
            'Ensure there is no flash glare on the hologram',
            'Name must match your registered Ardi profile',
            'Upload sharp, high-resolution original photos',
            'Selfies with ID are not required for this step'
          ].map((item, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="w-6 h-6 bg-slate-50 dark:bg-[#020817] rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-800 group-hover:border-emerald-500/30 transition-colors">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors tracking-tight">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
