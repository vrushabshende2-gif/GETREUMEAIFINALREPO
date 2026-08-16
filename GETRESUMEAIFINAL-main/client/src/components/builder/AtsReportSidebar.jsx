import React from 'react';
import { X, Search, CheckCircle2, AlertTriangle, HelpCircle, FileText, Check } from 'lucide-react';
import { calculateLocalATSScore } from '../../utils/atsScorer';
import useResumeStore from '../../store/useResumeStore';

const AtsReportSidebar = ({ isOpen, onClose, localAts }) => {
  const { currentResumeData } = useResumeStore();

  if (!isOpen) return null;

  const result = localAts || calculateLocalATSScore(currentResumeData);
  const { score, breakdown, matchedKeywordsCount, totalKeywords, missingKeywords, metricCount, wordCount, recommendations } = result;

  // Gauge colors
  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (val >= 60) return 'text-orange-500 stroke-orange-500';
    return 'text-red-500 stroke-red-500';
  };

  const getScoreBg = (val) => {
    if (val >= 80) return 'stroke-emerald-100';
    if (val >= 60) return 'stroke-orange-100';
    return 'stroke-red-100';
  };

  const strokeDashoffset = 251.2 - (251.2 * score) / 100;

  return (
    <div className="fixed top-0 right-0 z-[70] h-screen w-[380px] sm:w-[420px] bg-white border-l border-black/5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-16 px-6 border-b border-black/5 flex items-center justify-between bg-stone-50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Search size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-black">ATS Diagnostics Report</h3>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Research-Backed Scoring</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="h-8 w-8 rounded-lg border border-black/5 flex items-center justify-center hover:bg-stone-100 active:scale-95 transition-all text-stone-400 hover:text-black cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
        {/* Score Radial Circle */}
        <div className="bg-stone-50 border border-black/[0.02] rounded-3xl p-6 flex flex-col items-center justify-center text-center">
          <div className="relative h-28 w-28 flex items-center justify-center mb-4">
            <svg className="absolute transform -rotate-90 w-28 h-28">
              <circle
                cx="56"
                cy="56"
                r="40"
                strokeWidth="10"
                fill="transparent"
                className={getScoreBg(score)}
              />
              <circle
                cx="56"
                cy="56"
                r="40"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${getScoreColor(score)}`}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black tracking-tight text-black">{score}%</span>
              <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Match</span>
            </div>
          </div>
          <h4 className="text-sm font-black text-black">
            {score >= 80 ? 'Highly Optimised!' : score >= 60 ? 'Good, Needs Fine-Tuning' : 'Needs Optimization'}
          </h4>
          <p className="text-[10px] text-stone-400 font-bold mt-1 max-w-[200px]">
            Target match rate is 80%+ to clear enterprise filters.
          </p>
        </div>

        {/* Categories breakdown */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">Metrics Breakdown</h4>
          <div className="space-y-2.5">
            {/* Keywords */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50/50 hover:bg-stone-50 border border-black/[0.03] rounded-2xl">
              <div>
                <p className="text-xs font-black text-black">Keyword Intersection</p>
                <p className="text-[10px] font-bold text-stone-400">{matchedKeywordsCount} of {totalKeywords} keywords found</p>
              </div>
              <span className="text-xs font-bold text-black bg-stone-100 px-2.5 py-1 rounded-lg">{breakdown.keywordMatch}/40</span>
            </div>
            {/* Impact Metrics */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50/50 hover:bg-stone-50 border border-black/[0.03] rounded-2xl">
              <div>
                <p className="text-xs font-black text-black">Quantitative Achievements</p>
                <p className="text-[10px] font-bold text-stone-400">{metricCount} metrics parsed (Google XYZ/ABC)</p>
              </div>
              <span className="text-xs font-bold text-black bg-stone-100 px-2.5 py-1 rounded-lg">{breakdown.quantitativeImpact}/20</span>
            </div>
            {/* Action Verbs */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50/50 hover:bg-stone-50 border border-black/[0.03] rounded-2xl">
              <div>
                <p className="text-xs font-black text-black">Active Writing Style</p>
                <p className="text-[10px] font-bold text-stone-400">Verifying presence of direct action verbs</p>
              </div>
              <span className="text-xs font-bold text-black bg-stone-100 px-2.5 py-1 rounded-lg">{breakdown.actionVerbs}/10</span>
            </div>
            {/* Completeness */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50/50 hover:bg-stone-50 border border-black/[0.03] rounded-2xl">
              <div>
                <p className="text-xs font-black text-black">Structure Completeness</p>
                <p className="text-[10px] font-bold text-stone-400">Personal details & standard sections</p>
              </div>
              <span className="text-xs font-bold text-black bg-stone-100 px-2.5 py-1 rounded-lg">{breakdown.completeness}/15</span>
            </div>
            {/* Formatting */}
            <div className="flex items-center justify-between p-3.5 bg-stone-50/50 hover:bg-stone-50 border border-black/[0.03] rounded-2xl">
              <div>
                <p className="text-xs font-black text-black">Length and Formatting</p>
                <p className="text-[10px] font-bold text-stone-400">Word count parsed: {wordCount}</p>
              </div>
              <span className="text-xs font-bold text-black bg-stone-100 px-2.5 py-1 rounded-lg">{breakdown.formatting}/15</span>
            </div>
          </div>
        </div>

        {/* Missing Keywords */}
        {missingKeywords.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">Top Missing Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((kw, i) => (
                <span 
                  key={i} 
                  className="text-[10px] font-bold bg-red-50 border border-red-100 text-red-600 rounded-lg px-2.5 py-1"
                >
                  + {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action recommendations */}
        <div className="space-y-3 pb-6">
          <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider">Critical Optimization Checklist</h4>
          <div className="space-y-2">
            {recommendations.length > 0 ? (
              recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2.5 p-3 rounded-2xl bg-amber-50/50 border border-amber-100 text-[11px] font-bold text-amber-800 leading-relaxed">
                  <AlertTriangle size={15} className="shrink-0 text-amber-500 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))
            ) : (
              <div className="flex gap-2.5 p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-bold items-center">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Your resume meets all modern ATS evaluation frameworks. Clear to download!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtsReportSidebar;
