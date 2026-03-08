import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const DocumentUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSimulateUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-slate-200/30">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Fayda ID Verification</h3>
        <p className="text-slate-400 font-medium mb-8 leading-relaxed">
          Ardi requires a valid Ethiopian National ID (Fayda) to activate your merchant bonding. 
          Upload a clear photo of your ID card.
        </p>

        {!success ? (
          <div className="space-y-6">
            <div className="border-4 border-dashed border-slate-50 rounded-[2.5rem] p-12 text-center group hover:bg-blue-50/30 hover:border-blue-100 transition-all duration-500 cursor-pointer">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 group-hover:scale-110 transition-all">
                <Upload className="w-10 h-10 text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="text-lg font-black text-slate-900">Drop your ID photo here</p>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Support: JPG, PNG, PDF (Max 10MB)</p>
            </div>

            <button 
              onClick={handleSimulateUpload}
              disabled={uploading}
              className="w-full py-5 bg-blue-600 text-white font-black text-xl rounded-[1.5rem] shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {uploading ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Verifying Document...</>
              ) : (
                <><FileText className="w-6 h-6" /> Upload Documentation</>
              )}
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 bg-emerald-50 rounded-[2.5rem] border border-emerald-100"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <p className="text-2xl font-black text-emerald-900">Submission Received</p>
            <p className="text-emerald-700/60 font-bold mt-2">Ardi admins are reviewing your Fayda ID</p>
            <div className="mt-8 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center gap-3 text-xs font-black text-emerald-700 uppercase tracking-widest border border-emerald-100">
               <AlertCircle className="w-4 h-4" /> Est. review time: 2-4 hours
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
        <h4 className="text-lg font-black text-slate-900 mb-4">Verification Guidelines</h4>
        <ul className="space-y-4">
          {[
            'All text on the ID must be clearly readable',
            'Capture both corners of the physical card',
            'Ensure there is no flash glare on the hologram',
            'Name must match your registered Ardi profile'
          ].map((item, i) => (
            <li key={i} className="flex gap-4 group">
               <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                 <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
               </div>
               <p className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors tracking-tight">{item}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DocumentUpload;
