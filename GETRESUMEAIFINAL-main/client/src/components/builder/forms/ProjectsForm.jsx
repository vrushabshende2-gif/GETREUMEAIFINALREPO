import React, { useState } from 'react';
import useResumeStore from '../../../store/useResumeStore';
import Input from '../../common/Input';
import BulletPolisherModal from '../BulletPolisherModal';
import { Plus, Trash2, FolderGit2, Sparkles, ExternalLink } from 'lucide-react';

const ProjectsForm = () => {
  const { currentResumeData, updateEntry, addEntry, removeEntry } = useResumeStore();
  const projects = Array.isArray(currentResumeData?.projects) ? currentResumeData.projects : [];
  const [polisherTargetId, setPolisherTargetId] = useState(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
             <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black shadow-xs">
               <FolderGit2 size={16} />
             </div>
             <span>Personal &amp; Open-Source Projects</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1">Portfolio highlights, architecture, and technology stack</p>
        </div>
        <button 
          onClick={() => addEntry('projects')}
          className="btn-luxury-dark flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          <span>Add Project</span>
        </button>
      </div>

      {projects.map((item, index) => (
        <div key={item.id} className="bento-card p-6 md:p-8 space-y-6 relative group">
          {projects.length > 1 && (
            <button 
              onClick={() => removeEntry('projects', item.id)}
              className="absolute right-5 top-5 rounded-xl p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
              title="Remove project"
            >
              <Trash2 size={16} />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Project Title" 
              placeholder="e.g. Distributed Key-Value Store or AI Code Reviewer" 
              value={item.title}
              onChange={(e) => updateEntry('projects', item.id, 'title', e.target.value)}
            />
            <Input 
              label="Project Repository / Live URL" 
              placeholder="e.g. github.com/username/project or myapp.dev" 
              value={item.link}
              onChange={(e) => updateEntry('projects', item.id, 'link', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
             <div className="flex items-center justify-between">
               <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 ml-1">
                 Technologies Used &amp; Key Highlights
               </label>
               <button
                 type="button"
                 onClick={() => setPolisherTargetId(item.id)}
                 className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-[11px] font-black text-orange-700 transition-all cursor-pointer shadow-2xs"
               >
                 <Sparkles size={12} className="text-orange-500" />
                 <span>XYZ Bullet AI</span>
               </button>
             </div>
             <textarea 
               className="textarea-luxury min-h-[110px]"
               placeholder="• Built with Go, gRPC, and Raft consensus handling 10,000 req/sec&#10;• Implemented automated CI/CD pipeline reducing build cycles by 60%..."
               value={item.description}
               onChange={(e) => updateEntry('projects', item.id, 'description', e.target.value)}
             />
          </div>
        </div>
      ))}

      {/* Bullet Polisher Modal Integration */}
      {polisherTargetId && (
        <BulletPolisherModal
          isOpen={!!polisherTargetId}
          onClose={() => setPolisherTargetId(null)}
          initialBullet={projects.find(p => p.id === polisherTargetId)?.description || ''}
          onApply={(polishedText) => {
            const currentDesc = projects.find(p => p.id === polisherTargetId)?.description || '';
            const newDesc = currentDesc ? `${currentDesc}\n• ${polishedText}` : `• ${polishedText}`;
            updateEntry('projects', polisherTargetId, 'description', newDesc);
            setPolisherTargetId(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectsForm;

