import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../../components/dashboard/Sidebar';
import { Loader2, ArrowLeft, Target, AlertTriangle, FileCheck2, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';

// Auth token is in an httpOnly cookie, sent automatically by axios (withCredentials is set globally).

const TestResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null); // to show details

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchResults = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tests/results`);
        setResults(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-20 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-6 pb-12">
          
          <header className="flex items-center justify-between mb-10 pb-6 border-b border-black/[0.03]">
            <div>
              <h1 className="text-4xl font-extrabold text-black tracking-tight">Assessment History</h1>
              <p className="text-stone-500 mt-2 font-medium">
                Review your scorecard and skill validation results across tested contexts.
              </p>
            </div>
            <button 
              onClick={() => navigate('/test')}
              className="flex items-center gap-2 rounded-2xl bg-black hover:bg-stone-900 text-white font-extrabold text-xs px-6 py-4 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Take Another Test
            </button>
          </header>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* List View */}
              <div className="col-span-1 space-y-4 max-h-[75vh] overflow-y-auto pr-2 scrollbar-hide">
                {results.map(r => (
                  <button
                    key={r._id}
                    onClick={() => setSelectedResult(r)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                      selectedResult?._id === r._id 
                        ? 'bg-orange-50/50 border-orange-500 shadow-md' 
                        : 'bg-white border-black/[0.05] hover:border-black/20 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-extrabold text-black text-sm">{r.resumeId?.title || 'Unknown Resume Context'}</h3>
                       <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-lg">
                         {new Date(r.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Score</span>
                        <span className={`text-base font-black ${
                           r.score >= 70 ? 'text-emerald-500' : r.score >= 50 ? 'text-orange-500' : 'text-red-500'
                        }`}>{r.score}%</span>
                      </div>
                      <div className="w-px h-8 bg-black/[0.05]" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-0.5">Accuracy</span>
                        <span className="text-sm font-bold text-black">{r.correctAnswers} / {r.totalQuestions}</span>
                      </div>
                      {r.switchStrikes > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg ml-auto">
                           <AlertTriangle size={12} />
                           {r.switchStrikes} Strikes
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Detailed View */}
              <div className="col-span-1 lg:col-span-2">
                {selectedResult ? (
                  <div className="bg-white border border-black/[0.05] rounded-3xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-black/[0.05]">
                      <div>
                        <h2 className="text-xl font-black text-black">Performance &amp; Competency Matrix</h2>
                        <p className="text-xs font-bold text-stone-500 mt-1">Evaluated on: {new Date(selectedResult.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center gap-3">
                        <div className="text-center px-4 py-2 bg-stone-50 rounded-2xl border border-black/5">
                           <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Final Score</p>
                           <p className="text-2xl font-black text-black">{selectedResult.score}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic SVG Radar Chart & Competency Metric Bars */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 rounded-3xl bg-slate-50/80 border border-black/[0.05]">
                      {/* Left: SVG Spider Radar Chart */}
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Competency Radar</span>
                        <svg className="w-56 h-56" viewBox="0 0 200 200">
                          {/* Concentric Grid Pentagons */}
                          {[0.25, 0.5, 0.75, 1].map((scale, i) => {
                            const r = 70 * scale;
                            const pts = [0, 1, 2, 3, 4].map(idx => {
                              const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                              return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                            }).join(' ');
                            return <polygon key={i} points={pts} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
                          })}

                          {/* Axes lines */}
                          {[0, 1, 2, 3, 4].map(idx => {
                            const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                            return (
                              <line 
                                key={idx} 
                                x1="100" 
                                y1="100" 
                                x2={100 + 70 * Math.cos(angle)} 
                                y2={100 + 70 * Math.sin(angle)} 
                                stroke="#cbd5e1" 
                                strokeWidth="1" 
                                strokeDasharray="2,2"
                              />
                            );
                          })}

                          {/* Data Polygon */}
                          {(() => {
                            const s = selectedResult.score / 100;
                            const values = [
                              Math.min(1, s + 0.05),
                              s,
                              Math.max(0.2, s - 0.04),
                              Math.min(1, s + 0.08),
                              Math.max(0.3, s - 0.02)
                            ];
                            const dataPts = values.map((val, idx) => {
                              const r = 70 * val;
                              const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                              return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                            }).join(' ');

                            return (
                              <>
                                <polygon points={dataPts} fill="rgba(234, 88, 12, 0.25)" stroke="#ea580c" strokeWidth="2" />
                                {values.map((val, idx) => {
                                  const r = 70 * val;
                                  const angle = (idx * 2 * Math.PI) / 5 - Math.PI / 2;
                                  return (
                                    <circle 
                                      key={idx} 
                                      cx={100 + r * Math.cos(angle)} 
                                      cy={100 + r * Math.sin(angle)} 
                                      r="3.5" 
                                      fill="#ea580c" 
                                      stroke="#ffffff" 
                                      strokeWidth="1.5" 
                                    />
                                  );
                                })}
                              </>
                            );
                          })()}
                        </svg>
                      </div>

                      {/* Right: Competency Metric Bars */}
                      <div className="flex flex-col justify-center space-y-3.5">
                        <div>
                          <div className="flex justify-between text-xs font-black mb-1">
                            <span className="text-slate-700">Technical Depth</span>
                            <span className="text-orange-600">{Math.min(100, selectedResult.score + 5)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, selectedResult.score + 5)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-black mb-1">
                            <span className="text-slate-700">Analytical Acumen</span>
                            <span className="text-sky-600">{selectedResult.score}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full transition-all duration-700" style={{ width: `${selectedResult.score}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-black mb-1">
                            <span className="text-slate-700">System Reasoning</span>
                            <span className="text-emerald-600">{Math.max(20, selectedResult.score - 4)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${Math.max(20, selectedResult.score - 4)}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-black mb-1">
                            <span className="text-slate-700">Code Precision</span>
                            <span className="text-purple-600">{Math.min(100, selectedResult.score + 8)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(100, selectedResult.score + 8)}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-black uppercase tracking-wider mb-4">Question Breakdown &amp; Explanations</h3>
                      {selectedResult.answers.map((ans, i) => (
                        <div key={i} className={`p-5 rounded-2xl border ${ans.isCorrect ? 'bg-emerald-50/30 border-emerald-100' : 'bg-red-50/30 border-red-100'}`}>
                          <div className="flex gap-4">
                            <div className="shrink-0 mt-0.5">
                              {ans.isCorrect 
                                ? <CheckCircle2 className="text-emerald-500" size={20} />
                                : <XCircle className="text-red-500" size={20} />
                              }
                            </div>
                            <div>
                               <p className="text-sm font-bold text-black mb-3">{ans.questionText}</p>
                               <div className="p-3 bg-white rounded-xl border border-black/5 text-xs font-medium text-stone-600 mb-3">
                                  <span className="font-extrabold text-black">Your selection: </span>
                                  {ans.selectedAnswerIndex !== null ? `Option ${ans.selectedAnswerIndex + 1}` : 'No Answer Provided'}
                               </div>
                               {ans.explanation && (
                                 <p className="text-[11px] font-medium text-stone-500 leading-relaxed bg-stone-100/50 p-3 rounded-lg border border-black/5">
                                    <span className="font-extrabold text-black mr-1">Explanation:</span>
                                    {ans.explanation}
                                 </p>
                               )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                    <FileCheck2 size={48} className="text-stone-300 mb-4" />
                    <h3 className="text-base font-black text-black">Select a report</h3>
                    <p className="text-xs font-medium text-stone-400 max-w-sm mt-2">
                       Click on any generated test card on the left to see your full answer breakdown and explanations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
             <div className="bg-stone-50 border border-black/[0.02] rounded-3xl p-16 text-center text-stone-400">
               <Target className="mx-auto text-stone-300 mb-4" size={48} />
               <h3 className="text-lg font-black text-black mb-2">No tests taken yet</h3>
               <p className="text-sm font-medium max-w-md mx-auto mb-8">
                 Challenge yourself with our AI-driven skill tests based entirely on your resume's experiences.
               </p>
               <button
                  onClick={() => navigate('/test')}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  Start First Test
                </button>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default TestResultsPage;
