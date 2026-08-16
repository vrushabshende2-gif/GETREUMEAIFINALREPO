import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertTriangle, Clock, Target, ArrowRight } from 'lucide-react';
import useResumeStore from '../../store/useResumeStore';

// Auth token is in an httpOnly cookie, sent automatically by axios (withCredentials is set globally).

const TestSessionPage = () => {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { resumeList, fetchResumes } = useResumeStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [strikes, setStrikes] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Hard stop flag to prevent further actions if user leaves page
  const strikeCountRef = useRef(0);
  const isFinishedRef = useRef(false);

  const hasFetchedResumesRef = useRef(false);
  // Step 1: Wait for resumes to load
  useEffect(() => {
    if (resumeList.length === 0 && !hasFetchedResumesRef.current) {
      hasFetchedResumesRef.current = true;
      fetchResumes();
    }
  }, [resumeList, fetchResumes]);

  // Step 2: Fetch and Generate Test
  const generateTest = useCallback(async () => {
    if (resumeList.length === 0) return; // Wait for store

    const resumeContext = resumeList.find(r => r._id === resumeId);
    if (!resumeContext) {
      setError("We couldn't find this resume. Please go back.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Calls AI test generation endpoint
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/generate-test`,
        { resumeData: resumeContext }
      );
      
      const genQuestions = res.data?.questions;
      if (!genQuestions || !Array.isArray(genQuestions)) {
        throw new Error('Invalid test format received from server.');
      }
      setQuestions(genQuestions);
    } catch (err) {
      console.error(err);
      setError('Test generation failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [resumeId, resumeList]);

  useEffect(() => {
    if (questions.length === 0 && !error) {
      generateTest();
    }
  }, [generateTest, questions.length, error]);

  // Step 3: Anti-Cheat Tab Monitor (Visibility/Blur)
  useEffect(() => {
    if (loading || error || isFinished) return;

    const handleFocusLoss = () => {
      if (isFinishedRef.current) return;
      
      const currentStrikes = strikeCountRef.current + 1;
      strikeCountRef.current = currentStrikes;
      setStrikes(currentStrikes);
      
      alert(`WARNING: Test Session Disturbance Detected (Strike ${currentStrikes}/3) \nSwitching tabs or minimizing the window is prohibited.`);
      
      if (currentStrikes >= 3) {
        alert("Maximum strikes reached. Auto-submitting current session.");
        handleSubmit();
      }
    };

    window.addEventListener('blur', handleFocusLoss);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleFocusLoss();
      }
    });

    return () => {
      window.removeEventListener('blur', handleFocusLoss);
      document.removeEventListener('visibilitychange', handleFocusLoss);
    };
  }, [loading, error, isFinished]);

  // Step 4: Submission
  const handleSubmit = async () => {
    if (isFinishedRef.current || submitting) return;
    
    setIsFinished(true);
    isFinishedRef.current = true;
    setSubmitting(true);

    try {
      let scoreAmt = 0;
      let correctAnswersCount = 0;
      const finalAnswersArray = [];

      questions.forEach((q, index) => {
        const userChoiceIndex = selectedAnswers[index];
        const isCorrect = userChoiceIndex === q.correctOptionIndex;
        if (isCorrect) {
          correctAnswersCount++;
          scoreAmt += 10; // 10 pts per question
        }
        
        finalAnswersArray.push({
          questionText: q.questionText,
          selectedOptionIndex: userChoiceIndex !== undefined ? userChoiceIndex : null,
          correctOptionIndex: q.correctOptionIndex,
          isCorrect,
          explanation: q.explanation || ''
        });
      });

      const payload = {
        resumeId,
        score: scoreAmt,
        totalQuestions: questions.length,
        correctAnswers: correctAnswersCount,
        switchStrikes: strikeCountRef.current,
        answers: finalAnswersArray
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/tests/results`,
        payload
      );

      navigate('/test/results');
    } catch (err) {
      console.error(err);
      alert('Failed to save test results, but your answers were processed.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestionIdx];

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-orange-500 mb-6" size={48} />
        <h2 className="text-2xl font-black text-black">Formulating Architecture & Assessment</h2>
        <p className="text-stone-500 font-bold mt-2">Analyzing your resume patterns...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-xl border border-red-100">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-black mb-2">Operation Halted</h2>
          <p className="text-stone-500 font-medium mb-6 text-sm">{error}</p>
          <button 
            onClick={() => navigate('/test')} 
            className="px-6 py-3 bg-black hover:bg-stone-900 text-white rounded-xl text-xs font-bold w-full"
          >
            Return to Assessment Board
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col select-none text-slate-900">
      {/* ── Test Header HUD ─────────────────────────────────────────────── */}
      <header className="h-20 bg-white/85 backdrop-blur-2xl border-b border-black/[0.06] px-8 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/25">
            <Target size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-tight">Proctored Assessment HUD</h1>
            <p className="text-[10px] font-bold text-slate-400">Strict Single-Session Focus Lock</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-black bg-slate-100/80 px-4 py-2 rounded-xl text-slate-600 border border-black/5">
            <Clock size={14} className="text-orange-500" />
            <span>Telemetry Active</span>
          </div>
          
          <div className={`flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl border transition-all ${
            strikes > 0 
              ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' 
              : 'bg-white border-black/10 text-slate-400'
          }`}>
            <AlertTriangle size={14} className={strikes > 0 ? 'text-rose-500' : 'text-slate-300'} />
            <span>Strikes: {strikes} / 3</span>
          </div>
        </div>
      </header>

      {/* ── Main Challenge Canvas ────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="max-w-3xl w-full space-y-8">
          
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-400">
              <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
              <span className="text-orange-600">
                {Object.keys(selectedAnswers).length} Answered
              </span>
            </div>
            
            <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-600 to-amber-500 h-full rounded-full transition-all duration-300 ease-out shadow-xs" 
                style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bento-card p-8 md:p-10 space-y-8 animate-in fade-in duration-300" key={currentQuestionIdx}>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Challenge Prompt #{currentQuestionIdx + 1}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                {currentQ.questionText}
              </h2>
            </div>

            <div className="space-y-3 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestionIdx] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: idx }))}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                      isSelected 
                        ? 'border-orange-500 bg-orange-50/50 shadow-md shadow-orange-500/5 ring-1 ring-orange-500' 
                        : 'border-black/[0.08] hover:border-black/20 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1 pr-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className={`text-sm font-bold leading-relaxed ${
                        isSelected ? 'text-orange-950 font-black' : 'text-slate-700'
                      }`}>
                        {option}
                      </span>
                    </div>

                    <span className="text-[10px] font-black text-slate-400 px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center pt-2">
            <button
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              className="px-6 py-3.5 rounded-2xl border border-black/10 font-black text-xs text-slate-600 hover:bg-white hover:text-slate-900 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
            >
              Previous Question
            </button>

            {currentQuestionIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                className="btn-luxury-dark px-8 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="btn-luxury-primary px-9 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {submitting && <Loader2 className="animate-spin" size={14} />}
                <span>Submit &amp; View Competency Radar</span>
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default TestSessionPage;
