import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShieldAlert, 
  Activity, 
  Flame, 
  Users, 
  BarChart3, 
  HeartPulse, 
  LogOut, 
  Moon, 
  Sun,
  X 
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useIncidentStore } from '../store/useIncidentStore';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, demoLogin, toggleDarkMode } = useAuthStore();
  const { toggleSound } = useIncidentStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const commands = [
    { id: 'sos', title: 'Raise Emergency SOS', icon: ShieldAlert, action: () => { navigate('/student'); setIsOpen(false); } },
    { id: 'staff', title: 'Open Staff Control Console', icon: Users, action: () => { navigate('/staff'); setIsOpen(false); } },
    { id: 'analytics', title: 'View Analytics & SLA Reports', icon: BarChart3, action: () => { navigate('/staff/analytics'); setIsOpen(false); } },
    { id: 'firstaid', title: 'Open First-Aid Guide', icon: HeartPulse, action: () => { navigate('/student'); setIsOpen(false); } },
    { id: 'darkmode', title: 'Toggle Theme (Dark / Light)', icon: Moon, action: () => { toggleDarkMode(); setIsOpen(false); } },
    { id: 'sound', title: 'Toggle Siren Sound Alerts', icon: Activity, action: () => { toggleSound(); setIsOpen(false); } },
    { id: 'role-warden', title: 'Switch Demo Role: Warden', icon: Users, action: () => { demoLogin('warden'); navigate('/staff'); setIsOpen(false); } },
    { id: 'role-medical', title: 'Switch Demo Role: Medical Officer', icon: Activity, action: () => { demoLogin('medical'); navigate('/staff'); setIsOpen(false); } },
    { id: 'role-security', title: 'Switch Demo Role: Security Supervisor', icon: ShieldAlert, action: () => { demoLogin('security'); navigate('/staff'); setIsOpen(false); } },
    { id: 'role-admin', title: 'Switch Demo Role: Campus Admin', icon: BarChart3, action: () => { demoLogin('admin'); navigate('/admin'); setIsOpen(false); } },
  ];

  const filtered = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search (Ctrl+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No matching commands found</div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-3 text-slate-700 dark:text-slate-200 transition"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="flex-1">{cmd.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">↵ Jump</span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>Navigate with mouse or arrow keys</span>
          <span>ESC to close</span>
        </div>

      </div>
    </div>
  );
}
