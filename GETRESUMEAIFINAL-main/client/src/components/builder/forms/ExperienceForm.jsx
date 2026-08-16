import React, { useState } from 'react';
import useResumeStore from '../../../store/useResumeStore';
import Input from '../../common/Input';
import BulletPolisherModal from '../BulletPolisherModal';
import { Plus, Trash2, Briefcase, Sparkles, Building2, Calendar, UserCheck } from 'lucide-react';

const ExperienceForm = () => {
  const { currentResumeData, updateEntry, addEntry, removeEntry } = useResumeStore();
  const experience = Array.isArray(currentResumeData?.experience) ? currentResumeData.experience : [];
  const isFresher = !!currentResumeData?.isFresher;

  const [polisherTargetId, setPolisherTargetId] = useState(null);

  if (isFresher) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
             <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black shadow-xs">
               <Briefcase size={16} />
             </div>
             <span>Work Experience</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1">Quantify career accomplishments with measurable impact</p>
        </div>
        <button 
          onClick={() => addEntry('experience')}
          className="btn-luxury-dark flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          <span>Add Role</span>
        </button>
      </div>

      {experience.map((item, index) => (
        <div key={item.id} className="bento-card p-6 md:p-8 space-y-6 relative group">
          {experience.length > 1 && (
            <button 
              onClick={() => removeEntry('experience', item.id)}
              className="absolute right-5 top-5 rounded-xl p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
              title="Remove experience entry"
            >
              <Trash2 size={16} />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Company Name" 
              placeholder="e.g. Google, Stripe, or Vercel" 
              value={item.company}
              onChange={(e) => updateEntry('experience', item.id, 'company', e.target.value)}
            />
            <Input 
              label="Job Title / Position" 
              placeholder="e.g. Senior Backend Engineer" 
              value={item.position}
              onChange={(e) => updateEntry('experience', item.id, 'position', e.target.value)}
            />
          </div>

          <div>
            <Input 
              label="Employment Duration" 
              placeholder="e.g. Mar 2022 — Present · San Francisco, CA" 
              value={item.duration}
              onChange={(e) => updateEntry('experience', item.id, 'duration', e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
             <div className="flex items-center justify-between">
               <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 ml-1">
                 Responsibilities &amp; Measurable Accomplishments
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
                className="textarea-luxury min-h-[120px]"
                placeholder="• Architected microservices reducing API latency by 45%&#10;• Led migration of 1.2M user records with zero downtime&#10;• Mentored 4 junior engineers on distributed systems design..."
                value={item.description}
                onChange={(e) => updateEntry('experience', item.id, 'description', e.target.value)}
             />
          </div>
        </div>
      ))}

      {/* Bullet Polisher Modal Integration */}
      {polisherTargetId && (
        <BulletPolisherModal
          isOpen={!!polisherTargetId}
          onClose={() => setPolisherTargetId(null)}
          initialBullet={experience.find(e => e.id === polisherTargetId)?.description || ''}
          onApply={(polishedText) => {
            const currentDesc = experience.find(e => e.id === polisherTargetId)?.description || '';
            const newDesc = currentDesc ? `${currentDesc}\n• ${polishedText}` : `• ${polishedText}`;
            updateEntry('experience', polisherTargetId, 'description', newDesc);
            setPolisherTargetId(null);
          }}
        />
      )}
    </div>
  );
};

export default ExperienceForm;

