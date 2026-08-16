import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import { useAuth } from '../../context/AuthContext';
import useResumeStore from '../../store/useResumeStore';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Plus,
  Trash2,
  FileText,
  ChevronRight,
  Loader2,
  ExternalLink,
  PlusCircle,
  AlertCircle,
  X,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react';

const API_JOBS_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/jobs`;

const RecommendationScoreCircle = ({ score }) => {
  const getScoreColor = (val) => {
    if (val >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (val >= 60) return 'text-orange-500 stroke-orange-500';
    return 'text-red-500 stroke-red-500';
  };
  const getScoreBg = (val) => {
    if (val >= 80) return 'stroke-emerald-100';
    if (val >= 60) return 'stroke-orange-100';
    return 'stroke-red-100';
  };
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
      <svg className="absolute transform -rotate-90 w-12 h-12">
        <circle
          cx="24"
          cy="24"
          r={radius}
          strokeWidth="3"
          fill="transparent"
          className={getScoreBg(score)}
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
        />
      </svg>
      <span className="text-[11px] font-black text-slate-800">{score}%</span>
    </div>
  );
};

const JobsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { resumeList, fetchResumes } = useResumeStore();

  const [activeTab, setActiveTab] = useState('openings'); // 'openings' | 'kanban'
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

  const [activeJob, setActiveJob] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // New Job Form State
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: ''
  });

  const [applying, setApplying] = useState(false);
  const [submittingJob, setSubmittingJob] = useState(false);

  // Load Job Listings
  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_JOBS_URL);
      setJobs(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve job listings. Check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load My Applications for Kanban
  const fetchMyApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const response = await axios.get(`${API_JOBS_URL}/my-applications`);
      setMyApplications(response.data);
    } catch (err) {
      console.error('Failed to load my applications:', err);
    } finally {
      setLoadingApps(false);
    }
  }, []);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    loadJobs();
    fetchMyApplications();
    fetchResumes();
  }, [loadJobs, fetchMyApplications, fetchResumes]);

  // Load Applicants for Admin
  const loadApplicants = async (job) => {
    setActiveJob(job);
    setShowApplicantsModal(true);
    setLoadingApplicants(true);
    try {
      const response = await axios.get(`${API_JOBS_URL}/${job._id}/applicants`);
      setApplicants(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateApplicantStatus = async (applicantId, newStatus) => {
    if (!activeJob) return;
    try {
      await axios.put(
        `${API_JOBS_URL}/${activeJob._id}/applicants/${applicantId}/status`,
        { status: newStatus }
      );
      toast.success('Status Updated', `Moved applicant to ${newStatus}`);
      loadApplicants(activeJob);
    } catch (err) {
      toast.error('Error', 'Failed to update applicant stage.');
    }
  };

  // Load AI Candidates Recommendation for Admin
  const loadRecommendations = async (job) => {
    setActiveJob(job);
    setShowRecommendationsModal(true);
    setLoadingRecommendations(true);
    try {
      const response = await axios.get(`${API_JOBS_URL}/${job._id}/recommendations`);
      setRecommendations(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Open Apply Modal
  const handleOpenApply = (job) => {
    setActiveJob(job);
    setSelectedResumeId(resumeList[0]?._id || '');
    setShowApplyModal(true);
  };

  // Submit Job Application
  const handleApply = async () => {
    if (!selectedResumeId) {
      alert('Please select a resume to apply with.');
      return;
    }
    setApplying(true);
    try {
      await axios.post(`${API_JOBS_URL}/${activeJob._id}/apply`, {
        resumeId: selectedResumeId
      });
      setShowApplyModal(false);
      loadJobs();
      fetchMyApplications();
      toast.success('Applied!', 'Your application was submitted successfully.');
    } catch (err) {
      toast.error('Application Failed', err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  // Create Job Posting (Admin)
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setSubmittingJob(true);
    try {
      await axios.post(API_JOBS_URL, newJob);
      setShowAddJobModal(false);
      setNewJob({
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: '',
        salary: ''
      });
      loadJobs();
      toast.success('Job Posted!', 'Opening published to all candidates.');
    } catch (err) {
      toast.error('Error', 'Failed to post job listing.');
    } finally {
      setSubmittingJob(false);
    }
  };

  // Delete Job Posting (Admin)
  const handleDeleteJob = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this listing?')) return;
    try {
      await axios.delete(`${API_JOBS_URL}/${id}`);
      loadJobs();
      toast.info('Deleted', 'Job opening removed.');
    } catch (err) {
      console.error(err);
    }
  };

  const KANBAN_STAGES = [
    { key: 'Applied', title: 'Applied', color: 'border-orange-500 text-orange-600 bg-orange-50' },
    { key: 'Interviewing', title: 'Interviewing', color: 'border-sky-500 text-sky-600 bg-sky-50' },
    { key: 'Offered', title: 'Offered 🎉', color: 'border-emerald-500 text-emerald-600 bg-emerald-50' },
    { key: 'Rejected', title: 'Archived', color: 'border-slate-300 text-slate-500 bg-slate-100' },
  ];

  return (
    <div className="flex bg-white min-h-screen">
      <Sidebar />

      <main className="flex-1 ml-0 md:ml-20 min-h-screen pt-16 md:pt-0 pb-24 md:pb-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-6 pb-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-black/[0.04]">
            <div>
              <h1 className="text-4xl font-black text-black tracking-tight">Hiring &amp; Career Hub</h1>
              <p className="text-stone-500 mt-1 font-medium text-sm">
                {user?.isAdmin
                  ? 'Manage open positions, post new job descriptions, and track candidate applications.'
                  : 'Explore top openings and track your application pipeline in real time.'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Tab Switcher for Candidates */}
              {!user?.isAdmin && (
                <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl">
                  <button
                    onClick={() => setActiveTab('openings')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                      activeTab === 'openings'
                        ? 'bg-white text-black shadow-md shadow-black/5'
                        : 'text-stone-500 hover:text-black'
                    }`}
                  >
                    <Briefcase size={14} /> Openings ({jobs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('kanban')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                      activeTab === 'kanban'
                        ? 'bg-white text-black shadow-md shadow-black/5'
                        : 'text-stone-500 hover:text-black'
                    }`}
                  >
                    <Layers size={14} /> My Tracker ({myApplications.length})
                  </button>
                </div>
              )}

              {user?.isAdmin && (
                <button
                  onClick={() => setShowAddJobModal(true)}
                  className="flex items-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-6 py-3.5 shadow-xl shadow-orange-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  Post Job Opening
                </button>
              )}
            </div>
          </header>

          {/* Kanban Pipeline View */}
          {activeTab === 'kanban' && !user?.isAdmin && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {KANBAN_STAGES.map((stage) => {
                  const stageApps = myApplications.filter(
                    (app) => (app.status || 'Applied').toLowerCase() === stage.key.toLowerCase()
                  );

                  return (
                    <div key={stage.key} className="flex flex-col bg-slate-50/70 border border-black/[0.05] rounded-3xl p-4 min-h-[480px]">
                      <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] mb-4">
                        <span className={`px-3 py-1 rounded-xl text-xs font-black border ${stage.color}`}>
                          {stage.title}
                        </span>
                        <span className="text-xs font-black text-stone-400">{stageApps.length}</span>
                      </div>

                      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide">
                        {stageApps.length === 0 ? (
                          <div className="h-32 flex items-center justify-center text-center text-xs font-bold text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
                            No applications
                          </div>
                        ) : (
                          stageApps.map((app) => (
                            <div
                              key={app._id}
                              className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-sm hover:shadow-md transition-all space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-sm font-black text-black leading-tight">{app.title}</h4>
                                {app.resume?.atsScore > 0 && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-black shrink-0">
                                    {app.resume.atsScore}% ATS
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-orange-600">{app.company}</p>
                              
                              <div className="flex items-center justify-between pt-2 text-[10px] font-bold text-stone-400 border-t border-black/[0.04]">
                                <span className="flex items-center gap-1"><MapPin size={10} /> {app.location}</span>
                                <span className="flex items-center gap-1"><Clock size={10} /> {new Date(app.appliedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Job Openings Grid View */}
          {activeTab === 'openings' && (
            <>
              {/* Error display */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 p-4 rounded-2xl flex items-center gap-3 font-semibold mb-6">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Job grid */}
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="animate-spin text-orange-500" size={36} />
                </div>
              ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {jobs.map((job) => {
                    const userHasApplied = job.applicants.some(a => a.userId === user?._id);

                    return (
                      <div
                        key={job._id}
                        className="bento-card bento-card-hover p-7 relative group flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          {/* Job Heading & Company Logo */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-3.5">
                              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-black/10">
                                {job.company?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              <div>
                                <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">
                                  {job.title}
                                </h3>
                                <p className="text-xs font-black text-orange-600 mt-0.5">{job.company}</p>
                              </div>
                            </div>

                            {user?.isAdmin && (
                              <button
                                onClick={(e) => handleDeleteJob(job._id, e)}
                                className="p-2.5 border border-black/10 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                                title="Delete Listing"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          {/* Metas */}
                          <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600 pt-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-black/5">
                              <MapPin size={13} className="text-slate-400" /> {job.location}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-black/5">
                              <DollarSign size={13} className="text-slate-400" /> {job.salary}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 border border-black/5">
                              <Users size={13} className="text-slate-400" /> {job.applicants?.length || 0} Candidate(s)
                            </span>
                          </div>

                          {/* Description */}
                          <p className="text-xs font-medium text-slate-600 line-clamp-3 leading-relaxed">
                            {job.description}
                          </p>

                          {/* Requirements Badges */}
                          {job.requirements?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {job.requirements.slice(0, 4).map((req, i) => (
                                <span key={i} className="text-[10px] font-black px-2.5 py-1 bg-white text-slate-700 rounded-lg border border-black/10 shadow-2xs">
                                  {req}
                                </span>
                              ))}
                              {job.requirements.length > 4 && (
                                <span className="text-[10px] font-black px-2 py-1 text-slate-400">
                                  +{job.requirements.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 border-t border-black/[0.04] mt-6 flex items-center justify-between">
                          {user?.isAdmin ? (
                            <div className="flex gap-2.5 w-full">
                              <button
                                onClick={() => loadApplicants(job)}
                                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Users size={14} />
                                Applicants ({job.applicants?.length || 0})
                              </button>
                              <button
                                onClick={() => loadRecommendations(job)}
                                className="flex-1 py-3.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-black text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-orange-200/60 shadow-xs"
                              >
                                <Sparkles size={14} />
                                AI Match Matrix
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={userHasApplied}
                              onClick={() => handleOpenApply(job)}
                              className={`w-full py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                userHasApplied
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                                  : 'btn-luxury-primary'
                              }`}
                            >
                              {userHasApplied ? (
                                <>
                                  <CheckCircle2 size={16} /> Application Active
                                </>
                              ) : (
                                <>
                                  <PlusCircle size={16} /> Apply with Resume
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-stone-50 rounded-3xl border border-black/5 text-center p-8">
                  <Briefcase size={40} className="text-stone-300 mb-3" />
                  <h3 className="text-lg font-bold text-black">No Open Positions Currently</h3>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm">
                    {user?.isAdmin
                      ? 'Click the "Post Job Opening" button to list new opportunities.'
                      : 'Check back soon for newly posted roles from our team.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ── WINDOW MODAL: POST JOB (ADMIN) ────────────────────────────────── */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateJob}
            className="bg-white rounded-3.5xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-5 shadow-2xl border border-black/5 animate-in scale-in duration-300"
          >
            <h3 className="text-lg font-black text-black">Post Job Opening</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-600">Position Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Frontend Developer"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  className="w-full mt-1 px-4 py-3 border border-black/10 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600">Company Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Stark Labs"
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  className="w-full mt-1 px-4 py-3 border border-black/10 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-600">Job Location</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Remote / New York"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  className="w-full mt-1 px-4 py-3 border border-black/10 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-600">Offered Salary</label>
                <input
                  type="text"
                  placeholder="e.g. $100,000/yr"
                  value={newJob.salary}
                  onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                  className="w-full mt-1 px-4 py-3 border border-black/10 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600">Details Description</label>
              <textarea
                required
                rows={4}
                placeholder="List context, expectations, and role details..."
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                className="w-full mt-1 px-4 py-3 border border-black/10 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500 min-h-[100px]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-600">Required Skills (Comma separated)</label>
              <input
                type="text"
                placeholder="Python, React, Django"
                value={newJob.requirements}
                onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                className="w-full mt-1 px-4 py-3 border border-black/10 rounded-xl text-xs font-bold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={() => setShowAddJobModal(false)}
                className="px-5 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-stone-500 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingJob}
                className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submittingJob && <Loader2 size={12} className="animate-spin" />}
                Post Opening
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── WINDOW MODAL: APPLY TO JOB (USER/CANDIDATE) ────────────────────── */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3.5xl p-8 max-w-md w-full shadow-2xl border border-black/5 animate-in scale-in duration-300">
            <h3 className="text-lg font-black text-black">Apply to {activeJob?.title}</h3>
            <p className="text-stone-400 text-xs font-bold mt-1">Provider: {activeJob?.company}</p>

            {resumeList.length === 0 ? (
              <div className="py-8 text-center space-y-4">
                <p className="text-stone-500 text-xs font-semibold leading-relaxed">
                  You haven't built any resumes yet. A resume document is required before posting an application.
                </p>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    navigate('/builder');
                  }}
                  className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-orange-500 text-white text-xs font-black hover:bg-orange-600 active:scale-95 transition-all cursor-pointer shadow-md shadow-orange-500/10"
                >
                  <PlusCircle size={16} />
                  Build New Resume
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-6 mt-6">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-2">Select From Your Resumes</label>
                  <select
                    required
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-4 py-3 border border-black/10 rounded-xl text-xs font-extrabold bg-stone-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="">-- Click to choose --</option>
                    {resumeList.map(r => (
                      <option key={r._id} value={r._id}>
                        {r.title} (ATS Matches: {r.atsScore || 0}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowApplyModal(false);
                      setSelectedResumeId('');
                    }}
                    className="px-5 py-3 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-stone-500 text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={applying || !selectedResumeId}
                    className="px-6 py-3 rounded-xl bg-black hover:bg-stone-900 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {applying && <Loader2 size={12} className="animate-spin" />}
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── WINDOW MODAL: CHECK APPLICANTS (ADMIN) ─────────────────────────── */}
      {showApplicantsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-black/5 animate-in scale-in duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.03] mb-6">
              <div>
                <h3 className="text-lg font-black text-black">Applicants for {activeJob?.title}</h3>
                <p className="text-xs font-bold text-stone-400 capitalize">List length: {applicants.length}</p>
              </div>
              <button
                onClick={() => {
                  setShowApplicantsModal(false);
                  setApplicants([]);
                }}
                className="h-8 w-8 rounded-lg border border-black/5 flex items-center justify-center hover:bg-stone-50 text-stone-400 hover:text-black transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-hide">
              {loadingApplicants ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="animate-spin text-orange-500" size={32} />
                </div>
              ) : applicants.length > 0 ? (
                applicants.map((appl) => (
                  <div
                    key={appl._id}
                    className="p-4 border border-black/[0.03] rounded-2xl flex items-center justify-between hover:bg-stone-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-extrabold text-black">{appl.userId?.name || 'Guest User'}</p>
                      <p className="text-[10px] font-bold text-stone-400">{appl.userId?.email || 'N/A'}</p>
                      <div className="flex items-center gap-3 pt-1 text-[10px] font-bold text-stone-500">
                        <span className="flex items-center gap-1.5"><FileText size={12} /> {appl.resumeId?.title || 'Main Resume'}</span>
                        <span>•</span>
                        <span className="text-orange-500 font-extrabold">ATS Compatibility: {appl.resumeId?.atsScore || 0}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Selector */}
                      <select
                        value={appl.status || 'Applied'}
                        onChange={(e) => handleUpdateApplicantStatus(appl._id, e.target.value)}
                        className="px-3 py-2 rounded-xl border border-black/10 text-xs font-black uppercase tracking-wider bg-white cursor-pointer focus:outline-none focus:border-orange-500"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interviewing">Interviewing</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <button
                        onClick={() => {
                          setShowApplicantsModal(false);
                          if (appl.resumeId) {
                            navigate(`/builder`);
                            const targetResume = resumeList.find(r => r._id === appl.resumeId._id);
                            if (targetResume) {
                              useResumeStore.getState().loadResume(targetResume);
                            } else {
                              axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resume/${appl.resumeId._id}`)
                                .then(res => {
                                  useResumeStore.getState().loadResume(res.data);
                                });
                            }
                          }
                        }}
                        className="flex items-center gap-1.5 border border-black/5 hover:border-orange-500/20 hover:bg-orange-50 hover:text-orange-650 px-3.5 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer text-stone-500"
                      >
                        <ExternalLink size={12} />
                        View Resume
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-stone-400 font-medium text-xs">
                  No one has submitted applications to this position yet.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-black/[0.03] mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowApplicantsModal(false);
                  setApplicants([]);
                }}
                className="px-5 py-3 bg-black hover:bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close list
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── WINDOW MODAL: CANDIDATE RECOMMENDATIONS (ADMIN) ─────────────────── */}
      {showRecommendationsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-black/5 animate-in scale-in duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.03] mb-6">
              <div>
                <h3 className="text-lg font-black text-black">AI Recommendations for {activeJob?.title}</h3>
                <p className="text-xs font-bold text-stone-400">Ranked by local Research-Backed ATS scoring model</p>
              </div>
              <button
                onClick={() => {
                  setShowRecommendationsModal(false);
                  setRecommendations([]);
                }}
                className="h-8 w-8 rounded-lg border border-black/5 flex items-center justify-center hover:bg-stone-50 text-stone-400 hover:text-black transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-hide">
              {loadingRecommendations ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="animate-spin text-orange-500" size={32} />
                </div>
              ) : recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div
                    key={rec.resumeId}
                    className="p-5 border border-black/[0.03] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between hover:bg-stone-50 transition-all duration-300 gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <RecommendationScoreCircle score={rec.score} />
                      <div className="space-y-1">
                        <p className="text-sm font-extrabold text-black">{rec.name}</p>
                        <p className="text-[10px] font-bold text-stone-400">{rec.email} • {rec.phone}</p>
                        <p className="text-[10px] font-bold text-stone-500 italic">Resume: {rec.resumeTitle}</p>

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {rec.matchedKeywords.slice(0, 3).map((kw, i) => (
                            <span key={i} className="text-[8px] font-extrabold px-2 py-0.5 rounded-md bg-green-50 border border-green-200 text-green-700">
                              ✓ {kw}
                            </span>
                          ))}
                          {rec.missingKeywords.slice(0, 3).map((kw, i) => (
                            <span key={i} className="text-[8px] font-extrabold px-2 py-0.5 rounded-md bg-red-50 border border-red-100 text-red-600">
                              ✗ {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowRecommendationsModal(false);
                        navigate(`/builder`);
                        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resume/${rec.resumeId}`)
                          .then(res => {
                            useResumeStore.getState().loadResume(res.data);
                          });
                      }}
                      className="flex items-center justify-center gap-1.5 border border-black/5 hover:border-orange-500/20 hover:bg-orange-50 hover:text-orange-650 px-4 py-2.5 rounded-xl text-[10px] font-black transition-colors cursor-pointer text-stone-500 shrink-0"
                    >
                      <ExternalLink size={12} />
                      Open Resume in Builder
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-stone-400 font-medium text-xs">
                  No candidate resumes registered in the system yet.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-black/[0.03] mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowRecommendationsModal(false);
                  setRecommendations([]);
                }}
                className="px-5 py-3 bg-black hover:bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close recommendations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
