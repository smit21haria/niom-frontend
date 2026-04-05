import { useState, useEffect, useRef, useCallback } from 'react';
import { getToken } from '../lib/api';

const BASE = import.meta.env.VITE_API_URL || 'https://niom-backend.onrender.com';

// ── Country codes (same as AdminPartners) ─────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+91',  label: 'India' },
  { code: '+1',   label: 'USA / Canada' },
  { code: '+44',  label: 'UK' },
  { code: '+971', label: 'UAE' },
  { code: '+65',  label: 'Singapore' },
  { code: '+61',  label: 'Australia' },
  { code: '+852', label: 'Hong Kong' },
  { code: '+41',  label: 'Switzerland' },
  { code: '+49',  label: 'Germany' },
  { code: '+33',  label: 'France' },
  { code: '+81',  label: 'Japan' },
  { code: '+82',  label: 'South Korea' },
  { code: '+86',  label: 'China' },
  { code: '+60',  label: 'Malaysia' },
  { code: '+66',  label: 'Thailand' },
  { code: '+62',  label: 'Indonesia' },
  { code: '+63',  label: 'Philippines' },
  { code: '+84',  label: 'Vietnam' },
  { code: '+94',  label: 'Sri Lanka' },
  { code: '+92',  label: 'Pakistan' },
  { code: '+880', label: 'Bangladesh' },
  { code: '+977', label: 'Nepal' },
  { code: '+64',  label: 'New Zealand' },
  { code: '+27',  label: 'South Africa' },
  { code: '+234', label: 'Nigeria' },
  { code: '+254', label: 'Kenya' },
  { code: '+20',  label: 'Egypt' },
  { code: '+212', label: 'Morocco' },
  { code: '+966', label: 'Saudi Arabia' },
  { code: '+974', label: 'Qatar' },
  { code: '+973', label: 'Bahrain' },
  { code: '+968', label: 'Oman' },
  { code: '+965', label: 'Kuwait' },
  { code: '+972', label: 'Israel' },
  { code: '+90',  label: 'Turkey' },
  { code: '+7',   label: 'Russia' },
  { code: '+48',  label: 'Poland' },
  { code: '+31',  label: 'Netherlands' },
  { code: '+32',  label: 'Belgium' },
  { code: '+34',  label: 'Spain' },
  { code: '+39',  label: 'Italy' },
  { code: '+351', label: 'Portugal' },
  { code: '+46',  label: 'Sweden' },
  { code: '+47',  label: 'Norway' },
  { code: '+45',  label: 'Denmark' },
  { code: '+353', label: 'Ireland' },
  { code: '+43',  label: 'Austria' },
  { code: '+55',  label: 'Brazil' },
  { code: '+54',  label: 'Argentina' },
  { code: '+52',  label: 'Mexico' },
  { code: '+57',  label: 'Colombia' },
  { code: '+56',  label: 'Chile' },
  { code: '+51',  label: 'Peru' },
  { code: '+30',  label: 'Greece' },
  { code: '+36',  label: 'Hungary' },
  { code: '+420', label: 'Czech Republic' },
  { code: '+358', label: 'Finland' },
  { code: '+1345',label: 'Cayman Islands' },
  { code: '+1284',label: 'British Virgin Islands' },
];

function ccFmt(code) {
  const found = COUNTRY_CODES.find(c => c.code === code);
  return found ? `${found.code} (${found.label})` : code;
}

// ── Services (same as AdminPartners) ─────────────────────────────────────────
const SERVICES = [
  { label: 'Mutual Funds',         icon: '📈' },
  { label: 'SIP Planning',         icon: '📊' },
  { label: 'Goal-Based Investing',  icon: '🎯' },
  { label: 'Tax Saving (ELSS)',     icon: '🛡' },
  { label: 'Retirement Planning',   icon: '☂' },
  { label: "Children's Education",  icon: '🎓' },
  { label: 'NRI Investments',       icon: '🌐' },
];

// ── Shared style tokens ───────────────────────────────────────────────────────
const tabLabel = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--gold)',
  fontWeight: 600,
};

const fieldInput = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)', borderRadius: '8px',
  fontSize: '14px', fontFamily: 'var(--body-font)',
  color: 'var(--charcoal)', background: '#fff', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const disabledInput = {
  ...fieldInput,
  background: 'var(--sage)',
  color: '#8a9e96',
  border: '1.5px solid rgba(44,74,62,0.08)',
  cursor: 'default',
};

const fe = e => (e.target.style.borderColor = 'var(--green)');
const fb = e => (e.target.style.borderColor = 'var(--border)');

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

// ── CCPicker (same as AdminPartners — searchable, supports disabled) ──────────
function CCPicker({ value, onChange, disabled = false }) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [filtered, setFiltered] = useState(COUNTRY_CODES);
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false); setQuery(''); setFiltered(COUNTRY_CODES);
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
      ? COUNTRY_CODES.filter(c => c.code.replace('+','').startsWith(n) || c.label.toLowerCase().includes(n))
      : COUNTRY_CODES
    );
  };

  const select = (cc) => {
    onChange(cc.code);
    setQuery(''); setFiltered(COUNTRY_CODES); setOpen(false);
  };

  const displayValue = open ? query : ccFmt(value);

  return (
    <div ref={ref} style={{ position: 'relative', width: '160px', flexShrink: 0 }}>
      <input
        value={displayValue}
        onChange={handleInput}
        onFocus={() => { if (!disabled) { setOpen(true); setQuery(''); } }}
        disabled={disabled}
        placeholder={ccFmt(value)}
        style={{
          width: '100%', padding: '10px 12px',
          border: `1.5px solid ${disabled ? 'rgba(44,74,62,0.08)' : 'var(--border)'}`,
          borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--body-font)',
          color: disabled ? '#8a9e96' : 'var(--charcoal)',
          background: disabled ? 'var(--sage)' : '#fff',
          outline: 'none', cursor: disabled ? 'default' : 'text',
          boxSizing: 'border-box', opacity: disabled ? 0.7 : 1,
        }}
        onFocus={e => { if (!disabled) { e.target.style.borderColor = 'var(--green)'; setOpen(true); setQuery(''); } }}
        onBlur={e => (e.target.style.borderColor = disabled ? 'rgba(44,74,62,0.08)' : 'var(--border)')}
      />
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300,
          background: '#fff', borderRadius: '8px', marginTop: '4px',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 24px rgba(44,74,62,0.12)',
          maxHeight: '200px', overflowY: 'auto',
        }}>
          {filtered.length === 0
            ? <div style={{ padding: '12px 14px', fontSize: '12px', color: '#9aaa9e' }}>No match</div>
            : filtered.map(cc => (
              <div key={cc.code + cc.label} onMouseDown={() => select(cc)} style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: '13px',
                color: cc.code === value ? 'var(--green)' : 'var(--charcoal)',
                fontWeight: cc.code === value ? 600 : 400,
                background: cc.code === value ? 'rgba(44,74,62,0.06)' : '#fff',
              }}
                onMouseEnter={e => { if (cc.code !== value) e.currentTarget.style.background = 'var(--sage)'; }}
                onMouseLeave={e => { if (cc.code !== value) e.currentTarget.style.background = cc.code === value ? 'rgba(44,74,62,0.06)' : '#fff'; }}
              >
                {cc.code} ({cc.label})
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}

// ── API helper ────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PartnerProfile() {
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState(null);
  const [data,     setData]     = useState(null);

  const [form, setForm] = useState({
    fname: '', lname: '', arn: '',
    tagline: '', bio: '',
    callCC: '+91', callNumber: '',
    waCC: '+91', waNumber: '',
    sameNumber: false,
    services: [],
    email: '', password: '',
    photoFile: null, photoPreview: null,
    logoFile: null,  logoPreview: null,
  });

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

  const populateForm = useCallback((p) => {
    setForm({
      fname:      p.fname       || '',
      lname:      p.lname       || '',
      arn:        p.arn         || '',
      tagline:    p.tagline     || '',
      bio:        p.bio         || '',
      callCC:     p.call_cc     || '+91',
      callNumber: p.call_number || '',
      waCC:       p.wa_cc       || '+91',
      waNumber:   p.wa_number   || '',
      sameNumber: false,
      services:   Array.isArray(p.services) ? p.services : [],
      email:      p.email       || '',
      password:   '',
      photoFile:  null, photoPreview: p.photo_url ? `${BASE}${p.photo_url}` : null,
      logoFile:   null, logoPreview:  p.logo_url  ? `${BASE}${p.logo_url}`  : null,
    });
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const p = await apiFetch('/api/partners/me');
        setData(p);
        populateForm(p);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [populateForm]);

  const handleEdit = () => {
    populateForm(data);
    setEditing(true); setSaved(false); setError(null);
  };

  const handleCancel = () => {
    populateForm(data);
    setEditing(false); setError(null);
  };

  const handleSave = async () => {
    if (!form.fname.trim() || !form.lname.trim()) { setError('First and last name are required.'); return; }
    if (form.services.length !== 3)                { setError('Please select exactly 3 areas of focus.'); return; }
    if (!form.callNumber.trim())                   { setError('Call number is required.'); return; }

    setSaving(true); setError(null);
    try {
      let photo_url = null, logo_url = null;

      if (form.photoFile) {
        const fd = new FormData(); fd.append('photo', form.photoFile);
        const r = await apiFetch('/api/upload/photo', { method: 'POST', body: fd });
        photo_url = r.url;
      }
      if (form.logoFile) {
        const fd = new FormData(); fd.append('logo', form.logoFile);
        const r = await apiFetch('/api/upload/logo', { method: 'POST', body: fd });
        logo_url = r.url;
      }

      const payload = {
        fname:       form.fname.trim(),
        lname:       form.lname.trim(),
        arn:         form.arn.trim()        || null,
        tagline:     form.tagline.trim(),
        bio:         form.bio.trim(),
        call_cc:     form.callCC,
        call_number: form.callNumber.trim(),
        wa_cc:       form.sameNumber ? form.callCC     : form.waCC,
        wa_number:   form.sameNumber ? form.callNumber : form.waNumber.trim(),
        services:    form.services,
        email:       form.email.trim()      || null,
      };
      if (form.password)  payload.password  = form.password;
      if (photo_url)      payload.photo_url = photo_url;
      if (logo_url)       payload.logo_url  = logo_url;

      const updated = await apiFetch(`/api/partners/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      setData(updated);
      populateForm(updated);
      setEditing(false); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // In view mode, use data; in edit mode, use form
  const isView = !editing;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)' }}>Loading profile...</div>
    </div>
  );

  if (error && !data) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#c05050', fontSize: '14px' }}>{error}</div>
  );

  return (
    <div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* Page header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
            Partner Profile
          </h1>
          <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '4px' }}>
            Your profile appears on your public microsite
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
          {saved && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓ Saved successfully</span>}
          {!editing && (
            <button onClick={handleEdit} style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--body-font)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
            >Edit</button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(192,80,80,0.08)', color: '#c05050', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* ── Form card — same structure as AdminPartners onboard ── */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>

        {/* Basic Information */}
        <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ ...tabLabel, marginBottom: '20px' }}>Basic Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="First Name">
              <input value={editing ? form.fname : data?.fname || ''} onChange={e => updateForm('fname', e.target.value)}
                disabled={isView} style={isView ? disabledInput : fieldInput} onFocus={fe} onBlur={fb} placeholder="Arjun" />
            </Field>
            <Field label="Last Name">
              <input value={editing ? form.lname : data?.lname || ''} onChange={e => updateForm('lname', e.target.value)}
                disabled={isView} style={isView ? disabledInput : fieldInput} onFocus={fe} onBlur={fb} placeholder="Mehta" />
            </Field>
            <Field label="ARN Number">
              <input value={editing ? form.arn : data?.arn || ''} onChange={e => updateForm('arn', e.target.value)}
                disabled={isView} style={isView ? disabledInput : fieldInput} onFocus={fe} onBlur={fb} placeholder="ARN-XXXXXX" />
            </Field>
            <Field label="Microsite URL">
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={data?.slug ? `niomfintech.in/${data.slug}` : ''} disabled style={{ ...disabledInput, flex: 1 }} />
                {data?.slug && (
                  <a href={`${BASE}/${data.slug}`} target="_blank" rel="noreferrer"
                    style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--sage)', color: 'var(--green)', fontSize: '12px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', border: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
                    Preview ↗
                  </a>
                )}
              </div>
            </Field>
          </div>
        </div>

        {/* Profile */}
        <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ ...tabLabel, marginBottom: '20px' }}>Profile</div>

          {/* Photo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500, display: 'block', marginBottom: '10px' }}>Profile Photo</label>
            {editing ? (
              <div onClick={() => photoInputRef.current?.click()}
                style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--gold)', overflow: 'hidden', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {form.photoPreview ? <img src={form.photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '24px' }}>👤</span>}
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: 'var(--green)', fontWeight: 500, marginBottom: '4px' }}>Click to upload photo</p>
                  <span style={{ fontSize: '12px', color: '#9aaa9e' }}>JPG or PNG, square preferred. Max 5MB.</span>
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files[0]; if (f) { updateForm('photoFile', f); updateForm('photoPreview', URL.createObjectURL(f)); } }} />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--gold)', overflow: 'hidden', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {data?.photo_url ? <img src={`${BASE}${data.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '24px' }}>👤</span>}
                </div>
                <span style={{ fontSize: '13px', color: '#9aaa9e' }}>{data?.photo_url ? 'Photo uploaded' : 'No photo uploaded'}</span>
              </div>
            )}
          </div>

          {/* Tagline */}
          <Field label={editing ? `Tagline (${form.tagline.length}/80)` : 'Tagline'}>
            <input value={editing ? form.tagline : data?.tagline || ''} onChange={e => updateForm('tagline', e.target.value.slice(0, 80))}
              disabled={isView} style={isView ? disabledInput : fieldInput} onFocus={fe} onBlur={fb}
              placeholder="Helping families invest with clarity and confidence" />
          </Field>

          {/* Bio */}
          <Field label={editing ? `Bio (${form.bio.length}/300)` : 'Bio'}>
            <textarea value={editing ? form.bio : data?.bio || ''} onChange={e => updateForm('bio', e.target.value.slice(0, 300))}
              disabled={isView} rows={4}
              style={{ ...(isView ? disabledInput : fieldInput), resize: 'vertical' }}
              onFocus={fe} onBlur={fb}
              placeholder="Write a short bio..." />
          </Field>

          {/* Logo */}
          <div style={{ marginTop: '8px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500, display: 'block', marginBottom: '10px' }}>Partner Logo</label>
            {editing ? (
              <div onClick={() => logoInputRef.current?.click()}
                style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: '56px', height: '56px', borderRadius: '8px', border: '1.5px solid var(--border)', overflow: 'hidden', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {form.logoPreview ? <img src={form.logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '20px' }}>🖼</span>}
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: 'var(--green)', fontWeight: 500, marginBottom: '4px' }}>Click to upload logo</p>
                  <span style={{ fontSize: '12px', color: '#9aaa9e' }}>PNG with transparent background preferred. Max 5MB.</span>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files[0]; if (f) { updateForm('logoFile', f); updateForm('logoPreview', URL.createObjectURL(f)); } }} />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '120px', height: '56px', borderRadius: '8px', border: '1.5px solid rgba(44,74,62,0.08)', background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {data?.logo_url ? <img src={`${BASE}${data.logo_url}`} alt="" style={{ maxWidth: '110px', maxHeight: '48px', objectFit: 'contain' }} /> : <span style={{ fontSize: '11px', color: '#9aaa9e' }}>No logo</span>}
                </div>
                <span style={{ fontSize: '13px', color: '#9aaa9e' }}>{data?.logo_url ? 'Logo uploaded' : 'No logo uploaded'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ ...tabLabel, marginBottom: '20px' }}>Contact Details</div>

          <Field label="Call Number">
            <div style={{ display: 'flex', gap: '8px' }}>
              <CCPicker value={editing ? form.callCC : data?.call_cc || '+91'} onChange={v => { updateForm('callCC', v); if (form.sameNumber) updateForm('waCC', v); }} disabled={isView} />
              <input value={editing ? form.callNumber : data?.call_number || ''} onChange={e => { const v = e.target.value.replace(/\D/g,'').slice(0,10); updateForm('callNumber', v); if (form.sameNumber) updateForm('waNumber', v); }}
                disabled={isView} placeholder="9876543210" maxLength={10} inputMode="numeric"
                style={{ ...(isView ? disabledInput : fieldInput), flex: 1 }} onFocus={fe} onBlur={fb} />
            </div>
          </Field>

          {editing && (
            <div style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="sameNum" checked={form.sameNumber} onChange={e => {
                const c = e.target.checked;
                updateForm('sameNumber', c);
                if (c) { updateForm('waCC', form.callCC); updateForm('waNumber', form.callNumber); }
              }} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--green)' }} />
              <label htmlFor="sameNum" style={{ fontSize: '13px', color: '#5a6a64', cursor: 'pointer' }}>
                WhatsApp number is the same as call number
              </label>
            </div>
          )}

          <Field label="WhatsApp Number">
            <div style={{ display: 'flex', gap: '8px' }}>
              <CCPicker
                value={editing ? (form.sameNumber ? form.callCC : form.waCC) : data?.wa_cc || '+91'}
                onChange={v => updateForm('waCC', v)}
                disabled={isView || form.sameNumber}
              />
              <input
                value={editing ? (form.sameNumber ? form.callNumber : form.waNumber) : data?.wa_number || ''}
                onChange={e => updateForm('waNumber', e.target.value.replace(/\D/g,'').slice(0,10))}
                disabled={isView || form.sameNumber}
                placeholder="9876543210" maxLength={10} inputMode="numeric"
                style={{ ...(isView || form.sameNumber ? disabledInput : fieldInput), flex: 1,
                  opacity: form.sameNumber ? 0.6 : 1 }}
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
            <span style={{ fontSize: '12px', color: '#9aaa9e', marginLeft: 'auto' }}>
              {editing ? `${form.services.length} of 3 selected` : `${(data?.services || []).length} selected`}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {SERVICES.map(s => {
              const activeServices = editing ? form.services : (data?.services || []);
              const sel = activeServices.includes(s.label);
              const dis = !sel && editing && form.services.length >= 3;
              return (
                <div key={s.label}
                  onClick={() => editing && !dis && toggleService(s.label)}
                  style={{
                    border: `1.5px solid ${sel ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: '10px', padding: '14px 12px',
                    cursor: editing && !dis ? 'pointer' : 'default',
                    textAlign: 'center', fontSize: '13px',
                    fontWeight: sel ? 500 : 400,
                    color: sel ? 'var(--green)' : dis ? '#bbb' : (isView ? '#8a9e96' : '#5a6a64'),
                    background: sel ? 'rgba(44,74,62,0.07)' : (isView ? 'var(--sage)' : 'var(--ivory)'),
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    opacity: dis ? 0.4 : 1, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (editing && !dis && !sel) { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}}
                  onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = dis ? '#bbb' : (isView ? '#8a9e96' : '#5a6a64'); }}}
                >
                  <span style={{ fontSize: '20px' }}>{s.icon}</span>
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Login Credentials */}
        <div style={{ padding: '28px 32px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ ...tabLabel, marginBottom: '20px' }}>Login Credentials</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Email">
              <input value={editing ? form.email : data?.email || ''} onChange={e => updateForm('email', e.target.value)}
                type="email" disabled={isView} style={isView ? disabledInput : fieldInput} onFocus={fe} onBlur={fb}
                placeholder="partner@email.com" />
            </Field>
            <Field label={editing ? 'New Password (leave blank to keep current)' : 'Password'}>
              <input value={editing ? form.password : '••••••••'} onChange={e => updateForm('password', e.target.value)}
                type={isView ? 'text' : 'password'} disabled={isView}
                style={isView ? disabledInput : fieldInput} onFocus={fe} onBlur={fb}
                placeholder="Leave blank to keep current" />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', color: '#9aaa9e' }}>
            {editing ? 'Changes will update your micro-site page.' : 'Your profile is live on your microsite.'}
          </span>
          {editing && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCancel} style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', color: '#8a9e96', border: '1.5px solid var(--border)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--body-font)' }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: '10px 24px', borderRadius: '8px', background: saving ? '#9aaa9e' : 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: saving ? 'default' : 'pointer', fontFamily: 'var(--body-font)' }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--gold)'; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--green)'; }}
              >{saving ? 'Saving...' : 'Save Changes →'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
