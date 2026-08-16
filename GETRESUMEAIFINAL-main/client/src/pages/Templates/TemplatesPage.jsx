import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import useResumeStore from '../../store/useResumeStore';
import ConfigurableTemplate from '../../ResumeTemplates/ConfigurableTemplate';
import { 
  filterTemplates, 
  TEMPLATE_CATEGORIES, 
  MASTER_TEMPLATES_CATALOG 
} from '../../services/templatesRegistry';
import { 
  Check, 
  MousePointer2, 
  Layout, 
  Palette, 
  Sparkles,
  Search,
  ShieldCheck,
  Award,
  ArrowRight,
  Zap
} from 'lucide-react';

const TemplatesPage = () => {
  const navigate = useNavigate();
  const { selectedTemplate, setTemplate, resetResume } = useResumeStore();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    return filterTemplates({ category: activeCategory, search: searchQuery });
  }, [activeCategory, searchQuery]);

  const handleSelect = (id) => {
    resetResume();
    setTemplate(id);
    navigate('/builder');
  };

  return (
    <div className="flex bg-[#fafafa] min-h-screen overflow-x-hidden relative text-slate-900">
      <div className="ambient-glow-orange top-10 left-64" />
      <div className="ambient-glow-blue top-60 right-20" />

      <Sidebar />

      <main className="flex-1 ml-0 md:ml-20 min-h-screen pt-16 md:pt-0 pb-24 md:pb-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 space-y-10 md:space-y-12">
          
          {/* ── Header ──────────────────────────────────────────────────── */}
          <header className="relative rounded-[36px] bg-white border border-black/[0.06] p-8 md:p-12 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-orange-50/60 to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-black text-orange-600 uppercase tracking-wider shadow-xs">
                <Award size={13} />
                <span>Executive Template Library</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Engineered for <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Top Screeners</span>
              </h1>
              <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                Hand-crafted resume layouts modeled after successful hires at Google, McKinsey, Apple, Amazon, and Harvard.
              </p>
            </div>
          </header>

          {/* ── Search & Filter Controls ────────────────────────────────── */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search templates by role or category (e.g. Harvard, Minimal, Tech)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-black/10 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white border border-black/10 rounded-2xl w-fit shadow-xs">
              {TEMPLATE_CATEGORIES.map(cat => (
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

          {/* ── Templates Grid ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((temp) => (
              <div 
                key={temp.id}
                onClick={() => handleSelect(temp.id)}
                className={`bento-card bento-card-hover p-6 flex flex-col justify-between cursor-pointer group ${
                  selectedTemplate === temp.id ? 'ring-2 ring-orange-500' : ''
                }`}
              >
                {/* Badges Bar */}
                <div className="flex items-center justify-between mb-4 z-10">
                  <span className="px-2.5 py-1 bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-700 rounded-lg group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                    {temp.badge || temp.category}
                  </span>
                  {temp.atsScore && (
                    <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 shadow-2xs">
                      <ShieldCheck size={11} />
                      {temp.atsScore}
                    </span>
                  )}
                </div>

                {/* Template Live Preview Box */}
                <div className="relative mb-5 aspect-[1/1.4142] overflow-hidden rounded-[22px] border border-black/[0.06] bg-gradient-to-b from-slate-50 to-slate-100/60 transition-all duration-300 group-hover:border-orange-500/20 shadow-inner">
                  <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none">
                    <div className="w-[500px] flex-shrink-0 origin-center scale-[0.40] transition-transform duration-500 group-hover:scale-[0.43]">
                      <div className="shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 rounded-sm overflow-hidden bg-white">
                        {temp.isConfigurable ? (
                          <ConfigurableTemplate data={{}} config={temp.config} />
                        ) : (
                          <temp.component data={{}} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Badge */}
                  {selectedTemplate === temp.id && (
                    <div className="absolute top-4 right-4 h-9 w-9 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-xl z-20 animate-in zoom-in-50 duration-300">
                      <Check size={18} strokeWidth={3.5} />
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="flex flex-col flex-1">
                  <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-orange-600 transition-colors">
                    {temp.name}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 line-clamp-2">
                    {temp.desc}
                  </p>

                  <div className="mt-auto">
                    <button className="w-full py-3.5 rounded-2xl text-xs font-black bg-slate-900 text-white group-hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                      <Zap size={14} />
                      Use This Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Footer Banner ───────────────────────────────────────────── */}
          <section className="p-10 rounded-[36px] bg-[#0c0c0e] text-white relative overflow-hidden border border-white/10 shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl text-center md:text-left space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Need 100% Guaranteed ATS Parsing?</h2>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                  Select Harvard Executive Classic or Google Tech Lead for bulletproof parsing across Workday, Taleo, and Greenhouse.
                </p>
              </div>
              <button
                onClick={() => handleSelect('harvard-classic')}
                className="btn-luxury-primary px-8 py-4 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Palette size={16} />
                <span>Launch Harvard Classic</span>
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
};

export default TemplatesPage;

