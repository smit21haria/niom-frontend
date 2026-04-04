import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { investors, partners, families } from '../lib/api';

// ── Styles ────────────────────────────────────────────────────────────────────

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

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'var(--body-font)',
  color: 'var(--charcoal)',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a9e96' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: '32px',
};

const kycBadge = {
  verified: { background: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  pending:  { background: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS  = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

function Label({ children }) {
  return <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>{children}</div>;
}

// ── DOB Picker — three linked dropdowns ──────────────────────────────────────
// value: 'YYYY-MM-DD' or '', onChange: called with 'YYYY-MM-DD' or ''

function DOBPicker({ value, onChange }) {
  const parse = (v) => {
    if (!v) return { d: '', m: '', y: '' };
    const [y, m, d] = v.split('-');
    return { d: d || '', m: m || '', y: y || '' };
  };

  const [parts, setParts] = useState(() => parse(value));

  useEffect(() => { setParts(parse(value)); }, [value]);

  const commit = (next) => {
    if (next.d && next.m && next.y) {
      onChange(`${next.y}-${next.m.padStart(2, '0')}-${next.d.padStart(2, '0')}`);
    } else {
      onChange('');
    }
  };

  const set = (key, val) => {
    const next = { ...parts, [key]: val };
    setParts(next);
    commit(next);
  };

  const fi = (e) => (e.target.style.borderColor = 'var(--green)');
  const fb = (e) => (e.target.style.borderColor = 'var(--border)');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '8px' }}>
      <select value={parts.d} onChange={e => set('d', e.target.value)} style={selectStyle} onFocus={fi} onBlur={fb}>
        <option value="">Day</option>
        {DAYS.map(d => <option key={d} value={String(d).padStart(2, '0')}>{d}</option>)}
      </select>
      <select value={parts.m} onChange={e => set('m', e.target.value)} style={selectStyle} onFocus={fi} onBlur={fb}>
        <option value="">Month</option>
        {MONTHS.map((name, i) => <option key={name} value={String(i + 1).padStart(2, '0')}>{name}</option>)}
      </select>
      <select value={parts.y} onChange={e => set('y', e.target.value)} style={selectStyle} onFocus={fi} onBlur={fb}>
        <option value="">Year</option>
        {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
      </select>
    </div>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  const shimmer = {
    background: 'linear-gradient(90deg, var(--sage) 25%, #e8ede8 50%, var(--sage) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '4px',
    height: '14px',
  };
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {[180, 100, 120, 110, 80, 80, 80].map((w, i) => (
        <td key={i} style={{ padding: '16px 20px' }}><div style={{ ...shimmer, width: w }} /></td>
      ))}
    </tr>
  );
}

const EMPTY_FORM = {
  firstName: '', lastName: '', pan: '', mobile: '',
  email: '', date_of_birth: '', partner_id: '', family_id: '', kyc_status: 'pending',
};

const subSections = ['Investor List', 'Create Investor'];

// ── Edit Drawer ───────────────────────────────────────────────────────────────

function InvestorDrawer({ investor, livePartners, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName:     investor.first_name     || '',
    lastName:      investor.last_name      || '',
    mobile:        investor.mobile         || '',
    email:         investor.email          || '',
    date_of_birth: investor.date_of_birth  ? investor.date_of_birth.split('T')[0] : '',
    partner_id:    investor.partner_id     ? String(investor.partner_id) : '',
    family_id:     investor.family_id      ? String(investor.family_id)  : '',
    kyc_status:    investor.kyc_status     || 'pending',
  });
  const [drawerFamilies, setDrawerFamilies] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); setError(''); };

  useEffect(() => {
    if (!form.partner_id) { setDrawerFamilies([]); return; }
    families.list({ partner_id: form.partner_id, limit: 100 })
      .then(data => setDrawerFamilies(data?.families || []))
      .catch(() => setDrawerFamilies([]));
  }, [form.partner_id]);

  const handlePartnerChange = (v) => {
    setForm(f => ({ ...f, partner_id: v, family_id: '' }));
    setSaved(false); setError('');
  };

  const handleSave = async () => {
    if (!form.firstName.trim()) { setError('First name is required.'); return; }
    setSubmitting(true); setError('');
    try {
      await investors.update(investor.id, {
        first_name:    form.firstName.trim(),
        last_name:     form.lastName.trim()  || null,
        mobile:        form.mobile.trim()    || null,
        email:         form.email.trim()     || null,
        date_of_birth: form.date_of_birth    || null,
        partner_id:    form.partner_id       ? parseInt(form.partner_id) : null,
        family_id:     form.family_id        ? parseInt(form.family_id)  : null,
        kyc_status:    form.kyc_status,
      });
      setSaved(true);
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fi = { onFocus: e => e.target.style.borderColor = 'var(--green)', onBlur: e => e.target.style.borderColor = 'var(--border)' };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,43,37,0.4)', zIndex: 200 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px', background: '#fff', zIndex: 201, overflowY: 'auto', boxShadow: '-8px 0 40px rgba(44,74,62,0.12)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={sectionHead}>Edit Investor</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#8a9e96' }}>✕</button>
        </div>

        <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Label>PAN Number</Label>
            <input value={investor.pan || ''} disabled style={{ ...inputStyle, background: 'var(--sage)', color: '#8a9e96', cursor: 'not-allowed' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div><Label>First Name *</Label><input value={form.firstName} onChange={e => update('firstName', e.target.value)} style={inputStyle} {...fi} /></div>
            <div><Label>Last Name</Label><input value={form.lastName} onChange={e => update('lastName', e.target.value)} style={inputStyle} {...fi} /></div>
          </div>
          <div><Label>Mobile</Label><input value={form.mobile} onChange={e => update('mobile', e.target.value)} style={inputStyle} {...fi} /></div>
          <div><Label>Email</Label><input value={form.email} onChange={e => update('email', e.target.value)} style={inputStyle} {...fi} /></div>
          <div>
            <Label>Date of Birth</Label>
            <DOBPicker value={form.date_of_birth} onChange={v => update('date_of_birth', v)} />
          </div>
          <div>
            <Label>Assign to Partner</Label>
            <select value={form.partner_id} onChange={e => handlePartnerChange(e.target.value)} style={selectStyle} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
              <option value="">— No partner</option>
              {livePartners.map(p => <option key={p.id} value={String(p.id)}>{p.fname} {p.lname}</option>)}
            </select>
          </div>
          <div>
            <Label>Assign to Family</Label>
            <select value={form.family_id} onChange={e => update('family_id', e.target.value)} disabled={!form.partner_id}
              style={{ ...selectStyle, cursor: form.partner_id ? 'pointer' : 'not-allowed', background: form.partner_id ? '#fff' : 'var(--sage)', color: form.partner_id ? 'var(--charcoal)' : '#8a9e96' }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
              <option value="">— No family</option>
              {drawerFamilies.map(f => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <Label>KYC Status</Label>
            <select value={form.kyc_status} onChange={e => update('kyc_status', e.target.value)} style={selectStyle} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
            </select>
          </div>
          {error && <div style={{ fontSize: '13px', color: '#c0392b', padding: '10px 14px', background: 'rgba(192,57,43,0.06)', borderRadius: '8px' }}>{error}</div>}
        </div>

        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={handleSave} disabled={submitting}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--gold)'; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'var(--green)'; }}>
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={onClose} style={{ padding: '12px 20px', borderRadius: '8px', background: 'transparent', color: '#8a9e96', border: '1.5px solid var(--border)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
          {saved && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓ Saved</span>}
        </div>
      </div>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminInvestors() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Investor List');
  const [investorList, setInvestorList]   = useState([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [kycFilter, setKycFilter]         = useState('');
  const [editingInvestor, setEditingInvestor] = useState(null);
  const [livePartners, setLivePartners]   = useState([]);
  const [form, setForm]                   = useState({ ...EMPTY_FORM });
  const [createFamilies, setCreateFamilies] = useState([]);
  const [submitting, setSubmitting]       = useState(false);
  const [createError, setCreateError]     = useState('');
  const [successMsg, setSuccessMsg]       = useState('');

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setCreateError(''); };

  useEffect(() => {
    partners.list().then(data => {
      const all = Array.isArray(data) ? data : [];
      setLivePartners(all.filter(p => p.status === 'live'));
    }).catch(() => {});
  }, []);

  const loadInvestors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await investors.list({
        search:     search        || undefined,
        partner_id: partnerFilter || undefined,
        kyc_status: kycFilter     || undefined,
        limit: 20, offset: 0,
      });
      setInvestorList(data?.investors || []);
      setTotal(data?.total || 0);
    } catch (e) {
      console.error('Failed to load investors:', e);
    } finally {
      setLoading(false);
    }
  }, [search, partnerFilter, kycFilter]);

  useEffect(() => { loadInvestors(); }, [loadInvestors]);

  useEffect(() => {
    if (!form.partner_id) { setCreateFamilies([]); return; }
    families.list({ partner_id: form.partner_id, limit: 100 })
      .then(data => setCreateFamilies(data?.families || []))
      .catch(() => setCreateFamilies([]));
  }, [form.partner_id]);

  const handlePartnerChange = (v) => { setForm(f => ({ ...f, partner_id: v, family_id: '' })); setCreateError(''); };

  const handleCreate = async () => {
    if (!form.firstName.trim()) { setCreateError('First name is required.'); return; }
    if (!form.pan.trim())       { setCreateError('PAN number is required.'); return; }
    setSubmitting(true); setCreateError('');
    try {
      await investors.create({
        first_name:    form.firstName.trim(),
        last_name:     form.lastName.trim()    || null,
        pan:           form.pan.trim().toUpperCase(),
        mobile:        form.mobile.trim()      || null,
        email:         form.email.trim()       || null,
        date_of_birth: form.date_of_birth      || null,
        partner_id:    form.partner_id         ? parseInt(form.partner_id) : null,
        family_id:     form.family_id          ? parseInt(form.family_id)  : null,
        kyc_status:    form.kyc_status,
      });
      setForm({ ...EMPTY_FORM });
      setCreateFamilies([]);
      setSuccessMsg('Investor created successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
      setActiveSection('Investor List');
      loadInvestors();
    } catch (e) {
      setCreateError(e.message?.includes('PAN already exists') ? 'An investor with this PAN already exists.' : (e.message || 'Something went wrong.'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fi = { onFocus: e => e.target.style.borderColor = 'var(--green)', onBlur: e => e.target.style.borderColor = 'var(--border)' };

  return (
    <div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>Investor Management</h1>
      </div>

      {successMsg && (
        <div style={{ marginBottom: '20px', padding: '14px 20px', borderRadius: '10px', background: 'rgba(44,74,62,0.08)', border: '1px solid rgba(44,74,62,0.2)', fontSize: '14px', color: 'var(--green)', fontWeight: 500 }}>
          ✓ {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{ width: '200px', flexShrink: 0, background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden', position: 'sticky', top: '20px' }}>
          {subSections.map(s => (
            <div key={s} onClick={() => setActiveSection(s)} style={{ padding: '14px 18px', cursor: 'pointer', fontSize: '13px', fontWeight: activeSection === s ? 600 : 500, color: activeSection === s ? 'var(--green)' : 'var(--charcoal)', background: activeSection === s ? 'rgba(44,74,62,0.06)' : '#fff', borderLeft: `3px solid ${activeSection === s ? 'var(--green)' : 'transparent'}`, borderBottom: '1px solid var(--border)', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (activeSection !== s) e.currentTarget.style.background = 'var(--sage)'; }}
              onMouseLeave={e => { if (activeSection !== s) e.currentTarget.style.background = '#fff'; }}
            >{s}</div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Investor List */}
          {activeSection === 'Investor List' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ ...sectionHead, fontSize: '18px', marginRight: 'auto' }}>All Investors</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, PAN, email…" style={{ ...inputStyle, width: '220px', padding: '8px 14px', fontSize: '13px' }} {...fi} />
                <select value={partnerFilter} onChange={e => setPartnerFilter(e.target.value)} style={{ ...selectStyle, width: '160px', padding: '8px 14px', fontSize: '13px' }} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                  <option value="">All Partners</option>
                  {livePartners.map(p => <option key={p.id} value={String(p.id)}>{p.fname} {p.lname}</option>)}
                </select>
                <select value={kycFilter} onChange={e => setKycFilter(e.target.value)} style={{ ...selectStyle, width: '130px', padding: '8px 14px', fontSize: '13px' }} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                  <option value="">All KYC</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                  <thead>
                    <tr style={{ background: 'var(--sage)' }}>
                      {['Name','PAN','Partner','Family','KYC','Joined','Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : investorList.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)', marginBottom: '8px' }}>
                          {search || partnerFilter || kycFilter ? 'No results match your filters.' : 'No investors yet'}
                        </div>
                        {!search && !partnerFilter && !kycFilter && <div style={{ fontSize: '13px', color: '#8a9e96' }}>Create your first investor using the form.</div>}
                      </td></tr>
                    ) : investorList.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(44,74,62,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display-font)', fontSize: '12px', fontWeight: 600, color: 'var(--green)' }}>
                              {(inv.first_name?.[0] || '') + (inv.last_name?.[0] || '')}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{inv.first_name} {inv.last_name || ''}</div>
                              <div style={{ fontSize: '11px', color: '#9aaa9e' }}>{inv.email || inv.mobile || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96', fontFamily: 'monospace' }}>{inv.pan ? inv.pan.slice(0,3)+'••••'+inv.pan.slice(-2) : '—'}</td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{inv.partner_name || '—'}</td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{inv.family_name || '—'}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.1em', ...(kycBadge[inv.kyc_status] || kycBadge.pending) }}>
                            {inv.kyc_status || 'pending'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96' }}>{formatDate(inv.created_at)}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => navigate(`/investors/${inv.id}`)} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', border: '1.5px solid var(--border)', background: '#fff', color: 'var(--charcoal)', cursor: 'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.color='var(--green)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--charcoal)'; }}>View</button>
                            <button onClick={() => setEditingInvestor(inv)} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', border: '1.5px solid var(--border)', background: '#fff', color: 'var(--charcoal)', cursor: 'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--green)'; e.currentTarget.style.color='var(--green)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--charcoal)'; }}>Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {total > 0 && (
                <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', fontSize: '13px', color: '#8a9e96' }}>
                  Showing {investorList.length} of {total} investors
                </div>
              )}
            </div>
          )}

          {/* Create Investor */}
          {activeSection === 'Create Investor' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '28px' }}>
              <span style={{ ...sectionHead, display: 'block', marginBottom: '24px' }}>Create Investor</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
                <div><Label>First Name *</Label><input value={form.firstName} onChange={e => update('firstName', e.target.value)} style={inputStyle} {...fi} /></div>
                <div><Label>Last Name</Label><input value={form.lastName} onChange={e => update('lastName', e.target.value)} style={inputStyle} {...fi} /></div>
                <div><Label>PAN Number *</Label><input value={form.pan} onChange={e => update('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" style={inputStyle} {...fi} /></div>
                <div><Label>Mobile</Label><input value={form.mobile} onChange={e => update('mobile', e.target.value)} style={inputStyle} {...fi} /></div>
                <div><Label>Email</Label><input value={form.email} onChange={e => update('email', e.target.value)} style={inputStyle} {...fi} /></div>
                <div>
                  <Label>Date of Birth</Label>
                  <DOBPicker value={form.date_of_birth} onChange={v => update('date_of_birth', v)} />
                </div>
                <div>
                  <Label>Assign to Partner</Label>
                  <select value={form.partner_id} onChange={e => handlePartnerChange(e.target.value)} style={selectStyle} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                    <option value="">— No partner</option>
                    {livePartners.map(p => <option key={p.id} value={String(p.id)}>{p.fname} {p.lname}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Assign to Family</Label>
                  <select value={form.family_id} onChange={e => update('family_id', e.target.value)} disabled={!form.partner_id}
                    style={{ ...selectStyle, cursor: form.partner_id ? 'pointer' : 'not-allowed', background: form.partner_id ? '#fff' : 'var(--sage)', color: form.partner_id ? 'var(--charcoal)' : '#8a9e96' }}
                    onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                    <option value="">— No family</option>
                    {createFamilies.map(f => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>KYC Status</Label>
                  <select value={form.kyc_status} onChange={e => update('kyc_status', e.target.value)} style={selectStyle} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                  </select>
                </div>
              </div>
              {createError && (
                <div style={{ fontSize: '13px', color: '#c0392b', padding: '10px 14px', background: 'rgba(192,57,43,0.06)', borderRadius: '8px', marginBottom: '18px' }}>
                  {createError}
                </div>
              )}
              <button onClick={handleCreate} disabled={submitting}
                style={{ padding: '11px 28px', borderRadius: '8px', background: 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = 'var(--gold)'; }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = 'var(--green)'; }}>
                {submitting ? 'Creating…' : 'Create Investor'}
              </button>
            </div>
          )}
        </div>
      </div>

      {editingInvestor && (
        <InvestorDrawer
          investor={editingInvestor}
          livePartners={livePartners}
          onClose={() => setEditingInvestor(null)}
          onSaved={() => { setEditingInvestor(null); loadInvestors(); }}
        />
      )}
    </div>
  );
}
