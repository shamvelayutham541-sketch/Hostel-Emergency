import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4 glass-card p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="inline-flex p-3 rounded-2xl bg-red-500/10 text-red-500">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black font-heading text-slate-900 dark:text-white">404 - Page Not Found</h1>
        <p className="text-xs text-slate-500">The requested emergency control room URL does not exist or has been relocated.</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow hover:bg-red-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Safety Home</span>
        </Link>
      </div>
    </div>
  );
}
