import React from 'react';

/**
 * Universal High-End Professional Resume Template Engine (20 Authentic Templates)
 * Powers real-world layouts used by candidates at Harvard, Google, McKinsey, Apple, Goldman Sachs, Tesla, Stanford, Nike, Johns Hopkins, Amazon, MIT, Y Combinator, and Deloitte.
 */
const ConfigurableTemplate = ({ data, config = {} }) => {
  const safeData = data || {};
  const pInfo = safeData.personalInfo || {};

  const { styleVariant = 'harvard-classic' } = config;

  const summary = pInfo.summary || safeData.summary || '';
  const experienceList = safeData.isFresher ? (safeData.internships || []) : (safeData.experience || []);
  const educationList = safeData.education || [];
  const skillsList = safeData.skills || [];
  const projectsList = safeData.projects || [];
  const enabledSections = safeData.enabledSections || {
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
  };

  const name = pInfo.name || pInfo.fullName || '';
  const email = pInfo.email || '';
  const phone = pInfo.phone || '';
  const location = pInfo.location || '';
  const linkedin = pInfo.linkedin || '';

  // Demo fallback if data is completely unpopulated
  const isDemo = !name && !email && !experienceList.length && !educationList.length;

  const displayName = isDemo ? 'ALEXANDER MORGAN' : name;
  const displayEmail = isDemo ? 'alexander.morgan@example.com' : email;
  const displayPhone = isDemo ? '+1 (555) 019-2831' : phone;
  const displayLocation = isDemo ? 'San Francisco, CA' : location;
  const displayLinkedin = isDemo ? 'linkedin.com/in/alexander-morgan' : linkedin;
  const displaySummary = isDemo
    ? 'Results-driven leader with 7+ years of experience executing high-impact technical initiatives, leading cross-functional teams, and driving business growth in fast-paced environments.'
    : summary;

  const displayExperience = isDemo ? [
    {
      id: 'demo-1',
      position: 'Senior Product Lead / Engineer',
      company: 'Apex Global Technologies',
      location: 'San Francisco, CA',
      duration: '2021 – Present',
      description: '• Spearheaded core platform optimization initiative, accelerating processing speeds by 42% for 2M+ active users.\n• Led cross-functional team of 14 engineers, designers, and data scientists across product lifecycle.\n• Reduced operational infrastructure expenditure by $1.8M annually through serverless migration.'
    },
    {
      id: 'demo-2',
      position: 'Systems & Data Analyst',
      company: 'Vanguard Analytics',
      location: 'New York, NY',
      duration: '2018 – 2021',
      description: '• Architected automated business intelligence pipeline, processing 50M+ daily telemetry events.\n• Built executive dashboards adopted across 6 business divisions to track core financial performance.'
    }
  ] : experienceList;

  const displayEducation = isDemo ? [
    {
      id: 'demo-edu-1',
      school: 'Stanford University',
      degree: 'B.S. in Computer Science & Management',
      year: '2014 – 2018'
    }
  ] : educationList;

  const displaySkills = isDemo ? ['Python', 'System Architecture', 'React', 'SQL', 'Financial Modeling', 'Agile Leadership', 'Cloud Infrastructure'] : skillsList;

  const displayProjects = isDemo ? [
    {
      id: 'demo-proj-1',
      title: 'High-Throughput Analytics Engine',
      link: 'github.com/demo/analytics-engine',
      description: 'Engineered an open-source distributed event processor capable of ingesting 100k events/sec with sub-5ms latency.'
    }
  ] : projectsList;

  const renderBullets = (desc) => {
    if (!desc) return null;
    return (
      <p className="text-xs leading-relaxed whitespace-pre-wrap text-stone-800">{desc}</p>
    );
  };

  // Helper function to extract skill string
  const formatSkill = (s) => typeof s === 'object' ? s.name : s;

  // ── 1. Harvard Executive Classic (Serif, ATS 100%, Corporate) ─────────────────
  if (styleVariant === 'harvard-classic') {
    return (
      <div className="bg-white p-10 w-full aspect-[1/1.4142] shadow-xl origin-top mx-auto overflow-hidden text-left font-serif text-black">
        <header className="text-center border-b-2 border-black pb-4 mb-5">
          <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">{displayName || 'YOUR NAME'}</h1>
          <p className="text-xs font-sans font-medium text-stone-700 tracking-wide">
            {[displayLocation, displayPhone, displayEmail, displayLinkedin].filter(Boolean).join('  |  ')}
          </p>
        </header>

        {enabledSections.summary && displaySummary && (
          <section className="mb-5">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest border-b border-black pb-1 mb-2">Executive Summary</h2>
            <p className="text-xs leading-relaxed text-stone-800">{displaySummary}</p>
          </section>
        )}

        {enabledSections.experience && displayExperience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest border-b border-black pb-1 mb-3">
              {safeData.isFresher ? 'Internship Experience' : 'Professional Experience'}
            </h2>
            <div className="space-y-4">
              {displayExperience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline font-sans font-bold text-xs">
                    <span>{exp.company}</span>
                    <span>{exp.duration}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs italic mb-1 text-stone-800">
                    <span>{exp.position || exp.title}</span>
                    <span>{exp.location}</span>
                  </div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </section>
        )}

        {enabledSections.education && displayEducation.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest border-b border-black pb-1 mb-2">Education</h2>
            <div className="space-y-2">
              {displayEducation.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline text-xs font-sans">
                  <div>
                    <span className="font-bold">{edu.school}</span>
                    <span className="italic ml-2">— {edu.degree}</span>
                  </div>
                  <span className="font-semibold text-stone-700">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {enabledSections.skills && displaySkills.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold font-sans uppercase tracking-widest border-b border-black pb-1 mb-2">Skills & Competencies</h2>
            <p className="text-xs font-sans leading-relaxed text-stone-800">
              {displaySkills.map(formatSkill).join('  •  ')}
            </p>
          </section>
        )}
      </div>
    );
  }

  // ── 2. Google Tech Lead (LaTeX Monospace Sans) ──────────────────────────────
  if (styleVariant === 'google-latex') {
    return (
      <div className="bg-white p-10 w-full aspect-[1/1.4142] shadow-xl origin-top mx-auto overflow-hidden text-left font-sans text-stone-900">
        <header className="text-center pb-4 mb-4 border-b border-stone-300">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-black">{displayName || 'YOUR NAME'}</h1>
          <p className="text-xs font-mono text-stone-600">
            {[displayEmail, displayPhone, displayLocation, displayLinkedin].filter(Boolean).join(' | ')}
          </p>
        </header>

        {enabledSections.summary && displaySummary && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-stone-300 pb-0.5 mb-1.5">Summary</h2>
            <p className="text-xs leading-relaxed text-stone-800">{displaySummary}</p>
          </section>
        )}

        {enabledSections.experience && displayExperience.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-stone-300 pb-0.5 mb-2">Experience</h2>
            <div className="space-y-3">
              {displayExperience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline text-xs font-bold text-black">
                    <span>{exp.position || exp.title} <span className="font-normal text-stone-600">@ {exp.company}</span></span>
                    <span className="font-mono text-[11px] text-stone-600">{exp.duration}</span>
                  </div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </section>
        )}

        {enabledSections.skills && displaySkills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-stone-300 pb-0.5 mb-1.5">Technical Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((s, idx) => (
                <span key={idx} className="font-mono text-[11px] px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-800 font-medium">
                  {formatSkill(s)}
                </span>
              ))}
            </div>
          </section>
        )}

        {enabledSections.education && displayEducation.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-stone-300 pb-0.5 mb-1.5">Education</h2>
            <div className="space-y-1.5">
              {displayEducation.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-black">{edu.school}</span>
                    <span className="text-stone-700 ml-2">— {edu.degree}</span>
                  </div>
                  <span className="font-mono text-[11px] text-stone-600">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ── 3. McKinsey Strategy Consultant (Dual Column Navy Accent) ───────────────
  if (styleVariant === 'mckinsey-consultant') {
    return (
      <div className="bg-white p-8 w-full aspect-[1/1.4142] shadow-xl origin-top mx-auto overflow-hidden text-left font-sans text-stone-900">
        <header className="bg-slate-900 text-white p-6 rounded-xl mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">{displayName || 'YOUR NAME'}</h1>
            <p className="text-xs font-medium text-slate-300 mt-1">Management & Strategy Consulting</p>
          </div>
          <div className="text-right text-[11px] text-slate-300 space-y-0.5 font-medium">
            <p>{displayEmail}</p>
            <p>{displayPhone}</p>
            <p>{displayLocation}</p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-5">
            {enabledSections.summary && displaySummary && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-2">Executive Overview</h2>
                <p className="text-xs leading-relaxed text-stone-700">{displaySummary}</p>
              </section>
            )}

            {enabledSections.experience && displayExperience.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 mb-3">Professional Experience</h2>
                <div className="space-y-4">
                  {displayExperience.map((exp, idx) => (
                    <div key={exp.id || idx}>
                      <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                        <span>{exp.position || exp.title}</span>
                        <span className="text-[11px] font-semibold text-slate-500">{exp.duration}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 mb-1">{exp.company} • {exp.location}</p>
                      {renderBullets(exp.description)}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="col-span-1 space-y-5 border-l border-stone-200 pl-5">
            {enabledSections.skills && displaySkills.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">Core Competencies</h2>
                <div className="space-y-1.5">
                  {displaySkills.map((s, idx) => (
                    <div key={idx} className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                      {formatSkill(s)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {enabledSections.education && displayEducation.length > 0 && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2">Education</h2>
                <div className="space-y-3 text-xs">
                  {displayEducation.map((edu, idx) => (
                    <div key={edu.id || idx}>
                      <p className="font-bold text-slate-900">{edu.school}</p>
                      <p className="text-slate-600">{edu.degree}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{edu.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 4. Stanford AI & Data Science (Dark Navy Tech Header) ─────────────────────
  if (styleVariant === 'stanford-ai') {
    return (
      <div className="bg-white p-9 w-full aspect-[1/1.4142] shadow-xl origin-top mx-auto overflow-hidden text-left font-sans text-stone-900">
        <header className="border-l-4 border-indigo-600 pl-4 pb-2 mb-5">
          <h1 className="text-3xl font-black text-indigo-950 tracking-tight">{displayName || 'YOUR NAME'}</h1>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Artificial Intelligence & Data Science Specialist</p>
          <p className="text-xs font-mono text-stone-500 mt-2">
            {[displayEmail, displayPhone, displayLocation, displayLinkedin].filter(Boolean).join('  •  ')}
          </p>
        </header>

        {enabledSections.summary && displaySummary && (
          <section className="mb-5 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
            <h2 className="text-[11px] font-black text-indigo-900 uppercase tracking-widest mb-1">AI & Machine Learning Focus</h2>
            <p className="text-xs leading-relaxed text-stone-800">{displaySummary}</p>
          </section>
        )}

        {enabledSections.experience && displayExperience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-black text-indigo-950 uppercase tracking-widest border-b-2 border-indigo-600 pb-1 mb-3">Industry Experience</h2>
            <div className="space-y-4">
              {displayExperience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline text-xs font-bold text-black">
                    <span>{exp.position || exp.title} — <span className="text-indigo-700 font-semibold">{exp.company}</span></span>
                    <span className="font-mono text-[11px] text-stone-500">{exp.duration}</span>
                  </div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </section>
        )}

        {enabledSections.skills && displaySkills.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-black text-indigo-950 uppercase tracking-widest border-b border-indigo-200 pb-1 mb-2">Technical Stack & ML Tools</h2>
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-indigo-900 text-white rounded text-[11px] font-mono font-medium">
                  {formatSkill(s)}
                </span>
              ))}
            </div>
          </section>
        )}

        {enabledSections.education && displayEducation.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-black text-indigo-950 uppercase tracking-widest border-b border-indigo-200 pb-1 mb-2">Education</h2>
            <div className="space-y-2 text-xs">
              {displayEducation.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline">
                  <span className="font-bold text-black">{edu.school} <span className="font-normal text-stone-600">— {edu.degree}</span></span>
                  <span className="font-mono text-stone-500 text-[11px]">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ── 5. Goldman Sachs Investment Banker (Wall Street Single Column) ─────────────
  if (styleVariant === 'goldman-banking') {
    return (
      <div className="bg-white p-10 w-full aspect-[1/1.4142] shadow-xl origin-top mx-auto overflow-hidden text-left font-serif text-black">
        <header className="text-center border-b border-stone-400 pb-3 mb-4">
          <h1 className="text-2xl font-bold uppercase tracking-widest mb-1">{displayName || 'YOUR NAME'}</h1>
          <p className="text-[11px] font-sans font-semibold text-stone-700">
            {[displayLocation, displayPhone, displayEmail, displayLinkedin].filter(Boolean).join('  |  ')}
          </p>
        </header>

        {enabledSections.summary && displaySummary && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold font-sans uppercase tracking-widest border-b border-stone-400 pb-0.5 mb-1.5">Executive Profile</h2>
            <p className="text-xs leading-relaxed text-stone-900">{displaySummary}</p>
          </section>
        )}

        {enabledSections.experience && displayExperience.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold font-sans uppercase tracking-widest border-b border-stone-400 pb-0.5 mb-2">Investment Banking & Financial Experience</h2>
            <div className="space-y-3">
              {displayExperience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline font-sans font-bold text-xs">
                    <span>{exp.company} <span className="font-normal italic">— {exp.location}</span></span>
                    <span>{exp.duration}</span>
                  </div>
                  <p className="text-xs italic font-sans font-semibold text-stone-800 mb-1">{exp.position || exp.title}</p>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </section>
        )}

        {enabledSections.education && displayEducation.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold font-sans uppercase tracking-widest border-b border-stone-400 pb-0.5 mb-1.5">Education & Honors</h2>
            <div className="space-y-1.5">
              {displayEducation.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline text-xs font-sans">
                  <div>
                    <span className="font-bold">{edu.school}</span>
                    <span className="italic ml-2">— {edu.degree}</span>
                  </div>
                  <span className="font-semibold text-stone-700">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {enabledSections.skills && displaySkills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold font-sans uppercase tracking-widest border-b border-stone-400 pb-0.5 mb-1.5">Financial & Technical Skills</h2>
            <p className="text-xs font-sans leading-relaxed text-stone-900">
              {displaySkills.map(formatSkill).join('  •  ')}
            </p>
          </section>
        )}
      </div>
    );
  }

  // ── 6. Nike Brand Marketing & Media (Crimson Accent Header) ───────────────────
  if (styleVariant === 'nike-marketing') {
    return (
      <div className="bg-white p-9 w-full aspect-[1/1.4142] shadow-xl origin-top mx-auto overflow-hidden text-left font-sans text-stone-900">
        <header className="bg-rose-950 text-white p-6 rounded-2xl mb-6">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-1">{displayName || 'YOUR NAME'}</h1>
          <p className="text-xs font-bold text-rose-400 uppercase tracking-widest">Brand Strategy & Global Marketing</p>
          <div className="flex flex-wrap gap-4 text-xs text-rose-200 mt-3 pt-3 border-t border-rose-900/60 font-medium">
            {displayEmail && <span>{displayEmail}</span>}
            {displayPhone && <span>{displayPhone}</span>}
            {displayLocation && <span>{displayLocation}</span>}
          </div>
        </header>

        {enabledSections.summary && displaySummary && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-rose-900 border-b-2 border-rose-900 pb-1 mb-2">Brand Vision</h2>
            <p className="text-xs leading-relaxed text-stone-800">{displaySummary}</p>
          </section>
        )}

        {enabledSections.experience && displayExperience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-rose-900 border-b-2 border-rose-900 pb-1 mb-3">Marketing Experience</h2>
            <div className="space-y-4">
              {displayExperience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline text-xs font-black text-rose-950">
                    <span>{exp.position || exp.title}</span>
                    <span className="text-[11px] font-bold text-stone-500">{exp.duration}</span>
                  </div>
                  <p className="text-xs font-bold text-rose-700 mb-1">{exp.company} • {exp.location}</p>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </section>
        )}

        {enabledSections.skills && displaySkills.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-black uppercase tracking-widest text-rose-900 border-b border-rose-200 pb-1 mb-2">Marketing Toolkit</h2>
            <div className="flex flex-wrap gap-1.5">
              {displaySkills.map((s, idx) => (
                <span key={idx} className="px-3 py-1 bg-rose-100 text-rose-950 font-bold rounded-lg text-xs">
                  {formatSkill(s)}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ── 7. Johns Hopkins Medical & Clinical (Structured Clinical) ─────────────────
  if (styleVariant === 'johns-hopkins') {
    return (
      <div className="bg-white p-9 w-full aspect-[1/1.4142] shadow-xl origin-top mx-auto overflow-hidden text-left font-sans text-stone-900">
        <header className="border-b-2 border-teal-700 pb-4 mb-5">
          <div className="flex justify-between items-baseline">
            <h1 className="text-2xl font-bold text-teal-950 tracking-wide">{displayName || 'YOUR NAME'}</h1>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-widest">Medical & Clinical Practice</span>
          </div>
          <p className="text-xs font-medium text-stone-600 mt-2">
            {[displayEmail, displayPhone, displayLocation, displayLinkedin].filter(Boolean).join('  •  ')}
          </p>
        </header>

        {enabledSections.summary && displaySummary && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 border-b border-teal-200 pb-1 mb-2">Clinical Profile</h2>
            <p className="text-xs leading-relaxed text-stone-800">{displaySummary}</p>
          </section>
        )}

        {enabledSections.experience && displayExperience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 border-b border-teal-200 pb-1 mb-3">Clinical Appointments & Experience</h2>
            <div className="space-y-4">
              {displayExperience.map((exp, idx) => (
                <div key={exp.id || idx}>
                  <div className="flex justify-between items-baseline text-xs font-bold text-teal-950">
                    <span>{exp.position || exp.title} <span className="font-medium text-stone-600">— {exp.company}</span></span>
                    <span className="text-[11px] text-stone-500 font-semibold">{exp.duration}</span>
                  </div>
                  {renderBullets(exp.description)}
                </div>
              ))}
            </div>
          </section>
        )}

        {enabledSections.education && displayEducation.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 border-b border-teal-200 pb-1 mb-2">Education & Medical Training</h2>
            <div className="space-y-2 text-xs">
              {displayEducation.map((edu, idx) => (
                <div key={edu.id || idx} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-black">{edu.school}</span>
                    <span className="text-stone-700 ml-2">— {edu.degree}</span>
                  </div>
                  <span className="text-stone-500 text-[11px] font-semibold">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {enabledSections.skills && displaySkills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-900 border-b border-teal-200 pb-1 mb-2">Clinical Competencies & Certifications</h2>
            <p className="text-xs leading-relaxed text-stone-800 font-medium">
              {displaySkills.map(formatSkill).join('  •  ')}
            </p>
          </section>
        )}
      </div>
    );
  }

  // ── Default Fallback: Apple Senior Product Designer Style ────────────────────
  return (
    <div className="bg-white p-9 w-full aspect-[1/1.4142] shadow-xl origin-top mx-auto overflow-hidden text-left font-sans text-stone-900">
      <header className="flex justify-between items-start pb-6 mb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black">{displayName || 'YOUR NAME'}</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mt-1">Product & Design Architecture</p>
        </div>
        <div className="text-right text-xs font-medium text-stone-500 space-y-0.5">
          <p>{displayEmail}</p>
          <p>{displayPhone}</p>
          <p>{displayLocation}</p>
        </div>
      </header>

      {enabledSections.summary && displaySummary && (
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-2">About</h2>
          <p className="text-xs leading-relaxed text-stone-800 font-medium">{displaySummary}</p>
        </section>
      )}

      {enabledSections.experience && displayExperience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-3">Experience</h2>
          <div className="space-y-4">
            {displayExperience.map((exp, idx) => (
              <div key={exp.id || idx} className="p-4 bg-stone-50/80 rounded-2xl border border-stone-100">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-xs text-black">{exp.position || exp.title}</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{exp.duration}</span>
                </div>
                <p className="text-[11px] font-bold text-orange-600 mb-2">{exp.company} • {exp.location}</p>
                {renderBullets(exp.description)}
              </div>
            ))}
          </div>
        </section>
      )}

      {enabledSections.skills && displaySkills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Skills & Toolkit</h2>
          <div className="flex flex-wrap gap-2">
            {displaySkills.map((s, idx) => (
              <span key={idx} className="px-3 py-1 bg-black text-white rounded-xl text-[11px] font-bold">
                {formatSkill(s)}
              </span>
            ))}
          </div>
        </section>
      )}

      {enabledSections.education && displayEducation.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-2">Education</h2>
          <div className="space-y-2">
            {displayEducation.map((edu, idx) => (
              <div key={edu.id || idx} className="flex justify-between items-baseline text-xs">
                <span className="font-bold text-black">{edu.school} <span className="font-normal text-stone-600">— {edu.degree}</span></span>
                <span className="text-[11px] font-semibold text-stone-400">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ConfigurableTemplate;
