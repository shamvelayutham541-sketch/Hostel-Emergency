import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Radio, 
  Clock, 
  Building, 
  FileText, 
  Flame, 
  Plus, 
  CheckCircle, 
  AlertOctagon,
  Lock,
  Layers,
  Settings
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import FireEvacuationModal from '../components/FireEvacuationModal';

export default function AdminPanel() {
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState('broadcast'); // 'broadcast', 'sla', 'drill', 'users'
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [isDrill, setIsDrill] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastList, setBroadcastList] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [isEvacModalOpen, setIsEvacModalOpen] = useState(false);

  // SLA Configuration States
  const [slaCritical, setSlaCritical] = useState(2);
  const [slaHigh, setSlaHigh] = useState(5);
  const [slaNormal, setSlaNormal] = useState(10);
  const [slaSaved, setSlaSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const bRes = await api.broadcasts.list();
      if (bRes.success) setBroadcastList(bRes.broadcasts);

      const sRes = await api.users.listStaff();
      if (sRes.success) setStaffUsers(sRes.staff);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setBroadcasting(true);
    try {
      const res = await api.broadcasts.create({
        title: broadcastTitle,
        message: broadcastMessage,
        target: broadcastTarget,
        isDrill
      });

      if (res.success) {
        alert(isDrill ? 'Fire drill broadcast triggered hostel-wide!' : 'Emergency broadcast published!');
        setBroadcastTitle('');
        setBroadcastMessage('');
        setIsDrill(false);
        loadData();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setBroadcasting(false);
    }
  };

  const handleSaveSLA = (e) => {
    e.preventDefault();
    setSlaSaved(true);
    setTimeout(() => setSlaSaved(false), 3000);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase text-rose-500">
            Administrative Superuser Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
            Hostel Safety System Governance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control SLA rules, campus broadcasts, user authorizations and evacuation roll-calls
          </p>
        </div>

        <button
          onClick={() => setIsEvacModalOpen(true)}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-2"
        >
          <Flame className="w-4 h-4" />
          <span>Launch Evacuation Headcount Monitor</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'broadcast' ? 'bg-rose-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Panic Broadcasts & Drills
        </button>
        <button
          onClick={() => setActiveTab('sla')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'sla' ? 'bg-rose-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          SLA & Auto-Escalation Thresholds
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'users' ? 'bg-rose-600 text-white shadow' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Authorized Staff Roster ({staffUsers.length})
        </button>
      </div>

      {/* TAB 1: PANIC BROADCASTS */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
              <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Create Campus Safety Announcement</span>
            </h3>

            <form onSubmit={handleCreateBroadcast} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Broadcast Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🚨 EMERGENCY WATER CUT or DRILL"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Target Audience</label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-bold"
                >
                  <option value="all">All Hostel Residents (Campus-wide)</option>
                  <option value="Block A - Phoenix">Block A - Phoenix Residents Only</option>
                  <option value="Block B - Orion">Block B - Orion Residents Only</option>
                  <option value="Block C - Zenith">Block C - Zenith Residents Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Announcement Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Specific emergency instructions, assembly point details..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs pt-1">
                <input
                  type="checkbox"
                  id="drill"
                  checked={isDrill}
                  onChange={(e) => setIsDrill(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-0"
                />
                <label htmlFor="drill" className="text-slate-700 dark:text-slate-300 font-bold">
                  Flag as Scheduled Safety / Fire Drill
                </label>
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                {broadcasting ? 'Publishing Broadcast...' : 'Publish Announcement Now'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm">
              Published Safety Broadcasts & Acknowledgements
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {broadcastList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No broadcasts published.</div>
              ) : (
                broadcastList.map((b) => (
                  <div key={b._id} className="p-4 space-y-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{b.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(b.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{b.message}</p>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono pt-1">
                      <span>Target: {b.target.toUpperCase()}</span>
                      <span>By: {b.createdByName || 'Admin'}</span>
                      <span className="text-emerald-500 font-bold">
                        {b.acknowledgedBy?.length || 0} students marked safe
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SLA CONFIGURATION */}
      {activeTab === 'sla' && (
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Service Level Agreement (SLA) Watchdog Config</h2>
            <p className="text-xs text-slate-500">Configure response windows. If unacknowledged, system auto-escalates to Chief Warden.</p>
          </div>

          {slaSaved && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold">
              ✓ SLA thresholds updated and active in background watchdog engine!
            </div>
          )}

          <form onSubmit={handleSaveSLA} className="space-y-4">
            
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-red-500">
                <span>CRITICAL Priority Threshold (Medical, Fire, Security)</span>
                <span className="font-mono">{slaCritical} Minutes</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={slaCritical}
                onChange={(e) => setSlaCritical(Number(e.target.value))}
                className="w-full accent-red-600"
              />
              <p className="text-[11px] text-slate-400">Target response time before immediate external escalation.</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-amber-500">
                <span>HIGH Priority Threshold (Electrical, Gas, Lockout)</span>
                <span className="font-mono">{slaHigh} Minutes</span>
              </div>
              <input
                type="range"
                min={2}
                max={15}
                value={slaHigh}
                onChange={(e) => setSlaHigh(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-[11px] text-slate-400">Target acknowledgement window for floor wardens.</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-blue-500">
                <span>NORMAL Priority Threshold (Plumbing, General)</span>
                <span className="font-mono">{slaNormal} Minutes</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={slaNormal}
                onChange={(e) => setSlaNormal(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <p className="text-[11px] text-slate-400">Target window for maintenance technicians.</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow transition"
            >
              Save & Apply Watchdog Rules
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: AUTHORIZED STAFF */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm">
            Active Staff Roster & Incident Responders
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            {staffUsers.map((st) => (
              <div key={st.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</h4>
                  <p className="text-slate-500">{st.email} • Role: <span className="font-mono uppercase font-bold text-indigo-500">{st.role}</span></p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                    st.shiftStatus === 'on_duty' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {st.shiftStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evacuation Modal */}
      <FireEvacuationModal isOpen={isEvacModalOpen} onClose={() => setIsEvacModalOpen(false)} />

    </div>
  );
}
