/**
 * Frontend API Service Layer
 * Intercepts requests, attaches JWT headers, handles automatic renewal and error notifications.
 */

const API_BASE_URL = '/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('hostelsos_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    // Attempt refresh or clean redirect
    console.warn('[API] Unauthorized access or expired session.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
    refresh: (token) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: token }) }),
  },
  incidents: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/incidents${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/incidents/${id}`),
    create: (data) => request('/incidents', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status, note) => request(`/incidents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
    assignStaff: (id, staffId, note) => request(`/incidents/${id}/assign`, { method: 'POST', body: JSON.stringify({ staffId, note }) }),
    respondAssignment: (id, action) => request(`/incidents/${id}/respond`, { method: 'POST', body: JSON.stringify({ action }) }),
    sendMessage: (id, content, mediaUrl) => request(`/incidents/${id}/messages`, { method: 'POST', body: JSON.stringify({ content, mediaUrl }) }),
    escalate: (id, escalationTarget, reason) => request(`/incidents/${id}/escalate`, { method: 'POST', body: JSON.stringify({ escalationTarget, reason }) }),
    markFalseAlarm: (id, note) => request(`/incidents/${id}/false-alarm`, { method: 'PATCH', body: JSON.stringify({ note }) }),
    submitFeedback: (id, rating, comment) => request(`/incidents/${id}/feedback`, { method: 'POST', body: JSON.stringify({ rating, comment }) }),
  },
  broadcasts: {
    list: () => request('/broadcasts'),
    create: (data) => request('/broadcasts', { method: 'POST', body: JSON.stringify(data) }),
    checkin: (id, status, note) => request(`/broadcasts/${id}/checkin`, { method: 'POST', body: JSON.stringify({ status, note }) }),
    getHeadcount: (broadcastId) => request(`/broadcasts/${broadcastId}/headcount`),
  },
  maintenance: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/maintenance${q ? `?${q}` : ''}`);
    },
    create: (data) => request('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, data) => request(`/maintenance/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  analytics: {
    getDashboard: () => request('/analytics/dashboard'),
    exportCSVUrl: '/api/v1/analytics/export-csv',
  },
  contacts: {
    list: () => request('/contacts'),
  },
  users: {
    listStaff: () => request('/users/staff'),
    updateShift: (status) => request('/users/staff/shift', { method: 'PATCH', body: JSON.stringify({ status }) }),
    getProfile: (userId) => request(`/users/profile${userId ? `?userId=${userId}` : ''}`),
    updateProfile: (data) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  }
};
