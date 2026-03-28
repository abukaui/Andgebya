import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, XCircle } from 'lucide-react';
import api from '../../services/api';

const DocumentUpload = ({ status, onUploadSuccess }: { status?: string, onUploadSuccess?: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(status === 'pending');
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (side === 'front') {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
    } else {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!frontFile || !backFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('front', frontFile);
    formData.append('back', backFile);

    try {
      await api.post('/courier/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const UploadBox = ({ label, side, file, preview, onClear }: { label: string, side: 'front' | 'back', file: File | null, preview: string | null, onClear: () => void }) => (
    <div 
      onClick={() => (side === 'front' ? frontInputRef : backInputRef).current?.click()}
      className={`relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-6 text-center transition-all duration-300 min-h-[220px] flex flex-col items-center justify-center overflow-hidden ${
        file 
          ? 'border-emerald-500/50 bg-emerald-500/5' 
          : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 hover:bg-emerald-500/5'
      }`}
    >
      {preview ? (
        <div className="absolute inset-0 z-0">
          <img src={preview} alt={label} className="w-full h-full object-cover opacity-30 dark:opacity-20 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a111b] via-transparent to-transparent" />
        </div>
      ) : null}

      <div className="relative z-10 w-full">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all ${
          file ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:text-emerald-500'
        }`}>
          {file ? <CheckCircle2 className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
        </div>
        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{label}</p>
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em] truncate max-w-full px-4">
          {file ? file.name : 'Tap to upload'}
        </p>
      </div>

      {file && (
        <button 
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all z-20"
        >
          <XCircle className="w-4 h-4" />
        </button>
      )}
      
      {!file && (
        <div className="absolute top-4 right-4 text-slate-200 dark:text-slate-800 group-hover:text-emerald-500/20 transition-colors">
          <ImageIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Hidden Inputs */}
      <input type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} />
      <input type="file" ref={backInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} />

      <div className="bg-white dark:bg-[#0a111b] rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-900 shadow-xl dark:shadow-2xl transition-all relative overflow-hidden">
        {/* Progress Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-900">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: success ? '100%' : (frontFile || backFile ? (frontFile && backFile ? '90%' : '45%') : '0%') }}
            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Identity Check</h3>
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mt-3 md:mt-2">
              National ID (Fayda) photos are required for station clearance.
            </p>
          </div>
          {success && (
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Under Review</span>
            </div>
          )}
        </div>

        {!success ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadBox 
                label="ID Front View" 
                side="front" 
                file={frontFile} 
                preview={frontPreview}
                onClear={() => { setFrontFile(null); setFrontPreview(null); }}
              />
              <UploadBox 
                label="ID Back View" 
                side="back" 
                file={backFile} 
                preview={backPreview}
                onClear={() => { setBackFile(null); setBackPreview(null); }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploading || !frontFile || !backFile}
              className={`w-full py-5 rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center gap-4 ${
                uploading || !frontFile || !backFile
                  ? 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 hover:-translate-y-1 active:scale-[0.98]'
              }`}
            >
              {uploading ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Transmitting Data...</>
              ) : (
                <><FileText className="w-6 h-6" /> Submit Documents</>
              )}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 bg-emerald-500/[0.02] rounded-[2.5rem] border border-emerald-500/10 relative"
          >
            <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl shadow-emerald-500/40">
              <Loader2 className="w-12 h-12 animate-spin" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Telemetry Received</p>
            <p className="text-slate-400 dark:text-slate-500 font-bold mt-2 text-center px-8">Your Fayda ID has been broadcasted to Ardi Hub for station verification.</p>
            
            <div className="mt-10 px-8 py-5 bg-white dark:bg-[#020817] rounded-3xl flex items-center gap-4 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] border border-slate-100 dark:border-slate-800 shadow-sm max-w-sm">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" /> 
              <span>Estimated Clearance Time: 2-4 Hours. Keep station active.</span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-white dark:bg-[#0a111b] rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-900 shadow-xl transition-all">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
          Clearance Guidelines
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {[
            'Captures must show all four physical card corners',
            'All biometric and text data must be high-contrast',
            'Avoid flash flare and environmental shadows',
            'Documents must be valid and non-expired',
            'Self-portraits are not required in this phase',
            'JPG/PNG format only. Maximum 5MB per capture'
          ].map((item, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="w-6 h-6 bg-slate-50 dark:bg-[#020817] rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-800 group-hover:border-emerald-500/30 transition-colors">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors tracking-tight leading-relaxed">
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
