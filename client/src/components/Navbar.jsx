import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Globe, 
  Monitor, 
  LogOut, 
  User, 
  Flame, 
  LifeBuoy, 
  Users, 
  Activity,
  Menu,
  X,
  PhoneCall
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useIncidentStore } from '../store/useIncidentStore';
import { translations } from '../utils/translations';

export default function Navbar() {
  const { user, isAuthenticated, logout, darkMode, toggleDarkMode, language, setLanguage, demoLogin } = useAuthStore();
  const { soundEnabled, toggleSound, controlRoomMode, toggleControlRoomMode, incidents } = useIncidentStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const t = translations[language] || translations.en;

  const activeIncidentsCount = incidents.filter(i => 
    ['pending', 'acknowledged', 'en_route', 'in_progress'].includes(i.status)
  ).length;

  const handleRoleSwitch = async (role) => {
    setShowDemoDropdown(false);
    await demoLogin(role);
    if (role === 'student') navigate('/student');
    else if (role === 'admin') navigate('/admin');
    else navigate('/staff');
  };

  const roleColors = {
    student: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    warden: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    security: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    medical: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    maintenance: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    admin: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Live Pulse */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-glow-red group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-heading font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Hostel<span className="text-red-500">SOS</span>
                </span>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase font-semibold">
                Rapid Campus Response
              </span>
            </div>
          </Link>

          {/* Active Live Count Pill */}
          {activeIncidentsCount > 0 && (
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>{activeIncidentsCount} ACTIVE</span>
            </div>
          )}
        </div>

        {/* Center Navigation Links based on role */}
        <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-lg transition ${location.pathname === '/' ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Home
          </Link>
          <Link 
            to="/hostel-info" 
            className={`px-3 py-2 rounded-lg transition ${location.pathname === '/hostel-info' ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Hostel Info & Rules
          </Link>

          {isAuthenticated && user?.role === 'student' && (
            <>
              <Link 
                to="/student" 
                className={`px-3 py-2 rounded-lg transition ${location.pathname === '/student' ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Student Hub
              </Link>
              <Link 
                to="/student/tracking" 
                className={`px-3 py-2 rounded-lg transition ${location.pathname === '/student/tracking' ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Live Timeline
              </Link>
            </>
          )}

          {isAuthenticated && user?.role !== 'student' && (
            <>
              <Link 
                to="/staff" 
                className={`px-3 py-2 rounded-lg transition ${location.pathname === '/staff' ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Staff Console
              </Link>
              <Link 
                to="/staff/analytics" 
                className={`px-3 py-2 rounded-lg transition ${location.pathname === '/staff/analytics' ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                Analytics & SLA
              </Link>
            </>
          )}

          {isAuthenticated && (user?.role === 'admin' || user?.role === 'warden') && (
            <Link 
              to="/admin" 
              className={`px-3 py-2 rounded-lg transition ${location.pathname === '/admin' ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              Admin & Evac
            </Link>
          )}
        </nav>

        {/* Right Tools: Language, Sound, Dark mode, Demo switch, Profile */}
        <div className="flex items-center space-x-2">
          
          {/* Language Switcher */}
          <div className="relative group">
            <button 
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center space-x-1"
              title="Change Language"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs uppercase font-mono font-bold">{language}</span>
            </button>
            <div className="absolute right-0 mt-1 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 hidden group-hover:block z-50">
              <button onClick={() => setLanguage('en')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">English (EN)</button>
              <button onClick={() => setLanguage('hi')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">हिन्दी (HI)</button>
              <button onClick={() => setLanguage('ta')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">தமிழ் (TA)</button>
            </div>
          </div>

          {/* Sound Alert Toggle */}
          <button 
            onClick={toggleSound}
            className={`p-2 rounded-xl transition ${soundEnabled ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title={soundEnabled ? 'Sound alerts ON' : 'Sound alerts MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Control Room Mode Toggle (for staff/admin) */}
          {isAuthenticated && user?.role !== 'student' && (
            <button
              onClick={toggleControlRoomMode}
              className={`p-2 rounded-xl transition hidden lg:flex ${controlRoomMode ? 'text-red-500 bg-red-500/10' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title="Toggle Control Room Wall Display Mode"
            >
              <Monitor className="w-4 h-4" />
            </button>
          )}

          {/* Fast Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoDropdown(!showDemoDropdown)}
              className="px-2.5 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold font-heading flex items-center space-x-1.5 border border-brand-500/20 transition"
            >
              <span>Demo Roles</span>
              <span className="text-[10px]">▼</span>
            </button>
            {showDemoDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-[10px] uppercase font-mono font-bold text-slate-400">Switch Role:</div>
                <button onClick={() => handleRoleSwitch('student')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between">
                  <span>Student (Aarav)</span>
                  <span className="text-[10px] text-indigo-400">Student</span>
                </button>
                <button onClick={() => handleRoleSwitch('warden')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between">
                  <span>Warden Mukherjee</span>
                  <span className="text-[10px] text-purple-400">Warden</span>
                </button>
                <button onClick={() => handleRoleSwitch('security')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between">
                  <span>Officer Rajesh</span>
                  <span className="text-[10px] text-amber-400">Security</span>
                </button>
                <button onClick={() => handleRoleSwitch('medical')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between">
                  <span>Dr. Priya Sharma</span>
                  <span className="text-[10px] text-emerald-400">Medical</span>
                </button>
                <button onClick={() => handleRoleSwitch('maintenance')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between">
                  <span>Ramesh Patel</span>
                  <span className="text-[10px] text-blue-400">Maint.</span>
                </button>
                <button onClick={() => handleRoleSwitch('admin')} className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between">
                  <span>Dean Verma</span>
                  <span className="text-[10px] text-rose-400">Admin</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile or Login Button */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 pl-2">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase border ${roleColors[user?.role] || 'bg-slate-100 text-slate-800'}`}>
                {user?.role}
              </span>
              <button 
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md hover:shadow-glow-red transition"
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl md:hidden text-slate-600 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">Home</Link>
          <Link to="/hostel-info" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">Hostel Info & Rules</Link>
          {isAuthenticated && user?.role === 'student' && (
            <>
              <Link to="/student" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-red-500">Student Emergency Hub</Link>
              <Link to="/student/tracking" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">Live Incident Tracker</Link>
            </>
          )}
          {isAuthenticated && user?.role !== 'student' && (
            <>
              <Link to="/staff" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-red-500">Staff Control Center</Link>
              <Link to="/staff/analytics" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold">Incident Analytics</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
