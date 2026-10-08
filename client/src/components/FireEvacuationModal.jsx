import React, { useState, useEffect } from 'react';
import { X, Flame, ShieldCheck, AlertTriangle, Users, CheckCircle2, UserCheck, Phone, Radio } from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function FireEvacuationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { user } = useAuthStore();
  const [broadcasts, setBroadcasts] = useState([]);
  const [selectedBroadcastId, setSelectedBroadcastId] = useState(null);
  const [headcountData, setHeadcountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('safe'); // 'safe', 'help', 'unverified'

  const loadData = async () => {
    try {
      const res = await api.broadcasts.list();
      if (res.success && res.broadcasts.length > 0) {
        setBroadcasts(res.broadcasts);
        const drillOrRecent = res.broadcasts.find(b => b.isDrill) || res.broadcasts[0];
        setSelectedBroadcastId(drillOrRecent._id);

        const countRes = await api.broadcasts.getHeadcount(drillOrRecent._id);
        if (countRes.success) {
          setHeadcountData(countRes);
        }
      }
    } catch (err) {
      console.error('Failed to load evacuation headcount', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleStudentCheckin = async (status) => {
    if (!selectedBroadcastId) return;
    try {
      await api.broadcasts.checkin(selectedBroadcastId, status, 'Student mobile checkin confirmation');
      loadData();
    } catch (err) {
      alert('Checkin error: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Fire Evacuation & Headcount</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500 text-white uppercase">
                  Live Roll-Call
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hostel emergency assembly point verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Check-in Bar for Students */}
        {user?.role === 'student' && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div>
              <h4 className="font-bold text-sm">Emergency Evacuation Alert Active!</h4>
              <p className="text-xs text-red-100">Confirm your physical safety status for the control room roster.</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStudentCheckin('safe')}
                className="px-4 py-2 bg-white text-emerald-700 font-bold text-xs rounded-xl shadow hover:bg-emerald-50 transition flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>I'M SAFE AT ASSEMBLY POINT</span>
              </button>
              <button
                onClick={() => handleStudentCheckin('needs_help')}
                className="px-4 py-2 bg-black/40 text-white font-bold text-xs rounded-xl hover:bg-black/60 transition"
              >
                TRAPPED / NEED HELP
              </button>
            </div>
          </div>
        )}

        {/* Headcount Metrics Cards */}
        {headcountData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-center">
              <div className="text-xs text-slate-500 uppercase font-mono font-bold">Total Enrolled</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{headcountData.totalStudents}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-mono font-bold">Marked Safe</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{headcountData.safeCount}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
              <div className="text-xs text-red-600 dark:text-red-400 uppercase font-mono font-bold">Needs Help</div>
              <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-0.5">{headcountData.needHelpCount}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-xs text-amber-600 dark:text-amber-400 uppercase font-mono font-bold">Unaccounted</div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{headcountData.unverifiedCount}</div>
            </div>
          </div>
        )}

        {/* Assembly Points Bar */}
        {headcountData?.assemblyPoints && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 mb-4 flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="font-mono font-bold text-slate-500">Designated Assembly Points:</div>
            <div className="flex flex-wrap gap-2">
              {headcountData.assemblyPoints.map(ap => (
                <span key={ap.id} className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <strong>{ap.id}:</strong> {ap.name} ({ap.block})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('safe')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'safe' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Verified Safe ({headcountData?.safeCount || 0})
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'help' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Needs Assistance ({headcountData?.needHelpCount || 0})
          </button>
          <button
            onClick={() => setActiveTab('unverified')}
            className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'unverified' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            Pending Check-in ({headcountData?.unverifiedCount || 0})
          </button>
        </div>

        {/* Roster List */}
        <div className="flex-1 overflow-y-auto pt-3 space-y-2">
          {activeTab === 'safe' && (
            (headcountData?.safeList || []).map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                  <span className="text-slate-500 ml-2">Room {s.roomNumber} ({s.blockName})</span>
                </div>
                <span className="text-emerald-500 font-mono text-[11px] font-bold">Safe at {new Date(s.timestamp).toLocaleTimeString()}</span>
              </div>
            ))
          )}

          {activeTab === 'help' && (
            (headcountData?.needHelpList || []).length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-6">No students reported needing emergency evacuation rescue.</div>
            ) : (
              (headcountData?.needHelpList || []).map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-red-500">{s.name}</span>
                    <span className="text-slate-500 ml-2">Room {s.roomNumber} ({s.blockName})</span>
                    <p className="text-[11px] text-red-400 mt-0.5 font-semibold">Note: {s.note || 'Requested immediate rescue'}</p>
                  </div>
                  <a href={`tel:${s.phone || '108'}`} className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold">Call</a>
                </div>
              ))
            )
          )}

          {activeTab === 'unverified' && (
            (headcountData?.unverifiedList || []).map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                  <span className="text-slate-500 ml-2">Room {s.roomNumber} ({s.blockName})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-amber-500 font-mono text-[11px]">Unconfirmed</span>
                  <a href={`tel:${s.phone}`} className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
