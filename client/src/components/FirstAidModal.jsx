import React, { useState } from 'react';
import { X, HeartPulse, Flame, AlertCircle, Zap, Shield, Phone, ChevronRight } from 'lucide-react';

export default function FirstAidModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [selectedTopic, setSelectedTopic] = useState('burns');

  const guides = [
    {
      id: 'burns',
      title: 'Burns & Scalds',
      severity: 'Immediate Action',
      steps: [
        'Immediately place burnt area under cool running water for 10–20 minutes.',
        'Do NOT apply ice, toothpaste, butter, or oil to the burn wound.',
        'Gently remove tight rings or clothing before swelling begins.',
        'Cover loosely with sterile, clean plastic wrap or dry non-stick gauze.',
        'Call hostel medical officer immediately if blisters cover an area larger than a palm.'
      ]
    },
    {
      id: 'choking',
      title: 'Choking (Airway Obstruction)',
      severity: 'Critical (Every Second Counts)',
      steps: [
        'Ask the person: "Are you choking?" If they cannot speak or cough, act immediately.',
        'Lean the person forward and give 5 firm back blows with the heel of your hand between shoulder blades.',
        'If airway is still blocked, perform 5 abdominal thrusts (Heimlich maneuver): place fist above navel, pull inward and upward sharply.',
        'Alternate 5 back blows and 5 abdominal thrusts until object is expelled.',
        'If person loses consciousness, call 108 immediately and begin CPR chest compressions.'
      ]
    },
    {
      id: 'fainting',
      title: 'Fainting & Syncope',
      severity: 'Urgent',
      steps: [
        'Lay the student flat on their back and elevate legs by 12 inches (30 cm) to restore blood flow to brain.',
        'Loosen tight neckties, belts, or collars.',
        'Ensure plenty of fresh air — disperse crowds around the student.',
        'Check breathing. Do NOT pour cold water on face or force them to drink while drowsy.',
        'Once awake, let them rest seated for 10 minutes before attempting to stand.'
      ]
    },
    {
      id: 'bleeding',
      title: 'Severe Bleeding',
      severity: 'High Priority',
      steps: [
        'Apply firm, continuous direct pressure over the wound using a clean cloth or sterile dressing.',
        'Elevate the injured limb above heart level if no bone fracture is suspected.',
        'Do not remove blood-soaked dressings; add more pads on top and press firmly.',
        'Secure pressure bandage firmly, ensuring you do not cut off pulse completely.',
        'Keep the casualty warm and calm until campus medical ambulance arrives.'
      ]
    },
    {
      id: 'shock',
      title: 'Electric Shock',
      severity: 'Critical Safety Hazard',
      steps: [
        'DO NOT touch the victim while they are still in contact with the electrical current!',
        'Immediately switch off the main electrical circuit breaker in corridor or room.',
        'If switch is out of reach, use a dry wooden stick or broom handle to separate victim from wire.',
        'Once isolated, check responsiveness and breathing.',
        'If breathing has stopped, start CPR immediately and call 108.'
      ]
    },
    {
      id: 'bite',
      title: 'Snake or Insect Bite',
      severity: 'Urgent',
      steps: [
        'Keep the victim calm and still — movement spreads venom faster.',
        'Immobilize the bitten limb with a splint at or slightly below heart level.',
        'Do NOT cut the wound, do NOT attempt to suck venom, and do NOT apply tourniquets.',
        'Note the appearance of the snake if safe to do so for anti-venom identification.',
        'Rush immediately to the nearest hospital trauma center with anti-venom.'
      ]
    }
  ];

  const current = guides.find(g => g.id === selectedTopic) || guides[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Emergency First-Aid Guide</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Offline step-by-step campus protocols</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body: Sidebar + Step Detail */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Topics List */}
          <div className="space-y-1.5 overflow-y-auto pr-1">
            {guides.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedTopic(g.id)}
                className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition flex items-center justify-between ${
                  selectedTopic === g.id
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>{g.title}</span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>
            ))}
          </div>

          {/* Guide Steps */}
          <div className="md:col-span-2 overflow-y-auto bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{current.title}</h3>
              <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                {current.severity}
              </span>
            </div>

            <ol className="space-y-3 mt-4">
              {current.steps.map((step, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-[11px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">If condition is critical, dial ambulance immediately:</span>
              <a
                href="tel:108"
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1 hover:bg-red-700"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 108</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
