import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useResumeStore from '../../store/useResumeStore';
import PreviewSection from '../../components/builder/PreviewSection';
import AIPanel from '../../components/builder/AIPanel';
import PersonalInfoForm from '../../components/builder/forms/PersonalInfoForm';
import EducationForm from '../../components/builder/forms/EducationForm';
import ExperienceForm from '../../components/builder/forms/ExperienceForm';
import InternshipForm from '../../components/builder/forms/InternshipForm';
import SkillsForm from '../../components/builder/forms/SkillsForm';
import ProjectsForm from '../../components/builder/forms/ProjectsForm';
import ChatbotSidebar from '../../components/builder/ChatbotSidebar';
import AtsReportSidebar from '../../components/builder/AtsReportSidebar';
import CoverLetterModal from '../../components/builder/CoverLetterModal';
import { calculateLocalATSScore } from '../../utils/atsScorer';
import { MASTER_TEMPLATES_CATALOG } from '../../services/templatesRegistry';
import { downloadAsPDF } from '../../utils/pdfGenerator';
import {
  Download,
  Save,
  Settings2,
  Eye,
  Layout,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  GraduationCap,
  Briefcase,
  User,
  FileText,
  Sparkles,
} from 'lucide-react';

// ─── Section Nav Items ─────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Settings2 },
  { id: 'projects', label: 'Projects', icon: Zap },
];

// ─── Toast ─────────────────────────────────────────────────────────────────

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-300 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const icons = {
    success: <CheckCircle2 size={16} />,
    error: <AlertCircle size={16} />,
    info: <Loader2 size={16} className="animate-spin" />,
  };
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-xl max-w-sm animate-in slide-in-from-bottom-4 duration-300 ${styles[toast.type]}`}>
      {icons[toast.type]}
      <p className="text-sm font-semibold flex-1">{toast.message}</p>
      <button onClick={onClose} className="text-current opacity-50 hover:opacity-100 ml-2">
        <X size={14} />
      </button>
    </div>
  );
};

// ─── Toggle Item ───────────────────────────────────────────────────────────

const ToggleItem = ({ label, checked, onChange, icon: Icon }) => (
  <label className="flex items-center justify-between p-4 rounded-2xl border border-black/5 bg-stone-50/50 hover:bg-white transition-all cursor-pointer group">
    <div className="flex items-center gap-3">
      {Icon && <Icon size={18} className="text-stone-400 group-hover:text-orange-500 transition-colors" />}
      <span className="text-sm font-bold text-stone-600 group-hover:text-black">{label}</span>
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-5 w-5 accent-orange-500 rounded-lg cursor-pointer"
    />
  </label>
);

// ─── Section Title ──────────────────────────────────────────────────────────

const SectionTitle = ({ title, subtitle, icon: Icon }) => (
  <div className="flex items-center gap-3 mb-8">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
      <Icon size={20} />
    </div>
    <div>
      <h3 className="text-lg font-black text-black leading-tight">{title}</h3>
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{subtitle}</p>
    </div>
  </div>
);

// ─── Main Builder Content ──────────────────────────────────────────────────

const BuilderContent = () => {
  const navigate = useNavigate();
  const { 
    currentResumeData, 
    updateResumeData, 
    setFresherMode, 
    setTemplate, 
    selectedTemplate,
    saveResume,
    isSaving,
    error
  } = useResumeStore();
  
  const safeResumeData = currentResumeData || {};
  const isFresher = safeResumeData.isFresher || false;
  const enabledSections = safeResumeData.enabledSections || {
    education: true,
    experience: true,
    internships: false,
    skills: true,
    projects: true,
    summary: true,
  };

  const [toast, setToast] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAtsOpen, setIsAtsOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [mobileView, setMobileView] = useState('editor');

  // Compute live local ATS score using the same accurate algorithm as server-side atsService.js
  // This is the single source of truth — used for badge, sidebar, and saved atsScore.
  const localAts = calculateLocalATSScore(currentResumeData);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  // Sync error from store to toast
  useEffect(() => {
    if (error) {
        showToast(error, 'error');
    }
  }, [error, showToast]);

  // ─── PDF Download ────────────────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    const elementId = 'resume-preview-content';
    const element = document.getElementById(elementId);
    
    if (!element) {
      showToast('Preview not found. Please try again.', 'error');
      return;
    }

    setIsDownloading(true);
    showToast('Generating PDF…', 'info');

    try {
      const name = currentResumeData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Resume';
      const success = await downloadAsPDF(elementId, `${name}_Resume.pdf`);

      if (success) {
        showToast('PDF downloaded successfully!', 'success');
      } else {
        throw new Error('PDF generation failed');
      }
    } catch (err) {
      console.error('PDF Error:', err);
      showToast('PDF generation failed. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveDraft = async () => {
    showToast('Saving draft…', 'info');
    try {
      useResumeStore.setState(state => ({
        currentResumeData: { ...state.currentResumeData, atsScore: localAts.score }
      }));
      await saveResume(false);
      showToast('Draft saved successfully!', 'success');
    } catch (err) {
      // Error handled by useEffect above
    }
  };

  const handleSaveAndExit = async () => {
    showToast('Saving and exiting…', 'info');
    try {
      useResumeStore.setState(state => ({
        currentResumeData: { ...state.currentResumeData, atsScore: localAts.score }
      }));
      await saveResume(false);
      navigate('/dashboard');
    } catch (err) {
      // Error handled by useEffect
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden select-none">
      {/* Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Sidebars & Modals */}
      <ChatbotSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <AtsReportSidebar isOpen={isAtsOpen} onClose={() => setIsAtsOpen(false)} localAts={localAts} />
      <CoverLetterModal isOpen={isCoverLetterOpen} onClose={() => setIsCoverLetterOpen(false)} resumeData={currentResumeData} />

      {/* ── Top Header ─────────────────────────────────────────────────── */}
      <header className="h-16 md:h-18 border-b border-black/[0.06] px-4 md:px-6 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-2xl z-50 shadow-xs shrink-0 gap-2 overflow-x-auto scrollbar-hide">
        {/* Logo & Status */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 hover:scale-105 transition-transform cursor-pointer"
            title="Return to Dashboard"
          >
            <Layout size={18} />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-sm font-black text-slate-900 leading-tight">Studio Builder</h2>
            <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">AI Engine Active</p>
          </div>
        </div>

        {/* Mobile Editor/Preview Switcher (< lg) */}
        <div className="lg:hidden flex items-center p-1 bg-slate-100 rounded-xl border border-black/5 shrink-0">
          <button
            onClick={() => setMobileView('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              mobileView === 'editor' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ✏️ Editor
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              mobileView === 'preview' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            👁️ Preview
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Template Switcher */}
          <select
            className="rounded-xl border border-black/10 bg-slate-50/80 px-2.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer hover:bg-white transition-colors max-w-[130px] sm:max-w-[180px] truncate"
            value={selectedTemplate}
            onChange={(e) => setTemplate(e.target.value)}
          >
            {MASTER_TEMPLATES_CATALOG.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Real-time ATS Score Badge */}
          <button
            onClick={() => setIsAtsOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-black text-slate-900 hover:bg-slate-50 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-black text-white ${
              localAts.score >= 80 ? 'bg-emerald-500 animate-pulse' : localAts.score >= 60 ? 'bg-orange-500' : 'bg-rose-500'
            }`}>
              {localAts.score}
            </span>
            <span className="hidden sm:inline">ATS Score</span>
          </button>

          {/* AI Cover Letter Generator */}
          <button
            onClick={() => setIsCoverLetterOpen(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-2 text-xs font-black transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <Sparkles size={14} className="text-orange-500" />
            <span>Letter</span>
          </button>

          {/* AI Chatbot Assistant Trigger */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-black text-white px-3 py-2 text-xs font-black transition-all active:scale-95 shadow-md shadow-black/10 cursor-pointer"
          >
            <span>🤖 AI</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="btn-luxury-primary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black text-white disabled:opacity-50 cursor-pointer"
          >
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span className="hidden md:inline">Download PDF</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Form Area ──────────────────────────────────────────── */}
        <div className={`w-full lg:w-[55%] xl:w-[48%] h-full overflow-y-auto scrollbar-hide border-r border-black/5 px-4 sm:px-6 lg:px-10 py-6 md:py-8 ${
          mobileView === 'editor' ? 'block' : 'hidden lg:block'
        }`}>

          {/* AI Panel — always at top */}
          <AIPanel />

          {/* Smart Controls */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <Zap size={15} className="text-orange-500" />
              <h3 className="text-xs font-black text-black uppercase tracking-widest">Smart Controls</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ToggleItem
                label="Are you a fresher?"
                checked={isFresher}
                onChange={setFresherMode}
                icon={Eye}
              />
              <ToggleItem
                label="Show Summary"
                checked={enabledSections.summary}
                onChange={(val) => updateResumeData('enabledSections', 'summary', val)}
                icon={Settings2}
              />
              <ToggleItem
                label="Show Projects"
                checked={enabledSections.projects}
                onChange={(val) => updateResumeData('enabledSections', 'projects', val)}
                icon={Settings2}
              />
              <ToggleItem
                label="Show Skills"
                checked={enabledSections.skills}
                onChange={(val) => updateResumeData('enabledSections', 'skills', val)}
                icon={Settings2}
              />
            </div>
          </section>

          {/* Form Sections */}
          <div className="space-y-14">
            <section id="section-personal">
              <SectionTitle title="Personal Information" subtitle="Contact & profile" icon={User} />
              <PersonalInfoForm />
            </section>

            <section id="section-education">
              <SectionTitle title="Education" subtitle="Academic background" icon={GraduationCap} />
              <EducationForm />
            </section>

            <section id="section-experience">
              {!isFresher ? (
                <>
                  <SectionTitle title="Work Experience" subtitle="Professional history" icon={Briefcase} />
                  <ExperienceForm />
                </>
              ) : (
                <>
                  <SectionTitle title="Internships" subtitle="Training & internships" icon={Briefcase} />
                  <InternshipForm />
                </>
              )}
            </section>

            <section id="section-skills">
              <SkillsForm />
            </section>

            <section id="section-projects">
              <ProjectsForm />
            </section>
          </div>

          {/* Footer note */}
          <div className="mt-16 pb-8 pt-8 border-t border-black/5 text-center">
            <p className="text-stone-400 text-xs font-medium">
              ✓ Auto-saved to account · All data stays private
            </p>
          </div>
        </div>

        {/* ── Right: Live Preview ───────────────────────────────────────── */}
        <div className={`flex-1 h-full shadow-inner bg-stone-100 overflow-hidden ${
          mobileView === 'preview' ? 'block' : 'hidden lg:block'
        }`}>
          <PreviewSection />
        </div>
      </div>
    </div>
  );
};

const BuilderPage = () => {
  return (
    <BuilderContent />
  );
};

export default BuilderPage;
