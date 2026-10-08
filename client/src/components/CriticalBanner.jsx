import React from 'react';
import { AlertTriangle, X, ArrowRight, BellRing } from 'lucide-react';
import { useIncidentStore } from '../store/useIncidentStore';
import { useNavigate } from 'react-router-dom';

export default function CriticalBanner() {
  const { activeBannerAlert, dismissBannerAlert } = useIncidentStore();
  const navigate = useNavigate();

  if (!activeBannerAlert) return null;

  const isCritical = activeBannerAlert.type === 'CRITICAL_INCIDENT' || activeBannerAlert.type === 'SLA_BREACH';

  return (
    <div className={`w-full py-3 px-4 shadow-lg text-white font-medium flex items-center justify-between transition-all duration-300 z-50 ${
      isCritical ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 animate-pulse-fast' : 'bg-gradient-to-r from-amber-600 to-orange-600'
    }`}>
      <div className="flex items-center space-x-3 max-w-5xl mx-auto flex-1">
        <div className="p-1.5 bg-white/20 rounded-full animate-bounce">
          {isCritical ? <AlertTriangle className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <span className="font-bold tracking-wide uppercase mr-2 text-xs bg-white text-red-700 px-2 py-0.5 rounded-full font-mono">
            {activeBannerAlert.title}
          </span>
          <span className="text-sm font-semibold">{activeBannerAlert.message}</span>
        </div>

        {activeBannerAlert.incident && (
          <button
            onClick={() => {
              navigate('/staff');
              dismissBannerAlert();
            }}
            className="flex items-center space-x-1 text-xs bg-white text-slate-900 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 transition shadow"
          >
            <span>View Incident</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <button
        onClick={dismissBannerAlert}
        className="p-1.5 hover:bg-white/20 rounded-lg transition ml-4"
        title="Dismiss banner"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
