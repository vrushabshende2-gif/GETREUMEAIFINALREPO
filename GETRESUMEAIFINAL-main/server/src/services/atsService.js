/**
 * ATS Scoring Service
 * Analyzes resume data (structured) OR raw text (from uploaded file).
 */

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

// Helper to extract clean keywords from a job description
const extractKeywordsFromJD = (jdText) => {
  if (!jdText) return [];
  const source = jdText.toLowerCase();
  
  // Combine custom common keywords + other potential proper nouns/tech terms
  const foundKeywords = new Set();
  
  // Check our standard list first
  COMMON_KEYWORDS.forEach(kw => {
    if (source.includes(kw)) {
      foundKeywords.add(kw);
    }
  });

  // Extract other uppercase words/tech acronyms as potential keywords
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

// Heuristic score calculator for structured data
const calculateATSScore = (resumeData, jobDescriptionText = '') => {
  let score = 0;
  const breakdown = {
    keywordMatch: 0,       // Max 40
    quantitativeImpact: 0, // Max 20
    actionVerbs: 0,        // Max 10
    completeness: 0,       // Max 15
    formatting: 0          // Max 15
  };

  const jdText = jobDescriptionText || resumeData.jobDescription || '';
  const jdKeywords = extractKeywordsFromJD(jdText);
  const targetKeywords = jdKeywords.length >= 5 ? jdKeywords : COMMON_KEYWORDS.slice(0, 15);

  // Collect all resume text content for checks
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

  // 1. Keyword Score (Max 40 points)
  let matchedKeywordsCount = 0;
  targetKeywords.forEach(kw => {
    if (fullResumeText.includes(kw.toLowerCase())) {
      matchedKeywordsCount++;
    }
  });

  const keywordRatio = targetKeywords.length > 0 ? (matchedKeywordsCount / targetKeywords.length) : 0.5;
  breakdown.keywordMatch = Math.round(keywordRatio * 40);
  // Cap keyword score between 8 and 40
  breakdown.keywordMatch = Math.max(8, Math.min(breakdown.keywordMatch, 40));

  // 2. Quantitative Impact & Metrics (Max 20 points)
  // Look for percentages (20%), dollar amounts ($10k, 5M), numbers that describe volume/scale (10 developers, 500k users, 3x faster, 12 months)
  // Exclude dates/years like 2021, 2022, 2023, 2024, 2025, 2026.
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

  // 3. Action Verbs Score (Max 10 points)
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

  // 4. Completeness Score (Max 15 points)
  let completenessScore = 0;
  // Contact details: email, phone, location or linkedin
  const emailRegex = /[\w.-]+@[\w.-]+\.\w{2,}/;
  const phone = resumeData.personalInfo?.phone || '';
  const email = resumeData.personalInfo?.email || '';
  const linkedin = resumeData.personalInfo?.linkedin || '';
  const name = resumeData.personalInfo?.name || resumeData.personalInfo?.fullName || '';

  if (name && emailRegex.test(email)) completenessScore += 2;
  if (phone) completenessScore += 1;
  if (linkedin) completenessScore += 1;

  // Sections
  if (summaryText.trim().length > 30) completenessScore += 2;
  if (skillsList.length >= 4) completenessScore += 3;
  if ((Array.isArray(resumeData.experience) && resumeData.experience.length > 0) || 
      (Array.isArray(resumeData.internships) && resumeData.internships.length > 0)) {
    completenessScore += 3;
  }
  if (Array.isArray(resumeData.education) && resumeData.education.length > 0) completenessScore += 2;
  if (Array.isArray(resumeData.projects) && resumeData.projects.length > 0) completenessScore += 1;

  breakdown.completeness = completenessScore;

  // 5. Formatting Score (Max 15 points)
  // Word count check: optimal is between 450 and 900 words
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

  score = breakdown.keywordMatch + breakdown.quantitativeImpact + breakdown.actionVerbs + breakdown.completeness + breakdown.formatting;
  
  return {
    score: Math.min(Math.round(score), 100),
    breakdown,
    totalKeywords: targetKeywords.length,
    matchedKeywordsCount,
    metricCount,
    wordCount
  };
};

const analyzeResumeText = (text) => {
  const lower = text.toLowerCase();
  const breakdown = {};
  let score = 0;

  // 1. Keyword Match (Max 60 pts)
  const foundKeywords = COMMON_KEYWORDS.filter(kw => lower.includes(kw));
  const keywordScore = Math.min(foundKeywords.length * 5, 60);
  breakdown['Keyword Match'] = { score: keywordScore, max: 60, status: keywordScore >= 45 ? 'good' : keywordScore > 20 ? 'warn' : 'bad' };
  score += keywordScore;

  // 2. Skills Relevance (Max 15 pts)
  const hasSkillsSection = /skills|technologies|tech stack|competencies/i.test(text);
  const skillsScore = hasSkillsSection ? 15 : 0;
  breakdown['Skills Relevance'] = { score: skillsScore, max: 15, status: hasSkillsSection ? 'good' : 'bad' };
  score += skillsScore;

  // 3. Experience Relevance (Max 10 pts)
  const hasExperience = /experience|employment|work history|positions?|internship/i.test(text);
  const foundVerbs = ACTION_VERBS.filter(v => lower.includes(v));
  const expBaseScore = hasExperience ? 5 : 0;
  const expVerbScore = Math.min(foundVerbs.length, 5); 
  const experienceScore = expBaseScore + expVerbScore;
  breakdown['Experience Relevance'] = { score: experienceScore, max: 10, status: experienceScore >= 8 ? 'good' : experienceScore >= 5 ? 'warn' : 'bad' };
  score += experienceScore;

  // 4. Education Match (Max 5 pts)
  const hasEducation = /education|degree|university|college|bachelor|master|b\.?tech|m\.?tech|b\.?sc|diploma/i.test(text);
  const eduScore = hasEducation ? 5 : 0;
  breakdown['Education Match'] = { score: eduScore, max: 5, status: hasEducation ? 'good' : 'bad' };
  score += eduScore;

  // 5. Formatting & Parsing (Max 5 pts)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  // ideal is 450 - 900
  let formattingScore = 0;
  if (wordCount >= 450 && wordCount <= 900) formattingScore = 5;
  else if (wordCount >= 300 && wordCount <= 1200) formattingScore = 3;
  else formattingScore = 1;
  
  breakdown['Formatting & Parsing'] = { score: formattingScore, max: 5, status: formattingScore === 5 ? 'good' : 'bad' };
  score += formattingScore;

  // 6. Section Completeness (Max 5 pts)
  const hasEmail = /[\w.-]+@[\w.-]+\.\w{2,}/.test(text);
  const hasPhone = /(\+?\d[\d\s\-().]{7,}\d)/.test(text);
  const hasSummary = /summary|objective|profile|about me/i.test(text);
  let completenessScore = 0;
  if(hasEmail) completenessScore += 2;
  if(hasPhone) completenessScore += 2;
  if(hasSummary) completenessScore += 1;
  breakdown['Section Completeness'] = { score: completenessScore, max: 5, status: completenessScore === 5 ? 'good' : completenessScore >= 2 ? 'warn' : 'bad' };
  score += completenessScore;

  const missingKeywords = COMMON_KEYWORDS.filter(kw => !lower.includes(kw)).slice(0, 8);

  const recommendations = [];
  if (keywordScore < 45) recommendations.push('Incorporate more industry-standard keywords related to your target job.');
  if (!hasSkillsSection) recommendations.push('Include a dedicated Skills or Technologies section.');
  if (experienceScore < 8) recommendations.push('Add stronger action verbs to your Work Experience descriptions.');
  if (!hasEducation) recommendations.push('Include your educational background and qualifications.');
  if (formattingScore < 5) recommendations.push('Your resume length could be improved. Aim for 450 to 900 words.');
  if (completenessScore < 5) recommendations.push('Ensure contact details (email/phone) and a professional summary are included.');

  const finalScore = Math.min(Math.round(score), 100);

  return {
    score: finalScore,
    label: finalScore >= 80 ? 'Excellent' : finalScore >= 60 ? 'Good' : finalScore >= 40 ? 'Average' : 'Needs Work',
    breakdown,
    missingKeywords,
    recommendations,
    wordCount,
  };
};

module.exports = { calculateATSScore, analyzeResumeText };
