import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import { useResume } from '../../context/ResumeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AutocompleteInput, { LOCATION_SUGGESTIONS, UNIVERSITY_SUGGESTIONS } from '../../components/common/AutocompleteInput';
import {
  User,
  Settings,
  Search as Bell,
  User as Shield,
  Layout as Moon,
  Mail,
  Phone,
  MapPin,
  PlusCircle as Save,
  Layout as CreditCard,
  PlusCircle as Sparkles,
  Lock,
  CheckCircle,
  Info,
  Loader2,
  AlertCircle,
  FileText,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  X,
  Link,
  Users,
  ShieldCheck,
  RefreshCw,
  Clock,
  UserX,
  Activity,
  Server,
  Database,
  Cpu,
  Eye,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

import { isLiveSession } from '../../services/authService';

// --- Static Data ---
const TABS = [
  { id: 'profile', name: 'Profile Details', icon: User },
  { id: 'resume', name: 'Resume Data', icon: FileText },
  { id: 'settings', name: 'Preferences', icon: Settings },
  { id: 'billing', name: 'Subscription', icon: CreditCard },
];

const ADMIN_TABS = [
  ...TABS,
  { id: 'admin', name: 'User Audit & Diagnostics', icon: ShieldCheck },
];

// Auth token is in an httpOnly cookie, sent automatically by axios (withCredentials is set globally).


const fmt = (dateStr) => {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const AdminAuditSection = ({ users, loading, onRestore }) => {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [inspectingUser, setInspectingUser] = useState(null);
  const [auditedResume, setAuditedResume] = useState(null);
  const [loadingResume, setLoadingResume] = useState(false);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoadingMetrics(true);
      try {
        const [analyticsRes, healthRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/analytics`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/health`),
        ]);
        setAnalytics(analyticsRes.data);
        setHealth(healthRes.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchAdminStats();
  }, []);

  const handleAuditResume = async (targetUser) => {
    setInspectingUser(targetUser);
    setLoadingResume(true);
    setAuditedResume(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users/${targetUser._id}/resume`);
      setAuditedResume(res.data);
    } catch (err) {
      toast.info('No Active Resume', 'This user has not generated a resume yet.');
      setInspectingUser(null);
    } finally {
      setLoadingResume(false);
    }
  };

  const filtered = users.filter(u => {
    if (filter === 'active') return !u.isDeleted;
    if (filter === 'deleted') return u.isDeleted;
    return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Top Platform Metrics Cards ────────────────────────────────────── */}
      {analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bento-card p-6 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total User Base</span>
              <p className="text-3xl font-black text-slate-900">{analytics.metrics.totalUsers}</p>
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
                <CheckCircle size={12} />
                <span>{analytics.metrics.activeUsers} Active Accounts</span>
              </div>
            </div>

            <div className="bento-card p-6 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resumes Created</span>
              <p className="text-3xl font-black text-slate-900">{analytics.metrics.totalResumes}</p>
              <div className="flex items-center gap-1.5 text-xs font-black text-orange-600">
                <Cpu size={12} />
                <span>AI Engine Synced</span>
              </div>
            </div>

            <div className="bento-card p-6 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg ATS Benchmark</span>
              <p className="text-3xl font-black text-emerald-600">{analytics.metrics.avgAtsScore}%</p>
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-500">
                <TrendingUp size={12} />
                <span>High Compliance Ratio</span>
              </div>
            </div>

            <div className="bento-card p-6 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Audit</span>
              <p className="text-3xl font-black text-amber-600">{analytics.metrics.deletedUsers}</p>
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-400">
                <ShieldCheck size={12} />
                <span>Soft-Deleted Records</span>
              </div>
            </div>
          </div>

          {/* Top In-Demand Skills Pill Cluster */}
          {analytics.topSkills?.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-white border border-orange-200/60 space-y-3 shadow-xs">
              <span className="text-xs font-black uppercase tracking-wider text-orange-950 flex items-center gap-2">
                <TrendingUp size={16} className="text-orange-600" /> Top Market Competencies Detected Across User Base:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {analytics.topSkills.map((s, idx) => (
                  <span key={idx} className="px-3.5 py-1.5 rounded-xl bg-white border border-orange-200 text-xs font-black text-slate-800 shadow-2xs">
                    {s.name} <span className="text-orange-600 ml-1">({s.count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Obsidian System Health Diagnostics ─────────────────────────────── */}
      {health && (
        <div className="p-7 rounded-[32px] bg-[#0c0c0e] text-white space-y-6 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-3.5 w-3.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#34d399]" />
              <h4 className="text-base font-black tracking-tight flex items-center gap-2">
                <Server size={18} className="text-emerald-400" /> Platform Infrastructure Diagnostics
              </h4>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              Live: {health.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 relative z-10">
            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Database size={13} className="text-sky-400" /> {health.services.database.name}
              </span>
              <p className="text-sm font-black text-white">{health.services.database.status}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu size={13} className="text-orange-400" /> {health.services.aiEngine.name}
              </span>
              <p className="text-sm font-black text-emerald-400">{health.services.aiEngine.status}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={13} className="text-emerald-400" /> Heap &amp; Server Telemetry
              </span>
              <p className="text-sm font-black text-white">{health.system.heapUsedMB} MB / Uptime: {health.uptime}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── User Security Audit Table ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-2xl shadow-xs"><ShieldCheck size={22} /></div>
            Candidate Registry &amp; Security Compliance
          </h3>
          <p className="text-slate-500 text-xs font-bold mt-1">Audit active sessions, resume assets, and compliance status.</p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 border border-black/5 rounded-2xl">
          {['all', 'active', 'deleted'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                filter === f ? 'bg-white text-slate-900 shadow-md shadow-black/5' : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {f === 'all' ? `All (${users.length})` : f === 'active' ? `Active (${users.filter(u => !u.isDeleted).length})` : `Deleted (${users.filter(u => u.isDeleted).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-orange-500" size={36} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="h-40 flex items-center justify-center bg-stone-50 rounded-3xl text-stone-400 font-bold text-sm">
          No users found.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr_auto] gap-4 px-5 py-3 text-[10px] font-black text-stone-400 uppercase tracking-widest">
            <span>Name</span>
            <span>Email</span>
            <span className="flex items-center gap-1"><Clock size={10} /> Last Login</span>
            <span>Registered</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filtered.map(u => (
            <div
              key={u._id}
              className={`grid grid-cols-[2fr_2fr_1.5fr_1.5fr_1fr_auto] gap-4 items-center px-5 py-4 rounded-2xl border transition-all ${
                u.isDeleted
                  ? 'bg-red-50 border-red-100 opacity-80'
                  : 'bg-white border-black/[0.04] hover:shadow-md hover:border-black/10'
              }`}
            >
              {/* Name */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0 ${
                  u.isDeleted ? 'bg-red-400' : u.isAdmin ? 'bg-orange-500' : 'bg-stone-800'
                }`}>
                  {u.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-black truncate">{u.name}</p>
                  {u.isAdmin && <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Admin</p>}
                </div>
              </div>

              {/* Email */}
              <p className="text-xs font-bold text-stone-500 truncate">{u.email}</p>

              {/* Last Login */}
              <p className="text-[11px] font-bold text-stone-500">{fmt(u.lastLogin)}</p>

              {/* Registered */}
              <p className="text-[11px] font-bold text-stone-500">{fmt(u.createdAt)}</p>

              {/* Status badge */}
              {u.isDeleted ? (
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-600 rounded-lg text-[9px] font-black uppercase">
                    <UserX size={9} /> Deleted
                  </span>
                </div>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase w-fit">
                  <CheckCircle size={9} /> Active
                </span>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!u.isDeleted && (
                  <button
                    onClick={() => handleAuditResume(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-black/10 hover:border-orange-500/30 hover:bg-orange-50 hover:text-orange-600 text-stone-600 rounded-xl text-[10px] font-black transition-all cursor-pointer shrink-0"
                  >
                    <Eye size={11} /> Inspect
                  </button>
                )}
                {u.isDeleted && (
                  <button
                    onClick={() => onRestore(u._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/10 hover:border-orange-500/30 hover:bg-orange-50 hover:text-orange-600 text-stone-500 rounded-xl text-[10px] font-black transition-all cursor-pointer shrink-0"
                  >
                    <RefreshCw size={11} /> Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Resume Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-stone-100 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-black/[0.06] mb-6">
              <div>
                <h3 className="text-xl font-black text-black">Auditing Resume: {inspectingUser.name}</h3>
                <p className="text-xs font-bold text-stone-400">{inspectingUser.email}</p>
              </div>
              <button onClick={() => setInspectingUser(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {loadingResume ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="animate-spin text-orange-500" size={32} />
                </div>
              ) : auditedResume ? (
                <div className="space-y-4 text-xs font-medium text-slate-700">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.04]">
                    <span className="text-[10px] font-black uppercase text-orange-600">Title &amp; Template</span>
                    <p className="text-sm font-black text-slate-900">{auditedResume.title} ({auditedResume.template})</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.04]">
                    <span className="text-[10px] font-black uppercase text-slate-400">Summary</span>
                    <p className="text-slate-800 mt-1">{auditedResume.summary || auditedResume.personalInfo?.summary || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-black/[0.04]">
                    <span className="text-[10px] font-black uppercase text-slate-400">Skills ({auditedResume.skills?.length || 0})</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {auditedResume.skills?.map((sk, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-black/10 font-bold text-slate-800 text-[10px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-stone-400 font-bold">No resume record exists for this user.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deleted accounts warning note */}
      {users.some(u => u.isDeleted) && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-amber-700">
            Deleted accounts are retained as <strong>soft-deleted records</strong> for security audit purposes. Their login is permanently blocked. Only admins can restore them.
          </p>
        </div>
      )}
    </div>
  );
};

// --- Sub-components (Defined outside to prevent focus loss) ---

const AddDataModal = ({ show, section, onClose, onSubmit }) => {
  if (!show) return null;
  
  const sectionTitles = {
    education: 'Education',
    experience: 'Work Experience',
    internships: 'Internship',
    projects: 'New Project'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-stone-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-black">Add {sectionTitles[section]}</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-stone-500 text-sm font-medium mb-8">
          Create a new entry for your {section}. You can fill in the details immediately after adding.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={onSubmit} 
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 font-black uppercase tracking-widest text-xs"
          >
            Confirm & Add
          </Button>
          <button 
            onClick={onClose}
            className="w-full py-4 text-stone-400 font-black uppercase tracking-widest text-[10px] hover:text-black transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ResumeDataSection = ({ resumeData, syncing, handleSync, openAddModal, handleRemove, updateEntry, setResumeData }) => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
    <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
      <div>
        <h3 className="text-2xl font-black text-black">Global Resume Data</h3>
        <p className="text-stone-500 text-sm font-medium">Manage your professional background used for AI resume generation.</p>
      </div>
      <Button
        onClick={() => handleSync()}
        disabled={syncing}
        className="flex items-center gap-2 px-8 py-3 bg-black hover:bg-stone-800 transition-all font-black uppercase tracking-widest text-xs"
      >
        {syncing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {syncing ? 'Syncing...' : 'Save All Changes'}
      </Button>
    </div>

    <div className="grid grid-cols-1 gap-16">
      {/* Education */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><GraduationCap size={22} /></div>
            <h3 className="text-xl font-black text-black">Education</h3>
          </div>
          <button onClick={() => openAddModal('education')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase hover:bg-blue-100 transition-all">
            <Plus size={14} /> Add Education
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumeData.education.map((edu) => (
            <div key={edu.id} className="p-6 bg-stone-50 rounded-3xl border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative">
              <button onClick={() => handleRemove('education', edu.id)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 size={14} /></button>
              <div className="space-y-3">
                <input className="w-full bg-transparent text-sm font-black text-black focus:outline-none" value={edu.school} onChange={(e) => updateEntry('education', edu.id, 'school', e.target.value)} placeholder="University Name" />
                <input className="w-full bg-transparent text-xs font-bold text-stone-600 focus:outline-none" value={edu.degree} onChange={(e) => updateEntry('education', edu.id, 'degree', e.target.value)} placeholder="Degree / Field" />
                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-stone-400">
                  <div className="flex items-center gap-1.5 flex-1"><MapPin size={12} /><input className="w-full bg-transparent focus:outline-none" value={edu.location} onChange={(e) => updateEntry('education', edu.id, 'location', e.target.value)} placeholder="Location" /></div>
                  <div className="flex items-center gap-1.5"><Settings size={12} /><input className="w-20 bg-transparent focus:outline-none text-right" value={edu.year} onChange={(e) => updateEntry('education', edu.id, 'year', e.target.value)} placeholder="Year" /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><Briefcase size={22} /></div>
            <h3 className="text-xl font-black text-black">Work Experience</h3>
          </div>
          <button onClick={() => openAddModal('experience')} className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-xs font-black uppercase hover:bg-orange-100 transition-all">
            <Plus size={14} /> Add Experience
          </button>
        </div>
        <div className="space-y-4">
          {resumeData.experience.map((exp) => (
            <div key={exp.id} className="p-6 bg-stone-50 rounded-3xl border border-transparent hover:border-orange-100 hover:bg-white hover:shadow-xl hover:shadow-orange-500/5 transition-all group relative">
              <button onClick={() => handleRemove('experience', exp.id)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <input className="w-full bg-transparent text-sm font-black text-black focus:outline-none" value={exp.company} onChange={(e) => updateEntry('experience', exp.id, 'company', e.target.value)} placeholder="Company" />
                <input className="w-full bg-transparent text-sm font-black text-black focus:outline-none" value={exp.position} onChange={(e) => updateEntry('experience', exp.id, 'position', e.target.value)} placeholder="Position" />
              </div>
              <input className="w-full bg-transparent text-[11px] font-black text-stone-400 mb-2 focus:outline-none uppercase tracking-wider" value={exp.duration} onChange={(e) => updateEntry('experience', exp.id, 'duration', e.target.value)} placeholder="Duration" />
              <textarea className="w-full bg-transparent text-[11px] text-stone-500 focus:outline-none min-h-[60px] resize-none leading-relaxed" value={exp.description} onChange={(e) => updateEntry('experience', exp.id, 'description', e.target.value)} placeholder="Description..." />
            </div>
          ))}
        </div>
      </section>

      {/* Internships */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><Award size={22} /></div>
            <h3 className="text-xl font-black text-black">Internships</h3>
          </div>
          <button onClick={() => openAddModal('internships')} className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-xs font-black uppercase hover:bg-purple-100 transition-all">
            <Plus size={14} /> Add Internship
          </button>
        </div>
        <div className="space-y-4">
          {resumeData.internships.map((intern) => (
            <div key={intern.id} className="p-6 bg-stone-50 rounded-3xl border border-transparent hover:border-purple-100 hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 transition-all group relative">
              <button onClick={() => handleRemove('internships', intern.id)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 size={14} /></button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <input className="w-full bg-transparent text-sm font-black text-black focus:outline-none" value={intern.company} onChange={(e) => updateEntry('internships', intern.id, 'company', e.target.value)} placeholder="Company" />
                <input className="w-full bg-transparent text-sm font-black text-black focus:outline-none" value={intern.position} onChange={(e) => updateEntry('internships', intern.id, 'position', e.target.value)} placeholder="Position" />
              </div>
              <input className="w-full bg-transparent text-[11px] font-black text-stone-400 mb-2 focus:outline-none uppercase" value={intern.duration} onChange={(e) => updateEntry('internships', intern.id, 'duration', e.target.value)} placeholder="Duration" />
              <textarea className="w-full bg-transparent text-[11px] text-stone-500 focus:outline-none min-h-[40px] resize-none" value={intern.description} onChange={(e) => updateEntry('internships', intern.id, 'description', e.target.value)} placeholder="Description..." />
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl"><Code size={22} /></div>
            <h3 className="text-xl font-black text-black">Core Skills</h3>
          </div>
          <input 
            className="px-4 py-2 bg-stone-50 border border-stone-100 rounded-xl text-xs font-bold focus:outline-none focus:border-green-500 transition-all"
            placeholder="Type & Press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                const newSkills = [...resumeData.skills, e.target.value.trim()];
                setResumeData(prev => ({ ...prev, skills: newSkills }));
                e.target.value = '';
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          {resumeData.skills.map((skill, idx) => (
            <span key={idx} className="px-5 py-2.5 bg-stone-50 text-stone-600 text-xs font-black rounded-2xl border border-stone-200 hover:border-green-500 hover:text-green-600 transition-all flex items-center gap-3 group">
              {skill}
              <button onClick={() => setResumeData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><X size={12} /></button>
            </span>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl"><BookOpen size={22} /></div>
            <h3 className="text-xl font-black text-black">Projects</h3>
          </div>
          <button onClick={() => openAddModal('projects')} className="flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-600 rounded-xl text-xs font-black uppercase hover:bg-pink-100 transition-all">
            <Plus size={14} /> Add Project
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resumeData.projects.map((project) => (
            <div key={project.id} className="p-6 bg-stone-50 rounded-3xl border border-transparent hover:border-pink-100 hover:bg-white hover:shadow-xl hover:shadow-pink-500/5 transition-all group relative">
              <button onClick={() => handleRemove('projects', project.id)} className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"><Trash2 size={14} /></button>
              <input className="w-full bg-transparent text-sm font-black text-black focus:outline-none mb-1" value={project.title} onChange={(e) => updateEntry('projects', project.id, 'title', e.target.value)} placeholder="Project Title" />
              <textarea className="w-full bg-transparent text-[11px] text-stone-500 focus:outline-none mb-3 min-h-[50px] resize-none" value={project.description} onChange={(e) => updateEntry('projects', project.id, 'description', e.target.value)} placeholder="Description..." />
              <div className="flex items-center gap-2 text-pink-500"><Link size={12} /><input className="w-full bg-transparent text-[10px] font-black focus:outline-none" value={project.link} onChange={(e) => updateEntry('projects', project.id, 'link', e.target.value)} placeholder="Link (URL)" /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
);

const ProfileSection = ({ resumeData, isLive, isLocked, syncing, handleSync, handleInfoChange, showSuccess, localError }) => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-2xl font-black text-black">Personal Details</h3>
        </div>
        <p className="text-stone-500 text-sm font-medium mt-1">Update your global contact information used across all resumes.</p>
        {isLocked && <div className="flex items-center gap-2 mt-3 px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl w-fit"><Lock size={13} className="text-orange-500" /><span className="text-xs font-bold text-orange-600">Identity fields are locked for security.</span></div>}
      </div>
      <Button onClick={() => handleSync()} disabled={syncing} className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 transition-all font-black uppercase tracking-widest text-xs">
        {syncing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {syncing ? 'Syncing...' : 'Save Changes'}
      </Button>
    </div>

    {resumeData.isAdmin && (
      <div className="flex items-center justify-between gap-4 px-6 py-5 bg-stone-950 rounded-3xl border border-orange-500/30 shadow-2xl animate-in slide-in-from-top-4 duration-700">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-500"><Shield size={22} /></div>
          <div><p className="text-sm font-black text-white tracking-tight">Admin Privileges Active</p><p className="text-[11px] text-stone-400 font-bold uppercase">Toggle identity locks below</p></div>
        </div>
        <Button onClick={() => handleSync({ profileLocked: !resumeData.profileLocked })} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${resumeData.profileLocked ? 'bg-orange-500 text-white' : 'bg-white/5 text-stone-400'}`}>
          {resumeData.profileLocked ? 'Unlock Profile' : 'Lock Profile'}
        </Button>
      </div>
    )}

    {showSuccess && <div className="px-5 py-4 bg-green-50 border border-green-200 rounded-2xl animate-in fade-in slide-in-from-top-2 flex items-center gap-3"><CheckCircle size={20} className="text-green-500" /><span className="text-sm font-black text-green-800">Profile Synced Successfully!</span></div>}
    {localError && <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in slide-in-from-top-2 flex items-center gap-3"><AlertCircle size={20} className="text-red-500" /><span className="text-sm font-black text-red-800">{localError}</span></div>}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Input label="Full Name" value={resumeData.personalInfo.fullName} onChange={(e) => handleInfoChange('fullName', e.target.value)} disabled={isLocked} placeholder="John Doe" className={isLocked ? 'opacity-80 bg-stone-50' : 'bg-white border-orange-100'} />
        <Input label="Email Address" type="email" value={resumeData.personalInfo.email} onChange={(e) => handleInfoChange('email', e.target.value)} disabled={isLocked} placeholder="john@example.com" className={isLocked ? 'opacity-80 bg-stone-50' : 'bg-white border-orange-100'} />
        <Input label="Phone Number" value={resumeData.personalInfo.phone} onChange={(e) => handleInfoChange('phone', e.target.value)} placeholder="+91 98765 43210" className="bg-white border-orange-100" />
      </div>
      <div className="space-y-6">
        <Input label="LinkedIn URL" value={resumeData.personalInfo.linkedin} onChange={(e) => handleInfoChange('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" className="bg-white border-orange-100" />
        <AutocompleteInput label="Current Location" name="location" value={resumeData.personalInfo.location || ''} onChange={(e) => handleInfoChange('location', e.target.value)} suggestions={LOCATION_SUGGESTIONS} placeholder="Mumbai, India or New York, NY, USA" icon={MapPin} />
        <div className="space-y-1.5"><label className="text-sm font-bold text-stone-700 ml-1">Professional Summary</label><textarea value={resumeData.personalInfo.summary} onChange={(e) => handleInfoChange('summary', e.target.value)} className="w-full h-32 p-4 rounded-2xl border border-orange-100 bg-white focus:ring-2 focus:ring-orange-500/20 text-sm font-bold resize-none transition-all outline-none" placeholder="Tell us about your background..." /></div>
      </div>
    </div>
  </div>
);

const SettingsSection = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        { title: 'Push Notifications', desc: 'Real-time alerts about recruiter views.', icon: Bell, active: true },
        { title: 'Account Privacy', desc: 'Control public link visibility.', icon: Shield, active: false },
        { title: 'Dark Mode', desc: 'Toggle visual theme.', icon: Moon, active: false },
        { title: 'Email Summaries', desc: 'Weekly career progress reports.', icon: Mail, active: true }
      ].map((pref) => (
        <div key={pref.title} className="p-6 bg-stone-50 rounded-3xl flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
          <div className="flex gap-4">
            <div className="p-3 bg-white rounded-2xl border border-black/5 text-stone-400 group-hover:text-orange-500 transition-colors shrink-0"><pref.icon size={20} /></div>
            <div><h4 className="text-sm font-black text-black mb-1">{pref.title}</h4><p className="text-xs text-stone-400 font-medium">{pref.desc}</p></div>
          </div>
          <div className={`w-12 h-6 rounded-full relative cursor-pointer ${pref.active ? 'bg-orange-500' : 'bg-stone-200'}`}><div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${pref.active ? 'left-7' : 'left-1'}`} /></div>
        </div>
      ))}
    </div>
  </div>
);

// --- Main Page Component ---

const ProfilePage = () => {
  const { user } = useAuth();
  const { 
    resumeData, 
    updatePersonalInfo, 
    syncProfileWithBackend, 
    loading: contextLoading,
    addEntry,
    removeEntry,
    updateEntry,
    setResumeData,
    refreshProfile,
  } = useResume();

  useEffect(() => {
    if (user) {
      if (!resumeData.personalInfo.fullName && user.name) {
        updatePersonalInfo('fullName', user.name);
      }
      if (!resumeData.personalInfo.email && user.email) {
        updatePersonalInfo('email', user.email);
      }
    }
  }, [user, resumeData.personalInfo.fullName, resumeData.personalInfo.email]);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);
  const [localError, setLocalError] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) {
      setActiveTab('admin');
    }
  }, [user]);

  // Admin audit state
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);

  const fetchAdminUsers = async () => {
    setAdminUsersLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users`);
      setAdminUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/users/${userId}/restore`, {});
      fetchAdminUsers();
    } catch (err) {
      alert('Failed to restore account.');
    }
  };

  useEffect(() => {
    if (activeTab === 'admin' && resumeData.isAdmin) {
      fetchAdminUsers();
    }
  }, [activeTab]);
  
  // State for Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalSection, setModalSection] = useState(null);

  const hasRefreshedOnMount = useRef(false);
  useEffect(() => {
    if (!hasRefreshedOnMount.current) {
      hasRefreshedOnMount.current = true;
      refreshProfile();
    }
    const onFocus = () => refreshProfile();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);


  const isLocked = resumeData.profileLocked;
  const isLive = isLiveSession();

  const handleInfoChange = (field, value) => {
    if (isLocked && (field === 'fullName' || field === 'email')) return;
    updatePersonalInfo(field, value);
    setLocalError('');
  };

  const handleSync = async (overrideData = null) => {
    setSyncing(true);
    setLocalError('');
    try {
      await syncProfileWithBackend(overrideData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3500);
    } catch (err) {
      setLocalError(err.message || 'Failed to sync with database.');
    } finally {
      setSyncing(false);
    }
  };

  const handleRemove = async (section, id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      removeEntry(section, id);
      await handleSync();
    }
  };

  const openAddModal = (section) => {
    setModalSection(section);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setModalSection(null);
  };

  const handleAddSubmit = async () => {
    addEntry(modalSection);
    await handleSync();
    closeAddModal();
  };

  return (
    <div className="flex bg-[#fafafa] min-h-screen overflow-x-hidden text-slate-900">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-20 min-h-screen pt-16 md:pt-0 pb-24 md:pb-12 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12">
          {/* ── Profile Hero Banner ─────────────────────────────────────────── */}
          <header className="flex flex-col md:flex-row items-center gap-8 mb-12 bg-white p-8 md:p-12 rounded-[40px] border border-black/[0.06] shadow-[0_12px_40px_-15px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-orange-50/60 to-transparent pointer-events-none" />
            
            <div className="relative group shrink-0">
              <div className="h-28 w-28 rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-black/10 overflow-hidden relative">
                {resumeData.personalInfo.fullName?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 p-2.5 bg-white rounded-2xl shadow-lg border border-black/5 text-orange-500">
                <Sparkles size={16} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                  {resumeData.personalInfo.fullName || 'Complete Your Profile'}
                </h1>
                <span className="glass-pill text-[10px]">
                  {resumeData.isAdmin ? 'Admin Mode' : 'Verified Candidate'}
                </span>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-5 text-slate-500 font-bold text-xs pt-1">
                <div className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {resumeData.personalInfo.email}</div>
                <div className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {resumeData.personalInfo.phone || 'Phone not set'}</div>
                <div className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {resumeData.personalInfo.location || 'Location not set'}</div>
              </div>
            </div>
          </header>

          {/* ── Navigation Tabs Dock ────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-black/[0.08] rounded-2xl w-fit mb-12 shadow-xs">
            {((resumeData.isAdmin || user?.isAdmin) ? ADMIN_TABS : TABS).map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-md shadow-black/10' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <tab.icon size={15} />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {contextLoading ? (
            <div className="h-64 flex flex-col items-center justify-center"><Loader2 size={48} className="text-orange-500 animate-spin mb-4" /><p className="text-stone-400 font-black uppercase tracking-widest text-xs">Loading your profile...</p></div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <ProfileSection 
                  resumeData={resumeData}
                  isLive={isLive}
                  isLocked={isLocked}
                  syncing={syncing}
                  handleSync={handleSync}
                  handleInfoChange={handleInfoChange}
                  showSuccess={showSuccess}
                  localError={localError}
                />
              )}
              {activeTab === 'resume' && (
                <ResumeDataSection 
                  resumeData={resumeData}
                  syncing={syncing}
                  handleSync={handleSync}
                  openAddModal={openAddModal}
                  handleRemove={handleRemove}
                  updateEntry={updateEntry}
                  setResumeData={setResumeData}
                />
              )}
              {activeTab === 'settings' && <SettingsSection />}
              {activeTab === 'billing' && <div className="h-64 flex flex-col items-center justify-center bg-stone-50 rounded-[48px] border-2 border-dashed border-stone-200 animate-pulse"><CreditCard size={48} className="text-stone-200 mb-4" /><p className="text-stone-400 font-black uppercase text-xs">Coming Soon</p></div>}
              {activeTab === 'admin' && (resumeData.isAdmin || user?.isAdmin) && (
                <AdminAuditSection
                  users={adminUsers}
                  loading={adminUsersLoading}
                  onRestore={handleRestoreUser}
                />
              )}
            </>
          )}
        </div>
      </main>
      <AddDataModal 
        show={showAddModal}
        section={modalSection}
        onClose={closeAddModal}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
};

export default ProfilePage;