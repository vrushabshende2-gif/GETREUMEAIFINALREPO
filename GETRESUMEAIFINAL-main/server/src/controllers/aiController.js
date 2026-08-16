const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Helper to call Groq API from backend
 */
async function callGroqBackend(systemPrompt, userPrompt) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured on the server.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 3500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Groq API Error Response:', errText);
    throw new Error(`Groq API failure: ${response.status}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error('No content returned from Groq.');
  }

  return JSON.parse(rawContent);
}

/**
 * @desc    Chatbot assistant handles resume updates
 * @route   POST /api/ai/chatbot
 * @access  Private
 */
const chatResumeAssistant = async (req, res, next) => {
  try {
    const { resumeData, message, history } = req.body;

    if (!resumeData) {
      return res.status(400).json({ message: 'Resume data is required' });
    }

    const systemPrompt = `You are a professional Resume Editor Chatbot. You work with a structured resume data JSON.
Your task is to parse the user's instructions and modify the provided resume coordinates.
You have direct read/write permission to modify this data.

Strict Guidelines:
1. Always preserve the structure of the JSON fields. Do not add foreign properties, keep existing ids.
2. If the user asks to add a skill, append it to the "skills" string array.
3. If they ask to add, edit, or delete experiences, projects, or internships, do so directly on the respective array items. Generate a unique short string for any newly added item "id".
4. When rewriting descriptions for experiences, projects, or internships, you must apply the industry-standard ABC rule: "Accomplished [X], as measured by [Y], by doing [Z]" with clear quantified impact.
5. If the user makes requests unrelated to editing their resume (e.g. asking random questions), do not change the resume data, but provide an informative response in the "message" field.
6. Make sure to only edit what is requested. Keep the other coordinates completely intact.
7. Return ONLY the raw JSON output matching this structure:
{
  "updatedResumeData": <updated_resume_data_object>,
  "message": "<Explain what edits you made under user requests and how it benefits them. Highlight where ABC rule was applied. Be concise.>"
}`;

    const userPrompt = `USER MESSAGE: "${message}"

CURRENT RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

CHAT HISTORY CONTEXT (if any):
${JSON.stringify(history || [])}
`;

    const result = await callGroqBackend(systemPrompt, userPrompt);
    res.json(result);
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ message: 'Failed to process AI assistant command. Please try again.' });
  }
};

/**
 * @desc    Generates customized quiz based on resume content
 * @route   POST /api/ai/generate-test
 * @access  Private
 */
const generateResumeTest = async (req, res, next) => {
  try {
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({ message: 'Resume details are required' });
    }

    const skills = resumeData.skills || [];
    const experiences = (resumeData.experience || []).map(e => `${e.position} at ${e.company}: ${e.description}`).join('; ');
    const projects = (resumeData.projects || []).map(p => `${p.title}: ${p.description}`).join('; ');

    const systemPrompt = `You are a strict, top-tier technical interviewer.
Analyze the candidate's resume content (skills, work history, projects).
Generate exactly 10 high-quality, industry-matching technical and behavioral multiple-choice questions tailored to their listed skills and projects.

Rules:
1. Make the questions challenging and highly specific to their stack (e.g. if they list React/Node/AWS, focus on deep concepts like React hooks state rendering, async event loop bottlenecks, DynamoDB indices optimization, API security, etc.).
2. Do not generate generic questions. Mix technical (7) and behavioral/scenario-based (3) questions based on their profile.
3. Every question must have exactly 4 choices.
4. Set correctOptionIndex from 0 to 3.
5. Provide a detailed "explanation" for why the correct option is right and the others are wrong.
6. Output matching JSON format ONLY:
{
  "questions": [
    {
      "id": 1,
      "questionText": "<Question description>",
      "options": ["A", "B", "C", "D"],
      "correctOptionIndex": <0-3>,
      "explanation": "<Explanation of correct choice>"
    }
  ]
}`;

    const userPrompt = `CANDIDATE DETAILS:
Skills list: ${JSON.stringify(skills)}
Experience context: ${experiences}
Projects context: ${projects}
`;

    const result = await callGroqBackend(systemPrompt, userPrompt);
    res.json(result);
  } catch (error) {
    console.error('AI Test Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate technical test questions. Please check your credentials.' });
  }
};
/**
 * @desc    Generate optimized resume via Groq
 * @route   POST /api/ai/generate-resume
 * @access  Private
 */
const generateATSResume = async (req, res, next) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription) {
      return res.status(400).json({ message: 'Resume data and job description are required' });
    }

    const systemPrompt = `You are an expert resume writer and ATS (Applicant Tracking System) specialist.
Your job is to rewrite the user's resume content to be perfectly optimized for the target job description.
Strict Rules:
- All bullet points in experience and projects MUST strictly follow the industry-standard ABC (or XYZ) rule:
  "Accomplished [X], as measured by [Y], by doing [Z]"
  - X (Accomplished): Start with a strong action verb detailing the action or function.
  - Y (Measured by): Include a quantified metric, statistics, numerical outcomes, percentage improvements, or speed gains.
  - Z (By doing): Describe the engineering work, algorithms, technologies, or tools utilized.
  - Example: "Optimized DB page read latency by 45% (measured by Prometheus) by refactoring PostgreSQL lookup indexes and implementing Redis clustering."
- Quantify accomplishments wherever possible. Turn generic summaries into result-driven impact statements.
- Naturally weave in keywords from the job description
- Keep all bullet points concise (1-2 lines max)
- NEVER invent fake companies, titles, dates, or credentials. Only optimize what the user highlights.
- Return ONLY valid JSON, no markdown, no extra text`;

    const userPrompt = `JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

Return a JSON object with this exact structure:
{
  "personalInfo": {
    "fullName": "<keep original>",
    "email": "<keep original>",
    "phone": "<keep original>",
    "linkedin": "<keep original>",
    "location": "<keep original>",
    "summary": "<rewrite: 3-4 sentences, ATS-optimized, use JD keywords, first person>",
  },
  "experience": [
    {
      "id": "<keep original id>",
      "company": "<keep original>",
      "position": "<keep original>",
      "duration": "<keep original>",
      "description": "<rewrite using professional bullet points starting with •, each following the ABC rule with metrics (X, as measured by Y, by doing Z)>"
    }
  ],
  "internships": [
    {
      "id": "<keep original id>",
      "company": "<keep original>",
      "position": "<keep original>",
      "duration": "<keep original>",
      "description": "<rewrite using professional bullet points starting with •, each following the ABC rule with metrics (X, as measured by Y, by doing Z)>"
    }
  ],
  "projects": [
    {
      "id": "<keep original id>",
      "title": "<keep original>",
      "link": "<keep original>",
      "description": "<rewrite using professional bullet points starting with • following the ABC rule, detailing specific technologies and quantified results>"
    }
  ],
  "skills": [<enhanced skills array combining existing skills + relevant JD skills the user likely has>],
  "suggestedSkills": [<5-8 skills from JD the user should add if they have them>],
  "atsScore": <integer 0-100 estimating ATS match after optimization>,
  "missingKeywords": [<top 5 keywords from JD not found in the resume>],
  "improvements": "<2-sentence summary of main changes made>"
}`;
    
    const result = await callGroqBackend(systemPrompt, userPrompt);
    res.json(result);
  } catch (error) {
    console.error('AI Resume Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate ATS-optimized resume. Please check your credentials.' });
  }
};

/**
 * @desc    Analyze ATS Score logic without rewriting
 * @route   POST /api/ai/analyze-ats
 * @access  Private
 */
const analyzeResumeATS = async (req, res, next) => {
  try {
    const { resumeData, jobDescription } = req.body;
    if (!resumeData || !jobDescription) {
      return res.status(400).json({ message: 'Resume data and job description are required' });
    }

    const systemPrompt = `You are an ATS (Applicant Tracking System) analysis engine. 
Analyze the resume vs job description and return ONLY valid JSON.`;

    const userPrompt = `JOB DESCRIPTION: ${jobDescription}

RESUME SKILLS: ${JSON.stringify(resumeData.skills)}
RESUME SUMMARY: ${resumeData.personalInfo?.summary || ''}
RESUME EXPERIENCE: ${JSON.stringify((resumeData.experience || []).map(e => e.description))}

Return JSON:
{
  "atsScore": <integer 0-100>,
  "matchedKeywords": [<up to 10 keywords from JD found in resume>],
  "missingKeywords": [<up to 8 important keywords from JD missing from resume>],
  "suggestions": [<3 short actionable tips to improve the score>]
}`;

    const result = await callGroqBackend(systemPrompt, userPrompt);
    res.json(result);
  } catch (error) {
    console.error('AI ATS Analysis Error:', error);
    res.status(500).json({ message: 'Failed to analyze ATS score via AI.' });
  }
};

/**
 * @desc    Generate tailored AI Cover Letter from Resume and Job Description
 * @route   POST /api/ai/generate-cover-letter
 * @access  Private
 */
const generateCoverLetter = async (req, res, next) => {
  try {
    const { resumeData, jobTitle, company, jobDescription, tone = 'Confident & Professional' } = req.body;
    if (!resumeData || !jobTitle) {
      return res.status(400).json({ message: 'Resume data and Job Title are required.' });
    }

    const systemPrompt = `You are a top-tier executive career coach and cover letter writer.
Create a compelling, professional, ATS-aligned 3-paragraph cover letter formatted in clean markdown.
Return ONLY valid JSON in the exact schema specified.`;

    const userPrompt = `CANDIDATE NAME: ${resumeData.personalInfo?.fullName || resumeData.name || 'Candidate'}
TARGET ROLE: ${jobTitle}
TARGET COMPANY: ${company || 'the Hiring Team'}
DESIRED TONE: ${tone}
JOB DESCRIPTION CONTEXT: ${jobDescription || 'Standard requirements for ' + jobTitle}
RESUME SUMMARY: ${resumeData.personalInfo?.summary || ''}
TOP SKILLS: ${JSON.stringify(resumeData.skills || [])}
TOP EXPERIENCE: ${JSON.stringify((resumeData.experience || []).slice(0, 2))}

Return JSON:
{
  "subject": "<Compelling Email/Letter Subject Line>",
  "salutation": "<Professional Salutation>",
  "opening": "<Strong, hook-driven opening paragraph expressing enthusiasm and key value proposition>",
  "body": "<Impactful body paragraph highlighting 2-3 specific quantifiable accomplishments matching the role>",
  "closing": "<Confident call-to-action and professional closing>",
  "fullLetter": "<Complete formatted cover letter string ready to send>"
}`;

    const result = await callGroqBackend(systemPrompt, userPrompt);
    res.json(result);
  } catch (error) {
    console.error('Cover Letter Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate AI cover letter.' });
  }
};

/**
 * @desc    Polish and optimize a single resume bullet point
 * @route   POST /api/ai/polish-bullet
 * @access  Private
 */
const polishBulletPoint = async (req, res, next) => {
  try {
    const { bullet, targetRole, industry } = req.body;
    if (!bullet || !bullet.trim()) {
      return res.status(400).json({ message: 'Bullet point text is required.' });
    }

    const systemPrompt = `You are a Fortune 500 resume reviewer and executive recruiter.
Transform ordinary resume bullets into high-impact Google XYZ formula accomplishments (Accomplished [X], as measured by [Y], by doing [Z]).
Return ONLY valid JSON.`;

    const userPrompt = `ORIGINAL BULLET: "${bullet}"
TARGET ROLE/INDUSTRY: ${targetRole || industry || 'General Tech/Business'}

Return JSON:
{
  "original": "${bullet}",
  "polished": "<High-impact rewritten bullet starting with a dynamic action verb and quantifiable metric placeholder>",
  "alternatives": [
    "<Alternative focused on technical excellence>",
    "<Alternative focused on leadership and business velocity>"
  ],
  "impactScoreBefore": <integer 20-65 representing weak bullet score>,
  "impactScoreAfter": <integer 85-99 representing polished bullet score>,
  "actionVerb": "<The strong power verb used>",
  "critique": "<Short 1-sentence explanation of what was improved>"
}`;

    const result = await callGroqBackend(systemPrompt, userPrompt);
    res.json(result);
  } catch (error) {
    console.error('Bullet Polish Error:', error);
    res.status(500).json({ message: 'Failed to polish bullet point.' });
  }
};

module.exports = {
  chatResumeAssistant,
  generateResumeTest,
  generateATSResume,
  analyzeResumeATS,
  generateCoverLetter,
  polishBulletPoint
};

