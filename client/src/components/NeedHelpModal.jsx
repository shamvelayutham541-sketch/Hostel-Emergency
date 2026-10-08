import React, { useState } from 'react';
import { X, Activity, Flame, ShieldAlert, Zap, Droplet, HelpCircle, CheckCircle, Phone } from 'lucide-react';
import { api } from '../services/api';
import { playEmergencySiren } from '../utils/soundAlerts';

export default function NeedHelpModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [loadingType, setLoadingType] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  const quickCategories = [
    { id: 'medical', label: 'MEDICAL EMERGENCY', sub: 'Severe injury, breathing trouble, fainting', icon: Activity, bg: 'bg-red-600 hover:bg-red-700' },
    { id: 'fire', label: 'FIRE / SMOKE', sub: 'Open flames, burning smell, thick smoke', icon: Flame, bg: 'bg-orange-600 hover:bg-orange-700' },
    { id: 'security', label: 'SECURITY / THREAT', sub: 'Intruder, physical fight, harassment', icon: ShieldAlert, bg: 'bg-rose-700 hover:bg-rose-800' },
    { id: 'electrical', label: 'ELECTRICAL HAZARD', sub: 'Short circuit, live wire, electric shock', icon: Zap, bg: 'bg-amber-600 hover:bg-amber-700' },
    { id: 'other', label: 'OTHER URGENT HELP', sub: 'Water leakage, room lockout, other hazard', icon: HelpCircle, bg: 'bg-indigo-600 hover:bg-indigo-700' },
  ];

  const handleTapCategory = async (catId) => {
    setLoadingType(catId);
    try {
      const res = await api.incidents.create({
        type: catId,
        priority: 'critical',
        description: `Rapid 1-tap emergency alert raised via "I NEED HELP" screen. Immediate assistance requested!`
      });

      if (res.success) {
        playEmergencySiren(2.5);
        setSuccessResult(res.incident);
        if (onSuccess) onSuccess(res.incident);
      }
    } catch (err) {
      alert('Failed to send SOS: ' + err.message);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-red-500/40 rounded-3xl p-6 text-white shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-widest">
            🚨 1-Tap Urgent Assist
          </span>
          <h2 className="text-2xl font-black mt-2 tracking-tight">I NEED HELP NOW</h2>
          <p className="text-xs text-slate-400 mt-1">Tap one category below — no typing required. Responders will locate your registered room.</p>
        </div>

        {successResult ? (
          <div className="p-6 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Emergency Dispatched!</h3>
            <p className="text-xs text-slate-300">
              Control room and wardens have been notified for <span className="font-bold text-white">{successResult.location?.blockName} - Room {successResult.location?.roomNumber}</span>.
            </p>
            <div className="pt-2 flex justify-center space-x-2">
              <a
                href="tel:108"
                className="px-4 py-2 bg-emerald-600 rounded-xl text-xs font-bold flex items-center space-x-1 hover:bg-emerald-700"
              >
                <Phone className="w-4 h-4" />
                <span>Call Ambulance (108)</span>
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/10 rounded-xl text-xs font-bold hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {quickCategories.map((c) => {
              const Icon = c.icon;
              const isLoading = loadingType === c.id;

              return (
                <button
                  key={c.id}
                  onClick={() => handleTapCategory(c.id)}
                  disabled={loadingType !== null}
                  className={`w-full p-4 rounded-2xl text-left flex items-center space-x-4 transition transform active:scale-98 shadow-lg ${c.bg} ${
                    isLoading ? 'opacity-80 animate-pulse' : ''
                  }`}
                >
                  <div className="p-3 bg-black/20 rounded-xl">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-sm tracking-wide">{c.label}</div>
                    <div className="text-xs text-white/80">{c.sub}</div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                    {isLoading ? 'SENDING...' : 'TAP'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
