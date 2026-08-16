import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Layout, 
  Search, 
  User, 
  LogOut, 
  Layout as LayoutDashboard, 
  ChevronRight, 
  Briefcase, 
  FileCheck2, 
  ShieldCheck,
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const menuItems = user?.isAdmin
    ? [
        { name: 'User Audit & Health', icon: ShieldCheck, path: '/profile' },
        { name: 'Job & Talent Hub', icon: Briefcase, path: '/jobs' },
      ]
    : [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Studio Builder', icon: PlusCircle, path: '/builder' },
        { name: 'Templates Catalog', icon: Layout, path: '/templates' },
        { name: 'ATS Scanner', icon: Search, path: '/ats-check' },
        { name: 'Job Board & Tracker', icon: Briefcase, path: '/jobs' },
        { name: 'AI Skill Matrix', icon: FileCheck2, path: '/test' },
        { name: 'Account Profile', icon: User, path: '/profile' },
      ];

  const quickMobileItems = user?.isAdmin
    ? menuItems
    : [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Builder', icon: PlusCircle, path: '/builder' },
        { name: 'Jobs', icon: Briefcase, path: '/jobs' },
        { name: 'Profile', icon: User, path: '/profile' },
      ];

  return (
    <>
      {/* ── Mobile Top Header (< md) ─────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-2xl border-b border-black/[0.06] px-4 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/25">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-base font-black tracking-tight text-slate-900 leading-none">
            GetResume<span className="text-orange-500">.ai</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 font-black text-xs border border-black/5">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer Overlay (< md) ─────────────────────────────── */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-4/5 max-w-sm h-full bg-white p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-white font-black text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 truncate max-w-[160px]">{user?.name || 'Pro Candidate'}</h4>
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{user?.isAdmin ? 'Admin Authority' : 'Pro Member'}</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-900">
                  <X size={20} />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-black transition-all ${
                        isActive ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-rose-50 text-rose-600 font-black text-xs hover:bg-rose-100 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Navigation Bar (< md) ──────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-2xl border-t border-black/[0.06] px-4 flex items-center justify-around shadow-lg">
        {quickMobileItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-orange-600 font-black' : 'text-slate-400 font-bold'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-orange-600 scale-110 transition-transform' : ''} />
              <span className="text-[10px] tracking-tight">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* ── Desktop Sidebar (>= md) ──────────────────────────────────── */}
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`hidden md:flex fixed left-0 top-0 z-[60] h-screen bg-white/85 backdrop-blur-2xl border-r border-black/[0.06] flex-col transition-all duration-300 ease-in-out select-none shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${
          isHovered ? 'w-72 shadow-2xl shadow-orange-950/5' : 'w-20'
        }`}
      >
        {/* App Logo / Brand */}
        <div className={`h-20 flex items-center transition-all duration-300 ${isHovered ? 'px-6' : 'px-5'} overflow-hidden border-b border-black/[0.03]`}>
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300">
               <Sparkles size={20} className="text-white" />
            </div>
            <div className={`flex flex-col min-w-0 transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                GetResume<span className="text-orange-500">.ai</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
                Studio Suite
              </span>
            </div>
          </Link>
        </div>

        {/* User Info & Avatar */}
        <div className={`py-4 flex items-center gap-3 transition-all duration-300 ${isHovered ? 'px-6' : 'px-5'} border-b border-black/[0.02]`}>
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-800 font-black border border-black/5 shadow-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className={`flex flex-col min-w-0 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden'
          }`}>
             <span className="text-xs font-black text-slate-900 truncate">{user?.name || 'Pro Candidate'}</span>
             <span className="text-[9px] uppercase tracking-wider font-extrabold text-orange-600">
               {user?.isAdmin ? '🛡️ Admin Authority' : '✦ Pro Careerist'}
             </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1.5 overflow-hidden">
          <div className={`px-4 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-opacity duration-300 ${
             isHovered ? 'opacity-100' : 'opacity-0'
          }`}>Navigation</div>
          
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`group relative flex items-center rounded-2xl p-3 transition-all duration-200 ${
                  isActive 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 font-black' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-bold'
                }`}
              >
                <div className="shrink-0 flex items-center justify-center w-8">
                  <Icon size={19} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 transition-colors'} />
                </div>
                <span className={`ml-3.5 text-xs whitespace-nowrap transition-all duration-300 tracking-tight ${
                  isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
                }`}>
                  {item.name}
                </span>
                {isActive && isHovered && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-black/[0.04]">
          <button 
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center rounded-2xl p-3 text-xs font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all overflow-hidden cursor-pointer active:scale-[0.98]"
          >
            <div className="shrink-0 flex items-center justify-center w-8">
              <LogOut size={18} />
            </div>
            <span className={`ml-3.5 transition-all duration-300 whitespace-nowrap ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
            }`}>
              Sign Out
            </span>
          </button>
        </div>

        {/* Expand Indicator (Desktop only) */}
        {!isHovered && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-7 w-7 bg-white border border-black/10 rounded-full flex items-center justify-center text-slate-400 shadow-lg pointer-events-none">
             <ChevronRight size={14} />
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;


