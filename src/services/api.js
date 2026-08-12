import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Soft-lock codes: keep session, redirect UI (no logout). */
const SOFT_SUB_REDIRECT = {
  MANAGER_SUBSCRIPTION_EXPIRED: '/management/locked',
  MANAGER_SUBSCRIPTION_REQUIRED: '/management/locked',
  SUBSCRIPTION_EXPIRED: '/management/subscription',
  SUBSCRIPTION_REQUIRED: '/select-plan',
};

function alreadyOnTarget(path) {
  const p = window.location.pathname.replace(/\/+$/, '') || '/';
  const target = String(path).replace(/\/+$/, '') || '/';
  return p === target || p.startsWith(`${target}/`);
}

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - auth expiry vs subscription soft-lock
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const redirectTo = error.response?.data?.redirectTo;

    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 403 && code && SOFT_SUB_REDIRECT[code]) {
      const dest = redirectTo || SOFT_SUB_REDIRECT[code];
      if (!alreadyOnTarget(dest)) {
        window.location.href = dest;
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
