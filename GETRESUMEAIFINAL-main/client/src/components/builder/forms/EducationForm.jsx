import React from 'react';
import useResumeStore from '../../../store/useResumeStore';
import Input from '../../common/Input';
import AutocompleteInput, { UNIVERSITY_SUGGESTIONS, LOCATION_SUGGESTIONS } from '../../common/AutocompleteInput';
import { Plus, Trash2, GraduationCap, MapPin, Calendar, Award } from 'lucide-react';

const EducationForm = () => {
  const { currentResumeData, updateEntry, addEntry, removeEntry } = useResumeStore();
  const education = Array.isArray(currentResumeData?.education) ? currentResumeData.education : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
             <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black shadow-xs">
               <GraduationCap size={16} />
             </div>
             <span>Education &amp; Credentials</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1">Academic degrees, institutions, and major fields of study</p>
        </div>
        <button 
          onClick={() => addEntry('education')}
          className="btn-luxury-dark flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          <span>Add Education</span>
        </button>
      </div>

      {education.map((item, index) => (
        <div key={item.id} className="bento-card p-6 md:p-8 space-y-6 relative group">
          {education.length > 1 && (
            <button 
              onClick={() => removeEntry('education', item.id)}
              className="absolute right-5 top-5 rounded-xl p-2 text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer"
              title="Remove education entry"
            >
              <Trash2 size={16} />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AutocompleteInput 
              label="School / University" 
              name="school"
              placeholder="e.g. Harvard University or IIT Bombay" 
              value={item.school || ''}
              onChange={(e) => updateEntry('education', item.id, 'school', e.target.value)}
              suggestions={UNIVERSITY_SUGGESTIONS}
              icon={GraduationCap}
            />
            <Input 
              label="Degree &amp; Major" 
              placeholder="e.g. Bachelor of Science in Computer Science" 
              value={item.degree || ''}
              onChange={(e) => updateEntry('education', item.id, 'degree', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Graduation Year / Range" 
              placeholder="e.g. 2019 — 2023" 
              value={item.year || ''}
              onChange={(e) => updateEntry('education', item.id, 'year', e.target.value)}
            />
            <AutocompleteInput 
              label="Campus Location" 
              name="location"
              placeholder="e.g. Cambridge, MA or Mumbai, India" 
              value={item.location || ''}
              onChange={(e) => updateEntry('education', item.id, 'location', e.target.value)}
              suggestions={LOCATION_SUGGESTIONS}
              icon={MapPin}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EducationForm;

