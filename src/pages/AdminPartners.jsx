import { useState, useEffect, useRef, useCallback } from 'react';
import { partners as partnersApi, getToken } from '../lib/api';

const BASE = import.meta.env.VITE_API_URL || 'https://niom-backend.onrender.com';

// ── Design tokens ─────────────────────────────────────────────────────────────
const sectionHead = {
  fontFamily: 'var(--display-font)',
  fontSize: '22px',
  fontWeight: 600,
  color: 'var(--green)',
};

const tabLabel = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--gold)',
  fontWeight: 600,
};

// ── Country codes — full list, identical to admin-panel.html ──────────────────
const COUNTRY_CODES = [
  { code: '+91',   label: 'India' },
  { code: '+1',    label: 'USA / Canada' },
  { code: '+44',   label: 'UK' },
  { code: '+971',  label: 'UAE' },
  { code: '+65',   label: 'Singapore' },
  { code: '+61',   label: 'Australia' },
  { code: '+852',  label: 'Hong Kong' },
  { code: '+41',   label: 'Switzerland' },
  { code: '+49',   label: 'Germany' },
  { code: '+33',   label: 'France' },
  { code: '+81',   label: 'Japan' },
  { code: '+82',   label: 'South Korea' },
  { code: '+86',   label: 'China' },
  { code: '+60',   label: 'Malaysia' },
  { code: '+66',   label: 'Thailand' },
  { code: '+62',   label: 'Indonesia' },
  { code: '+63',   label: 'Philippines' },
  { code: '+84',   label: 'Vietnam' },
  { code: '+94',   label: 'Sri Lanka' },
  { code: '+92',   label: 'Pakistan' },
  { code: '+880',  label: 'Bangladesh' },
  { code: '+977',  label: 'Nepal' },
  { code: '+64',   label: 'New Zealand' },
  { code: '+27',   label: 'South Africa' },
  { code: '+234',  label: 'Nigeria' },
  { code: '+254',  label: 'Kenya' },
  { code: '+20',   label: 'Egypt' },
  { code: '+212',  label: 'Morocco' },
  { code: '+966',  label: 'Saudi Arabia' },
  { code: '+974',  label: 'Qatar' },
  { code: '+973',  label: 'Bahrain' },
  { code: '+968',  label: 'Oman' },
  { code: '+965',  label: 'Kuwait' },
  { code: '+972',  label: 'Israel' },
  { code: '+90',   label: 'Turkey' },
  { code: '+7',    label: 'Russia' },
  { code: '+48',   label: 'Poland' },
  { code: '+31',   label: 'Netherlands' },
  { code: '+32',   label: 'Belgium' },
  { code: '+34',   label: 'Spain' },
  { code: '+39',   label: 'Italy' },
  { code: '+351',  label: 'Portugal' },
  { code: '+46',   label: 'Sweden' },
  { code: '+47',   label: 'Norway' },
  { code: '+45',   label: 'Denmark' },
  { code: '+353',  label: 'Ireland' },
  { code: '+43',   label: 'Austria' },
  { code: '+55',   label: 'Brazil' },
  { code: '+54',   label: 'Argentina' },
  { code: '+52',   label: 'Mexico' },
  { code: '+57',   label: 'Colombia' },
  { code: '+56',   label: 'Chile' },
  { code: '+51',   label: 'Peru' },
  { code: '+30',   label: 'Greece' },
  { code: '+36',   label: 'Hungary' },
  { code: '+420',  label: 'Czech Republic' },
  { code: '+358',  label: 'Finland' },
  { code: '+1345', label: 'Cayman Islands' },
  { code: '+1284', label: 'British Virgin Islands' },
];

function ccFmt(code) {
  const found = COUNTRY_CODES.find(c => c.code === code);
  return found ? `${found.code} (${found.label})` : code;
}

// ── Services — identical to admin-panel.html ──────────────────────────────────
const SERVICES = [
  { label: 'Mutual Funds',        icon: '📈' },
  { label: 'SIP Planning',        icon: '📊' },
  { label: 'Goal-Based Investing',icon: '🎯' },
  { label: 'Tax Saving (ELSS)',   icon: '🛡' },
  { label: 'Retirement Planning', icon: '☂' },
  { label: "Children's Education",icon: '🎓' },
  { label: 'NRI Investments',     icon: '🌐' },
];

// ── API helper ────────────────────────────────────────────────────────────────
async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return res;
}

// ── Searchable Country Code Picker ────────────────────────────────────────────
function CCPicker({ value, onChange, disabled = false }) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [filtered, setFiltered] = useState(COUNTRY_CODES);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
        setFiltered(COUNTRY_CODES);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleInput = (e) => {
    const q = e.target.value;
    setQuery(q);
    const n = q.trim().toLowerCase().replace(/^\+/, '');
    setFiltered(n
      ? COUNTRY_CODES.filter(c =>
          c.code.replace('+', '').startsWith(n) ||
          c.label.toLowerCase().includes(n)
        )
      : COUNTRY_CODES
    );
  };

  const select = (cc) => {
    onChange(cc.code);
    setQuery('');
    setFiltered(COUNTRY_CODES);
    setOpen(false);
  };

  const displayValue = open ? query : ccFmt(value);

  return (
    <div ref={ref} style={{ position: 'relative', width: '160px', flexShrink: 0 }}>
      <input
        value={displayValue}
        onChange={handleInput}
        onFocus={() => { setOpen(true); setQuery(''); }}
        disabled={disabled}
        placeholder={ccFmt(value)}
        style={{
          width: '100%', padding: '10px 12px',
          border: '1.5px solid var(--border)', borderRadius: '8px',
          fontSize: '13px', fontFamily: 'var(--body-font)',
          color: 'var(--charcoal)', background: disabled ? 'var(--sage)' : '#fff',
          outline: 'none', cursor: disabled ? 'default' : 'text',
          boxSizing: 'border-box',
          opacity: disabled ? 0.6 : 1,
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = 'var(--green)'; setOpen(true); setQuery(''); }}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
          background: '#fff', borderRadius: '8px', marginTop: '4px',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(44,74,62,0.12)',
          maxHeight: '200px', overflowY: 'auto',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: '12px', color: '#9aaa9e' }}>No match</div>
          ) : filtered.map(cc => (
            <div
              key={cc.code}
              onMouseDown={() => select(cc)}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: '13px',
                color: cc.code === value ? 'var(--green)' : 'var(--charcoal)',
                fontWeight: cc.code === value ? 600 : 400,
                background: cc.code === value ? 'rgba(44,74,62,0.06)' : '#fff',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (cc.code !== value) e.currentTarget.style.background = 'var(--sage)'; }}
              onMouseLeave={e => { if (cc.code !== value) e.currentTarget.style.background = '#fff'; }}
            >
              {cc.code} ({cc.label})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Status styles ─────────────────────────────────────────────────────────────
const statusStyles = {
  live:    { bg: 'rgba(44,74,62,0.08)',    color: 'var(--green)' },
  pending: { bg: 'rgba(184,150,90,0.12)',  color: 'var(--gold)' },
  paused:  { bg: 'rgba(200,200,200,0.2)',  color: '#8a9e96' },
};

// ── MLM Tree Node ─────────────────────────────────────────────────────────────
function TreeNode({ partner, allPartners, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const children = allPartners.filter(p =>
    p.referred_by_slug && p.referred_by_slug === partner.slug
  );

  return (
    <div style={{ marginLeft: level * 28 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', background: '#fff',
        borderRadius: '10px', border: '1px solid var(--border)',
        marginBottom: '8px',
        cursor: children.length ? 'pointer' : 'default',
      }} onClick={() => children.length && setExpanded(v => !v)}>
        {children.length > 0 ? (
          <span style={{ fontSize: '10px', color: '#8a9e96', transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▶</span>
        ) : <span style={{ width: '14px' }} />}

        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(44,74,62,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 600, color: 'var(--green)', flexShrink: 0,
        }}>
          {`${partner.fname?.[0] || ''}${partner.lname?.[0] || ''}`}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)' }}>
            {partner.fname} {partner.lname}
          </div>
          <div style={{ fontSize: '11px', color: '#8a9e96' }}>
            {partner.arn} · {partner.investors_count || 0} investors · {partner.aum_display || '₹0'}
          </div>
        </div>

        <span style={{
          fontSize: '11px', fontWeight: 600, padding: '3px 8px',
          borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.08em',
          ...(statusStyles[partner.status] || statusStyles.paused),
        }}>{partner.status}</span>
      </div>

      {expanded && children.map(child => (
        <TreeNode key={child.id} partner={child} allPartners={allPartners} level={level + 1} />
      ))}
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ confirm, setConfirm }) {
  if (!confirm) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '32px',
        width: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ fontFamily: 'var(--display-font)', fontSize: '20px', fontWeight: 600, color: 'var(--green)', marginBottom: '12px' }}>
          {confirm.title}
        </div>
        <div style={{ fontSize: '14px', color: '#5a6a64', lineHeight: 1.6, marginBottom: '24px' }}>
          {confirm.body}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => setConfirm(null)} style={{ padding: '9px 20px', borderRadius: '8px', border: '1.5px solid var(--border)', background: '#fff', color: '#8a9e96', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--body-font)' }}>
            Cancel
          </button>
          <button
            onClick={() => { confirm.action(); setConfirm(null); }}
            style={{
              padding: '9px 20px', borderRadius: '8px', border: 'none',
              background: confirm.danger ? '#c0392b' : 'var(--green)',
              color: '#fff', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--body-font)',
            }}
          >
            {confirm.label}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form initial state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  fname: '', lname: '', slug: '', arn: '',
  waCC: '+91', waNumber: '',
  callCC: '+91', callNumber: '',
  sameNumber: false,
  tagline: '', bio: '',
  services: [],
  referredBy: '',
  photoFile: null, photoPreview: null,
  logoFile: null,  logoPreview: null,
};

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminPartners() {
  const [activeSection, setActiveSection] = useState('Partner List');
  const [filterStatus,  setFilterStatus]  = useState('All');
  const [partners,      setPartners]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [confirm,       setConfirm]       = useState(null);
  const [mode,          setMode]          = useState('yourself');
  const [linkName,      setLinkName]      = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkStepsActive, setLinkStepsActive] = useState(false);
  const [linkCopied,    setLinkCopied]    = useState(false);
  const [editingId,     setEditingId]     = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [successMsg,    setSuccessMsg]    = useState('');
  const [form,          setForm]          = useState({ ...EMPTY_FORM });

  const photoInputRef = useRef(null);
  const logoInputRef  = useRef(null);

  const updateForm = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);

  const toggleService = (label) => {
    setForm(f => ({
      ...f,
      services: f.services.includes(label)
        ? f.services.filter(s => s !== label)
        : f.services.length >= 3 ? f.services : [...f.services, label],
    }));
  };

  // ── Load partners from API ──────────────────────────────────────────────────
  const loadPartners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/api/partners');
      if (res.ok) {
        const data = await res.json();
        setPartners(Array.isArray(data) ? data : []);
      }
    } catch(e) {
      console.error('Failed to load partners:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPartners(); }, [loadPartners]);

  // ── Auto-slug from first+last name ─────────────────────────────────────────
  const autoSlug = (fname, lname) => {
    return `${fname}-${lname}`.toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // ── Partner actions ─────────────────────────────────────────────────────────
  const approvePartner = async (id) => {
    const res = await api(`/api/partners/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: 'live' }),
    });
    if (res.ok) loadPartners();
  };

  const rejectPartner = async (id) => {
    const res = await api(`/api/partners/${id}`, { method: 'DELETE' });
    if (res.ok) loadPartners();
  };

  const goLivePartner = async (id) => {
    const res = await api(`/api/partners/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: 'live' }),
    });
    if (res.ok) loadPartners();
  };

  const pausePartner = async (id) => {
    const res = await api(`/api/partners/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status: 'paused' }),
    });
    if (res.ok) loadPartners();
  };

  const deletePartner = async (id) => {
    const res = await api(`/api/partners/${id}`, { method: 'DELETE' });
    if (res.ok) loadPartners();
  };

  const previewPartner = (slug) => {
    window.open(`${BASE}/${slug}`, '_blank');
  };

  const editPartner = (p) => {
    setEditingId(p.id);
    setForm({
      ...EMPTY_FORM,
      fname:      p.fname      || '',
      lname:      p.lname      || '',
      slug:       p.slug       || '',
      arn:        p.arn        || '',
      waCC:       p.wa_cc      || '+91',
      waNumber:   p.wa_number  || '',
      callCC:     p.call_cc    || '+91',
      callNumber: p.call_number|| '',
      tagline:    p.tagline    || '',
      bio:        p.bio        || '',
      services:   Array.isArray(p.services) ? p.services : [],
      referredBy: p.referred_by_slug || '',
      photoPreview: p.photo_url ? `${BASE}${p.photo_url}` : null,
      logoPreview:  p.logo_url  ? `${BASE}${p.logo_url}`  : null,
    });
    setActiveSection('Onboard Partner');
    setMode('yourself');
  };

  // ── Form submission ─────────────────────────────────────────────────────────
  const submitForm = async () => {
    if (!form.fname.trim() || !form.lname.trim()) {
      alert('First and last name are required.');
      return;
    }
    if (form.services.length !== 3) {
      alert('Please select exactly 3 areas of focus.');
      return;
    }

    setSubmitting(true);
    try {
      let photo_url = null, logo_url = null;

      // Upload photo if new file selected
      if (form.photoFile) {
        const fd = new FormData();
        fd.append('photo', form.photoFile);
        const r = await api('/api/upload/photo', { method: 'POST', body: fd });
        if (r.ok) { const d = await r.json(); photo_url = d.url; }
      }

      // Upload logo if new file selected
      if (form.logoFile) {
        const fd = new FormData();
        fd.append('logo', form.logoFile);
        const r = await api('/api/upload/logo', { method: 'POST', body: fd });
        if (r.ok) { const d = await r.json(); logo_url = d.url; }
      }

      const payload = {
        slug:           form.slug.trim() || autoSlug(form.fname, form.lname),
        fname:          form.fname.trim(),
        lname:          form.lname.trim(),
        arn:            form.arn.trim() || null,
        tagline:        form.tagline.trim(),
        bio:            form.bio.trim(),
        wa_cc:          form.waCC,
        wa_number:      form.waNumber.trim(),
        call_cc:        form.callCC,
        call_number:    form.callNumber.trim(),
        services:       form.services,
        referred_by_slug: form.referredBy || null,
      };
      if (photo_url) payload.photo_url = photo_url;
      if (logo_url)  payload.logo_url  = logo_url;

      let res;
      if (editingId) {
        res = await api(`/api/partners/${editingId}`, {
          method: 'PATCH', body: JSON.stringify(payload),
        });
      } else {
        // Try slug; auto-increment on collision
        res = await api('/api/partners', { method: 'POST', body: JSON.stringify(payload) });
        if (res && res.status === 409) {
          let suffix = 2;
          const baseSlug = payload.slug;
          while (res.status === 409 && suffix <= 10) {
            payload.slug = `${baseSlug}-${suffix}`;
            res = await api('/api/partners', { method: 'POST', body: JSON.stringify(payload) });
            suffix++;
          }
        }
      }

      if (!res || !res.ok) {
        const err = await res?.json().catch(() => ({}));
        throw new Error(err.error || 'Something went wrong');
      }

      setSuccessMsg(editingId ? 'Partner updated successfully!' : 'Partner page created successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
      resetForm();
      loadPartners();
      setActiveSection('Partner List');
    } catch(e) {
      alert('Error: ' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  // ── Generate link ───────────────────────────────────────────────────────────
  const generateLink = async () => {
    if (!linkName.trim()) return;
    try {
      const res = await api('/api/partners/generate-link', {
        method: 'POST', body: JSON.stringify({ name: linkName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedLink(data.link);
        setLinkStepsActive(true);
      }
    } catch(e) { alert('Error generating link'); }
  };

  // ── Filtered partner list ───────────────────────────────────────────────────
  const filteredPartners = filterStatus === 'All'
    ? partners
    : partners.filter(p => p.status === filterStatus.toLowerCase());

  const rootPartners = partners.filter(p => !p.referred_by_slug);

  // ── Rendered ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Partner Management
        </h1>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div style={{
          marginBottom: '20px', padding: '14px 20px', borderRadius: '10px',
          background: 'rgba(44,74,62,0.08)', border: '1px solid rgba(44,74,62,0.2)',
          fontSize: '14px', color: 'var(--green)', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          ✓ {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* ── Sidebar ── */}
        <div style={{
          width: '200px', flexShrink: 0,
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          overflow: 'hidden', position: 'sticky', top: '20px',
        }}>
          {['Partner List', 'Onboard Partner', 'MLM Referral Tree'].map((sec, i) => (
            <div
              key={sec}
              onClick={() => { setActiveSection(sec); if (sec === 'Onboard Partner') resetForm(); }}
              style={{
                padding: '14px 18px', cursor: 'pointer', fontSize: '13px',
                fontWeight: activeSection === sec ? 600 : 500,
                color: activeSection === sec ? 'var(--green)' : 'var(--charcoal)',
                background: activeSection === sec ? 'rgba(44,74,62,0.06)' : '#fff',
                borderLeft: `3px solid ${activeSection === sec ? 'var(--green)' : 'transparent'}`,
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (activeSection !== sec) e.currentTarget.style.background = 'var(--sage)'; }}
              onMouseLeave={e => { if (activeSection !== sec) e.currentTarget.style.background = '#fff'; }}
            >{sec}</div>
          ))}
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ══ PARTNER LIST ══ */}
          {activeSection === 'Partner List' && (
            <div>
              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['All', 'Live', 'Pending', 'Paused'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} style={{
                    padding: '8px 20px', borderRadius: '100px', fontSize: '13px',
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--body-font)',
                    fontWeight: filterStatus === s ? 600 : 400,
                    background: filterStatus === s ? 'var(--green)' : 'var(--sage)',
                    color: filterStatus === s ? 'var(--ivory)' : '#7a8a84',
                    transition: 'all 0.2s',
                  }}>{s}</button>
                ))}
                <div style={{ marginLeft: 'auto' }}>
                  <button
                    onClick={() => { resetForm(); setActiveSection('Onboard Partner'); }}
                    style={{
                      padding: '9px 20px', borderRadius: '8px',
                      background: 'var(--green)', color: 'var(--ivory)',
                      border: 'none', fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'var(--body-font)',
                    }}
                  >+ Add Partner</button>
                </div>
              </div>

              {/* Partner cards grid */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ height: '160px', borderRadius: '16px', background: 'linear-gradient(90deg, var(--sage) 25%, #e8eeec 50%, var(--sage) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                  ))}
                </div>
              ) : filteredPartners.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)', marginBottom: '8px' }}>No partners yet</div>
                  <div style={{ fontSize: '13px', color: '#9aaa9e' }}>Click "Add Partner" to onboard your first partner</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                  {filteredPartners.map(p => {
                    const initials = `${p.fname?.[0] || ''}${p.lname?.[0] || ''}`;
                    const addedDate = p.created_at
                      ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—';
                    const st = statusStyles[p.status] || statusStyles.paused;
                    const statusLabel = { live: '● Live', pending: '● Pending', paused: '● Paused' }[p.status] || p.status;

                    return (
                      <div key={p.id} style={{
                        background: '#fff', borderRadius: '16px',
                        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
                        overflow: 'hidden',
                      }}>
                        {/* Card top */}
                        <div style={{ padding: '20px 20px 14px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                          <div style={{
                            width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(44,74,62,0.1)', border: '2px solid var(--gold)',
                            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--display-font)', fontSize: '16px', fontWeight: 600, color: 'var(--green)',
                          }}>
                            {p.photo_url
                              ? <img src={`${BASE}${p.photo_url}`} alt={p.fname} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : initials
                            }
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--charcoal)' }}>{p.fname} {p.lname}</div>
                            <div style={{ fontSize: '12px', color: '#9aaa9e', marginTop: '2px' }}>{p.tagline || ''}</div>
                          </div>
                          <span style={{
                            fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                            borderRadius: '100px', background: st.bg, color: st.color,
                            letterSpacing: '0.06em',
                          }}>{statusLabel}</span>
                        </div>

                        {/* Meta */}
                        <div style={{ padding: '0 20px 14px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <div style={{ fontSize: '12px', color: '#8a9e96', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🔗 <span style={{ color: 'var(--green)', fontWeight: 500 }}>niomfintech.in/{p.slug}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#8a9e96', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📅 {addedDate}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button onClick={() => previewPartner(p.slug)} style={actionBtnStyle}>👁 Preview</button>
                          <button onClick={() => editPartner(p)} style={actionBtnStyle}>✏ Edit</button>

                          {p.status === 'pending' && <>
                            <button onClick={() => setConfirm({
                              title: 'Approve Partner',
                              body: `Approve ${p.fname} ${p.lname} and make their page live?`,
                              label: 'Approve',
                              danger: false,
                              action: () => approvePartner(p.id),
                            })} style={{ ...actionBtnStyle, background: 'var(--green)', color: 'var(--ivory)', border: '1.5px solid var(--green)' }}>✓ Approve</button>
                            <button onClick={() => setConfirm({
                              title: 'Reject Partner',
                              body: `Reject and remove ${p.fname} ${p.lname}'s onboarding?`,
                              label: 'Reject',
                              danger: true,
                              action: () => rejectPartner(p.id),
                            })} style={{ ...actionBtnStyle, color: '#c0392b', borderColor: 'rgba(192,57,43,0.25)' }}>✕ Reject</button>
                          </>}

                          {p.status === 'live' && (
                            <button onClick={() => setConfirm({
                              title: 'Pause Partner Page',
                              body: `This will take ${p.fname} ${p.lname}'s page offline.`,
                              label: 'Pause',
                              danger: false,
                              action: () => pausePartner(p.id),
                            })} style={{ ...actionBtnStyle, color: 'var(--gold)', borderColor: 'rgba(184,150,90,0.3)' }}>⏸ Pause</button>
                          )}

                          {p.status === 'paused' && <>
                            <button onClick={() => setConfirm({
                              title: 'Go Live',
                              body: `Make ${p.fname} ${p.lname}'s page live again?`,
                              label: 'Go Live',
                              danger: false,
                              action: () => goLivePartner(p.id),
                            })} style={{ ...actionBtnStyle, background: 'var(--green)', color: 'var(--ivory)', border: '1.5px solid var(--green)' }}>▶ Go Live</button>
                            <button onClick={() => setConfirm({
                              title: 'Delete Partner',
                              body: `Permanently delete ${p.fname} ${p.lname}'s partner page? This cannot be undone.`,
                              label: 'Delete',
                              danger: true,
                              action: () => deletePartner(p.id),
                            })} style={{ ...actionBtnStyle, color: '#c0392b', borderColor: 'rgba(192,57,43,0.25)' }}>🗑 Delete</button>
                          </>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ ONBOARD PARTNER ══ */}
          {activeSection === 'Onboard Partner' && (
            <div>
              {/* Mode toggle */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['yourself', 'link'].map(m => (
                  <button key={m} onClick={() => setMode(m)} style={{
                    padding: '10px 24px', borderRadius: '100px',
                    background: mode === m ? 'var(--green)' : 'var(--sage)',
                    color: mode === m ? 'var(--ivory)' : '#7a8a84',
                    border: 'none', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'var(--body-font)', transition: 'all 0.2s',
                  }}>
                    {m === 'yourself' ? '✏ Fill it yourself' : '🔗 Send a link'}
                  </button>
                ))}
              </div>

              {/* ── FILL YOURSELF ── */}
              {mode === 'yourself' && (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>

                  {/* Basic Information */}
                  <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ ...tabLabel, marginBottom: '20px' }}>Basic Information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <Field label="First Name">
                        <input value={form.fname} onChange={e => {
                          updateForm('fname', e.target.value);
                          if (!editingId) updateForm('slug', autoSlug(e.target.value, form.lname));
                        }} placeholder="Arjun" style={fieldInput} onFocus={fe} onBlur={fb} />
                      </Field>
                      <Field label="Last Name">
                        <input value={form.lname} onChange={e => {
                          updateForm('lname', e.target.value);
                          if (!editingId) updateForm('slug', autoSlug(form.fname, e.target.value));
                        }} placeholder="Mehta" style={fieldInput} onFocus={fe} onBlur={fb} />
                      </Field>
                      <Field label="Page URL Slug" hint="Only lowercase letters, numbers, hyphens">
                        <input value={form.slug} onChange={e => updateForm('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="arjun-mehta" style={fieldInput} onFocus={fe} onBlur={fb} />
                      </Field>
                      <Field label="ARN Number">
                        <input value={form.arn} onChange={e => updateForm('arn', e.target.value)} placeholder="ARN-XXXXXX" style={fieldInput} onFocus={fe} onBlur={fb} />
                      </Field>
                    </div>

                    {/* URL Preview */}
                    <div style={{ marginTop: '16px', background: 'var(--sage)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', color: '#4a6a5e', flex: 1 }}>
                        niomfintech.in/<strong style={{ color: 'var(--green)' }}>{form.slug || 'partner-name'}</strong>
                      </span>
                      <button onClick={() => navigator.clipboard.writeText(`niomfintech.in/${form.slug || ''}`)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: 'var(--green)', cursor: 'pointer', fontFamily: 'var(--body-font)' }}>
                        Copy URL
                      </button>
                    </div>

                    {/* Referred By */}
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                        Referred By (MLM Upline)
                      </label>
                      <select
                        value={form.referredBy}
                        onChange={e => updateForm('referredBy', e.target.value)}
                        style={{ width: '100%', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: '#fff', outline: 'none' }}
                      >
                        <option value="">— Direct (no referral)</option>
                        {partners.filter(p => p.status === 'live').map(p => (
                          <option key={p.id} value={p.slug}>{p.fname} {p.lname} · {p.arn}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Profile */}
                  <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ ...tabLabel, marginBottom: '20px' }}>Profile</div>

                    {/* Photo upload */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500, display: 'block', marginBottom: '10px' }}>Profile Photo</label>
                      <div onClick={() => photoInputRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--gold)', overflow: 'hidden', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {form.photoPreview
                            ? <img src={form.photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '24px' }}>👤</span>
                          }
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', color: 'var(--green)', fontWeight: 500, marginBottom: '4px' }}>Click to upload photo</p>
                          <span style={{ fontSize: '12px', color: '#9aaa9e' }}>JPG or PNG, square preferred. Max 5MB.</span>
                        </div>
                        <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                          const file = e.target.files[0];
                          if (file) { updateForm('photoFile', file); updateForm('photoPreview', URL.createObjectURL(file)); }
                        }} />
                      </div>
                    </div>

                    {/* Tagline */}
                    <Field label={`Tagline (${form.tagline.length}/80)`}>
                      <input value={form.tagline} onChange={e => updateForm('tagline', e.target.value.slice(0, 80))} placeholder="Helping families invest with clarity and confidence" style={fieldInput} onFocus={fe} onBlur={fb} />
                    </Field>

                    {/* Bio */}
                    <Field label={`Bio (${form.bio.length}/300)`}>
                      <textarea value={form.bio} onChange={e => updateForm('bio', e.target.value.slice(0, 300))} rows={4} placeholder="Write a short bio for the partner. This will appear on their micro-site below the tagline." style={{ ...fieldInput, resize: 'vertical' }} onFocus={fe} onBlur={fb} />
                    </Field>

                    {/* Partner Logo */}
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500, display: 'block', marginBottom: '10px' }}>Partner Logo</label>
                      <div onClick={() => logoInputRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <div style={{ width: '56px', height: '56px', borderRadius: '8px', border: '1.5px solid var(--border)', overflow: 'hidden', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {form.logoPreview
                            ? <img src={form.logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : <span style={{ fontSize: '20px' }}>🖼</span>
                          }
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', color: 'var(--green)', fontWeight: 500, marginBottom: '4px' }}>Click to upload logo</p>
                          <span style={{ fontSize: '12px', color: '#9aaa9e' }}>PNG with transparent background preferred. Max 5MB.</span>
                        </div>
                        <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                          const file = e.target.files[0];
                          if (file) { updateForm('logoFile', file); updateForm('logoPreview', URL.createObjectURL(file)); }
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ ...tabLabel, marginBottom: '20px' }}>Contact Details</div>

                    {/* Call Number */}
                    <Field label="Call Number">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <CCPicker value={form.callCC} onChange={v => {
                          updateForm('callCC', v);
                          if (form.sameNumber) updateForm('waCC', v);
                        }} />
                        <input value={form.callNumber} onChange={e => {
                          const val = e.target.value.replace(/\D/g,'').slice(0,10);
                          updateForm('callNumber', val);
                          if (form.sameNumber) updateForm('waNumber', val);
                        }} placeholder="9876543210" maxLength={10} inputMode="numeric" style={{ ...fieldInput, flex: 1 }} onFocus={fe} onBlur={fb} />
                      </div>
                    </Field>

                    {/* Same number checkbox */}
                    <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input type="checkbox" id="sameNum" checked={form.sameNumber} onChange={e => {
                        const checked = e.target.checked;
                        updateForm('sameNumber', checked);
                        if (checked) { updateForm('waCC', form.callCC); updateForm('waNumber', form.callNumber); }
                      }} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--green)' }} />
                      <label htmlFor="sameNum" style={{ fontSize: '13px', color: '#5a6a64', cursor: 'pointer' }}>
                        WhatsApp number is the same as call number
                      </label>
                    </div>

                    {/* WhatsApp Number */}
                    <Field label="WhatsApp Number">
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <CCPicker value={form.waCC} onChange={v => updateForm('waCC', v)} disabled={form.sameNumber} />
                        <input
                          value={form.waNumber}
                          onChange={e => updateForm('waNumber', e.target.value.replace(/\D/g,'').slice(0,10))}
                          placeholder="9876543210" maxLength={10} inputMode="numeric" disabled={form.sameNumber}
                          style={{ ...fieldInput, flex: 1, opacity: form.sameNumber ? 0.6 : 1, cursor: form.sameNumber ? 'default' : 'text', background: form.sameNumber ? 'var(--sage)' : '#fff' }}
                          onFocus={fe} onBlur={fb}
                        />
                      </div>
                    </Field>
                  </div>

                  {/* Areas of Focus */}
                  <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
                      <span style={tabLabel}>Areas of Focus</span>
                      <span style={{ fontSize: '11px', color: '#9aaa9e', fontWeight: 300 }}>— pick exactly 3</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {SERVICES.map(s => {
                        const sel  = form.services.includes(s.label);
                        const dis  = !sel && form.services.length >= 3;
                        return (
                          <div key={s.label}
                            onClick={() => !dis && toggleService(s.label)}
                            style={{
                              border: `1.5px solid ${sel ? 'var(--green)' : 'var(--border)'}`,
                              borderRadius: '10px', padding: '14px 12px',
                              cursor: dis ? 'not-allowed' : 'pointer',
                              textAlign: 'center', fontSize: '13px',
                              fontWeight: sel ? 500 : 400,
                              color: sel ? 'var(--green)' : dis ? '#bbb' : '#5a6a64',
                              background: sel ? 'rgba(44,74,62,0.07)' : 'var(--ivory)',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                              opacity: dis ? 0.4 : 1, transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { if (!dis && !sel) { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}}
                            onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = dis ? '#bbb' : '#5a6a64'; }}}
                          >
                            <span style={{ fontSize: '20px' }}>{s.icon}</span>
                            <span>{s.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#9aaa9e' }}>
                      {form.services.length} of 3 selected
                    </div>
                  </div>

                  {/* Form footer */}
                  <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#9aaa9e' }}>
                      {editingId ? 'Save changes to update this partner.' : "This will generate the partner's micro-site page."}
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={resetForm} style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', color: '#8a9e96', border: '1.5px solid var(--border)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--body-font)' }}>
                        Clear Form
                      </button>
                      <button
                        onClick={submitForm}
                        disabled={submitting}
                        style={{ padding: '10px 24px', borderRadius: '8px', background: submitting ? '#9aaa9e' : 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: submitting ? 'default' : 'pointer', fontFamily: 'var(--body-font)' }}
                        onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--gold)'; }}
                        onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'var(--green)'; }}
                      >
                        {submitting ? 'Saving...' : editingId ? 'Save Changes →' : 'Create Partner Page →'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SEND A LINK ── */}
              {mode === 'link' && (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '40px' }}>
                  <div style={{ fontFamily: 'var(--display-font)', fontSize: '26px', fontWeight: 600, color: 'var(--green)', marginBottom: '8px' }}>Send Onboarding Link</div>
                  <p style={{ fontSize: '14px', color: '#8a9e96', fontWeight: 300, lineHeight: 1.7, marginBottom: '32px' }}>
                    Generate a unique link and send it to your partner. They'll fill in their own details and the page will be created once you approve.
                  </p>

                  {/* Step 1 */}
                  <div style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--sage)', border: '1.5px solid rgba(44,74,62,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--green)', flexShrink: 0 }}>1</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', color: 'var(--charcoal)', marginBottom: '12px' }}>Enter the partner's full name to generate their unique link</p>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          value={linkName}
                          onChange={e => setLinkName(e.target.value)}
                          placeholder="Partner's full name (e.g. Priya Sharma)"
                          style={{ ...fieldInput, flex: 1 }}
                          onFocus={fe} onBlur={fb}
                        />
                        <button onClick={generateLink} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--body-font)' }}>
                          🔗 Generate Link
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid var(--border)', opacity: linkStepsActive ? 1 : 0.4, transition: 'opacity 0.3s', pointerEvents: linkStepsActive ? 'auto' : 'none' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--sage)', border: '1.5px solid rgba(44,74,62,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--green)', flexShrink: 0 }}>2</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', color: 'var(--charcoal)', marginBottom: '12px' }}>Copy and share this link with your partner</p>
                      {generatedLink && (
                        <div style={{ background: 'var(--sage)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ flex: 1, fontSize: '13px', color: 'var(--green)', wordBreak: 'break-all' }}>{generatedLink}</span>
                          <button onClick={() => {
                            navigator.clipboard.writeText(generatedLink);
                            setLinkCopied(true);
                            setTimeout(() => setLinkCopied(false), 2000);
                          }} style={{ background: 'var(--green)', color: 'var(--ivory)', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--body-font)' }}>
                            {linkCopied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{ display: 'flex', gap: '20px', padding: '20px 0', opacity: linkStepsActive ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--sage)', border: '1.5px solid rgba(44,74,62,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--green)', flexShrink: 0 }}>3</div>
                    <div>
                      <p style={{ fontSize: '14px', color: 'var(--charcoal)', marginBottom: '4px' }}>Review & approve in your dashboard</p>
                      <span style={{ fontSize: '13px', color: '#9aaa9e' }}>Once your partner submits their details, they'll appear as a pending partner in the Partner List for you to approve.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ MLM REFERRAL TREE ══ */}
          {activeSection === 'MLM Referral Tree' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '28px' }}>
              <span style={{ ...sectionHead, display: 'block', marginBottom: '24px' }}>MLM Referral Tree</span>
              {loading ? (
                <div style={{ height: '200px', borderRadius: '10px', background: 'linear-gradient(90deg, var(--sage) 25%, #e8eeec 50%, var(--sage) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {rootPartners.map(p => (
                    <TreeNode key={p.id} partner={p} allPartners={partners} />
                  ))}
                  {rootPartners.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#9aaa9e', fontSize: '13px' }}>
                      No partners yet
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog confirm={confirm} setConfirm={setConfirm} />

      {/* Shimmer CSS */}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
const fieldInput = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)', borderRadius: '8px',
  fontSize: '14px', fontFamily: 'var(--body-font)',
  color: 'var(--charcoal)', background: '#fff', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const fe = e => e.target.style.borderColor = 'var(--green)';
const fb = e => e.target.style.borderColor = 'var(--border)';

const actionBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '5px',
  padding: '7px 13px', borderRadius: '7px', fontSize: '12px',
  fontWeight: 500, cursor: 'pointer',
  background: '#fff', color: 'var(--charcoal)',
  border: '1.5px solid var(--border)', fontFamily: 'var(--body-font)',
  transition: 'all 0.2s',
};

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
        {label}
      </label>
      {children}
      {hint && <span style={{ fontSize: '11px', color: '#9aaa9e', display: 'block', marginTop: '4px' }}>{hint}</span>}
    </div>
  );
}
