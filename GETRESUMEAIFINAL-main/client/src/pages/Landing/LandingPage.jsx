import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ATSScanner from '../../components/ats/ATSScanner';
import { 
  Cpu, 
  Zap, 
  Shield, 
  Globe, 
  Star, 
  Sparkles, 
  CheckCircle, 
  Target, 
  TrendingUp,
  ArrowRight,
  FileText,
  Layers,
  Award,
  CheckCircle2,
  Lock,
  ChevronRight,
  Briefcase,
  Terminal,
  Activity,
  Check,
  X,
  Compass,
  Code2,
  BarChart3,
  Sliders,
  CheckCheck
} from 'lucide-react';
import { MASTER_TEMPLATES_CATALOG } from '../../services/templatesRegistry';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeHeroTab, setActiveHeroTab] = useState('xyz');

  const categories = ['All', 'ATS-Optimized', 'Traditional', 'Creative', 'Executive'];

  const filteredTemplates = activeCategory === 'All'
    ? MASTER_TEMPLATES_CATALOG.slice(0, 6)
    : MASTER_TEMPLATES_CATALOG.filter(t => t.category.toLowerCase().includes(activeCategory.toLowerCase())).slice(0, 6);

  return (
    <div className="flex flex-col w-full font-sans bg-[#fafafa] min-h-screen text-slate-900 relative overflow-x-hidden select-none">
      
      {/* ── Ambient Radiant Ember Glows ───────────────────────────────── */}
      <div className="ambient-glow-orange top-0 left-1/4" />
      <div className="ambient-glow-blue top-96 right-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-0" />

      {/* ── Top Navigation Dock ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-black/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                GetResume<span className="text-orange-500">.ai</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mt-1">
                Career Studio
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-slate-600">
            <a href="#hero-mockup" className="hover:text-orange-600 transition-colors">Interactive Engine</a>
            <a href="#scanner-section" className="hover:text-orange-600 transition-colors">ATS Radar</a>
            <a href="#templates-section" className="hover:text-orange-600 transition-colors">Templates</a>
            <a href="#comparison-section" className="hover:text-orange-600 transition-colors">Comparison</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="btn-luxury-primary px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2"
            >
              <span>Launch Studio</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-16 md:pt-24 md:pb-24 flex flex-col items-center text-center z-10 space-y-8">
        
        {/* Top Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-black/[0.08] shadow-xs text-xs font-black text-slate-800">
          <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          <span>Next-Gen Career Intelligence Engine</span>
          <ChevronRight size={14} className="text-slate-400" />
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[1.04] max-w-5xl">
          Land senior roles with <br />
          <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
            Precision Resume AI.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed">
          Overcome strict ATS filters, quantify bullet impact with the Google XYZ formula, and craft Harvard-grade resumes that secure top interview callbacks.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto btn-luxury-primary px-10 py-5 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 shadow-xl shadow-orange-500/25 hover:scale-105 transition-all"
          >
            <Zap size={18} className="fill-white" />
            <span>Build Your Resume Free</span>
          </Link>
          <a
            href="#scanner-section"
            className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-white hover:bg-slate-50 border border-black/10 text-slate-800 font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Target size={18} className="text-orange-600" />
            <span>Run Live ATS Audit</span>
          </a>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-6 pt-6 border-t border-black/[0.05] max-w-md">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={16} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="text-slate-900 font-black">4.95 / 5.0</span>
            <span>·</span>
            <span>Trusted by 25,000+ candidates at Google, Apple &amp; Stripe</span>
          </div>
        </div>

        {/* ── Hero Interactive Studio Mockup Window ─────────────────────── */}
        <div id="hero-mockup" className="w-full max-w-5xl pt-8">
          <div className="rounded-[36px] bg-white border border-black/[0.08] p-6 md:p-8 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.07)] relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-50/60 blur-[80px] pointer-events-none" />

            {/* Window Header */}
            <div className="flex items-center justify-between pb-5 border-b border-black/[0.06] mb-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-black text-slate-400 ml-3">getresume-studio-v2.exe</span>
              </div>

              <div className="flex items-center gap-2 p-1 bg-slate-100/80 border border-black/5 rounded-xl">
                <button
                  onClick={() => setActiveHeroTab('xyz')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeHeroTab === 'xyz' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  XYZ Formula AI
                </button>
                <button
                  onClick={() => setActiveHeroTab('radar')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activeHeroTab === 'radar' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ATS Radar Index
                </button>
              </div>
            </div>

            {/* Tab 1: Live XYZ Transformation Diff */}
            {activeHeroTab === 'xyz' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                <div className="p-6 rounded-2xl bg-slate-50 border border-black/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-1.5">
                      <X size={12} /> Standard Applicant Bullet
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">ATS Score: 41%</span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono leading-relaxed bg-white p-4 rounded-xl border border-black/[0.04] shadow-inner">
                    "Responsible for developing backend features, managing databases, and helping the frontend team with APIs."
                  </p>
                  <p className="text-[11px] font-bold text-slate-400">❌ Passive phrasing, 0 quantified business metrics.</p>
                </div>

                <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-200/80 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-xl shadow-xs">
                    ✓ AI Optimized
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 flex items-center gap-1.5">
                      <Check size={12} /> Google XYZ Accomplishment Formula
                    </span>
                    <span className="text-[10px] font-black text-emerald-600">ATS Score: 98%</span>
                  </div>
                  <p className="text-xs text-slate-900 font-mono leading-relaxed bg-white p-4 rounded-xl border border-orange-200 shadow-xs">
                    "Architected high-throughput async microservices with Redis caching, reducing p99 API latency by 48% across 1.4M daily transactions."
                  </p>
                  <p className="text-[11px] font-bold text-emerald-600">✨ Action verb + Measurable metric + Technical mechanism.</p>
                </div>
              </div>
            )}

            {/* Tab 2: ATS Radar Index */}
            {activeHeroTab === 'radar' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                <div className="p-5 rounded-2xl bg-slate-50 border border-black/[0.06] space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Workday ATS Screener</span>
                  <p className="text-2xl font-black text-emerald-600">99.8% Match</p>
                  <p className="text-xs text-slate-500 font-medium">Single-column parse pass</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-black/[0.06] space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Greenhouse Parser</span>
                  <p className="text-2xl font-black text-emerald-600">100% Verified</p>
                  <p className="text-xs text-slate-500 font-medium">Zero parsing collision</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-black/[0.06] space-y-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">Lever Intelligence</span>
                  <p className="text-2xl font-black text-orange-600">High Seniority</p>
                  <p className="text-xs text-slate-500 font-medium">Keyword hierarchy aligned</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </section>

      {/* ── Interactive ATS Radar Section ────────────────────────────── */}
      <section id="scanner-section" className="w-full max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-black/[0.04] relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="w-full lg:w-1/2 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-xs font-black text-orange-600">
              <Target size={14} />
              <span>Real-Time Diagnostic Scanner</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Test your resume before recruiters do.
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
              Upload your current PDF or DOCX file to see exact keyword density gaps, parse errors, and missing senior competencies in seconds.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Checks formatting against Tier-1 enterprise ATS engines</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Detects weak accomplishment verbs and recommends metrics</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Zero data retention — your resume remains 100% private</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="rounded-[36px] bg-white border border-black/[0.08] p-2 shadow-xl">
              <ATSScanner />
            </div>
          </div>
        </div>
      </section>

      {/* ── Curated Templates Showcase ───────────────────────────────── */}
      <section id="templates-section" className="w-full max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-black/[0.04]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-black uppercase tracking-widest text-orange-600">
              Battle-Tested Designs
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
              Curated Executive Layouts.
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Modeled after verified resumes from staff engineers and executives at Harvard, Google, and McKinsey.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-black/10 rounded-2xl shadow-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredTemplates.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate('/builder')}
              className="bento-card bento-card-hover p-6 flex flex-col justify-between group cursor-pointer"
            >
              <div className="aspect-[1/1.3] bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-2xl border border-black/[0.04] p-5 relative overflow-hidden flex flex-col justify-between mb-5 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-wider text-slate-700 shadow-xs">
                    {t.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black tracking-wider shadow-2xs">
                    99% ATS Pass
                  </span>
                </div>

                <div className="space-y-2 pointer-events-none opacity-70">
                  <div className="h-4 w-3/4 bg-slate-900 rounded-sm" />
                  <div className="h-2 w-1/2 bg-orange-500 rounded-sm mb-4" />
                  <div className="h-1.5 w-full bg-slate-300 rounded-sm" />
                  <div className="h-1.5 w-5/6 bg-slate-300 rounded-sm" />
                  <div className="h-1.5 w-full bg-slate-300 rounded-sm" />
                </div>

                <div className="text-[10px] font-bold text-slate-400">
                  {t.description || 'Optimized single-column design with clean section hierarchy.'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-400">{t.category}</p>
                </div>
                <button className="h-10 w-10 rounded-xl bg-slate-100 group-hover:bg-orange-500 group-hover:text-white text-slate-700 flex items-center justify-center transition-colors">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison Matrix: Us vs Generic Builders ───────────────── */}
      <section id="comparison-section" className="w-full max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-black/[0.04] text-left">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-orange-600">
            Head to Head Benchmark
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">
            Why Generic AI Fails ATS.
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Most builders generate fluffy adjectives that get your resume discarded. We engineer quantified impact.
          </p>
        </div>

        <div className="rounded-[36px] bg-white border border-black/[0.08] overflow-hidden shadow-[0_15px_45px_-10px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-3 p-6 md:p-8 bg-slate-50/80 border-b border-black/[0.06] text-xs font-black uppercase tracking-wider text-slate-400">
            <span>Capability</span>
            <span>Traditional / Generic Builders</span>
            <span className="text-orange-600">GetResume AI</span>
          </div>

          <div className="divide-y divide-black/[0.04] text-xs font-bold text-slate-700">
            <div className="grid grid-cols-3 p-6 items-center">
              <span className="font-black text-slate-900">Bullet Point Formulation</span>
              <span className="text-slate-400 font-medium">Generic AI buzzwords</span>
              <span className="text-emerald-600 font-black flex items-center gap-1.5"><Check size={14} /> Google XYZ Accomplishment Engine</span>
            </div>

            <div className="grid grid-cols-3 p-6 items-center">
              <span className="font-black text-slate-900">ATS Formatting Guarantee</span>
              <span className="text-slate-400 font-medium">Broken columns &amp; icons</span>
              <span className="text-emerald-600 font-black flex items-center gap-1.5"><Check size={14} /> 100% Compliant Single-Column PDF</span>
            </div>

            <div className="grid grid-cols-3 p-6 items-center">
              <span className="font-black text-slate-900">Skill Verification</span>
              <span className="text-slate-400 font-medium">None / Self-reported</span>
              <span className="text-emerald-600 font-black flex items-center gap-1.5"><Check size={14} /> Proctored Skill Assessment &amp; Radar</span>
            </div>

            <div className="grid grid-cols-3 p-6 items-center">
              <span className="font-black text-slate-900">Pipeline Synchronization</span>
              <span className="text-slate-400 font-medium">No application tracking</span>
              <span className="text-emerald-600 font-black flex items-center gap-1.5"><Check size={14} /> Real-Time Kanban Job Tracker</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#0c0c0e] text-white py-16 px-6 md:px-12 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles size={18} className="text-orange-500" />
              GetResume<span className="text-orange-500">.ai</span>
            </h2>
            <p className="text-slate-400 text-xs font-medium max-w-sm leading-relaxed">
              Empowering ambitious professionals with high-performance resume engineering and intelligent career tooling.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-black text-white text-xs uppercase tracking-widest">Platform</h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li><Link to="/dashboard" className="hover:text-orange-400 transition-colors">Studio Builder</Link></li>
              <li><Link to="/ats-check" className="hover:text-orange-400 transition-colors">ATS Scanner</Link></li>
              <li><Link to="/jobs" className="hover:text-orange-400 transition-colors">Job Board &amp; Tracker</Link></li>
              <li><Link to="/test" className="hover:text-orange-400 transition-colors">Skill Assessments</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-black text-white text-xs uppercase tracking-widest">Security &amp; Standards</h4>
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              100% Privacy Compliant. HTTP-only secure cookie authentication and encrypted session storage.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-bold text-slate-500">
          <span>© 2026 GetResume.ai — All Rights Reserved.</span>
          <span className="text-slate-400 mt-2 sm:mt-0">Engineered for High-Impact Careers</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;



