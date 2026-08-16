import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  X, 
  FileText, 
  Loader2, 
  SendHorizontal,
  Briefcase
} from 'lucide-react';

const CoverLetterModal = ({ isOpen, onClose, resumeData }) => {
  const toast = useToast();
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Confident & Professional');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      toast.error('Required Field', 'Please enter a target Job Title.');
      return;
    }

    setLoading(true);
    toast.ai('Generating Cover Letter', 'Our AI is tailoring your accomplishments to the role...');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/generate-cover-letter`,
        {
          resumeData,
          jobTitle,
          company,
          jobDescription,
          tone,
        }
      );

      setCoverLetter(response.data);
      toast.success('Generated!', 'Your custom cover letter is ready.');
    } catch (err) {
      console.error('Cover Letter Generation Error:', err);
      toast.error('Generation Failed', err.response?.data?.message || 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter?.fullLetter) return;
    navigator.clipboard.writeText(coverLetter.fullLetter);
    setCopied(true);
    toast.success('Copied!', 'Cover letter copied to your clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!coverLetter?.fullLetter) return;
    const element = document.createElement('a');
    const file = new Blob([coverLetter.fullLetter], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${jobTitle.replace(/\s+/g, '_')}_Cover_Letter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Downloaded!', 'Cover letter saved as text file.');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-black/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/[0.06] bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">AI Cover Letter Generator</h3>
              <p className="text-xs text-slate-500 font-medium">Craft a bespoke letter matching your resume & target job</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {!coverLetter ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                    Target Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-black/10 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Google, Stripe, Meta"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-black/10 text-sm font-bold text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Tone of Voice
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Confident & Professional', 'Executive & Strategic', 'Enthusiastic & High-Energy', 'Technical & Precise'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                        tone === t
                          ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Job Description / Key Requirements (Optional)
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste the job description or specific key bullet points here for maximum ATS alignment..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-black/10 text-sm font-medium text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm tracking-wide shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating Tailored Letter...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Cover Letter
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Output Preview */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-black/[0.06] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Subject</span>
                    <p className="text-sm font-bold text-slate-900">{coverLetter.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-black/10 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Download size={14} />
                      Export
                    </button>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                  {coverLetter.fullLetter}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCoverLetter(null)}
                  className="px-6 py-3 rounded-2xl border border-black/10 text-xs font-black text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ← Edit Inputs / Regenerate
                </button>
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black hover:bg-black transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterModal;
