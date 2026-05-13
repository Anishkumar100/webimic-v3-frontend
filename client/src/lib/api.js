const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getToken = () => localStorage.getItem('webimic_token');

const request = async (method, path, body = null) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (networkErr) {
    // Connection refused / network down — throw a typed error so callers can detect it
    const err = new Error('Network error: server unreachable');
    err.isNetworkError = true;
    throw err;
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
};

const getBlob = async (path) => {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method: 'GET', headers });
  } catch (networkErr) {
    const err = new Error('Network error: server unreachable');
    err.isNetworkError = true;
    throw err;
  }
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.blob();
};

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
  getBlob,

  // Auth helpers
  setToken: (token) => localStorage.setItem('webimic_token', token),
  clearToken: () => localStorage.removeItem('webimic_token'),
  hasToken: () => !!getToken(),
};
