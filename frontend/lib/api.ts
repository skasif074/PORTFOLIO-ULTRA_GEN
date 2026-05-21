import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Clerk token to every request if available
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const { Clerk } = window as any;
      if (Clerk?.session) {
        const token = await Clerk.session.getToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
