const BASE_URL = '/api';

const getStoredTokens = () => {
  return {
    accessToken: localStorage.getItem('studybuddy_access_token'),
    refreshToken: localStorage.getItem('studybuddy_refresh_token')
  };
};

const setStoredTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem('studybuddy_access_token', accessToken);
  if (refreshToken) localStorage.setItem('studybuddy_refresh_token', refreshToken);
};

const clearStoredTokens = () => {
  localStorage.removeItem('studybuddy_access_token');
  localStorage.removeItem('studybuddy_refresh_token');
  localStorage.removeItem('studybuddy_user');
};

const request = async (endpoint, options = {}) => {
  const { accessToken, refreshToken } = getStoredTokens();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Handle 401 Unauthorized: Attempt token refresh once
  if (response.status === 401 && refreshToken && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setStoredTokens(refreshData.accessToken, refreshData.refreshToken);

        // Retry original request with fresh access token
        headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
        response = await fetch(`${BASE_URL}${endpoint}`, {
          ...options,
          headers
        });
      } else {
        clearStoredTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    } catch (err) {
      clearStoredTokens();
      window.location.href = '/login';
      throw err;
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Notes
  getNotes: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/notes${qs ? `?${qs}` : ''}`);
  },
  getNote: (id) => request(`/notes/${id}`),
  createNote: (payload) => request('/notes', { method: 'POST', body: JSON.stringify(payload) }),
  updateNote: (id, payload) => request(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteNote: (id) => request(`/notes/${id}`, { method: 'DELETE' }),
  getSubjects: () => request('/notes/subjects'),

  // AI Assistant
  generateSummary: (noteId) => request(`/ai/summary/${noteId}`, { method: 'POST' }),
  generateQuestions: (noteId) => request(`/ai/questions/${noteId}`, { method: 'POST' }),
  getAIHistory: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/ai/history${qs ? `?${qs}` : ''}`);
  },

  // Admin
  getAdminOverview: () => request('/admin/overview'),
  getAdminUsageStats: () => request('/admin/usage-stats'),
  getAdminUsers: () => request('/admin/users'),

  // Token management helpers
  setStoredTokens,
  getStoredTokens,
  clearStoredTokens
};
