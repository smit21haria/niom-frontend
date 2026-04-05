import { useState, useEffect, useRef, useCallback } from 'react';
import { getToken } from '../lib/api';

const BASE = import.meta.env.VITE_API_URL || 'https://niom-backend.onrender.com';

const SERVICES = [
  { label: 'Mutual Funds',         icon: '📈' },
  { label: 'SIP Planning',         icon: '📊' },
  { label: 'Goal-Based Investing',  icon: '🎯' },
  { label: 'Tax Saving (ELSS)',     icon: '🛡' },
  { label: 'Retirement Planning',   icon: '☂' },
  { label: "Children's Education",  icon: '🎓' },
  { label: 'NRI Investments',       icon: '🌐' },
];

const sectionHead = {
  fontFamily: 'var(--display-font)',
  fontSize: '20px',
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

function Label({ children }) {
  return (
    <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>{children}</div>
  );
}

function inputStyle(disabled) {
  return {
    width: '100%', padding: '10px 14px',
    border: `1.5px solid ${disabled ? 'rgba(44,74,62,0.08)' : 'var(--border)'}`,
    borderRadius: '8px', fontSize: '14px', fontFamily: 'var(--body-font)',
    color: disabled ? '#8a9e96' : 'var(--charcoal)',
    background: disabled ? 'var(--sage)' : '#fff',
    outline: 'none', boxSizing: 'border-box',
    cursor: disabled ? 'default' : 'text',
    transition: 'border-color 0.2s',
  };
}

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
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function SkeletonField() {
  return (
    <div style={{
      height: '42px', borderRadius: '8px',
      background: 'linear-gradient(90deg, var(--sage) 25%, #e8ede8 50%, var(--sage) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

export default function PartnerProfile() {
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [saving,  setSaving]      = useState(false);
  const [saved,   setSaved]       = useState(false);
  const [error,   setError]       = useState(null);

  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    fname: '', lname: '', arn: '', tagline: '', bio: '',
    callCC: '+91', callNumber: '',
    waCC: '+91', waNumber: '',
    sameNumber: false,
    services: [],
    email: '',
  });

  // Photo + logo
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [logoFile,     setLogoFile]     = useState(null);
  const [logoPreview,  setLogoPreview]  = useState(null);
  const photoInputRef = useRef(null);
  const logoInputRef  = useRef(null);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
    });
  }, []);

  // Load own profile on mount
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
    setPhotoFile(null); setPhotoPreview(null);
    setLogoFile(null);  setLogoPreview(null);
    setEditing(true); setSaved(false); setError(null);
  };

  const handleCancel = () => {
    setEditing(false); setError(null);
    setPhotoFile(null); setPhotoPreview(null);
    setLogoFile(null);  setLogoPreview(null);
  };

  const handleSave = async () => {
    if (!form.fname.trim() || !form.lname.trim()) {
      setError('First and last name are required.'); return;
    }
    if (form.services.length !== 3) {
      setError('Please select exactly 3 areas of focus.'); return;
    }
    if (!form.callNumber.trim()) {
      setError('Call number is required.'); return;
    }

    setSaving(true); setError(null);
    try {
      let photo_url = null, logo_url = null;

      if (photoFile) {
        const fd = new FormData();
        fd.append('photo', photoFile);
        const r = await apiFetch('/api/upload/photo', { method: 'POST', body: fd });
        photo_url = r.url;
      }
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
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
        wa_cc:       form.sameNumber ? form.callCC    : form.waCC,
        wa_number:   form.sameNumber ? form.callNumber : form.waNumber.trim(),
        services:    form.services,
        email:       form.email.trim()      || null,
      };
      if (photo_url) payload.photo_url = photo_url;
      if (logo_url)  payload.logo_url  = logo_url;

      const updated = await apiFetch(`/api/partners/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      setData(updated);
      populateForm(updated);
      setEditing(false);
      setSaved(true);
      setPhotoFile(null); setPhotoPreview(null);
      setLogoFile(null);  setLogoPreview(null);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const photoSrc = photoPreview || (data?.photo_url ? `${BASE}${data.photo_url}` : null);
  const logoSrc  = logoPreview  || (data?.logo_url  ? `${BASE}${data.logo_url}`  : null);

  const fe = (e) => { if (editing) e.target.style.borderColor = 'var(--green)'; };
  const fb = (e) => { e.target.style.borderColor = editing ? 'var(--border)' : 'rgba(44,74,62,0.08)'; };

  return (
    <div>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Partner Profile
        </h1>
        <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '4px' }}>
          Your profile appears on your public microsite
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(192,80,80,0.08)', color: '#c05050', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* ── Basic Info ── */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={sectionHead}>Basic Information</span>
          {!editing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {saved && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓ Saved successfully</span>}
              <button
                onClick={handleEdit}
                style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
              >Edit</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '8px 20px', borderRadius: '8px', background: saving ? '#9aaa9e' : 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: saving ? 'default' : 'pointer' }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--gold)'; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--green)'; }}
              >{saving ? 'Saving…' : 'Save Changes'}</button>
              <button
                onClick={handleCancel}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', color: '#8a9e96', border: '1.5px solid var(--border)', fontSize: '13px', cursor: 'pointer' }}
              >Cancel</button>
            </div>
          )}
        </div>

        <div style={{ padding: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <Label>First Name</Label>
              {loading ? <SkeletonField /> : <input value={editing ? form.fname : data?.fname || ''} onChange={e => update('fname', e.target.value)} disabled={!editing} style={inputStyle(!editing)} onFocus={fe} onBlur={fb} />}
            </div>
            <div>
              <Label>Last Name</Label>
              {loading ? <SkeletonField /> : <input value={editing ? form.lname : data?.lname || ''} onChange={e => update('lname', e.target.value)} disabled={!editing} style={inputStyle(!editing)} onFocus={fe} onBlur={fb} />}
            </div>
            <div>
              <Label>ARN Number</Label>
              {loading ? <SkeletonField /> : <input value={editing ? form.arn : data?.arn || ''} onChange={e => update('arn', e.target.value)} disabled={!editing} style={inputStyle(!editing)} onFocus={fe} onBlur={fb} placeholder="ARN-XXXXXX" />}
            </div>
            <div>
              <Label>Email (Login)</Label>
              {loading ? <SkeletonField /> : <input value={editing ? form.email : data?.email || ''} onChange={e => update('email', e.target.value)} disabled={!editing} style={inputStyle(!editing)} onFocus={fe} onBlur={fb} type="email" />}
            </div>
            <div>
              <Label>Microsite URL</Label>
              {loading ? <SkeletonField /> : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input value={data?.slug ? `niomfintech.in/${data.slug}` : ''} disabled style={{ ...inputStyle(true), flex: 1 }} />
                  {data?.slug && (
                    <a href={`${BASE}/${data.slug}`} target="_blank" rel="noreferrer"
                      style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--sage)', color: 'var(--green)', fontSize: '12px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>
                      Preview ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tagline */}
          <div style={{ marginBottom: '20px' }}>
            <Label>Tagline</Label>
            {loading ? <SkeletonField /> : <input value={editing ? form.tagline : data?.tagline || ''} onChange={e => update('tagline', e.target.value)} disabled={!editing} style={inputStyle(!editing)} onFocus={fe} onBlur={fb} placeholder="Helping families invest with clarity and confidence" maxLength={80} />}
          </div>

          {/* Bio */}
          <div>
            <Label>Bio</Label>
            {loading ? (
              <div style={{ height: '100px', borderRadius: '8px', background: 'linear-gradient(90deg, var(--sage) 25%, #e8ede8 50%, var(--sage) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
            ) : (
              <textarea
                value={editing ? form.bio : data?.bio || ''}
                onChange={e => update('bio', e.target.value)}
                disabled={!editing}
                rows={4}
                maxLength={300}
                style={{ ...inputStyle(!editing), resize: 'vertical', minHeight: '100px' }}
                onFocus={fe} onBlur={fb}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Contact Details ── */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <span style={sectionHead}>Contact Details</span>
        </div>
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Call number */}
          <div>
            <Label>Call Number</Label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={editing ? form.callCC : data?.call_cc || '+91'}
                onChange={e => { update('callCC', e.target.value); if (form.sameNumber) update('waCC', e.target.value); }}
                disabled={!editing}
                style={{ ...inputStyle(!editing), width: '80px', flexShrink: 0 }}
                onFocus={fe} onBlur={fb}
              />
              <input
                value={editing ? form.callNumber : data?.call_number || ''}
                onChange={e => { const v = e.target.value.replace(/\D/g,'').slice(0,10); update('callNumber', v); if (form.sameNumber) update('waNumber', v); }}
                disabled={!editing}
                style={{ ...inputStyle(!editing), flex: 1 }}
                placeholder="9876543210"
                onFocus={fe} onBlur={fb}
              />
            </div>
          </div>

          {/* Same number checkbox */}
          {editing && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#5a6a64' }}>
              <input
                type="checkbox"
                checked={form.sameNumber}
                onChange={e => {
                  const c = e.target.checked;
                  setForm(f => ({ ...f, sameNumber: c, waCC: c ? f.callCC : f.waCC, waNumber: c ? f.callNumber : f.waNumber }));
                }}
                style={{ width: '16px', height: '16px', accentColor: 'var(--green)', cursor: 'pointer' }}
              />
              WhatsApp number is the same as call number
            </label>
          )}

          {/* WhatsApp number */}
          <div>
            <Label>WhatsApp Number</Label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={editing ? (form.sameNumber ? form.callCC : form.waCC) : data?.wa_cc || '+91'}
                onChange={e => update('waCC', e.target.value)}
                disabled={!editing || form.sameNumber}
                style={{ ...inputStyle(!editing || form.sameNumber), width: '80px', flexShrink: 0 }}
                onFocus={fe} onBlur={fb}
              />
              <input
                value={editing ? (form.sameNumber ? form.callNumber : form.waNumber) : data?.wa_number || ''}
                onChange={e => update('waNumber', e.target.value.replace(/\D/g,'').slice(0,10))}
                disabled={!editing || form.sameNumber}
                style={{ ...inputStyle(!editing || form.sameNumber), flex: 1 }}
                placeholder="9876543210"
                onFocus={fe} onBlur={fb}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Areas of Focus ── */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={sectionHead}>Areas of Focus</span>
          <span style={{ fontSize: '12px', color: '#9aaa9e' }}>Pick exactly 3</span>
          {!loading && (
            <span style={{ fontSize: '12px', color: editing ? (form.services.length === 3 ? 'var(--green)' : 'var(--gold)') : '#9aaa9e', marginLeft: 'auto' }}>
              {editing ? `${form.services.length} of 3 selected` : `${(data?.services || []).length} selected`}
            </span>
          )}
        </div>
        <div style={{ padding: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {SERVICES.map(s => {
              const active = editing ? form.services.includes(s.label) : (data?.services || []).includes(s.label);
              const disabled = !editing || (!active && form.services.length >= 3);
              return (
                <div
                  key={s.label}
                  onClick={() => editing && !disabled && toggleService(s.label)}
                  style={{
                    padding: '16px 12px', borderRadius: '10px', textAlign: 'center',
                    border: `1.5px solid ${active ? 'var(--green)' : 'var(--border)'}`,
                    background: active ? 'rgba(44,74,62,0.07)' : 'var(--ivory)',
                    color: active ? 'var(--green)' : '#5a6a64',
                    fontSize: '13px', fontWeight: active ? 500 : 400,
                    cursor: editing && !disabled ? 'pointer' : 'default',
                    opacity: disabled ? 0.4 : 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{s.icon}</span>
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Photo & Logo ── */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <span style={sectionHead}>Photo & Logo</span>
        </div>
        <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
          {/* Profile Photo */}
          <div>
            <Label>Profile Photo</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2px solid var(--gold)', background: 'var(--sage)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photoSrc ? (
                  <img src={photoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '24px', color: '#9aaa9e' }}>👤</span>
                )}
              </div>
              {editing && (
                <div>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--sage)', color: 'var(--green)', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    {photoSrc ? 'Replace Photo' : 'Upload Photo'}
                  </button>
                  <div style={{ fontSize: '11px', color: '#9aaa9e', marginTop: '6px' }}>JPG or PNG, square preferred</div>
                  <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files[0]; if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} />
                </div>
              )}
            </div>
          </div>

          {/* Logo */}
          <div>
            <Label>Firm Logo</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '120px', height: '60px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'var(--sage)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {logoSrc ? (
                  <img src={logoSrc} alt="" style={{ maxWidth: '110px', maxHeight: '52px', objectFit: 'contain' }} />
                ) : (
                  <span style={{ fontSize: '11px', color: '#9aaa9e' }}>No logo</span>
                )}
              </div>
              {editing && (
                <div>
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: 'var(--sage)', color: 'var(--green)', border: '1px solid var(--border)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    {logoSrc ? 'Replace Logo' : 'Upload Logo'}
                  </button>
                  <div style={{ fontSize: '11px', color: '#9aaa9e', marginTop: '6px' }}>PNG with transparent bg preferred</div>
                  <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
