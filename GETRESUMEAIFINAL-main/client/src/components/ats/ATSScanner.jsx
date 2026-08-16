import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp, 
  UploadCloud, 
  Sparkles, 
  Layers, 
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

const getScoreColor = (score) => {
  if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-500', ring: 'ring-emerald-200', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (score >= 60) return { text: 'text-orange-500', bg: 'bg-orange-500', ring: 'ring-orange-200', badge: 'bg-orange-50 text-orange-700 border-orange-200' };
  return { text: 'text-rose-600', bg: 'bg-rose-500', ring: 'ring-rose-200', badge: 'bg-rose-50 text-rose-700 border-rose-200' };
};

const ATSScanner = () => {
  const [status, setStatus] = useState('idle'); // idle, scanning, result, error
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const startScan = async () => {
    if (!file) return;
    setStatus('scanning');
    
    await new Promise(resolve => setTimeout(resolve, 800));

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ats/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setStatus('result');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to parse resume document. Please verify the format.';
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setFile(null);
    setResult(null);
    setErrorMsg('');
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[36px] border border-black/[0.06] bg-white p-7 md:p-8 shadow-xl relative overflow-hidden">
      {status === 'idle' && (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 rounded-3xl border-2 border-dashed border-black/10 hover:border-orange-500/40 bg-slate-50/60 hover:bg-orange-50/20 transition-all cursor-pointer flex flex-col items-center gap-3 group"
          >
            <div className="h-16 w-16 rounded-2xl bg-white shadow-md shadow-black/5 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <UploadCloud size={32} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">
                {file ? file.name : "Click to select or drag & drop resume"}
              </p>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                PDF, DOCX format up to 10MB
              </p>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button 
            onClick={startScan} 
            disabled={!file}
            className={`w-full py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
              !file 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'btn-luxury-primary'
            }`}
          >
            <Search size={16} />
            <span>Run Deep ATS Analysis</span>
          </button>
        </div>
      )}

      {status === 'scanning' && (
        <div className="flex flex-col items-center gap-8 py-12">
          <div className="relative h-44 w-36 bg-slate-50 rounded-2xl border border-black/10 shadow-sm flex items-center justify-center overflow-hidden">
            <FileText size={64} className="text-slate-300" />
            <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_15px_#ea580c] animate-scan z-10" />
            <div className="absolute inset-0 bg-orange-500/5" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-slate-900">Running ATS Diagnostic Scan...</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Evaluating Keyword Density · Parsing Typography
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
           <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-rose-600">
             <AlertCircle size={48} />
           </div>
           <div>
             <h3 className="text-xl font-black text-slate-900 mb-1">Scan Unsuccessful</h3>
             <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">{errorMsg}</p>
           </div>
           <button 
             onClick={reset} 
             className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs transition-all cursor-pointer"
           >
             Try Different File
           </button>
        </div>
      )}

      {status === 'result' && result && (() => {
        const colors = getScoreColor(result.score);
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">ATS Diagnostic Report</h3>
                <p className="text-[11px] font-bold text-slate-400">Scanned against Tier-1 ATS Screeners</p>
              </div>
              <div className={`flex items-center gap-1.5 font-black text-xs px-3.5 py-1.5 rounded-full border ${colors.badge}`}>
                <Activity size={14} />
                <span>{result.label || 'Evaluated'}</span>
              </div>
            </div>

            {/* Score Ring / Card */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-black/[0.06] shadow-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Readiness Score</span>
                <p className={`text-5xl font-black ${colors.text}`}>{result.score}%</p>
              </div>
              <div className="text-right space-y-1 text-xs font-bold text-slate-500">
                <p>Structure: <span className="font-black text-slate-900">100% Passed</span></p>
                <p>Keywords: <span className="font-black text-slate-900">{result.score >= 70 ? 'High' : 'Moderate'}</span></p>
              </div>
            </div>

            {/* Missing Keywords Pills */}
            <div className="space-y-3">
               {result.missingKeywords?.length > 0 && (
                 <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-2">
                    <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                       <AlertCircle size={14} className="text-amber-600" /> Recommended Keywords to Add
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                       {result.missingKeywords.map(kw => (
                         <span key={kw} className="text-[10px] font-black bg-white text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs capitalize">
                           + {kw}
                         </span>
                       ))}
                    </div>
                 </div>
               )}

               {result.recommendations?.length > 0 && (
                 <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.05] space-y-1">
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                       <Sparkles size={14} className="text-orange-500" /> Key Optimization Strategy
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{result.recommendations[0]}</p>
                 </div>
               )}
            </div>

            {/* Action Row */}
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={reset} 
                className="w-1/3 py-3.5 rounded-2xl text-xs font-black bg-white border border-black/10 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Scan Another
              </button>
              <button 
                onClick={() => navigate('/builder')} 
                className="w-2/3 btn-luxury-primary py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Edit in Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ATSScanner;

