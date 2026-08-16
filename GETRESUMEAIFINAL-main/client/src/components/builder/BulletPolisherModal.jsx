import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { 
  Sparkles, 
  Check, 
  X, 
  Loader2, 
  TrendingUp, 
  ArrowRight,
  Zap,
  Lightbulb
} from 'lucide-react';

const BulletPolisherModal = ({ isOpen, onClose, initialBullet = '', onApply }) => {
  const toast = useToast();
  const [bullet, setBullet] = useState(initialBullet);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handlePolish = async (e) => {
    e?.preventDefault();
    if (!bullet.trim()) {
      toast.error('Required', 'Please enter a bullet point to polish.');
      return;
    }

    setLoading(true);
    toast.ai('Polishing Bullet', 'Transforming into high-impact XYZ formula...');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/polish-bullet`,
        {
          bullet,
          targetRole,
        }
      );

      setResult(response.data);
      toast.success('Polished!', 'Review the high-impact recommendations.');
    } catch (err) {
      console.error('Bullet Polish Error:', err);
      toast.error('Failed', err.response?.data?.message || 'Failed to polish bullet.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBullet = (selectedText) => {
    onApply(selectedText);
    toast.success('Applied!', 'Bullet updated in your resume.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-black/[0.06] bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">AI Bullet Point Polisher</h3>
              <p className="text-xs text-slate-500 font-medium">Elevate your accomplishments with measurable impact</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Input Area */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                Your Current Bullet Point
              </label>
              <textarea
                rows={3}
                value={bullet}
                onChange={(e) => setBullet(e.target.value)}
                placeholder="e.g. Worked on the website frontend and fixed bugs with React..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-black/10 text-sm font-medium text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="text"
                placeholder="Target Role (e.g. Frontend Lead, Data Analyst)"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="flex-1 w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-black/10 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handlePolish}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black tracking-wide shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Polish with AI
              </button>
            </div>
          </div>

          {/* Results Area */}
          {result && (
            <div className="space-y-4 pt-4 border-t border-black/[0.06] animate-in fade-in slide-in-from-bottom-3 duration-300">
              {/* Score Uplift Badge */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50 border border-orange-200">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-orange-600" />
                  <span className="text-xs font-black text-orange-950">Impact Score Rating:</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-black">
                  <span className="text-slate-400 line-through">{result.impactScoreBefore}%</span>
                  <ArrowRight size={12} className="text-orange-500" />
                  <span className="text-emerald-600 font-extrabold text-sm">{result.impactScoreAfter}%</span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-amber-500" /> Recommended High-Impact Versions:
                </span>

                {/* Primary Choice */}
                <div className="p-4 rounded-2xl bg-white border-2 border-orange-500/30 hover:border-orange-500 shadow-sm transition-all flex flex-col justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-black uppercase">
                      Top Recommendation
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-2 leading-relaxed">
                      {result.polished}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSelectBullet(result.polished)}
                    className="self-end flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <Check size={14} /> Apply to Resume
                  </button>
                </div>

                {/* Alternative Choices */}
                {result.alternatives?.map((alt, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-black/[0.06] hover:border-black/20 transition-all flex flex-col justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10px] font-black uppercase">
                        Alternative {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-700 mt-2 leading-relaxed">
                        {alt}
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectBullet(alt)}
                      className="self-end flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-black hover:bg-black transition-colors cursor-pointer"
                    >
                      <Check size={14} /> Apply to Resume
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulletPolisherModal;
