import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  Send, 
  Heart, 
  FileText, 
  AlertOctagon,
  ExternalLink,
  Flame,
  Activity,
  Zap,
  CornerDownRight,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useIncidentStore } from '../store/useIncidentStore';

export default function IncidentDetailModal({ incidentId, onClose }) {
  if (!incidentId) return null;

  const { user } = useAuthStore();
  const { fetchIncidents } = useIncidentStore();

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [showEscalateBox, setShowEscalateBox] = useState(false);
  const [selectedStaffToAssign, setSelectedStaffToAssign] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [sendingMsg, setSendingMsg] = useState(false);

  const chatEndRef = useRef(null);

  const loadData = async () => {
    try {
      const res = await api.incidents.getById(incidentId);
      if (res.success) {
        setDetailData(res);
      }
      const staffRes = await api.users.listStaff();
      if (staffRes.success) {
        setStaffList(staffRes.staff);
      }
    } catch (err) {
      console.error('Error fetching incident', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Polling sync
    return () => clearInterval(interval);
  }, [incidentId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [detailData?.messages]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.incidents.updateStatus(incidentId, newStatus, internalNote || `Status updated to ${newStatus}`);
      setInternalNote('');
      loadData();
      fetchIncidents();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffToAssign) return;
    try {
      await api.incidents.assignStaff(incidentId, selectedStaffToAssign, 'Direct staff deployment via console');
      setSelectedStaffToAssign('');
      loadData();
      fetchIncidents();
    } catch (err) {
      alert('Error assigning staff: ' + err.message);
    }
  };

  const handleRespondAssignment = async (action) => {
    try {
      await api.incidents.respondAssignment(incidentId, action);
      loadData();
      fetchIncidents();
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  const handleSendChat = async (textToSend) => {
    const text = textToSend || chatInput;
    if (!text || !text.trim()) return;
    setSendingMsg(true);
    try {
      await api.incidents.sendMessage(incidentId, text.trim());
      setChatInput('');
      loadData();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleEscalate = async () => {
    try {
      await api.incidents.escalate(incidentId, 'Chief Warden & Ambulance 108', escalateReason || 'Critical incident response window exceeded');
      setShowEscalateBox(false);
      loadData();
      fetchIncidents();
    } catch (err) {
      alert('Failed to escalate: ' + err.message);
    }
  };

  const handleMarkFalseAlarm = async () => {
    if (!window.confirm('Mark this emergency as a FALSE ALARM? This will notify the student and log a warning.')) return;
    try {
      const res = await api.incidents.markFalseAlarm(incidentId, 'Resident verified false alarm');
      alert(`Incident marked false alarm. Student total false alarms: ${res.studentWarnings}`);
      loadData();
      fetchIncidents();
    } catch (err) {
      alert('Error marking false alarm: ' + err.message);
    }
  };

  if (loading || !detailData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-8 text-center text-slate-500">
          Loading incident record...
        </div>
      </div>
    );
  }

  const { incident, timeline, messages, assignments, medicalCard } = detailData;

  const quickReplies = [
    "Help is on the way! Stay right where you are.",
    "Are you safe to speak? Unlock your door if possible.",
    "Medical officer is running up the staircase now.",
    "Please stay calm, security team has reached your corridor."
  ];

  // Calculate SLA countdown
  const slaDeadlineTime = incident.slaDeadline ? new Date(incident.slaDeadline).getTime() : 0;
  const isBreached = incident.slaBreached || (slaDeadlineTime && Date.now() > slaDeadlineTime && incident.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
              incident.priority === 'critical' ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-white'
            }`}>
              {incident.priority}
            </span>
            <div>
              <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{incident.type.toUpperCase()} EMERGENCY</span>
                <span className="text-xs font-mono text-slate-400 font-normal">#{incident._id}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>{incident.location?.blockName} — Room {incident.location?.roomNumber} (Floor {incident.location?.floor || 1})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* SLA Badge */}
            {incident.status === 'pending' && (
              <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 ${
                isBreached ? 'bg-red-500/20 text-red-500 border border-red-500 animate-pulse' : 'bg-amber-500/20 text-amber-500'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{isBreached ? '⚠️ SLA BREACHED' : 'SLA Target Active'}</span>
              </div>
            )}

            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Two Columns */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          
          {/* Left Column: Student Info, Status Controls, Actions (7 cols) */}
          <div className="md:col-span-7 space-y-5">
            
            {/* Student & Location Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase font-mono">Resident Info</span>
                <span className="text-xs text-slate-400">{new Date(incident.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{incident.studentName}</h4>
                  <p className="text-xs text-slate-500">{incident.studentPhone}</p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={`tel:${incident.studentPhone}`}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center space-x-1 text-xs font-bold"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Student</span>
                  </a>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                "{incident.description}"
              </p>
            </div>

            {/* Medical Info Card (Shown if available & role is authorized) */}
            {medicalCard && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Confidential Medical Card</span>
                  </span>
                  <span className="font-mono bg-rose-500/20 px-2 py-0.5 rounded text-[10px]">
                    Blood: {medicalCard.bloodGroup}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div><strong>Allergies:</strong> {medicalCard.allergies?.join(', ') || 'None recorded'}</div>
                  <div><strong>Pre-existing Conditions:</strong> {medicalCard.conditions?.join(', ') || 'None reported'}</div>
                </div>
              </div>
            )}

            {/* Status Change Control Panel */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase">Change Operational Status</label>
              <div className="grid grid-cols-3 gap-2">
                {['acknowledged', 'en_route', 'in_progress', 'resolved', 'closed', 'false_alarm'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold uppercase transition text-center border ${
                      incident.status === st 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow' 
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Staff Assignment & Accept/Decline */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-400 uppercase">Dispatch / Reassign Staff</label>
              <div className="flex space-x-2">
                <select
                  value={selectedStaffToAssign}
                  onChange={(e) => setSelectedStaffToAssign(e.target.value)}
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="">Select staff on duty...</option>
                  {staffList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} — {st.role.toUpperCase()} ({st.shiftStatus})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignStaff}
                  disabled={!selectedStaffToAssign}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Assign
                </button>
              </div>

              {/* If current user has pending assignment */}
              {assignments.some(a => a.staffId === user?.id && a.status === 'pending') && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                  <span className="text-xs text-amber-500 font-bold">You are assigned to this incident!</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRespondAssignment('accept')}
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondAssignment('decline')}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Escalation & False Alarm Actions */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={() => setShowEscalateBox(!showEscalateBox)}
                className="px-3 py-2 bg-red-600/10 text-red-600 border border-red-600/20 rounded-xl text-xs font-bold hover:bg-red-600/20 transition flex items-center space-x-1"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Escalate Externally</span>
              </button>

              <button
                onClick={handleMarkFalseAlarm}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 transition"
              >
                Mark False Alarm
              </button>
            </div>

            {showEscalateBox && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl space-y-2 animate-fade-in">
                <input
                  type="text"
                  placeholder="Escalation reason (e.g. Unresponsive, major fire spreading)..."
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-red-500/30 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  onClick={handleEscalate}
                  className="px-4 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl shadow hover:bg-red-700"
                >
                  Confirm Immediate Escalation
                </button>
              </div>
            )}

            {/* Timeline Audit Trail */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Incident Timeline & Audit</span>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {timeline.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 text-xs">
                    <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                      <span>{item.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(item.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.details} — <span className="italic">{item.performedBy}</span></p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: In-Incident Live Chat & Quick Replies (5 cols) */}
          <div className="md:col-span-5 flex flex-col h-full bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <MessageSquare className="w-4 h-4 text-brand-500" />
              <h4 className="font-bold text-xs font-heading text-slate-900 dark:text-white uppercase tracking-wider">
                In-Incident Responder Chat
              </h4>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-64 min-h-[160px]">
              {messages.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-8">
                  No messages exchanged yet. Send a quick reply to reassure the student.
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-400 mb-0.5 font-mono">
                        {m.senderName} ({m.senderRole})
                      </span>
                      <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs ${
                        isMe 
                          ? 'bg-brand-600 text-white rounded-br-none shadow' 
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Replies Buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">Quick Broadcast Replies:</div>
              <div className="flex flex-wrap gap-1">
                {quickReplies.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(q)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Send Input */}
            <div className="mt-3 flex space-x-2">
              <input
                type="text"
                placeholder="Type instructions or status..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none text-slate-900 dark:text-white"
              />
              <button
                onClick={() => handleSendChat()}
                disabled={sendingMsg || !chatInput.trim()}
                className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl shadow transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
