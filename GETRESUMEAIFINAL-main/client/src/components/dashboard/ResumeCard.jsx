import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useResumeStore from '../../store/useResumeStore';
import ClassicTemplate from '../../ResumeTemplates/ClassicTemplate';
import ModernTemplate from '../../ResumeTemplates/ModernTemplate';
import { AliceTemplate, IsabelleTemplate } from '../../ResumeTemplates/ATSResumeTemplete';
import { OceanTemplate, EmeraldTemplate } from '../../ResumeTemplates/CreativeTemplete';
import { FileEdit, Trash2, Download, MoreVertical, Calendar, Loader2, Copy, FileJson, Sparkles } from 'lucide-react';
import { downloadAsPDF } from '../../utils/pdfGenerator';
import { useToast } from '../../context/ToastContext';

const ResumeCard = ({ resume }) => {
  const { _id, title, updatedAt, template = 'classic', atsScore = 0 } = resume;
  const navigate = useNavigate();
  const { loadResume, deleteResume, duplicateResume, exportResumeJSON } = useResumeStore();
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const getTemplateComponent = (templateId) => {
    switch (templateId) {
      case 'modern':
        return ModernTemplate;
      case 'ats-alice':
        return AliceTemplate;
      case 'ats-isabelle':
        return IsabelleTemplate;
      case 'creative':
      case 'emerald':
        return EmeraldTemplate;
      case 'ocean':
        return OceanTemplate;
      case 'classic':
      default:
        return ClassicTemplate;
    }
  };

  const SelectedTemplate = getTemplateComponent(template);

  // Map structured resume data to template format
  const mappedData = {
    personalInfo: {
      name: resume.personalInfo?.name || '',
      email: resume.personalInfo?.email || '',
      phone: resume.personalInfo?.phone || '',
      linkedin: resume.personalInfo?.linkedin || '',
      location: resume.personalInfo?.location || '',
    },
    summary: resume.summary || '',
    education: resume.education || [],
    experience: resume.experience || [],
    internships: resume.internships || [],
    skills: resume.skills || [],
    projects: resume.projects || [],
    isFresher: resume.isFresher ?? false,
    enabledSections: resume.enabledSections || { education: true, experience: true, summary: true, skills: true, projects: true },
    selectedTemplate: template
  };

  const handleEdit = () => {
    loadResume(resume);
    navigate('/builder');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      await deleteResume(_id);
      toast.info('Deleted', 'Resume removed successfully.');
    }
  };

  const handleDuplicate = async () => {
    setMenuOpen(false);
    toast.ai('Duplicating', 'Creating a copy of your resume...');
    await duplicateResume(_id);
    toast.success('Duplicated!', 'Copy created in your dashboard.');
  };

  const handleExportJSON = () => {
    setMenuOpen(false);
    exportResumeJSON(resume);
    toast.success('Exported!', 'JSON resume backup downloaded.');
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const elementId = `pdf-capture-${_id}`;
    const fileName = `${title || 'resume'}_Resume.pdf`;
    
    setTimeout(async () => {
      await downloadAsPDF(elementId, fileName);
      setIsDownloading(false);
      toast.success('Downloaded!', 'PDF saved to your device.');
    }, 100);
  };

  const lastUpdated = new Date(updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="group relative w-72 flex-shrink-0 flex flex-col rounded-[32px] border border-black/[0.06] bg-white p-4.5 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_32px_64px_-16px_rgba(234,88,12,0.15)] hover:border-orange-500/30">
      
      {/* Hidden high-res container for PDF capture */}
      <div className="fixed -left-[9999px] top-0">
        <div id={`pdf-capture-${_id}`} className="w-[800px] bg-white">
          <SelectedTemplate data={mappedData} />
        </div>
      </div>

      {/* Header Info */}
      <div className="flex items-start justify-between mb-3.5 px-1 relative">
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-base font-black text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors duration-300">
            {title || 'Untitled Resume'}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
            <Calendar size={11} className="shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {lastUpdated}
            </span>
          </div>
        </div>
        
        {/* Menu Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-30 w-48 rounded-2xl bg-white border border-black/10 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={handleDuplicate}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-black text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors cursor-pointer"
              >
                <Copy size={14} /> Duplicate Copy
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <FileJson size={14} /> Backup JSON
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 size={14} /> Delete Resume
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visual Preview Area */}
      <div className="relative mb-4 aspect-[1/1.4142] overflow-hidden rounded-[22px] bg-gradient-to-b from-slate-50 to-slate-100/60 border border-black/[0.04] transition-all duration-500 group-hover:border-orange-500/20 shadow-inner">
        
        {/* Top Badges */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {atsScore > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black tracking-wider shadow-md shadow-emerald-500/20 flex items-center gap-1">
              <Sparkles size={10} /> {atsScore}% ATS
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-black/5 text-[9px] font-black uppercase tracking-widest text-slate-600 shadow-sm">
            {template}
          </span>
        </div>

        {/* Dynamic Template Preview - Scaled Down */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-2">
          <div className="w-[500px] flex-shrink-0 origin-center scale-[0.40] transition-transform duration-700 group-hover:scale-[0.43]">
            <div className="shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-black/5 rounded-md overflow-hidden bg-white">
               <SelectedTemplate 
                 data={mappedData} 
               />
            </div>
          </div>
        </div>
        
        {/* Hover Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-600/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      
      {/* Action Row */}
      <div className="flex items-center gap-2 px-0.5">
        <button 
          onClick={handleEdit}
          className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-xs font-black text-white shadow-lg shadow-black/5 transition-all duration-300 hover:bg-orange-600 hover:shadow-orange-500/25 active:scale-95 cursor-pointer"
        >
          <FileEdit size={14} />
          <span>Edit in Studio</span>
        </button>
        
        <button 
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-black/[0.08] text-slate-700 shadow-xs transition-all duration-300 hover:border-orange-500/30 hover:text-orange-600 hover:bg-orange-50/50 active:scale-90 disabled:opacity-50 cursor-pointer"
          title="Download PDF"
        >
          {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
        </button>
        
        <button 
          onClick={handleDelete}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-black/[0.08] text-slate-400 shadow-xs transition-all duration-300 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50/50 active:scale-90 cursor-pointer"
          title="Delete Resume"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};


export default ResumeCard;
