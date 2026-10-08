import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useIncidentStore } from './store/useIncidentStore';

import Navbar from './components/Navbar';
import CriticalBanner from './components/CriticalBanner';
import CommandPalette from './components/CommandPalette';

import Landing from './pages/Landing';
import HostelInfo from './pages/HostelInfo';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import IncidentTracking from './pages/IncidentTracking';
import StaffDashboard from './pages/StaffDashboard';
import StaffAnalytics from './pages/StaffAnalytics';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-400 font-mono">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role) && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { initAuth } = useAuthStore();
  const { subscribeToSocketEvents, fetchIncidents } = useIncidentStore();

  useEffect(() => {
    initAuth();
    fetchIncidents();
    subscribeToSocketEvents();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-surface-light dark:bg-surface-dark transition-colors duration-150">
        <CriticalBanner />
        <Navbar />
        <CommandPalette />

        <main className="flex-1">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Landing />} />
            <Route path="/hostel-info" element={<HostelInfo />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Protected Pages */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/tracking"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <IncidentTracking />
                </ProtectedRoute>
              }
            />

            {/* Staff Protected Pages */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['warden', 'security', 'medical', 'maintenance', 'admin']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/analytics"
              element={
                <ProtectedRoute allowedRoles={['warden', 'security', 'medical', 'admin']}>
                  <StaffAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Pages */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'warden']}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
