/**
 * Proprietary AI Service (Client wrapper)
 * Calls our secure backend API to maintain security
 * Auth is handled entirely by httpOnly cookie (sent automatically via credentials:'include')
 */
import { logout } from './authService';

const customFetch = async (url, options = {}) => {
  const mergedOptions = {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
    },
  };
  return fetch(url, mergedOptions);
};

export async function generateAIResume(resumeData, jobDescription) {
  const response = await customFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/generate-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData, jobDescription }),
  });

  if (!response.ok) {
    if (response.status === 401) {
       await logout(); 
       throw new Error('Not authenticated');
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to generate ATS-optimized resume.');
  }

  return await response.json();
}

export async function analyzeATSScore(resumeData, jobDescription) {
  const response = await customFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/analyze-ats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeData, jobDescription }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to analyze ATS score.');
  }

  return await response.json();
}
