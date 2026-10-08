import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  Flame, 
  Zap, 
  Clock, 
  PhoneCall, 
  HeartHandshake, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Sparkles,
  HelpCircle,
  Siren,
  Hospital,
  Wrench,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useIncidentStore } from '../store/useIncidentStore';
import SOSButton from '../components/SOSButton';
import NeedHelpModal from '../components/NeedHelpModal';
import FirstAidModal from '../components/FirstAidModal';

export default function Landing() {
  const navigate = useNavigate();
  const { user, isAuthenticated, demoLogin } = useAuthStore();
  const { incidents } = useIncidentStore();

  const [isNeedHelpOpen, setIsNeedHelpOpen] = useState(false);
  const [isFirstAidOpen, setIsFirstAidOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const activeCount = incidents.filter(i => ['pending', 'acknowledged', 'en_route', 'in_progress'].includes(i.status)).length;

  const emergencyNumbers = [
    { name: 'Hostel Control Room', number: '+91 98765 00001', role: '24/7 Desk', icon: ShieldAlert },
    { name: 'Campus Ambulance', number: '108', role: 'Medical Emergency', icon: Hospital },
    { name: 'Fire & Rescue', number: '101', role: 'Fire Brigade', icon: Flame },
    { name: 'Police Helpline', number: '100', role: 'City Police', icon: Siren },
    { name: 'Women Safety Helpline', number: '1091', role: 'Confidential Support', icon: HeartHandshake },
    { name: 'Campus Maintenance Desk', number: '+91 98765 00005', role: 'Repairs & Electric', icon: Wrench },
  ];

  const faqs = [
    {
      q: 'How fast do wardens and responders receive my SOS?',
      a: 'Instantly. The moment you hold the SOS button or tap "I Need Help", Socket.IO broadcasts a high-priority sound alarm, browser push, and dispatch record to the control room, security supervisor, and floor warden within 300 milliseconds.'
    },
    {
      q: 'What happens if no one acknowledges within the SLA window?',
      a: 'The built-in automated watchdog monitors every incident. If an alert remains unacknowledged past its threshold (2 minutes for Critical, 5 minutes for High), the system automatically escalates with visual flash alarms and notifies the Chief Warden and campus authorities.'
    },
    {
      q: 'Can I raise an alert silently if I feel threatened?',
      a: 'Yes. Toggle the "Discreet / Silent SOS" button. This triggers an immediate, silent alert routed directly to security officers with your registered room number and floor plan without sounding audible sirens on your device.'
    },
    {
      q: 'Does it work offline or during poor internet connectivity?',
      a: 'Yes. Our PWA client queues the SOS locally and provides a 1-tap pre-filled emergency SMS fallback link directly to the hostel control room numbers.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-surface-dark transition-colors">
      
      {/* 24/7 Top Emergency Numbers Strip */}
      <section className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-red-400 font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>24/7 CAMPUS EMERGENCY HOTLINES:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <span>Ambulance: <a href="tel:108" className="text-emerald-400 font-bold hover:underline">108</a></span>
            <span>Fire: <a href="tel:101" className="text-orange-400 font-bold hover:underline">101</a></span>
            <span>Police: <a href="tel:100" className="text-blue-400 font-bold hover:underline">100</a></span>
            <span>Women Helpline: <a href="tel:1091" className="text-rose-400 font-bold hover:underline">1091</a></span>
            <span>Hostel Warden Desk: <a href="tel:+919876500001" className="text-indigo-400 font-bold hover:underline">+91 98765 00001</a></span>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28">
        
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-5">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>Ultra-Rapid Campus Response System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              One-Tap SOS Help When <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-indigo-600">
                Every Second Counts.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Hostel students trigger medical, fire, or security emergencies in 1 tap. Wardens, medical officers, and security supervisors respond, coordinate and track resolution in real time.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setIsNeedHelpOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-heading font-extrabold text-sm shadow-glow-red hover:scale-102 transition transform active:scale-98 flex items-center space-x-2"
              >
                <ShieldAlert className="w-5 h-5 text-white" />
                <span>TAP "I NEED HELP" NOW</span>
              </button>

              <button
                onClick={() => setIsFirstAidOpen(true)}
                className="px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition flex items-center space-x-2"
              >
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>First-Aid Guide</span>
              </button>

              <Link
                to="/student"
                className="px-5 py-3.5 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm border border-indigo-500/20 transition flex items-center space-x-1"
              >
                <span>Student Hub</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

          {/* Interactive Live SOS Demo Showcase Card */}
          <div className="mt-14 max-w-2xl mx-auto glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 relative">
            <div className="text-center mb-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Interactive Live SOS Button Demo
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Press and hold 2 seconds to experience real-time alert activation:
              </p>
            </div>

            <SOSButton onEmergencyTriggered={(inc) => navigate('/student/tracking')} />
          </div>

        </div>
      </section>

      {/* Live Response Performance Metric Strip */}
      <section className="border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white">
                &lt; 2.4 <span className="text-base font-bold text-indigo-500">min</span>
              </div>
              <div className="text-xs text-slate-500 uppercase font-mono font-bold">Average Response Time</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-heading text-emerald-600 dark:text-emerald-400">
                98.4%
              </div>
              <div className="text-xs text-slate-500 uppercase font-mono font-bold">SLA Compliance Rate</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-heading text-red-600 dark:text-red-400">
                300 <span className="text-base font-bold">ms</span>
              </div>
              <div className="text-xs text-slate-500 uppercase font-mono font-bold">WebSocket Dispatch Speed</div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white">
                24 / 7
              </div>
              <div className="text-xs text-slate-500 uppercase font-mono font-bold">Control Room Monitoring</div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works 3-Step Interactive Timeline */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest">Fail-Safe Response Workflow</span>
          <h2 className="text-3xl font-black font-heading text-slate-900 dark:text-white">How HostelSOS Protects You</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">From the moment distress is signaled to verified safety resolution</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold font-mono">
              01
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">1-Tap SOS Activation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Press and hold for 2s or tap one category. Your name, verified room number, block, and GPS coordinates dispatch instantly without typing.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold font-mono">
              02
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Auto-Routing & Escalation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Medical alerts page doctors, fire alerts ping security. If not acknowledged within 2 minutes, auto-watchdog escalates to the Chief Warden.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold font-mono">
              03
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Tracking & Resolution</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Track arrival like a delivery app. Exchange quick-reply chats with assigned responders. Rate resolution and record tamper-proof audit trails.
            </p>
          </div>

        </div>
      </section>

      {/* Emergency Helplines Directory Cards */}
      <section className="py-16 bg-slate-100/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white">Emergency Hotline Directory</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Direct 1-tap call links to campus security, medical ambulances and public authorities</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyNumbers.map((num, idx) => {
              const Icon = num.icon;
              return (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{num.name}</h4>
                      <p className="text-xs text-slate-400">{num.role}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${num.number.replace(/\s+/g, '')}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-xs flex items-center space-x-1 shadow transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{num.number}</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black font-heading text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Everything you need to know about safety protocols and SLAs</p>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between"
              >
                <span>{f.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-700">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-10 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span className="font-heading font-bold text-slate-900 dark:text-white text-sm">HostelSOS Platform</span>
            <span>— Campus Emergency & Rapid Response Management</span>
          </div>
          <div className="flex space-x-6">
            <Link to="/hostel-info" className="hover:text-red-500 transition">Hostel Guidelines</Link>
            <Link to="/login" className="hover:text-red-500 transition">Control Room Login</Link>
            <a href="#privacy" className="hover:text-red-500 transition">Privacy & Medical Card Policy</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NeedHelpModal isOpen={isNeedHelpOpen} onClose={() => setIsNeedHelpOpen(false)} />
      <FirstAidModal isOpen={isFirstAidOpen} onClose={() => setIsFirstAidOpen(false)} />

    </div>
  );
}
