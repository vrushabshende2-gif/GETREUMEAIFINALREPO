import React, { useState, useRef, useEffect } from 'react';
import useResumeStore from '../../../store/useResumeStore';
import { Plus, X, Award, Search, Sparkles } from 'lucide-react';
import { SKILLS_LIST } from '../../../utils/skillsList';

const MAX_SKILLS = 30;

const SkillsForm = () => {
  const { currentResumeData, setResumeData } = useResumeStore();
  const skills = Array.isArray(currentResumeData?.skills) ? currentResumeData.skills : [];

  const [skillInput, setSkillInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter suggestions whenever input changes
  useEffect(() => {
    const trimmed = skillInput.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = trimmed.toLowerCase();
    const filtered = SKILLS_LIST.filter(
      (s) => s.toLowerCase().includes(lower) && !skills.includes(s)
    ).slice(0, 8);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setActiveSuggestionIdx(-1);
  }, [skillInput, skills]);

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    setError('');

    if (!trimmed) {
      setError('Please type a skill name.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Skill must be at least 2 characters.');
      return;
    }
    if (skills.includes(trimmed)) {
      setError(`"${trimmed}" is already added.`);
      return;
    }
    if (skills.length >= MAX_SKILLS) {
      setError(`Maximum ${MAX_SKILLS} skills allowed.`);
      return;
    }

    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
    setSkillInput('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (activeSuggestionIdx >= 0 && suggestions[activeSuggestionIdx]) {
      addSkill(suggestions[activeSuggestionIdx]);
    } else {
      addSkill(skillInput);
    }
  };

  const removeSkill = (skillToRemove) => {
    setError('');
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (listRef.current && !listRef.current.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.04]">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black shadow-xs">
              <Award size={16} />
            </div>
            <span>Technical &amp; Domain Competencies</span>
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Keywords matched against automated ATS screening algorithms · {skills.length}/{MAX_SKILLS}
          </p>
        </div>
      </div>

      <div className="bento-card p-6 md:p-8 space-y-6">
        {/* Input with suggestions */}
        <form onSubmit={handleAddSkill} className="relative flex gap-2.5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              className={`w-full rounded-2xl border pl-11 pr-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs ${
                error
                  ? 'border-rose-400 focus:border-rose-500 bg-rose-50/50'
                  : 'border-black/10 bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10'
              }`}
              placeholder="Type a skill e.g. React.js, Kubernetes, Distributed Systems, Python…"
              value={skillInput}
              onChange={(e) => {
                setSkillInput(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              autoComplete="off"
            />

            {/* Suggestion Dropdown */}
            {showSuggestions && (
              <ul
                ref={listRef}
                className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden p-1"
              >
                {suggestions.map((s, i) => (
                  <li key={s}>
                    <button
                      type="button"
                      onMouseDown={() => addSkill(s)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                        i === activeSuggestionIdx
                          ? 'bg-orange-50 text-orange-600 font-black'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {highlightMatch(s, skillInput)}
                    </button>
                  </li>
                ))}
                {skillInput.trim() && !suggestions.find((s) => s.toLowerCase() === skillInput.trim().toLowerCase()) && (
                  <li>
                    <button
                      type="button"
                      onMouseDown={() => addSkill(skillInput)}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 border-t border-black/5 flex items-center gap-2 rounded-xl cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add custom tag "<strong>{skillInput.trim()}</strong>"</span>
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>

          <button
            type="submit"
            className="btn-luxury-primary h-12 px-5 flex items-center justify-center rounded-2xl cursor-pointer shrink-0"
          >
            <Plus size={18} />
          </button>
        </form>

        {/* Validation error */}
        {error && (
          <p className="text-xs font-bold text-rose-500 ml-1">
            ⚠ {error}
          </p>
        )}

        {/* Skills chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="group flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/70 hover:bg-orange-100 px-4 py-2 text-xs font-black text-orange-800 transition-all shadow-2xs"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="rounded-full p-0.5 hover:bg-orange-500 hover:text-white transition-colors cursor-pointer"
                title="Remove skill"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-xs font-medium text-slate-400 italic">
              No skills added yet. Search keywords above or select suggested industry terms.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/** Highlight matching characters in suggestion */
function highlightMatch(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-black text-orange-600">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

export default SkillsForm;

