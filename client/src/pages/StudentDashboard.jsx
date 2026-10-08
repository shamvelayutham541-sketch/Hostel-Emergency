import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  Flame, 
  Zap, 
  Droplet, 
  Key, 
  HelpCircle, 
  Clock, 
  MapPin, 
  Phone, 
  FileText, 
  Heart, 
  CheckCircle2, 
  AlertTriangle,
  Upload,
  Send,
  EyeOff,
  Wrench,
  HeartPulse
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useIncidentStore } from '../store/useIncidentStore';
import { api } from '../services/api';
import SOSButton from '../components/SOSButton';
import NeedHelpModal from '../components/NeedHelpModal';
import FirstAidModal from '../components/FirstAidModal';
import FireEvacuationModal from '../components/FireEvacuationModal';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { incidents, fetchIncidents } = useIncidentStore();

  const [activeTab, setActiveTab] = useState('sos'); // 'sos', 'report', 'history', 'maintenance', 'profile'
  const [isNeedHelpOpen, setIsNeedHelpOpen] = useState(false);
  const [isFirstAidOpen, setIsFirstAidOpen] = useState(false);
  const [isEvacOpen, setIsEvacOpen] = useState(false);

  // Detailed emergency report form
  const [detailedType, setDetailedType] = useState('medical');
  const [detailedPriority, setDetailedPriority] = useState('critical');
  const [detailedDesc, setDetailedDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSilent, setIsSilent] = useState(false);
  const [submittingDetailed, setSubmittingDetailed] = useState(false);

  // Maintenance Ticket Form
  const [maintCategory, setMaintCategory] = useState('Plumbing');
  const [maintTitle, setMaintTitle] = useState('');
  const [maintDesc, setMaintDesc] = useState('');
  const [myTickets, setMyTickets] = useState([]);
  const [submittingMaint, setSubmittingMaint] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchIncidents();
    loadProfileAndTickets();
  }, []);

  const loadProfileAndTickets = async () => {
    try {
      const prof = await api.users.getProfile();
      if (prof.success) setProfileData(prof.profile);

      const tix = await api.maintenance.list();
      if (tix.success) setMyTickets(tix.tickets);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDetailedSubmit = async (e) => {
    e.preventDefault();
    setSubmittingDetailed(true);
    try {
      const res = await api.incidents.create({
        type: detailedType,
        priority: detailedPriority,
        description: detailedDesc,
        isAnonymous,
        isSilent
      });

      if (res.success) {
        alert('Detailed emergency report logged and dispatched to responders!');
        setDetailedDesc('');
        fetchIncidents();
        navigate('/student/tracking');
      }
    } catch (err) {
      alert('Error creating report: ' + err.message);
    } finally {
      setSubmittingDetailed(false);
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    if (!maintTitle || !maintDesc) return;
    setSubmittingMaint(true);
    try {
      const res = await api.maintenance.create({
        category: maintCategory,
        title: maintTitle,
        description: maintDesc
      });
      if (res.success) {
        alert('Maintenance ticket registered!');
        setMaintTitle('');
        setMaintDesc('');
        loadProfileAndTickets();
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSubmittingMaint(false);
    }
  };

  const myIncidents = incidents.filter(i => i.reporterId === user?.id || (profileData && i.studentName === profileData.name));
  const activeIncident = myIncidents.find(i => ['pending', 'acknowledged', 'en_route', 'in_progress'].includes(i.status));

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Active Incident Warning Alert Bar */}
      {activeIncident && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">Active Incident in Progress: #{activeIncident._id}</div>
              <div className="text-xs text-red-100">
                Type: {activeIncident.type.toUpperCase()} • Status: {activeIncident.status.toUpperCase().replace('_', ' ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/student/tracking')}
            className="px-4 py-2 bg-white text-red-700 font-bold text-xs rounded-xl shadow hover:bg-red-50 transition"
          >
            Track Responder Arrival →
          </button>
        </div>
      )}

      {/* Top Banner & Quick Trigger Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">
            Student Emergency Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'Resident'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>
              {profileData?.blockName || 'Block A - Phoenix'} • Room {profileData?.roomNumber || '204'} (Floor {profileData?.floor || 2})
            </span>
          </p>
        </div>

        {/* 1-Tap Quick Action Modals */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsNeedHelpOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-glow-red transition flex items-center space-x-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>I NEED HELP NOW</span>
          </button>

          <button
            onClick={() => setIsFirstAidOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center space-x-1.5"
          >
            <HeartPulse className="w-4 h-4 text-emerald-500" />
            <span>First-Aid</span>
          </button>

          <button
            onClick={() => setIsEvacOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold text-xs transition flex items-center space-x-1.5"
          >
            <Flame className="w-4 h-4" />
            <span>Fire Evac & Check-in</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('sos')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'sos' ? 'bg-red-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          SOS Button
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'report' ? 'bg-red-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Detailed Incident Report
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'history' ? 'bg-red-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          My Incidents History ({myIncidents.length})
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'maintenance' ? 'bg-red-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Room Maintenance Tickets
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'profile' ? 'bg-red-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Medical Card & Contacts
        </button>
      </div>

      {/* TAB CONTENT 1: SOS BUTTON */}
      {activeTab === 'sos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 glass-card p-6 sm:p-10 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl">
            <SOSButton onEmergencyTriggered={() => navigate('/student/tracking')} />
          </div>

          <div className="lg:col-span-4 space-y-4">
            
            <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Your Active Location Tag</span>
              </h3>
              <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <p><strong>Hostel Block:</strong> {profileData?.blockName || 'Block A - Phoenix'}</p>
                <p><strong>Room Number:</strong> {profileData?.roomNumber || '204'}</p>
                <p><strong>Floor:</strong> Floor {profileData?.floor || 2}</p>
                <p><strong>Registered Phone:</strong> {profileData?.phone || '+91 98111 00001'}</p>
              </div>
              <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-200 dark:border-slate-800">
                Every SOS automatically embeds this verified room tag directly into responders' consoles.
              </p>
            </div>

            <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Safety Emergency Contacts</span>
              </h3>
              <div className="space-y-2 text-xs">
                <a href="tel:108" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center hover:bg-slate-100 transition">
                  <span className="font-bold">Campus Ambulance</span>
                  <span className="font-mono text-emerald-500 font-bold">108</span>
                </a>
                <a href="tel:+919876500002" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center hover:bg-slate-100 transition">
                  <span className="font-bold">Hostel Chief Warden</span>
                  <span className="font-mono text-indigo-500 font-bold">+91 98765 00002</span>
                </a>
                <a href="tel:+919876500003" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center hover:bg-slate-100 transition">
                  <span className="font-bold">Security Control Room</span>
                  <span className="font-mono text-amber-500 font-bold">+91 98765 00003</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT 2: DETAILED INCIDENT REPORT */}
      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Submit Detailed Emergency Incident</h2>
            <p className="text-xs text-slate-500">Provide specific hazard details or submit an anonymous safety observation</p>
          </div>

          <form onSubmit={handleDetailedSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-1">Emergency Category</label>
                <select
                  value={detailedType}
                  onChange={(e) => setDetailedType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="medical">Medical Emergency</option>
                  <option value="fire">Fire Hazard / Smoke</option>
                  <option value="security">Security / Threat / Intruder</option>
                  <option value="electrical">Electrical Shock / Sparks</option>
                  <option value="lockout">Room Lockout</option>
                  <option value="plumbing">Plumbing Flooding</option>
                  <option value="other">Other Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-1">Priority Level</label>
                <select
                  value={detailedPriority}
                  onChange={(e) => setDetailedPriority(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="critical">Critical (Immediate Dispatch)</option>
                  <option value="high">High (Under 5 mins)</option>
                  <option value="normal">Normal (Routine)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-1">Detailed Description of Hazard</label>
              <textarea
                required
                rows={4}
                placeholder="Describe current location, victims, nature of danger or observed threat..."
                value={detailedDesc}
                onChange={(e) => setDetailedDesc(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Privacy & Discreet Toggles */}
            <div className="flex flex-wrap gap-4 text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-red-600 focus:ring-0"
                />
                <span className="text-slate-700 dark:text-slate-300">Submit Anonymously (Hide Name & Phone)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSilent}
                  onChange={(e) => setIsSilent(e.target.checked)}
                  className="rounded text-red-600 focus:ring-0"
                />
                <span className="text-slate-700 dark:text-slate-300">Silent Report (No Audible Alarms)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submittingDetailed}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{submittingDetailed ? 'Submitting & Routing...' : 'Send Emergency Incident Now'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 3: MY INCIDENTS HISTORY */}
      {activeTab === 'history' && (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm">
            My Incident History & Resolution Audit
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {myIncidents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                You have no recorded emergency incidents. Stay safe!
              </div>
            ) : (
              myIncidents.map((inc) => (
                <div key={inc._id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                        inc.priority === 'critical' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {inc.priority}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white uppercase">{inc.type}</span>
                      <span className="text-slate-400 font-mono text-[11px]">#{inc._id}</span>
                    </div>
                    <p className="text-slate-500">{inc.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Reported: {new Date(inc.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[11px] ${
                      inc.status === 'resolved' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : (inc.status === 'false_alarm' ? 'bg-slate-200 text-slate-600' : 'bg-red-500/10 text-red-500 animate-pulse')
                    }`}>
                      {inc.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => navigate('/student/tracking')}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition"
                    >
                      View Live Tracker
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: MAINTENANCE TICKETS */}
      {activeTab === 'maintenance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-blue-500" />
              <span>Raise Non-Emergency Maintenance Ticket</span>
            </h3>

            <form onSubmit={handleMaintenanceSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Issue Category</label>
                <select
                  value={maintCategory}
                  onChange={(e) => setMaintCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Plumbing">Plumbing / Water Tap</option>
                  <option value="Electrical">Electrical / Fan / Light Switch</option>
                  <option value="WiFi / LAN">Campus Wi-Fi / LAN Cable</option>
                  <option value="Carpentry">Carpentry / Bed / Door Lock</option>
                  <option value="AC / Heating">AC / Air Cooling</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Ticket Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bathroom tap leaking"
                  value={maintTitle}
                  onChange={(e) => setMaintTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Details of the room issue..."
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingMaint}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                {submittingMaint ? 'Submitting...' : 'Register Maintenance Ticket'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm">
              My Active & Past Maintenance Tickets
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {myTickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No maintenance tickets registered for this room.</div>
              ) : (
                myTickets.map((t) => (
                  <div key={t._id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{t.title}</div>
                      <div className="text-slate-500">{t.category} • {t.description}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                      t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT 5: PROFILE & MEDICAL CARD */}
      {activeTab === 'profile' && profileData && (
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black font-heading">
              {profileData.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profileData.name}</h2>
              <p className="text-xs text-slate-500 font-mono">Roll ID: {profileData.studentId} • Room {profileData.roomNumber}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
            <h4 className="font-bold text-rose-500 uppercase font-mono flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>Medical Safety Information</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div><strong>Blood Group:</strong> {profileData.medicalInfo?.bloodGroup || 'O+'}</div>
              <div><strong>Allergies:</strong> {profileData.medicalInfo?.allergies?.join(', ') || 'None recorded'}</div>
              <div className="col-span-2"><strong>Medications:</strong> {profileData.medicalInfo?.medication?.join(', ') || 'None recorded'}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-400 uppercase font-mono">Emergency Contacts on File</h4>
            {(profileData.emergencyContacts || []).map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                  <span className="text-slate-400 ml-2">({c.relation})</span>
                </div>
                <a href={`tel:${c.phone}`} className="font-mono text-emerald-500 font-bold">{c.phone}</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <NeedHelpModal isOpen={isNeedHelpOpen} onClose={() => setIsNeedHelpOpen(false)} onSuccess={() => navigate('/student/tracking')} />
      <FirstAidModal isOpen={isFirstAidOpen} onClose={() => setIsFirstAidOpen(false)} />
      <FireEvacuationModal isOpen={isEvacOpen} onClose={() => setIsEvacOpen(false)} />

    </div>
  );
}
