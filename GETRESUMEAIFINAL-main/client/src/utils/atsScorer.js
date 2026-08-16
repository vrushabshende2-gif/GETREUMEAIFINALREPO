const ACTION_VERBS = [
  'achieved', 'built', 'created', 'designed', 'developed', 'engineered',
  'established', 'implemented', 'improved', 'increased', 'launched', 'led',
  'managed', 'optimized', 'reduced', 'spearheaded', 'streamlined', 'delivered',
  'coordinated', 'analyzed', 'collaborated', 'automated', 'deployed', 'maintained',
  'accelerated', 'customized', 'devised', 'directed', 'executed', 'handled',
  'minimized', 'maximized', 'orchestrated', 'pioneered', 'restructured', 'supervised',
  'trained', 'upgraded', 'verified', 'authored', 'architected', 'facilitated'
];

const COMMON_KEYWORDS = [
  'javascript', 'python', 'java', 'react', 'node', 'sql', 'git', 'api',
  'agile', 'scrum', 'docker', 'kubernetes', 'aws', 'azure', 'ci/cd',
  'typescript', 'html', 'css', 'mongodb', 'postgresql', 'rest', 'graphql',
  'team leadership', 'project management', 'communication', 'problem solving',
  'data analysis', 'machine learning', 'testing', 'debugging', 'unit testing',
  'system design', 'scalability', 'microservices', 'linux', 'cloud computing',
  'devops', 'backend', 'frontend', 'fullstack', 'ci-cd'
];

const extractKeywordsFromJD = (jdText) => {
  if (!jdText) return [];
  const source = jdText.toLowerCase();
  const foundKeywords = new Set();
  
  COMMON_KEYWORDS.forEach(kw => {
    if (source.includes(kw)) {
      foundKeywords.add(kw);
    }
  });

  const techPattern = /\b([A-Z][a-zA-Z0-9+#.]+)\b/g;
  let match;
  while ((match = techPattern.exec(jdText)) !== null) {
    const word = match[1].toLowerCase();
    if (word.length > 1 && !['the', 'and', 'for', 'you', 'are', 'our', 'with'].includes(word)) {
      foundKeywords.add(word);
    }
  }

  return Array.from(foundKeywords);
};

export const calculateLocalATSScore = (resumeData, jobDescriptionText = '') => {
  const breakdown = {
    keywordMatch: 0,
    quantitativeImpact: 0,
    actionVerbs: 0,
    completeness: 0,
    formatting: 0
  };

  const jdText = jobDescriptionText || resumeData.jobDescription || '';
  const jdKeywords = extractKeywordsFromJD(jdText);
  const targetKeywords = jdKeywords.length >= 5 ? jdKeywords : COMMON_KEYWORDS.slice(0, 15);

  const summaryText = resumeData.summary || resumeData.personalInfo?.summary || '';
  const skillsList = Array.isArray(resumeData.skills) ? resumeData.skills.map(s => s.toLowerCase()) : [];
  
  let experienceText = '';
  if (Array.isArray(resumeData.experience)) {
    resumeData.experience.forEach(exp => {
      experienceText += ' ' + (exp.description || '') + ' ' + (exp.position || '') + ' ' + (exp.company || '');
    });
  }
  if (Array.isArray(resumeData.internships)) {
    resumeData.internships.forEach(intern => {
      experienceText += ' ' + (intern.description || '') + ' ' + (intern.position || '') + ' ' + (intern.company || '');
    });
  }

  let projectsText = '';
  if (Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach(proj => {
      projectsText += ' ' + (proj.description || '') + ' ' + (proj.title || '');
    });
  }

  const fullResumeText = `${summaryText} ${skillsList.join(' ')} ${experienceText} ${projectsText}`.toLowerCase();

  // 1. Keywords
  let matchedKeywordsCount = 0;
  const matchedKeywordsList = [];
  const missingKeywordsList = [];

  targetKeywords.forEach(kw => {
    if (fullResumeText.includes(kw.toLowerCase())) {
      matchedKeywordsCount++;
      matchedKeywordsList.push(kw);
    } else {
      missingKeywordsList.push(kw);
    }
  });

  const keywordRatio = targetKeywords.length > 0 ? (matchedKeywordsCount / targetKeywords.length) : 0.5;
  breakdown.keywordMatch = Math.round(keywordRatio * 40);
  breakdown.keywordMatch = Math.max(8, Math.min(breakdown.keywordMatch, 40));

  // 2. Metrics (Google XYZ/ABC style checks)
  const allNumbers = (experienceText + ' ' + projectsText).match(/\b(?!20\d{2})\d+(?:[.,\d]*\d+)?\s*(?:%|percent|usd|usd|\$|k|m|b|x|times|users|customers|clients|employees|developers|hours|seconds|days|weeks|months|years|pages|clicks|queries|servers|databases|apis|features|repos|pull requests)\b/gi) || [];
  const metricCount = allNumbers.length;
  
  if (metricCount >= 5) {
    breakdown.quantitativeImpact = 20;
  } else if (metricCount >= 3) {
    breakdown.quantitativeImpact = 16;
  } else if (metricCount >= 1) {
    breakdown.quantitativeImpact = 10;
  } else {
    breakdown.quantitativeImpact = 0;
  }

  // 3. Action Verbs
  let matchedVerbsCount = 0;
  ACTION_VERBS.forEach(verb => {
    if (fullResumeText.includes(verb)) {
      matchedVerbsCount++;
    }
  });
  if (matchedVerbsCount >= 8) {
    breakdown.actionVerbs = 10;
  } else if (matchedVerbsCount >= 5) {
    breakdown.actionVerbs = 8;
  } else if (matchedVerbsCount >= 2) {
    breakdown.actionVerbs = 5;
  } else {
    breakdown.actionVerbs = 2;
  }

  // 4. Completeness
  let completenessScore = 0;
  const emailRegex = /[\w.-]+@[\w.-]+\.\w{2,}/;
  const phone = resumeData.personalInfo?.phone || '';
  const email = resumeData.personalInfo?.email || '';
  const linkedin = resumeData.personalInfo?.linkedin || '';
  const name = resumeData.personalInfo?.name || resumeData.personalInfo?.fullName || '';

  if (name && emailRegex.test(email)) completenessScore += 2;
  if (phone) completenessScore += 1;
  if (linkedin) completenessScore += 1;

  if (summaryText.trim().length > 30) completenessScore += 2;
  if (skillsList.length >= 4) completenessScore += 3;
  if (
    (Array.isArray(resumeData.experience) && resumeData.experience.length > 0) || 
    (Array.isArray(resumeData.internships) && resumeData.internships.length > 0)
  ) {
    completenessScore += 3;
  }
  if (Array.isArray(resumeData.education) && resumeData.education.length > 0) completenessScore += 2;
  if (Array.isArray(resumeData.projects) && resumeData.projects.length > 0) completenessScore += 1;

  breakdown.completeness = completenessScore;

  // 5. Formatting
  const words = fullResumeText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount >= 450 && wordCount <= 900) {
    breakdown.formatting = 15;
  } else if ((wordCount >= 300 && wordCount < 450) || (wordCount > 900 && wordCount <= 1200)) {
    breakdown.formatting = 11;
  } else if (wordCount > 0 && wordCount < 300) {
    breakdown.formatting = 6;
  } else if (wordCount > 1200) {
    breakdown.formatting = 8;
  } else {
    breakdown.formatting = 0;
  }

  const score = breakdown.keywordMatch + breakdown.quantitativeImpact + breakdown.actionVerbs + breakdown.completeness + breakdown.formatting;
  const finalScore = Math.min(Math.round(score), 100);

  // Compile recommendations
  const recommendations = [];
  if (breakdown.keywordMatch < 30) recommendations.push('Weave more target keywords from direct job requests into your summary, experiences, or project text.');
  if (breakdown.quantitativeImpact < 15) recommendations.push('Add statistics or numbers to your bullet points (e.g. percentages, counts, or dollar figures) to satisfy the Google XYZ/ABC rule.');
  if (breakdown.actionVerbs < 8) recommendations.push('Use active verbs like "spearheaded", "orchestrated", or "refactored" instead of passive phrasing.');
  if (breakdown.completeness < 12) recommendations.push('Complete any missing phone, LinkedIn link, skills inputs, or summary blocks.');
  if (wordCount < 450) recommendations.push(`Your word count (${wordCount} words) is below the optimal ATS threshold (450–900 words). Add detail.`);
  if (wordCount > 1000) recommendations.push(`Your word count (${wordCount} words) exceeds recommended length. Condense achievements.`);

  return {
    score: finalScore,
    breakdown,
    totalKeywords: targetKeywords.length,
    matchedKeywordsCount,
    matchedKeywordsList,
    missingKeywords: missingKeywordsList.slice(0, 10),
    metricCount,
    wordCount,
    recommendations
  };
};
