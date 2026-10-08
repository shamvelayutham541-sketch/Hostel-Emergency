import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Send, 
  ShieldAlert, 
  User, 
  Star, 
  AlertTriangle,
  ArrowLeft,
  Activity,
  Flame,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useIncidentStore } from '../store/useIncidentStore';

export default function IncidentTracking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const incidentIdParam = searchParams.get('id');

  const { user } = useAuthStore();
  const { incidents, fetchIncidents } = useIncidentStore();

  const [activeIncidentData, setActiveIncidentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const chatEndRef = useRef(null);

  // Find relevant incident (either query param or most recent active for user)
  const loadIncident = async () => {
    try {
      let targetId = incidentIdParam;
      if (!targetId) {
        // Find most recent incident for student
        const userIncidents = incidents.filter(i => i.reporterId === user?.id);
        if (userIncidents.length > 0) {
          targetId = userIncidents[0]._id;
        } else if (incidents.length > 0) {
          targetId = incidents[0]._id;
        }
      }

      if (targetId) {
        const res = await api.incidents.getById(targetId);
        if (res.success) {
          setActiveIncidentData(res);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
    const timer = setInterval(loadIncident, 4000);
    return () => clearInterval(timer);
  }, [incidentIdParam]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeIncidentData?.messages]);

  const handleSendChat = async (textToSend) => {
    const text = textToSend || chatInput;
    if (!text || !text.trim() || !activeIncidentData) return;
    try {
      await api.incidents.sendMessage(activeIncidentData.incident._id, text.trim());
      setChatInput('');
      loadIncident();
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!activeIncidentData) return;
    try {
      await api.incidents.submitFeedback(activeIncidentData.incident._id, rating, feedbackComment);
      setFeedbackSubmitted(true);
    } catch (err) {
      alert('Error submitting rating: ' + err.message);
    }
  };

  if (loading || !activeIncidentData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center p-8 text-slate-500">
        <div>
          <ShieldAlert className="w-10 h-10 text-red-500 animate-pulse mx-auto mb-2" />
          <p className="text-sm">Loading real-time emergency tracking timeline...</p>
        </div>
      </div>
    );
  }

  const { incident, timeline, messages } = activeIncidentData;

  // Delivery tracking steps progression
  const trackingSteps = [
    { key: 'pending', label: 'Reported', desc: 'Dispatched to control room' },
    { key: 'acknowledged', label: 'Acknowledged', desc: 'Warden & security verified' },
    { key: 'en_route', label: 'En Route', desc: 'Responders heading to room' },
    { key: 'in_progress', label: 'At Room Site', desc: 'Assisting student' },
    { key: 'resolved', label: 'Resolved', desc: 'Safety confirmed & cleared' }
  ];

  const statusHierarchy = {
    pending: 0,
    acknowledged: 1,
    en_route: 2,
    in_progress: 3,
    resolved: 4,
    closed: 4,
    false_alarm: 4
  };

  const currentStepIndex = statusHierarchy[incident.status] !== undefined ? statusHierarchy[incident.status] : 0;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Status Pill */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Hub</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono">Incident #{incident._id}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
            incident.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500 animate-pulse'
          }`}>
            {incident.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Main Delivery-Style Tracking Card */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-8">
        
        {/* Incident Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase ${
                incident.priority === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
              }`}>
                {incident.priority}
              </span>
              <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white">
                {incident.type.toUpperCase()} EMERGENCY RESPONSE
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-1">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Location: {incident.location?.blockName} — Room {incident.location?.roomNumber} (Floor {incident.location?.floor})</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="tel:+919876500001"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Control Room</span>
            </a>
          </div>
        </div>

        {/* Live Delivery-Style Step Tracker */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider">
            Live Response Progression
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
            {trackingSteps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.key}
                  className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center space-y-1.5 ${
                    isCurrent
                      ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 shadow-md ring-2 ring-red-500/20'
                      : (isCompleted 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400')
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isCurrent
                      ? 'bg-red-600 text-white animate-pulse'
                      : (isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500')
                  }`}>
                    {isCompleted && !isCurrent ? '✓' : idx + 1}
                  </div>
                  <span className="font-extrabold text-xs tracking-tight">{step.label}</span>
                  <span className="text-[10px] leading-tight opacity-80">{step.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floor Plan Miniature Room Highlight */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Floor Blueprint Room Beacon:</span>
            <span className="text-red-500 font-mono font-bold text-[11px] animate-pulse">● Live GPS Beacon Active</span>
          </div>

          <div className="grid grid-cols-5 gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center font-mono text-xs">
            {['201', '202', '203', '204', '205'].map((r) => {
              const isMyRoom = r === String(incident.location?.roomNumber);
              return (
                <div
                  key={r}
                  className={`p-3 rounded-lg border font-bold ${
                    isMyRoom
                      ? 'bg-red-600 text-white border-red-600 shadow-glow-red animate-pulse'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  Room {r}
                  {isMyRoom && <div className="text-[9px] uppercase tracking-wider font-sans mt-0.5 font-bold">EMERGENCY SITE</div>}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Two Column Layout: Chat with Responder + Post-Resolution Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Chat with Assigned Responders (7 cols) */}
        <div className="md:col-span-7 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col h-96">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-xs uppercase font-heading text-slate-900 dark:text-white">
              Live Chat with Responders on Duty
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-12">
                No messages yet. Send instructions or safety status to the arriving responders.
              </div>
            ) : (
              messages.map((m, idx) => {
                const isMe = m.senderId === user?.id;
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-400 mb-0.5 font-mono">{m.senderName} ({m.senderRole})</span>
                    <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs ${
                      isMe 
                        ? 'bg-red-600 text-white rounded-br-none' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex space-x-2">
            <input
              type="text"
              placeholder="Reply to responders (e.g. Door is open)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              onClick={() => handleSendChat()}
              className="p-2.5 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Post-Resolution Feedback & Rating (5 cols) */}
        <div className="md:col-span-5 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-xs uppercase font-heading text-slate-900 dark:text-white flex items-center space-x-1.5">
            <Star className="w-4 h-4 text-amber-500" />
            <span>Response Quality Feedback</span>
          </h3>

          {incident.status === 'resolved' || incident.status === 'closed' ? (
            feedbackSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-center text-xs space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="font-bold">Thank you for rating!</p>
                <p className="text-slate-500">Your feedback is submitted to the Dean's safety audit log.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">How prompt and helpful was the emergency response?</p>
                
                {/* 5-Star Picker */}
                <div className="flex space-x-2 justify-center py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition hover:scale-110"
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  placeholder="Additional comment or praise for responders..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                />

                <button
                  onClick={handleFeedbackSubmit}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Submit Response Rating
                </button>
              </div>
            )
          ) : (
            <div className="text-xs text-slate-400 py-10 text-center">
              Rating and feedback will unlock once this emergency is resolved by wardens.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
