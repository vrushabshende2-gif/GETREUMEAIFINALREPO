import { create } from 'zustand';
import axios from 'axios';

axios.defaults.withCredentials = true;

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resume`;

// Auth is handled by httpOnly cookie sent automatically with credentials:include

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 11);
};

const initialState = {
    personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        linkedin: '',
        location: '',
        summary: '',
    },
    education: [{ id: generateId(), school: '', degree: '', year: '', location: '' }],
    experience: [{ id: generateId(), company: '', position: '', duration: '', description: '' }],
    internships: [{ id: generateId(), company: '', position: '', duration: '', description: '' }],
    skills: [],
    projects: [{ id: generateId(), title: '', description: '', link: '' }],
    isFresher: false,
    enabledSections: {
        education: true,
        experience: true,
        internships: false,
        skills: true,
        projects: true,
        summary: true,
    },
    // AI Related fields
    jobDescription: '',
    isAIGenerating: false,
    atsScore: null,
    missingKeywords: [],
    matchedKeywords: [],
    suggestedSkills: [],
    aiImprovements: '',
};

let activeFetchResumesPromise = null;

const useResumeStore = create((set, get) => ({
    // State
    currentResumeId: null,
    selectedTemplate: 'ats-alice',
    currentResumeData: initialState,
    resumeList: [],
    isSaving: false,
    isLoading: false,
    error: null,

    // Actions
    setTemplate: (templateId) => set({ selectedTemplate: templateId }),
    
    setResumeData: (data) => set((state) => ({
        currentResumeData: typeof data === 'function' ? data(state.currentResumeData) : data
    })),

    // AI Actions
    updateJobDescription: (desc) => set((state) => ({
        currentResumeData: { ...state.currentResumeData, jobDescription: desc }
    })),

    setAIGenerating: (val) => set((state) => ({
        currentResumeData: { ...state.currentResumeData, isAIGenerating: val }
    })),

    applyAIResume: (data) => set((state) => ({
        currentResumeData: {
            ...state.currentResumeData,
            personalInfo: {
                ...state.currentResumeData.personalInfo,
                summary: data.personalInfo.summary
            },
            experience: data.experience || state.currentResumeData.experience,
            internships: data.internships || state.currentResumeData.internships,
            projects: data.projects || state.currentResumeData.projects,
            skills: data.skills || state.currentResumeData.skills,
            suggestedSkills: data.suggestedSkills || [],
            atsScore: data.atsScore,
            missingKeywords: data.missingKeywords || [],
            aiImprovements: data.improvements || '',
            isAIGenerating: false
        }
    })),

    applyATSAnalysis: (data) => set((state) => ({
        currentResumeData: {
            ...state.currentResumeData,
            atsScore: data.atsScore,
            matchedKeywords: data.matchedKeywords || [],
            missingKeywords: data.missingKeywords || [],
            aiImprovements: data.suggestions?.join(' ') || '',
            isAIGenerating: false
        }
    })),

    updateResumeData: (section, field, value) => set((state) => {
        const newData = { ...state.currentResumeData };
        if (section === 'personalInfo') {
            newData.personalInfo = { ...newData.personalInfo, [field]: value };
        } else if (Array.isArray(newData[section])) {
            newData[section] = newData[section].map(item => 
                item.id === field ? { ...item, [value.name]: value.val } : item
            );
        } else if (section === 'enabledSections') {
            newData.enabledSections = { ...newData.enabledSections, [field]: value };
        }
        return { currentResumeData: newData };
    }),

    // Backend Synchronisation
    fetchResumes: async () => {
        if (activeFetchResumesPromise) {
            return activeFetchResumesPromise;
        }

        set({ isLoading: true });

        activeFetchResumesPromise = (async () => {
            try {
                const response = await axios.get(API_BASE_URL);
                set({ resumeList: response.data, isLoading: false });
                return response.data;
            } catch (error) {
                set({ error: error.message, isLoading: false });
            } finally {
                activeFetchResumesPromise = null;
            }
        })();

        return activeFetchResumesPromise;
    },

    loadResume: (resume) => {
        if (!resume) return;
        const nameVal = resume.personalInfo?.fullName || resume.personalInfo?.name || resume.name || '';
        const emailVal = resume.personalInfo?.email || resume.email || '';
        const phoneVal = resume.personalInfo?.phone || resume.phone || '';
        const linkedinVal = resume.personalInfo?.linkedin || resume.linkedin || '';
        const locationVal = resume.personalInfo?.location || resume.location || '';
        const summaryVal = resume.summary || resume.personalInfo?.summary || '';

        const mapWithId = (arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return [];
            return arr.map(item => typeof item === 'object' && item !== null ? { ...item, id: item.id || item._id || generateId() } : item);
        };

        set({
            currentResumeId: resume._id || null,
            selectedTemplate: resume.template || resume.templateId || 'ats-alice',
            currentResumeData: {
                ...initialState,
                ...resume,
                personalInfo: {
                    fullName: nameVal,
                    email: emailVal,
                    phone: phoneVal,
                    linkedin: linkedinVal,
                    location: locationVal,
                    summary: summaryVal,
                    nameLocked: !!nameVal,
                },
                enabledSections: {
                    ...initialState.enabledSections,
                    ...(resume.enabledSections || {})
                },
                education: mapWithId(resume.education).length > 0 ? mapWithId(resume.education) : initialState.education,
                experience: mapWithId(resume.experience).length > 0 ? mapWithId(resume.experience) : initialState.experience,
                internships: mapWithId(resume.internships).length > 0 ? mapWithId(resume.internships) : initialState.internships,
                projects: mapWithId(resume.projects).length > 0 ? mapWithId(resume.projects) : initialState.projects,
                skills: Array.isArray(resume.skills) ? resume.skills : initialState.skills,
                isFresher: !!resume.isFresher,
                atsScore: resume.atsScore || null,
            },
            error: null
        });
    },

    saveResume: async (isFinal = false) => {
        const { currentResumeId, selectedTemplate, currentResumeData } = get();
        set({ isSaving: true });

        const pInfo = currentResumeData?.personalInfo || {};

        // Structured payload for the new schema
        const payload = {
            title: pInfo.fullName ? `${pInfo.fullName}'s Resume` : 'My Resume',
            template: selectedTemplate,
            personalInfo: {
                name: pInfo.fullName || '',
                email: pInfo.email || '',
                phone: pInfo.phone || '',
                linkedin: pInfo.linkedin || '',
                location: pInfo.location || '',
            },
            summary: pInfo.summary || '',
            skills: currentResumeData?.skills || [],
            education: currentResumeData?.education || [],
            experience: currentResumeData?.isFresher ? [] : (currentResumeData?.experience || []),
            internships: currentResumeData?.internships || [],
            projects: currentResumeData?.projects || [],
            atsScore: currentResumeData?.atsScore || null,
            enabledSections: currentResumeData?.enabledSections || initialState.enabledSections,
            isFresher: !!currentResumeData?.isFresher,
        };

        try {
            let response;
            if (currentResumeId) {
                // Update
                response = await axios.put(`${API_BASE_URL}/${currentResumeId}`, payload);
            } else {
                // Create
                response = await axios.post(API_BASE_URL, payload);
                set({ currentResumeId: response.data._id });
            }
            
            // Refresh list
            get().fetchResumes();
            set({ isSaving: false, error: null });
            return response.data;
        } catch (error) {
            set({ isSaving: false, error: error.response?.data?.message || error.message });
            throw error;
        }
    },

    deleteResume: async (id) => {
        try {
            // Optimistic UI update
            set((state) => ({
                resumeList: state.resumeList.filter(r => r._id !== id)
            }));
            await axios.delete(`${API_BASE_URL}/${id}`);
            get().fetchResumes(); // Ensure sync
        } catch (error) {
            set({ error: error.response?.data?.message || error.message });
            get().fetchResumes(); // Rollback if failed
        }
    },

    updateEntry: (section, id, field, value) => set((state) => {
        const list = Array.isArray(state.currentResumeData[section]) ? state.currentResumeData[section] : [];
        return {
            currentResumeData: {
                ...state.currentResumeData,
                [section]: list.map(item =>
                    (item.id === id || item._id === id) ? { ...item, [field]: value } : item
                )
            }
        };
    }),

    addEntry: (section) => set((state) => {
        const list = Array.isArray(state.currentResumeData[section]) ? state.currentResumeData[section] : [];
        const newEntry = section === 'skills' ? '' : { id: generateId() };
        return {
            currentResumeData: {
                ...state.currentResumeData,
                [section]: [...list, newEntry]
            }
        };
    }),

    removeEntry: (section, id) => set((state) => {
        const list = Array.isArray(state.currentResumeData[section]) ? state.currentResumeData[section] : [];
        return {
            currentResumeData: {
                ...state.currentResumeData,
                [section]: list.filter(item => item.id !== id && item._id !== id)
            }
        };
    }),

    setFresherMode: (value) => set((state) => ({
        currentResumeData: {
            ...state.currentResumeData,
            isFresher: value,
            enabledSections: {
                ...(state.currentResumeData.enabledSections || initialState.enabledSections),
                experience: !value,
                internships: value
            }
        }
    })),

    resetResume: (userProfile = null) => {
        const nameVal = userProfile?.name || userProfile?.personalInfo?.fullName || userProfile?.personalInfo?.name || '';
        const emailVal = userProfile?.email || userProfile?.personalInfo?.email || '';
        const phoneVal = userProfile?.phone || userProfile?.personalInfo?.phone || '';
        const linkedinVal = userProfile?.linkedin || userProfile?.personalInfo?.linkedin || '';
        const locationVal = userProfile?.location || userProfile?.personalInfo?.location || '';
        const summaryVal = userProfile?.summary || userProfile?.personalInfo?.summary || '';

        const mapWithId = (arr) => {
            if (!Array.isArray(arr) || arr.length === 0) return [];
            return arr.map(item => typeof item === 'object' && item !== null ? { ...item, id: item.id || item._id || generateId() } : item);
        };

        set({
            currentResumeId: null,
            selectedTemplate: 'harvard-classic',
            currentResumeData: {
                ...initialState,
                personalInfo: {
                    fullName: nameVal,
                    email: emailVal,
                    phone: phoneVal,
                    linkedin: linkedinVal,
                    location: locationVal,
                    summary: summaryVal,
                    nameLocked: !!nameVal,
                },
                education: mapWithId(userProfile?.education).length > 0 ? mapWithId(userProfile?.education) : initialState.education,
                experience: mapWithId(userProfile?.experience).length > 0 ? mapWithId(userProfile?.experience) : initialState.experience,
                internships: mapWithId(userProfile?.internships).length > 0 ? mapWithId(userProfile?.internships) : initialState.internships,
                projects: mapWithId(userProfile?.projects).length > 0 ? mapWithId(userProfile?.projects) : initialState.projects,
                skills: Array.isArray(userProfile?.skills) && userProfile.skills.length > 0 ? userProfile.skills : initialState.skills,
            },
            error: null
        });
    },

    duplicateResume: async (resumeId) => {
        const { resumeList, fetchResumes } = get();
        const target = resumeList.find(r => r._id === resumeId);
        if (!target) return;

        set({ isSaving: true });
        try {
            const newPayload = {
                title: `${target.title || 'Resume'} (Copy)`,
                template: target.template || 'ats-alice',
                personalInfo: target.personalInfo,
                summary: target.summary,
                skills: target.skills,
                education: target.education,
                experience: target.experience,
                projects: target.projects,
                atsScore: target.atsScore || 0
            };

            await axios.post(API_BASE_URL, newPayload);
            await fetchResumes(true);
        } catch (err) {
            console.error('Duplicate Resume Error:', err);
            set({ error: 'Failed to duplicate resume' });
        } finally {
            set({ isSaving: false });
        }
    },

    exportResumeJSON: (resume) => {
        const data = resume || get().currentResumeData;
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${(data.title || data.personalInfo?.fullName || 'resume').replace(/\s+/g, '_')}_backup.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    importResumeJSON: (jsonData) => {
        try {
            const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            set((state) => ({
                currentResumeData: {
                    ...initialState,
                    ...parsed,
                    personalInfo: {
                        ...initialState.personalInfo,
                        ...(parsed.personalInfo || {})
                    }
                }
            }));
            return true;
        } catch (err) {
            console.error('Failed to import JSON resume:', err);
            return false;
        }
    }
}));


export default useResumeStore;

