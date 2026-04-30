const BASE = import.meta.env.VITE_API_URL || 'https://niom-backend.onrender.com';

// ── Auth ─────────────────────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem('niom_token');
}

export function setToken(token) {
  localStorage.setItem('niom_token', token);
}

export function clearToken() {
  localStorage.removeItem('niom_token');
}

export function isAuthenticated() {
  return !!getToken();
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    return null;
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data;
}

function get(path, params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
  ).toString();
  return request(`${path}${qs ? `?${qs}` : ''}`);
}

function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}

function patch(path, body) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body) });
}

function put(path, body) {
  return request(path, { method: 'PUT', body: JSON.stringify(body) });
}

function del(path) {
  return request(path, { method: 'DELETE' });
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  login:        (password)        => post('/api/auth/login',         { password }),
  partnerLogin: (email, password) => post('/api/auth/partner-login', { email, password }),
};

export function getUserRole() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

export function getPartnerId() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.partner_id || null;
  } catch {
    return null;
  }
}

export function getPartnerSlug() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.slug || null;
  } catch {
    return null;
  }
}

export function getPartnerName() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || null;
  } catch {
    return null;
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const dashboard = {
  kpis: (params = {}) => get('/api/dashboard/kpis', params),
  transactionSummary: (period = 7, partner_id) => get('/api/dashboard/transaction-summary', { period, partner_id }),
  aumHistory: (months = 12, partner_id) => get('/api/dashboard/aum-history', { months, partner_id }),
  aumBreakdown: (partner_id) => get('/api/dashboard/aum-breakdown', { partner_id }),
  sipsDue: (days = 7) => get('/api/dashboard/sips-due', { days }),
};

// ── Partners ──────────────────────────────────────────────────────────────────

export const partners = {
  list: (params = {}) => get('/api/partners', params),
  get: (id) => get(`/api/partners/${id}`),
  create: (body) => post('/api/partners', body),
  update: (id, body) => patch(`/api/partners/${id}`, body),
  updateStatus: (id, status) => patch(`/api/partners/${id}/status`, { status }),
  delete: (id) => del(`/api/partners/${id}`),
  generateLink: (name) => post('/api/partners/generate-link', { name }),
};

// ── Investors ─────────────────────────────────────────────────────────────────

export const investors = {
  list: (params = {}) => get('/api/investors', params),
  get: (id) => get(`/api/investors/${id}`),
  create: (body) => post('/api/investors', body),
  update: (id, body) => patch(`/api/investors/${id}`, body),
  delete: (id) => del(`/api/investors/${id}`),
  holdings: (id) => get(`/api/investors/${id}/holdings`),
  transactions: (id) => get(`/api/investors/${id}/transactions`),
};

// ── Families ──────────────────────────────────────────────────────────────────

export const families = {
  list: (params = {}) => get('/api/families', params),
  get: (id) => get(`/api/families/${id}`),
  create: (body) => post('/api/families', body),
  update: (id, body) => patch(`/api/families/${id}`, body),
  delete: (id) => del(`/api/families/${id}`),
};

// ── Portfolio ─────────────────────────────────────────────────────────────────

export const portfolio = {
  // Pass { investor_id } or { family_id }
  summary: (params) => get('/api/portfolio/summary', params),
  holdings: (params) => get('/api/portfolio/holdings', params),
  transactions: (params) => get('/api/portfolio/transactions', params),
  allocation: (params) => get('/api/portfolio/allocation', params),
  risk: (params) => get('/api/portfolio/risk', params),
  equityBreakdown: (params) => get('/api/portfolio/equity-breakdown', params),
  debtBreakdown: (params) => get('/api/portfolio/debt-breakdown', params),
};

// ── Schemes (VR fund data) ────────────────────────────────────────────────────

export const schemes = {
  search:     (params = {}) => get('/api/schemes/search', params),
  get:        (plan_id)     => get(`/api/schemes/${plan_id}`),
  detail:     (plan_id)     => get(`/api/schemes/${plan_id}/detail`),
  growthChart:(plan_id)     => get(`/api/schemes/${plan_id}/growth-chart`),
  compare:    (plan_id, peers = []) => get(`/api/schemes/${plan_id}/compare`, { peers: peers.join(',') }),
  compareAll: (plans)       => get('/api/schemes/compare-all', { plans }),
  compareNav: (plans, period = '1Y') => get('/api/schemes/compare-nav', { plans, period }),
  amcs:       ()            => get('/api/schemes/meta/amcs'),
  categories: ()            => get('/api/schemes/meta/categories'),
};

// ── Research ──────────────────────────────────────────────────────────────────

export const research = {
  categories: () => get('/api/research/categories'),
  categoryFunds: (id, params = {}) => get(`/api/research/category/${id}/funds`, params),
  benchmarks: () => get('/api/research/benchmarks'),
  topFunds: (params = {}) => get('/api/research/top-funds', params),
  nav: (plan_id, from) => get(`/api/research/nav/${plan_id}`, { from }),
};

// ── Commission ────────────────────────────────────────────────────────────────

export const commission = {
  summary:       (month, year) => get('/api/commission/summary', { month, year }),
  config:        ()     => get('/api/commission/config'),
  updateConfig:  (body) => put('/api/commission/config', body),
  configHistory: ()     => get('/api/commission/config/history'),
  mlmTree:       ()     => get('/api/commission/mlm-tree'),
};

// ── Leads ─────────────────────────────────────────────────────────────────────

export const leads = {
  list: (params = {}) => get('/api/leads', params),
  count: () => get('/api/leads/count'),
  create: (body) => post('/api/leads', body),
};

// ── CAS ───────────────────────────────────────────────────────────────────────

export const cas = {
  parse: (formData, token) =>
    fetch(`${BASE}/api/cas/parse`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token || getToken()}` },
      body: formData, // multipart — do NOT set Content-Type manually
    }).then(r => r.json()),
};

// ── Upload ────────────────────────────────────────────────────────────────────

export const upload = {
  photo: (file) => {
    const fd = new FormData(); fd.append('photo', file);
    return fetch(`${BASE}/api/upload/photo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    }).then(r => r.json());
  },
  logo: (file) => {
    const fd = new FormData(); fd.append('logo', file);
    return fetch(`${BASE}/api/upload/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    }).then(r => r.json());
  },
};

// ── Convenience: format currency ──────────────────────────────────────────────

export function formatINR(value, decimals = 0) {
  if (!value && value !== 0) return '—';
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(1)} L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)} K`;
  return `₹${num.toFixed(decimals)}`;
}

export function formatPct(value, decimals = 2) {
  if (!value && value !== 0) return '—';
  return `${parseFloat(value).toFixed(decimals)}%`;
}
