import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Flame, 
  Zap, 
  Clock, 
  CheckCircle, 
  Filter, 
  Search, 
  Phone, 
  UserPlus, 
  Kanban, 
  Table as TableIcon,
  AlertTriangle,
  RefreshCw,
  Download,
  Users,
  Eye,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useIncidentStore } from '../store/useIncidentStore';
import { api } from '../services/api';
import IncidentDetailModal from '../components/IncidentDetailModal';

export default function StaffDashboard() {
  const { user } = useAuthStore();
  const { 
    incidents, 
    fetchIncidents, 
    filters, 
    setFilters, 
    controlRoomMode, 
    toggleControlRoomMode 
  } = useIncidentStore();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [shiftStatus, setShiftStatus] = useState('on_duty');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleShiftChange = async (status) => {
    try {
      await api.users.updateShift(status);
      setShiftStatus(status);
    } catch (err) {
      alert('Error updating shift status: ' + err.message);
    }
  };

  // Filter incidents locally by search query + global filters
  const filteredIncidents = incidents.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i._id.toLowerCase().includes(q) ||
      (i.studentName || '').toLowerCase().includes(q) ||
      (i.location?.blockName || '').toLowerCase().includes(q) ||
      (i.location?.roomNumber || '').toLowerCase().includes(q) ||
      i.type.toLowerCase().includes(q)
    );
  });

  // Kanban Columns
  const pendingIncidents = filteredIncidents.filter(i => i.status === 'pending');
  const activeIncidents = filteredIncidents.filter(i => ['acknowledged', 'en_route', 'in_progress'].includes(i.status));
  const resolvedIncidents = filteredIncidents.filter(i => ['resolved', 'closed', 'false_alarm'].includes(i.status));

  const priorityColors = {
    critical: 'bg-red-500 text-white animate-pulse',
    high: 'bg-amber-500 text-white',
    normal: 'bg-blue-500 text-white',
    resolved: 'bg-emerald-500 text-white'
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 ${
      controlRoomMode ? 'bg-slate-950 text-white border-2 border-red-500/20' : ''
    }`}>
      
      {/* Top Console Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-bold uppercase text-red-500">
              Hostel Control Room Console
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white flex items-center space-x-3">
            <span>Live Incident Operations</span>
            {controlRoomMode && (
              <span className="text-xs px-2.5 py-1 bg-red-600 text-white rounded font-mono font-bold uppercase">
                Wall Display Mode
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time triage and rapid dispatch for wardens, security and medical officers
          </p>
        </div>

        {/* Right Tools: Responder Shift Status & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Shift Status Selector */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <span className="text-[10px] text-slate-400 font-mono px-2">SHIFT:</span>
            <button
              onClick={() => handleShiftChange('on_duty')}
              className={`px-2.5 py-1 rounded-lg transition ${shiftStatus === 'on_duty' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
            >
              On Duty
            </button>
            <button
              onClick={() => handleShiftChange('busy')}
              className={`px-2.5 py-1 rounded-lg transition ${shiftStatus === 'busy' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
            >
              Busy
            </button>
            <button
              onClick={() => handleShiftChange('off_duty')}
              className={`px-2.5 py-1 rounded-lg transition ${shiftStatus === 'off_duty' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
            >
              Off Duty
            </button>
          </div>

          {/* Kanban / Table Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-400'}`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-400'}`}
              title="Tabular Audit View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <a
            href={api.analytics.exportCSVUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Live Stat KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
          <div className="text-xs font-mono font-bold text-red-500 uppercase">Pending Verification</div>
          <div className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">{pendingIncidents.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
          <div className="text-xs font-mono font-bold text-amber-500 uppercase">Active Responders En Route</div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{activeIncidents.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <div className="text-xs font-mono font-bold text-emerald-500 uppercase">Resolved & Safe</div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{resolvedIncidents.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
          <div className="text-xs font-mono font-bold text-indigo-500 uppercase">Total Logged</div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{filteredIncidents.length}</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, room, block, ticket ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ priority: e.target.value })}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none font-bold"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ type: e.target.value })}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none font-bold"
          >
            <option value="all">All Categories</option>
            <option value="medical">Medical</option>
            <option value="fire">Fire</option>
            <option value="security">Security</option>
            <option value="electrical">Electrical</option>
            <option value="lockout">Lockout</option>
            <option value="plumbing">Plumbing</option>
          </select>

          <select
            value={filters.block}
            onChange={(e) => setFilters({ block: e.target.value })}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none font-bold"
          >
            <option value="all">All Blocks</option>
            <option value="Block A - Phoenix">Block A - Phoenix</option>
            <option value="Block B - Orion">Block B - Orion</option>
            <option value="Block C - Zenith">Block C - Zenith</option>
          </select>

          <button
            onClick={() => setFilters({ myAssigned: !filters.myAssigned })}
            className={`px-3 py-1.5 rounded-xl font-bold border transition ${
              filters.myAssigned 
                ? 'bg-brand-600 text-white border-brand-600' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Assigned to Me
          </button>
        </div>

      </div>

      {/* VIEW MODE 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* COLUMN 1: PENDING VERIFICATION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-red-500/10 border border-red-500/20 font-bold text-xs text-red-600 dark:text-red-400">
              <span className="uppercase font-mono">Pending Immediate Action</span>
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full font-mono">{pendingIncidents.length}</span>
            </div>

            <div className="space-y-3">
              {pendingIncidents.map((inc) => (
                <div
                  key={inc._id}
                  onClick={() => setSelectedIncidentId(inc._id)}
                  className="glass-card p-4 rounded-2xl border border-red-500/30 hover:border-red-500 shadow-md transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${priorityColors[inc.priority]}`}>
                      {inc.priority}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{inc._id}</span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase group-hover:text-red-500 transition">
                      {inc.type} EMERGENCY
                    </h4>
                    <p className="text-xs text-slate-500">{inc.location?.blockName} — Room {inc.location?.roomNumber}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                    <span>{inc.studentName}</span>
                    <span className="font-mono text-red-500 font-bold">{new Date(inc.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 2: ACTIVE / EN ROUTE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 font-bold text-xs text-amber-600 dark:text-amber-400">
              <span className="uppercase font-mono">Active Response in Progress</span>
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full font-mono">{activeIncidents.length}</span>
            </div>

            <div className="space-y-3">
              {activeIncidents.map((inc) => (
                <div
                  key={inc._id}
                  onClick={() => setSelectedIncidentId(inc._id)}
                  className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 shadow-sm transition cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${priorityColors[inc.priority]}`}>
                      {inc.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-500">
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase group-hover:text-amber-500 transition">
                      {inc.type} EMERGENCY
                    </h4>
                    <p className="text-xs text-slate-500">{inc.location?.blockName} — Room {inc.location?.roomNumber}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                    <span>{inc.studentName}</span>
                    <span className="font-mono">{new Date(inc.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: RESOLVED / CLOSED */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 font-bold text-xs text-emerald-600 dark:text-emerald-400">
              <span className="uppercase font-mono">Resolved & Audit Closed</span>
              <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full font-mono">{resolvedIncidents.length}</span>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {resolvedIncidents.map((inc) => (
                <div
                  key={inc._id}
                  onClick={() => setSelectedIncidentId(inc._id)}
                  className="glass-card p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 hover:border-emerald-500 transition cursor-pointer space-y-2 opacity-80 hover:opacity-100"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-500">
                      {inc.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{inc._id}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase">
                      {inc.type}
                    </h4>
                    <p className="text-xs text-slate-500">{inc.location?.blockName} — Room {inc.location?.roomNumber}</p>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono">
                    Resolved: {new Date(inc.resolvedAt || inc.updatedAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW MODE 2: AUDIT TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono font-bold uppercase text-slate-400">
                <tr>
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reported At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredIncidents.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono font-bold">{inc._id}</td>
                    <td className="p-4 font-bold uppercase text-slate-900 dark:text-white">{inc.type}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${priorityColors[inc.priority]}`}>
                        {inc.priority}
                      </span>
                    </td>
                    <td className="p-4">{inc.location?.blockName} - Room {inc.location?.roomNumber}</td>
                    <td className="p-4">{inc.studentName}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px] bg-slate-100 dark:bg-slate-800">
                        {inc.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{new Date(inc.createdAt).toLocaleTimeString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedIncidentId(inc._id)}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:opacity-90"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncidentId && (
        <IncidentDetailModal
          incidentId={selectedIncidentId}
          onClose={() => setSelectedIncidentId(null)}
        />
      )}

    </div>
  );
}
