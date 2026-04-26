import axios from 'axios';

// ── Instance Axios configurée ────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Intercepteur : injecte le token JWT ─────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ft_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Intercepteur : gère les erreurs 401 ─────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ft_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
