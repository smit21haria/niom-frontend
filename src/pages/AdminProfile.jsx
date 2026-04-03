import { useState, useEffect, useRef } from 'react';
import { getToken } from '../lib/api';

const BASE = import.meta.env.VITE_API_URL || 'https://niom-backend.onrender.com';

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

const inputStyle = (disabled) => ({
  width: '100%', padding: '10px 14px',
  border: `1.5px solid ${disabled ? 'rgba(44,74,62,0.08)' : 'var(--border)'}`,
  borderRadius: '8px',
  fontSize: '14px', fontFamily: 'var(--body-font)',
  color: disabled ? '#9aaa9e' : 'var(--charcoal)',
  background: disabled ? 'var(--sage)' : '#fff',
  outline: 'none',
  cursor: disabled ? 'default' : 'text',
  boxSizing: 'border-box',
  transition: 'all 0.2s',
});

function Label({ children }) {
  return <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>{children}</div>;
}

function SkeletonField() {
  return (
    <div style={{
      height: '42px', borderRadius: '8px',
      background: 'linear-gradient(90deg, var(--sage) 25%, #e8eeec 50%, var(--sage) 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export default function AdminProfile() {
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const [error,   setError]     = useState(null);

  // Persisted data from backend
  const [data, setData] = useState({
    firm_name: '', arn: '', email: '', phone: '',
    website: '', amfi_reg: '', address: '', logo_url: '',
  });

  // Editable form state (copy of data while editing)
  const [form, setForm] = useState({ ...data });

  // Logo upload
  const [logoFile,    setLogoFile]    = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Load profile on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const profile = await apiFetch('/api/admin/profile');
        setData(profile);
        setForm(profile);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleEdit = () => {
    setForm({ ...data }); // reset form to current data
    setLogoFile(null);
    setLogoPreview(null);
    setEditing(true);
    setSaved(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setLogoFile(null);
    setLogoPreview(null);
    setError(null);
  };

  const handleLogoChange = (file) => {
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Save text fields
      const updated = await apiFetch('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify({
          firm_name: form.firm_name,
          arn:       form.arn,
          email:     form.email,
          phone:     form.phone,
          website:   form.website,
          amfi_reg:  form.amfi_reg,
          address:   form.address,
        }),
      });

      // Upload logo if changed
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        const logoRes = await apiFetch('/api/admin/profile/logo', { method: 'POST', body: fd });
        updated.logo_url = logoRes.logo_url;
      }

      setData(updated);
      setForm(updated);
      setEditing(false);
      setSaved(true);
      setLogoFile(null);
      setLogoPreview(null);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const logoSrc = logoPreview || (data.logo_url ? `${BASE}${data.logo_url}` : null);

  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Admin Profile
        </h1>
      </div>

      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        {/* Section header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <span style={sectionHead}>Firm Details</span>
        </div>

        <div style={{ padding: '28px' }}>
          {error && (
            <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(192,80,80,0.08)', color: '#c05050', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Fields grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
            <div>
              <Label>Firm Name</Label>
              {loading ? <SkeletonField /> : (
                <input
                  value={editing ? form.firm_name : data.firm_name}
                  onChange={e => update('firm_name', e.target.value)}
                  disabled={!editing}
                  style={inputStyle(!editing)}
                  onFocus={e => { if (editing) e.target.style.borderColor = 'var(--green)'; }}
                  onBlur={e => { e.target.style.borderColor = editing ? 'var(--border)' : 'rgba(44,74,62,0.08)'; }}
                />
              )}
            </div>

            <div>
              <Label>Principal ARN</Label>
              {loading ? <SkeletonField /> : (
                <input
                  value={editing ? form.arn : data.arn}
                  onChange={e => update('arn', e.target.value)}
                  disabled={!editing}
                  style={inputStyle(!editing)}
                  onFocus={e => { if (editing) e.target.style.borderColor = 'var(--green)'; }}
                  onBlur={e => { e.target.style.borderColor = editing ? 'var(--border)' : 'rgba(44,74,62,0.08)'; }}
                />
              )}
            </div>

            <div>
              <Label>Email Address</Label>
              {loading ? <SkeletonField /> : (
                <input
                  type="email"
                  value={editing ? form.email : data.email}
                  onChange={e => update('email', e.target.value)}
                  disabled={!editing}
                  style={inputStyle(!editing)}
                  onFocus={e => { if (editing) e.target.style.borderColor = 'var(--green)'; }}
                  onBlur={e => { e.target.style.borderColor = editing ? 'var(--border)' : 'rgba(44,74,62,0.08)'; }}
                />
              )}
            </div>

            <div>
              <Label>Phone Number</Label>
              {loading ? <SkeletonField /> : (
                <input
                  value={editing ? form.phone : data.phone}
                  onChange={e => update('phone', e.target.value)}
                  disabled={!editing}
                  style={inputStyle(!editing)}
                  onFocus={e => { if (editing) e.target.style.borderColor = 'var(--green)'; }}
                  onBlur={e => { e.target.style.borderColor = editing ? 'var(--border)' : 'rgba(44,74,62,0.08)'; }}
                />
              )}
            </div>

            <div>
              <Label>Website</Label>
              {loading ? <SkeletonField /> : (
                <input
                  value={editing ? form.website : data.website}
                  onChange={e => update('website', e.target.value)}
                  disabled={!editing}
                  style={inputStyle(!editing)}
                  onFocus={e => { if (editing) e.target.style.borderColor = 'var(--green)'; }}
                  onBlur={e => { e.target.style.borderColor = editing ? 'var(--border)' : 'rgba(44,74,62,0.08)'; }}
                />
              )}
            </div>

            <div>
              <Label>AMFI Registration No.</Label>
              {loading ? <SkeletonField /> : (
                <input
                  value={editing ? form.amfi_reg : data.amfi_reg}
                  onChange={e => update('amfi_reg', e.target.value)}
                  disabled={!editing}
                  style={inputStyle(!editing)}
                  onFocus={e => { if (editing) e.target.style.borderColor = 'var(--green)'; }}
                  onBlur={e => { e.target.style.borderColor = editing ? 'var(--border)' : 'rgba(44,74,62,0.08)'; }}
                />
              )}
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Address</Label>
              {loading ? <SkeletonField /> : (
                <input
                  value={editing ? form.address : data.address}
                  onChange={e => update('address', e.target.value)}
                  disabled={!editing}
                  style={inputStyle(!editing)}
                  onFocus={e => { if (editing) e.target.style.borderColor = 'var(--green)'; }}
                  onBlur={e => { e.target.style.borderColor = editing ? 'var(--border)' : 'rgba(44,74,62,0.08)'; }}
                />
              )}
            </div>
          </div>

          {/* Firm Logo */}
          <div style={{ marginBottom: '28px' }}>
            <Label>Firm Logo</Label>
            {loading ? <SkeletonField /> : !editing ? (
              // View mode — show logo or placeholder
              logoSrc ? (
                <div style={{
                  border: '1.5px solid rgba(44,74,62,0.08)', borderRadius: '10px',
                  padding: '20px', background: 'var(--sage)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '160px', minHeight: '80px',
                }}>
                  <img src={logoSrc} alt="Firm Logo" style={{ maxHeight: '64px', maxWidth: '240px', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{
                  border: '1.5px solid rgba(44,74,62,0.08)', borderRadius: '10px',
                  padding: '20px', background: 'var(--sage)', textAlign: 'center',
                  fontSize: '13px', color: '#9aaa9e', maxWidth: '320px',
                }}>
                  No logo uploaded
                </div>
              )
            ) : (
              // Edit mode — upload zone
              <div
                style={{
                  border: '2px dashed var(--border)', borderRadius: '10px',
                  padding: '28px 24px', textAlign: 'center', background: 'var(--sage)',
                  cursor: 'pointer', maxWidth: '400px', transition: 'border-color 0.2s',
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--green)'; }}
                onDragLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--border)';
                  handleLogoChange(e.dataTransfer.files[0]);
                }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" style={{ maxHeight: '64px', maxWidth: '240px', objectFit: 'contain', marginBottom: '10px' }} />
                ) : logoSrc ? (
                  <img src={logoSrc} alt="Current logo" style={{ maxHeight: '64px', maxWidth: '240px', objectFit: 'contain', marginBottom: '10px', opacity: 0.6 }} />
                ) : (
                  <div style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '10px' }}>
                    Drag & drop or browse
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#9aaa9e', marginBottom: '12px' }}>
                  {logoPreview ? 'New logo selected — save to apply' : logoSrc ? 'Click to replace logo' : 'PNG, JPG up to 5 MB'}
                </div>
                <div style={{
                  display: 'inline-block', padding: '8px 20px', borderRadius: '8px',
                  background: 'var(--green)', color: 'var(--ivory)',
                  fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em',
                }}>
                  {logoSrc ? 'Replace Logo' : 'Upload Logo'}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleLogoChange(e.target.files[0])}
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!editing ? (
              <>
                <button
                  onClick={handleEdit}
                  style={{
                    padding: '11px 28px', borderRadius: '8px',
                    background: 'var(--green)', color: 'var(--ivory)',
                    border: 'none', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', letterSpacing: '0.06em',
                    fontFamily: 'var(--body-font)', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                >
                  Edit
                </button>
                {saved && (
                  <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>
                    ✓ Saved successfully
                  </span>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '11px 28px', borderRadius: '8px',
                    background: saving ? '#9aaa9e' : 'var(--green)',
                    color: 'var(--ivory)', border: 'none',
                    fontSize: '13px', fontWeight: 500,
                    cursor: saving ? 'default' : 'pointer',
                    letterSpacing: '0.06em', fontFamily: 'var(--body-font)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--gold)'; }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--green)'; }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    padding: '11px 20px', borderRadius: '8px',
                    background: 'transparent', color: '#8a9e96',
                    border: '1.5px solid var(--border)',
                    fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'var(--body-font)',
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
