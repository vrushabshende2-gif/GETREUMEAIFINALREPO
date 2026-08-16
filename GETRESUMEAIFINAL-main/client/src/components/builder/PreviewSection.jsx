import React, { useState } from 'react';
import useResumeStore from '../../store/useResumeStore';
import ConfigurableTemplate from '../../ResumeTemplates/ConfigurableTemplate';
import ClassicTemplate from '../../ResumeTemplates/ClassicTemplate';
import { getTemplateById } from '../../services/templatesRegistry';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Sparkles } from 'lucide-react';

const PreviewSection = () => {
    const { currentResumeData, selectedTemplate } = useResumeStore();
    const [zoom, setZoom] = useState(100);

    const safeData = currentResumeData || {};
    const pInfo = safeData.personalInfo || {};

    const mappedData = {
        personalInfo: {
            name: pInfo.fullName || pInfo.name || '',
            email: pInfo.email || '',
            phone: pInfo.phone || '',
            linkedin: pInfo.linkedin || '',
            location: pInfo.location || '',
        },
        summary: pInfo.summary || safeData.summary || '',
        education: Array.isArray(safeData.education) ? safeData.education : [],
        experience: Array.isArray(safeData.experience) ? safeData.experience : [],
        internships: Array.isArray(safeData.internships) ? safeData.internships : [],
        skills: Array.isArray(safeData.skills) ? safeData.skills : [],
        projects: Array.isArray(safeData.projects) ? safeData.projects : [],
        isFresher: !!safeData.isFresher,
        enabledSections: safeData.enabledSections || {
            education: true,
            experience: true,
            internships: false,
            skills: true,
            projects: true,
            summary: true,
        },
    };

    const templateMeta = getTemplateById(selectedTemplate);

    const renderTemplate = () => {
        if (templateMeta?.isConfigurable) {
            return <ConfigurableTemplate data={mappedData} config={templateMeta.config} />;
        }

        if (templateMeta?.component) {
            const Comp = templateMeta.component;
            return <Comp data={mappedData} />;
        }

        return <ClassicTemplate data={mappedData} />;
    };

    return (
        <div className="h-full w-full bg-[#f1f3f5] relative flex flex-col items-center overflow-hidden select-none">
            {/* Floating Studio Toolbar */}
            <div className="absolute top-4 z-20 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-xl border border-black/10 shadow-lg shadow-black/5">
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-r border-black/10 pr-3 mr-1">
                    <Sparkles size={12} className="text-orange-500" />
                    {templateMeta?.name || 'Template'}
                </span>

                <button
                    onClick={() => setZoom((z) => Math.max(60, z - 10))}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Zoom Out"
                >
                    <ZoomOut size={14} />
                </button>
                <span className="text-xs font-black text-slate-700 min-w-[40px] text-center">
                    {zoom}%
                </span>
                <button
                    onClick={() => setZoom((z) => Math.min(140, z + 10))}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    title="Zoom In"
                >
                    <ZoomIn size={14} />
                </button>
                <button
                    onClick={() => setZoom(100)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer ml-1 border-l border-black/10 pl-2.5"
                    title="Reset Zoom"
                >
                    <RotateCcw size={13} />
                </button>
            </div>

            {/* Document Workspace Canvas */}
            <div className="h-full w-full p-8 pt-20 flex justify-center overflow-y-auto scrollbar-hide">
                <div 
                    id="resume-preview-content" 
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                    className="w-full max-w-[800px] transition-transform duration-200 bg-white shadow-[0_25px_70px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] rounded-xs mb-16"
                >
                    {renderTemplate()}
                </div>
            </div>
        </div>
    );
};

export default PreviewSection;

