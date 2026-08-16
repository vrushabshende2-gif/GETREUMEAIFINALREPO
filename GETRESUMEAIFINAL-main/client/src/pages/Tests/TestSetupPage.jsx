import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import useResumeStore from '../../store/useResumeStore';
import { PlayCircle, FileText, CheckCircle2, Award, Sparkles, History, ArrowRight } from 'lucide-react';

const TestSetupPage = () => {
  const { resumeList, fetchResumes } = useResumeStore();
  const navigate = useNavigate();

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchResumes();
  }, [fetchResumes]);

  const handleStartTest = (resumeId) => {
    navigate(`/test/session/${resumeId}`);
  };

  return (
    <div className="flex bg-[#fafafa] min-h-screen relative overflow-x-hidden text-slate-900">
      <div className="ambient-glow-orange top-10 left-64" />
      <div className="ambient-glow-blue top-40 right-20" />

      <Sidebar />

      <main className="flex-1 ml-0 md:ml-20 min-h-screen pt-16 md:pt-0 pb-24 md:pb-12 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 space-y-10">
          
          {/* ── Hero Banner ──────────────────────────────────────────────── */}
          <header className="relative rounded-[36px] bg-white border border-black/[0.06] p-8 md:p-12 shadow-[0_12px_40px_-15px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-orange-50/60 to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[11px] font-black text-orange-600 uppercase tracking-wider shadow-xs">
                <Award size={13} />
                <span>AI Technical Assessment Engine</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Validate Your <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Technical Acumen</span>
              </h1>
              <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                Synthesizes custom senior-level multiple-choice challenges based on the exact skills, tech stack, and experience in your active resume.
              </p>
            </div>
          </header>

          {/* ── Context Selection Grid ───────────────────────────────────── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Select Resume Context</h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Questions are tailored directly to your selected profile</p>
              </div>
              
              <button
                onClick={() => navigate('/test/results')}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-black/10 hover:border-orange-500/30 hover:bg-orange-50/50 text-slate-700 hover:text-orange-600 text-xs font-black transition-all shadow-xs cursor-pointer"
              >
                <History size={14} />
                <span>Scorecard History</span>
              </button>
            </div>

            {resumeList.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-black/10 p-8 space-y-4">
                <FileText size={48} className="mx-auto text-slate-300" />
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">No Resume Context Available</h3>
                  <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                    Create a resume in the studio first so our AI engine can construct a personalized challenge.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/builder')}
                  className="btn-luxury-primary px-8 py-3.5 rounded-2xl text-xs font-black cursor-pointer"
                >
                  Create First Resume
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {resumeList.map(resume => (
                  <div 
                    key={resume._id} 
                    className="bento-card bento-card-hover p-7 flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black shrink-0 shadow-xs">
                            <FileText size={22} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-900 text-base leading-tight truncate max-w-[200px]">
                              {resume.title || 'Untitled Resume'}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                              Template: {resume.template || 'Classic'}
                            </p>
                          </div>
                        </div>

                        {resume.atsScore >= 70 && (
                          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-2xs">
                            <CheckCircle2 size={11} /> {resume.atsScore}% ATS
                          </span>
                        )}
                      </div>
                      
                      {/* Skills Badges */}
                      <div className="flex gap-1.5 flex-wrap">
                        {(resume.skills || []).slice(0, 5).map((skill, i) => (
                           <span key={i} className="px-2.5 py-1 bg-slate-100/80 border border-black/5 text-slate-700 text-[10px] font-bold rounded-lg shadow-2xs">
                             {skill}
                           </span>
                        ))}
                        {(resume.skills || []).length > 5 && (
                          <span className="px-2 py-1 text-slate-400 text-[10px] font-bold">
                            +{(resume.skills.length - 5)} more
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleStartTest(resume._id)}
                      className="btn-luxury-primary w-full py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PlayCircle size={16} />
                      <span>Start Proctored Challenge</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestSetupPage;

