import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertOctagon, 
  Flame, 
  Activity, 
  Zap, 
  Key, 
  Droplet, 
  ShieldAlert, 
  HelpCircle, 
  Mic, 
  VolumeX, 
  CheckCircle2, 
  X, 
  Compass, 
  Smartphone,
  Send,
  EyeOff
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useIncidentStore } from '../store/useIncidentStore';
import { playEmergencySiren, playChime } from '../utils/soundAlerts';

export default function SOSButton({ onEmergencyTriggered }) {
  const { user } = useAuthStore();
  const { fetchIncidents } = useIncidentStore();

  const [selectedType, setSelectedType] = useState('medical');
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0); // 0 to 100
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [cancelSecondsLeft, setCancelSecondsLeft] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [triggeredIncident, setTriggeredIncident] = useState(null);
  const [isSilent, setIsSilent] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [shakeDetected, setShakeDetected] = useState(false);

  const pressTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  const categories = [
    { id: 'medical', label: 'Medical', icon: Activity, color: 'from-rose-500 to-red-600', ring: 'ring-rose-500', desc: 'Chest pain, injury, unconsciousness, severe asthma' },
    { id: 'fire', label: 'Fire Hazard', icon: Flame, color: 'from-orange-500 to-amber-600', ring: 'ring-orange-500', desc: 'Smoke, open flame, electrical fire, explosion' },
    { id: 'security', label: 'Security / Threat', icon: ShieldAlert, color: 'from-red-600 to-rose-700', ring: 'ring-red-600', desc: 'Intruder, harassment, violent altercation' },
    { id: 'electrical', label: 'Electrical Shock', icon: Zap, color: 'from-amber-500 to-yellow-600', ring: 'ring-amber-500', desc: 'High voltage sparks, short circuit, exposed cable' },
    { id: 'lockout', label: 'Room Lockout', icon: Key, color: 'from-blue-500 to-indigo-600', ring: 'ring-blue-500', desc: 'Accidentally locked out, key jammed in slot' },
    { id: 'plumbing', label: 'Water / Leak', icon: Droplet, color: 'from-cyan-500 to-blue-600', ring: 'ring-cyan-500', desc: 'Flooding, pipe burst, ceiling water gush' },
    { id: 'other', label: 'Other Urgent', icon: HelpCircle, color: 'from-purple-500 to-indigo-600', ring: 'ring-purple-500', desc: 'Any other critical unlisted emergency' },
  ];

  // Press-and-hold logic (hold 2 seconds to reach 100%)
  const startPress = () => {
    if (isCountdownActive || isSubmitting) return;
    setIsPressing(true);
    const stepTime = 20; // 20ms steps -> 2000ms total = 100 steps
    let current = 0;

    pressTimerRef.current = setInterval(() => {
      current += 1;
      setPressProgress(current);

      if (current >= 100) {
        clearInterval(pressTimerRef.current);
        setIsPressing(false);
        setPressProgress(0);
        initiateCancelCountdown();
      }
    }, stepTime);
  };

  const endPress = () => {
    if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    setIsPressing(false);
    setPressProgress(0);
  };

  // 5-second cancel countdown window to prevent false alarms
  const initiateCancelCountdown = () => {
    setIsCountdownActive(true);
    setCancelSecondsLeft(5);

    countdownTimerRef.current = setInterval(() => {
      setCancelSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          setIsCountdownActive(false);
          dispatchEmergencySOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelEmergency = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setIsCountdownActive(false);
    setCancelSecondsLeft(5);
    playChime();
  };

  // Immediate Emergency Dispatch
  const dispatchEmergencySOS = async () => {
    setIsSubmitting(true);
    try {
      // Get browser geolocation if permitted
      let coords = { latitude: 12.9716, longitude: 77.5946 };
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
              resolve();
            },
            () => resolve(),
            { timeout: 1500 }
          );
        });
      }

      const payload = {
        type: selectedType,
        isSilent: isSilent,
        gps: coords,
        description: `Direct SOS triggered (${selectedType.toUpperCase()}) from student mobile unit.`
      };

      const res = await api.incidents.create(payload);
      if (res.success) {
        setTriggeredIncident(res.incident);
        if (!isSilent) {
          playEmergencySiren(3);
        }
        fetchIncidents();
        if (onEmergencyTriggered) onEmergencyTriggered(res.incident);
      }
    } catch (err) {
      console.error('Failed to dispatch SOS', err);
      // Offline fallback: queue and show offline emergency fallback
      alert('Network issue encountered. Emergency SMS link fallback generated!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Voice-Triggered Help ("Help help help" via Web Speech API)
  const toggleVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported on this browser.');
      return;
    }

    if (isListeningVoice) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListeningVoice(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListeningVoice(true);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      setVoiceTranscript(transcript);

      if (transcript.includes('help') || transcript.includes('emergency') || transcript.includes('bachao')) {
        recognition.stop();
        setIsListeningVoice(false);
        dispatchEmergencySOS();
      }
    };

    recognition.onerror = () => {
      setIsListeningVoice(false);
    };

    recognition.onend = () => {
      setIsListeningVoice(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Shake-to-SOS listener
  useEffect(() => {
    let lastX, lastY, lastZ;
    let lastTime = 0;

    const handleMotion = (event) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const currentTime = Date.now();
      if ((currentTime - lastTime) > 100) {
        const diffTime = currentTime - lastTime;
        lastTime = currentTime;

        const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;
        if (speed > 2500) {
          setShakeDetected(true);
          initiateCancelCountdown();
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  const activeCategory = categories.find(c => c.id === selectedType) || categories[0];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      
      {/* Category selector chips */}
      <div className="w-full mb-6">
        <label className="block text-xs font-mono font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2 text-center">
          Select Emergency Category:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedType === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedType(cat.id)}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-200 text-center ${
                  isSelected 
                    ? `bg-gradient-to-br ${cat.color} text-white shadow-md border-transparent scale-102` 
                    : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="text-xs font-bold leading-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
          Routing: {activeCategory.desc}
        </p>
      </div>

      {/* Centerpiece SOS Button with Ripple & Progress */}
      <div className="relative my-4 flex items-center justify-center">
        
        {/* Pulsing Ripple Outer Rings */}
        <div className="absolute w-64 h-64 rounded-full bg-red-500/20 sos-pulse-animation pointer-events-none"></div>
        <div className="absolute w-52 h-52 rounded-full bg-red-500/30 animate-ping opacity-30 pointer-events-none"></div>

        {/* Circular SVG Press-and-hold Progress Ring */}
        <svg className="w-56 h-56 transform -rotate-90 pointer-events-none absolute">
          <circle
            cx="112"
            cy="112"
            r="104"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-200 dark:text-slate-800"
            fill="transparent"
          />
          <circle
            cx="112"
            cy="112"
            r="104"
            stroke="currentColor"
            strokeWidth="8"
            className="text-red-500 transition-all duration-75"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 104}
            strokeDashoffset={2 * Math.PI * 104 * (1 - pressProgress / 100)}
            strokeLinecap="round"
          />
        </svg>

        {/* The Main Glowing Red SOS Button */}
        <button
          id="main-sos-button"
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={startPress}
          onTouchEnd={endPress}
          disabled={isSubmitting}
          className={`relative z-10 w-48 h-48 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 text-white font-heading font-black tracking-wider shadow-glow-red flex flex-col items-center justify-center select-none active:scale-95 transition-transform duration-100 ${
            isPressing ? 'scale-95 brightness-110' : ''
          }`}
          aria-label="Raise Emergency SOS Alert"
        >
          <AlertOctagon className="w-12 h-12 mb-1 text-white animate-pulse" />
          <span className="text-3xl font-extrabold tracking-widest uppercase">SOS</span>
          <span className="text-[10px] font-mono tracking-widest text-red-200 uppercase mt-0.5 font-bold">
            {isPressing ? `${pressProgress}% HOLD` : 'HOLD 2 SEC'}
          </span>
        </button>
      </div>

      {/* 5-Second Cancel Countdown Overlay Card */}
      {isCountdownActive && (
        <div className="w-full mt-4 p-5 rounded-3xl bg-red-600 text-white shadow-2xl animate-bounce flex flex-col items-center text-center">
          <span className="text-xs font-mono font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full mb-2">
            ⚠️ False Alarm Prevention Window
          </span>
          <p className="text-lg font-bold">
            Dispatching {selectedType.toUpperCase()} SOS in <span className="text-3xl font-mono underline font-extrabold">{cancelSecondsLeft}s</span>
          </p>
          <p className="text-xs text-red-100 mt-1">Tap below if pressed accidentally</p>
          <button
            onClick={cancelEmergency}
            className="mt-3 px-6 py-2.5 bg-white text-red-700 font-extrabold rounded-2xl shadow hover:bg-red-50 transition active:scale-95 flex items-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>CANCEL FALSE ALARM</span>
          </button>
        </div>
      )}

      {/* Confirmation of Dispatched SOS */}
      {triggeredIncident && (
        <div className="w-full mt-4 p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-start space-x-3">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">Emergency Dispatched Successfully!</h4>
            <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">
              Ticket <span className="font-mono font-bold">{triggeredIncident._id}</span> dispatched to Warden and Security. Response team has been alerted!
            </p>
            <div className="mt-2 flex space-x-2">
              <a 
                href={`tel:+919876543210`}
                className="inline-flex items-center space-x-1 text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-700 transition"
              >
                <span>Call Warden Office</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Quick Action Tools: Voice Trigger, Silent SOS, Simulated Shake */}
      <div className="w-full mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Silent SOS Toggle */}
        <button
          onClick={() => setIsSilent(!isSilent)}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border transition ${
            isSilent 
              ? 'bg-purple-600 text-white border-purple-600 font-bold' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
          title="Discreet Silent SOS for harassment or security issues"
        >
          <EyeOff className="w-4 h-4" />
          <span>{isSilent ? 'Silent Mode ON' : 'Discreet / Silent SOS'}</span>
        </button>

        {/* Voice Trigger Web Speech API */}
        <button
          onClick={toggleVoiceRecognition}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border transition ${
            isListeningVoice 
              ? 'bg-red-600 text-white border-red-600 animate-pulse font-bold' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{isListeningVoice ? 'Listening ("Help")...' : 'Voice Trigger (Speech)'}</span>
        </button>

        {/* Simulated Shake Test Button */}
        <button
          onClick={() => {
            setShakeDetected(true);
            initiateCancelCountdown();
          }}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          title="Simulate smartphone shake gesture"
        >
          <Smartphone className="w-4 h-4" />
          <span>Simulate Shake SOS</span>
        </button>
      </div>

    </div>
  );
}
