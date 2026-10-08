import React from 'react';
import { ShieldAlert, Clock, Building, Users, AlertCircle, Phone, CheckCircle, Wifi, Dumbbell, Coffee, BookOpen } from 'lucide-react';

export default function HostelInfo() {
  const blocks = [
    {
      name: 'Block A - Phoenix',
      type: 'Undergraduate Boys Hostel',
      floors: 4,
      capacity: '120 Students',
      warden: 'Warden S. Mukherjee',
      phone: '+91 98765 00002',
      securityGate: 'Gate 1 (West)'
    },
    {
      name: 'Block B - Orion',
      type: 'Undergraduate Girls Hostel',
      floors: 4,
      capacity: '120 Students',
      warden: 'Asst. Warden Sunita Rao',
      phone: '+91 98765 00003',
      securityGate: 'Gate 2 (East - Bio-access only)'
    },
    {
      name: 'Block C - Zenith',
      type: 'Postgraduate & Research Block',
      floors: 4,
      capacity: '80 Students',
      warden: 'Prof. K. Narayanan',
      phone: '+91 98765 00004',
      securityGate: 'Gate 3 (South)'
    }
  ];

  const rules = [
    { title: 'Curfew & Gate Timings', desc: 'Hostel entrance gates lock strictly at 10:30 PM. Late entries require prior warden digital permission or campus ID biometric check.' },
    { title: 'Emergency Siren Compliance', desc: 'Whenever a physical corridor alarm or continuous phone broadcast sounds, vacate rooms immediately and walk down fire exits to Assembly Point 1.' },
    { title: 'Electrical Appliance Safety', desc: 'Heavy heating coils, uncertified electric heaters, and tampering with room circuit breakers are strictly forbidden.' },
    { title: 'Medical Reporting', desc: 'Any resident experiencing acute illness or fainting must immediately trigger the Medical SOS button for campus ambulance dispatch.' },
    { title: 'False Alarms Policy', desc: 'Accidental SOS triggers have a 5-second cancellation grace window. Intentional false alarms are tracked and penalized.' }
  ];

  const staffDirectory = [
    { name: 'Dean R. K. Verma', role: 'Dean of Student Welfare & Admin', contact: '+91 98765 00001', desk: 'Admin Block Room 101' },
    { name: 'Warden S. Mukherjee', role: 'Chief Warden (Block A & B)', contact: '+91 98765 00002', desk: 'Phoenix Ground Floor Office' },
    { name: 'Officer Rajesh Kumar', role: 'Head of Campus Security', contact: '+91 98765 00003', desk: 'Security Control Room Gate 1' },
    { name: 'Dr. Priya Sharma', role: 'Chief Medical Officer', contact: '+91 98765 00004', desk: 'Campus Health Centre 24/7' },
    { name: 'Ramesh Patel', role: 'Head Electrical & Maintenance Engineer', contact: '+91 98765 00005', desk: 'Utility Substation Block' }
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 uppercase tracking-widest">
          Campus Housing Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white">
          Hostel Blocks, Rules & Key Staff
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Official handbook for Royal Palms Tech Campus Hostel residents and responders
        </p>
      </div>

      {/* Hostel Blocks Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
          <Building className="w-5 h-5 text-indigo-500" />
          <span>Resident Blocks Overview</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blocks.map((b, idx) => (
            <div key={idx} className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Wing {idx + 1}</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{b.name}</h3>
                <p className="text-xs text-slate-500">{b.type}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Floors:</span>
                  <span className="font-bold">{b.floors} Floors (20 Rooms/Floor)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Resident Capacity:</span>
                  <span className="font-bold">{b.capacity}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Hostel Warden:</span>
                  <span className="font-bold">{b.warden}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Security Gate:</span>
                  <span className="font-bold">{b.securityGate}</span>
                </div>
              </div>

              <a
                href={`tel:${b.phone}`}
                className="w-full py-2 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Block Warden</span>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Curfew & Hostel Rules */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <span>Curfew & Safety Guidelines</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((r, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{r.title}</span>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-6 leading-relaxed">
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Staff Directory */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center space-x-2">
          <Users className="w-5 h-5 text-emerald-500" />
          <span>Campus Emergency Responders & Wardens Directory</span>
        </h2>

        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {staffDirectory.map((st, idx) => (
              <div key={idx} className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{st.name}</h4>
                  <p className="text-slate-500">{st.role} • <span className="font-mono text-slate-400">{st.desk}</span></p>
                </div>
                <a
                  href={`tel:${st.contact}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{st.contact}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
