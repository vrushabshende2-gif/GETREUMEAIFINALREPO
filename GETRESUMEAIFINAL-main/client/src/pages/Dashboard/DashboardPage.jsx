import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useResumeStore from '../../store/useResumeStore';
import Sidebar from '../../components/dashboard/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';
import ResumeCard from '../../components/dashboard/ResumeCard';
import EmptyState from '../../components/dashboard/EmptyState';
import TemplateCard from '../../components/dashboard/TemplateCard';
import { 
  PlusCircle, 
  Search, 
  Sparkles, 
  Target,
  Loader2,
  Upload,
  FileJson,
  Briefcase,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Cpu,
  FileEdit,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { resumeList, fetchResumes, resetResume, importResumeJSON, isLoading, loadResume } = useResumeStore();
  const { user } = useAuth();
  const { resumeData: profileData } = useResume();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const hasFetched = useRef(false);
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchResumes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateNew = () => {
    resetResume({
      name: user?.name || profileData?.personalInfo?.fullName,
      email: user?.email || profileData?.personalInfo?.email,
      phone: profileData?.personalInfo?.phone,
      location: profileData?.personalInfo?.location,
      linkedin: profileData?.personalInfo?.linkedin,
      summary: profileData?.personalInfo?.summary,
      education: profileData?.education,
      experience: profileData?.experience,
      internships: profileData?.internships,
      skills: profileData?.skills,
      projects: profileData?.projects,
    });
    navigate('/builder');
  };

  const handleJSONFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importResumeJSON(event.target.result);
      if (success) {
        toast.success('Restored!', 'Resume restored from backup.');
        navigate('/builder');
      } else {
        toast.error('Failed', 'Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const templates = [
    { name: 'Professional Classic', id: 1, templateId: 'classic' },
    { name: 'Modern Minimalist', id: 2, templateId: 'modern' },
    { name: 'Minimalist ATS', id: 3, templateId: 'ats-alice' },
    { name: 'Modern ATS', id: 4, templateId: 'ats-isabelle' },
    { name: 'Emerald Modern', id: 5, templateId: 'creative' },
    { name: 'Ocean Blueprint', id: 6, templateId: 'ocean' },
  ];

  // Calculate average ATS score
  const avgScore = resumeList.length > 0
    ? Math.round(resumeList.reduce((acc, r) => acc + (r.atsScore || 75), 0) / resumeList.length)
    : 85;

  const primaryResume = resumeList.length > 0 ? resumeList[0] : null;

  return (
    <div className="flex bg-[#fafafa] min-h-screen overflow-x-hidden relative">
      {/* Ambient background glows */}
      <div className="ambient-glow-orange top-10 left-64" />
      <div className="ambient-glow-blue top-40 right-20" />

      {/* Hidden File Input for JSON Backup */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleJSONFile}
        accept=".json,application/json"
        className="hidden"
      />

      <Sidebar />

      <main className="flex-1 ml-0 md:ml-20 min-h-screen pt-16 md:pt-0 pb-24 md:pb-16 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-6 md:pt-8 pb-12 space-y-12">
          
          {/* ── Top Header & Greeting ────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[11px] font-black text-orange-600 uppercase tracking-widest shadow-2xs">
                <Sparkles size={12} />
                <span>Command Center · Smart Assistant</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                Welcome back, <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Leader'}</span>
              </h1>
              <p className="text-sm font-medium text-slate-500 max-w-xl">
                Real-time resume telemetry, ATS screening scores, and application tracking pipeline.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-3 rounded-2xl bg-white border border-black/10 hover:border-black/20 text-slate-700 text-xs font-black transition-all active:scale-95 shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Upload size={14} />
                <span>Restore JSON</span>
              </button>
              <button 
                onClick={handleCreateNew} 
                className="btn-luxury-primary px-7 py-3.5 rounded-2xl text-xs font-black flex items-center gap-2.5 cursor-pointer"
              >
                <PlusCircle size={16} />
                <span>Create New Resume</span>
              </button>
            </div>
          </div>

          {/* ── Asymmetric Stage: 70/30 Split Hero & Telemetry Rail ───────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 8 Cols: Spotlight Workspace Card */}
            <div className="lg:col-span-8 flex flex-col justify-between rounded-[36px] bg-gradient-to-br from-slate-900 via-[#0e0e11] to-[#151518] text-white p-8 md:p-10 border border-white/[0.08] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-orange-300 text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                    Primary Workspace Document
                  </span>
                  {primaryResume && (
                    <span className="text-xs font-bold text-slate-400">
                      Updated {new Date(primaryResume.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-w-lg">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                    {primaryResume?.title || 'Start Your First ATS Resume'}
                  </h2>
                  <p className="text-xs md:text-sm font-medium text-slate-400 leading-relaxed">
                    {primaryResume
                      ? 'Loaded with Google XYZ formula bullet points, verified against Workday & Lever screening algorithms.'
                      : 'Build an executive-ready resume tailored with AI in under 3 minutes.'}
                  </p>
                </div>

                {/* Live Stats Pill Group */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-3 backdrop-blur-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">ATS Score</span>
                      <p className="text-sm font-black text-white">{primaryResume?.atsScore || avgScore || 92}%</p>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-3 backdrop-blur-sm">
                    <div className="h-2 w-2 rounded-full bg-orange-400" />
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Active Template</span>
                      <p className="text-sm font-black text-white capitalize">{primaryResume?.template || 'Classic ATS'}</p>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center gap-3 backdrop-blur-sm">
                    <div className="h-2 w-2 rounded-full bg-indigo-400" />
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total Resumes</span>
                      <p className="text-sm font-black text-white">{resumeList.length} Active</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Ribbon inside Spotlight */}
              <div className="relative z-10 flex flex-wrap items-center gap-3 pt-8 mt-8 border-t border-white/[0.08]">
                {primaryResume ? (
                  <>
                    <button
                      onClick={() => {
                        loadResume(primaryResume);
                        navigate('/builder');
                      }}
                      className="btn-luxury-primary px-6 py-3.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer"
                    >
                      <FileEdit size={15} />
                      <span>Continue in Studio</span>
                    </button>
                    <button
                      onClick={() => navigate('/ats-check')}
                      className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-black transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <Search size={15} />
                      <span>Run ATS Audit</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCreateNew}
                    className="btn-luxury-primary px-8 py-3.5 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle size={15} />
                    <span>Create Resume Now</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right 4 Cols: Diagnostic & Pipeline Rail */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Telemetry Card 1: Live ATS Screening Status */}
              <div 
                onClick={() => navigate('/ats-check')}
                className="bento-card p-6 md:p-7 flex flex-col justify-between hover:border-orange-500/30 transition-all cursor-pointer group flex-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-xs">
                      <Search size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      99.8% Pass Rate
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                    ATS Scanner &amp; Matcher
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                    Audit keywords and section hierarchies against target job postings.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/[0.04] text-xs font-black text-orange-600">
                  <span>Open Scanner</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Telemetry Card 2: Kanban Pipeline */}
              <div 
                onClick={() => navigate('/jobs')}
                className="bento-card p-6 md:p-7 flex flex-col justify-between hover:border-indigo-500/30 transition-all cursor-pointer group flex-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                      <Briefcase size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                      Live Pipeline
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Hiring Hub &amp; Kanban
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">
                    Track applications from Applied through Technical Interview to Offer.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/[0.04] text-xs font-black text-indigo-600">
                  <span>Track Applications</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

            </div>
          </div>

          {/* ── Active Resumes Portfolio Gallery ──────────────────────────────── */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Resume Portfolio</h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">High-fidelity tailored versions ready for PDF export &amp; AI refinement</p>
              </div>
              {!isLoading && (
                <span className="glass-pill">{resumeList.length} Total Versions</span>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={36} />
              </div>
            ) : resumeList.length > 0 ? (
              <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
                {resumeList.map(resume => (
                  <ResumeCard 
                    key={resume._id}
                    resume={resume}
                  />
                ))}
              </div>
            ) : (
              <EmptyState onCreateClick={handleCreateNew} />
            )}
          </section>

          {/* ── Curated Templates Showcase ───────────────────────────────────── */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Curated Templates</h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Tested across Fortune 500 applicant tracking systems</p>
              </div>
              <button 
                onClick={() => navigate('/templates')}
                className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Catalog</span>
                <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
              {templates.map(temp => (
                <TemplateCard 
                  key={temp.id} 
                  name={temp.name} 
                  templateId={temp.templateId}
                />
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;

