import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Download, 
  MapPin, 
  Users, 
  Award, 
  AlertTriangle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { api } from '../services/api';

export default function StaffAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await api.analytics.getDashboard();
      if (res.success) {
        setAnalyticsData(res);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analyticsData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8 text-slate-500">
        <div className="text-center">
          <BarChart3 className="w-10 h-10 text-indigo-500 animate-pulse mx-auto mb-2" />
          <p className="text-xs font-mono">Aggregating SLA benchmarks and response graphs...</p>
        </div>
      </div>
    );
  }

  const { 
    summary, 
    categoryDistribution, 
    blockDistribution, 
    peakHoursData, 
    hotspots, 
    staffLeaderboard 
  } = analyticsData;

  const COLORS = ['#EF4444', '#F59E0B', '#6366F1', '#10B981', '#0EA5E9', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase text-indigo-500">
            Emergency Analytics & Quality Assurance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white">
            SLA Compliance & Incident Heatmaps
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit campus safety performance, peak call volumes and repeat hotspot rooms
          </p>
        </div>

        <a
          href={api.analytics.exportCSVUrl}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Full Audit CSV</span>
        </a>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase">Avg Response Time</div>
          <div className="text-3xl font-black font-heading text-slate-900 dark:text-white">
            {summary.avgResponseTimeMinutes} <span className="text-base text-indigo-500 font-bold">min</span>
          </div>
          <p className="text-[11px] text-emerald-500 font-semibold">Under 3 min campus target</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase">SLA Compliance Rate</div>
          <div className="text-3xl font-black font-heading text-emerald-600 dark:text-emerald-400">
            {summary.slaComplianceRate}
          </div>
          <p className="text-[11px] text-slate-400">Target: 95% on-time resolution</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase">Avg Resolution Time</div>
          <div className="text-3xl font-black font-heading text-slate-900 dark:text-white">
            {summary.avgResolutionTimeMinutes} <span className="text-base text-indigo-500 font-bold">min</span>
          </div>
          <p className="text-[11px] text-slate-400">Total verified closures</p>
        </div>

        <div className="glass-card p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase">Responders On Duty</div>
          <div className="text-3xl font-black font-heading text-indigo-600 dark:text-indigo-400">
            {summary.staffOnDuty}
          </div>
          <p className="text-[11px] text-slate-400">Across 3 resident blocks</p>
        </div>

      </div>

      {/* Main Charts: Category Breakdown & Hourly Peak Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Breakdown (Pie / Bar) - 6 cols */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span>Incidents by Category Breakdown</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24-Hour Peak Time Volume Curve - 6 cols */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Peak Hours Incident Volume Heatmap (24h)</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakHoursData}>
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="incidents" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Staff Leaderboard & Hotspot Rooms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Staff Performance Leaderboard (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Responder Performance & Speed Leaderboard</span>
          </h3>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            {staffLeaderboard.map((st, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold font-mono text-xs ${
                    idx === 0 ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{st.name}</h4>
                    <p className="text-slate-400">{st.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-right">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{st.resolved} resolved</div>
                    <div className="text-[10px] text-slate-400 font-mono">Avg: {st.avgTime}</div>
                  </div>
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-500 font-bold rounded-lg font-mono">
                    ★ {st.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hotspot Rooms (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Repeat Incident Hotspots</span>
          </h3>

          <div className="space-y-2 text-xs">
            {hotspots.map((h, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <span className="font-bold text-slate-800 dark:text-slate-200">{h.room}</span>
                <span className="px-2.5 py-0.5 rounded-full font-mono font-bold bg-red-500/10 text-red-500 text-[11px]">
                  {h.count} incidents
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-200 dark:border-slate-800">
            Corridors with repeated alerts are automatically scheduled for routine safety inspection.
          </p>
        </div>

      </div>

    </div>
  );
}
