import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/ui/KPICard';

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
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)', borderRadius: '8px',
  fontSize: '14px', fontFamily: 'var(--body-font)',
  color: 'var(--charcoal)', background: '#fff', outline: 'none',
};

function Label({ children }) {
  return <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>{children}</div>;
}

const mockPartners = [
  { id: 1, name: 'Aakash Shethia', arn: 'ARN-12345', status: 'live', aum: '₹2.4 Cr', aumChange: '+4.2%', investors: 18, sip: '₹1,20,000', sipCount: 24, commission: '₹8,400', leads: 6, lastTxn: '22 Mar 2026', referredBy: '—' },
  { id: 2, name: 'Priya Mehta', arn: 'ARN-67890', status: 'live', aum: '₹1.1 Cr', aumChange: '+1.8%', investors: 9, sip: '₹45,000', sipCount: 11, commission: '₹3,200', leads: 2, lastTxn: '20 Mar 2026', referredBy: 'Aakash Shethia' },
  { id: 3, name: 'Rahul Sharma', arn: 'ARN-11223', status: 'pending', aum: '₹0', aumChange: '—', investors: 0, sip: '₹0', sipCount: 0, commission: '₹0', leads: 1, lastTxn: '—', referredBy: '—' },
  { id: 4, name: 'Neha Gupta', arn: 'ARN-44556', status: 'paused', aum: '₹78 L', aumChange: '-0.3%', investors: 5, sip: '₹22,000', sipCount: 6, commission: '₹1,100', leads: 0, lastTxn: '10 Mar 2026', referredBy: 'Priya Mehta' },
];

const statusColor = {
  live: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  pending: { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
  paused: { bg: 'rgba(200,200,200,0.2)', color: '#8a9e96' },
};

const subSections = ['Partner List', 'Onboard Partner', 'MLM Referral Tree'];

const SERVICES = [
  'Mutual Funds', 'Insurance', 'Tax Planning',
  'Financial Planning', 'PMS', 'NPS',
];

const countryCodes = [
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+65', label: '🇸🇬 +65' },
];

// MLM Tree Node
function TreeNode({ partner, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const children = mockPartners.filter(p => p.referredBy === partner.name);

  return (
    <div style={{ marginLeft: level * 28 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', background: '#fff',
        borderRadius: '10px', border: '1px solid var(--border)',
        marginBottom: '8px',
        cursor: children.length ? 'pointer' : 'default',
      }} onClick={() => children.length && setExpanded(v => !v)}>
        {children.length > 0 && (
          <span style={{
            fontSize: '10px', color: '#8a9e96',
            transform: expanded ? 'rotate(90deg)' : 'none',
            display: 'inline-block', transition: 'transform 0.2s',
          }}>▶</span>
        )}
        {children.length === 0 && <span style={{ width: '14px' }} />}
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(44,74,62,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 600, color: 'var(--green)', flexShrink: 0,
        }}>
          {partner.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)' }}>{partner.name}</div>
          <div style={{ fontSize: '11px', color: '#8a9e96' }}>
            {partner.arn} · {partner.investors} investors · {partner.aum}
          </div>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 600,
          padding: '3px 8px', borderRadius: '100px',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          ...statusColor[partner.status],
        }}>{partner.status}</span>
      </div>
      {expanded && children.map(child => (
        <TreeNode key={child.id} partner={child} level={level + 1} />
      ))}
    </div>
  );
}

export default function AdminPartners() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Partner List');
  const [filterStatus, setFilterStatus] = useState('All');
  const [partners, setPartners] = useState(mockPartners);
  const [drawer, setDrawer] = useState(null);

  // Onboard form state
  const [form, setForm] = useState({
    fname: '', lname: '', slug: '', arn: '',
    waCC: '+91', waNumber: '',
    callCC: '+91', callNumber: '',
    tagline: '', bio: '',
    services: [],
    referredBy: '—',
    status: 'pending',
    photoPreview: null,
    logoPreview: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const updateForm = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSubmitted(false); };
  const toggleService = (s) => {
    setForm(f => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s],
    }));
    setSubmitted(false);
  };

  const rootPartners = partners.filter(p => p.referredBy === '—');
  const filtered = filterStatus === 'All'
    ? partners
    : partners.filter(p => p.status === filterStatus.toLowerCase());

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Partner Management
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Sub-section selector */}
        <div style={{
          width: '200px', flexShrink: 0, background: '#fff',
          borderRadius: '12px', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)', overflow: 'hidden',
        }}>
          {subSections.map(s => (
            <div key={s} onClick={() => setActiveSection(s)} style={{
              padding: '14px 16px', cursor: 'pointer', fontSize: '13px',
              fontWeight: activeSection === s ? 600 : 400,
              color: activeSection === s ? 'var(--green)' : '#5a6a64',
              background: activeSection === s ? 'rgba(44,74,62,0.08)' : '#fff',
              borderLeft: activeSection === s ? '3px solid var(--green)' : '3px solid transparent',
              borderBottom: '1px solid var(--border)', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (activeSection !== s) { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.color = 'var(--green)'; }}}
              onMouseLeave={e => { if (activeSection !== s) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#5a6a64'; }}}
            >{s}</div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── PARTNER LIST ── */}
          {activeSection === 'Partner List' && (
            <div>
              {/* KPI Cards */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <KPICard label="Total AUM" value="₹3.6 Cr" subtitle="All partners" />
                <KPICard label="Active Partners" value="2" subtitle="1 pending · 1 paused" />
                <KPICard label="Monthly SIP Book" value="₹1.87 L" subtitle="All partners" />
                <KPICard label="Commission Due" value="₹12,700" subtitle="This month" />
                <KPICard label="Total Leads MTD" value="9" subtitle="All micro-sites" />
                <KPICard label="Net New AUM" value="+₹14 L" subtitle="vs last month" />
              </div>

              {/* Toolbar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['All', 'Live', 'Pending', 'Paused'].map(f => (
                    <button key={f} onClick={() => setFilterStatus(f)} style={{
                      padding: '8px 18px', borderRadius: '100px',
                      fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em',
                      border: '1.5px solid var(--border)',
                      background: filterStatus === f ? 'var(--green)' : '#fff',
                      color: filterStatus === f ? 'var(--ivory)' : '#7a8a84',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>{f}</button>
                  ))}
                </div>
                <button onClick={() => setActiveSection('Onboard Partner')} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 20px', borderRadius: '8px',
                  background: 'var(--green)', color: 'var(--ivory)',
                  border: 'none', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', letterSpacing: '0.06em',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                >+ Add Partner</button>
              </div>

              {/* Partner Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
              }}>
                {filtered.map(p => {
                  const initials = p.name.split(' ').map(n => n[0]).join('');

                  return (
                    <div key={p.id} style={{
                      background: '#fff', borderRadius: '14px',
                      border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
                      overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(44,74,62,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Card top */}
                      <div style={{ padding: '22px 24px 16px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        {/* Avatar */}
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '50%',
                          border: '2px solid var(--gold)', flexShrink: 0,
                          background: 'var(--sage)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--display-font)', fontSize: '20px',
                          color: 'var(--green)', fontWeight: 600,
                        }}>
                          {initials}
                        </div>

                        {/* Name + tagline */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'var(--display-font)', fontSize: '20px',
                            fontWeight: 600, color: 'var(--green)', lineHeight: 1.1, marginBottom: '4px',
                          }}>{p.name}</div>
                          <div style={{
                            fontSize: '12px', color: '#8a9e96', fontWeight: 300,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>{p.arn}</div>
                        </div>

                        {/* Status badge */}
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '4px 10px', borderRadius: '100px',
                          fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em',
                          flexShrink: 0,
                          background: p.status === 'live' ? '#e6f7ec' : p.status === 'pending' ? '#fef9ec' : '#f5f5f5',
                          color: p.status === 'live' ? '#1a7a3c' : p.status === 'pending' ? '#8a6200' : '#7a7a7a',
                        }}>
                          <div style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: p.status === 'live' ? '#2ecc71' : p.status === 'pending' ? '#f39c12' : '#aaa',
                            flexShrink: 0,
                          }} />
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </div>
                      </div>

                      {/* Meta row */}
                      <div style={{
                        padding: '0 24px 16px',
                        display: 'flex', gap: '16px',
                        borderBottom: '1px solid var(--border)',
                      }}>
                        <div style={{ fontSize: '12px', color: '#9aaa9e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          Investors: <span style={{ color: 'var(--charcoal)', fontWeight: 500, fontFamily: 'var(--display-font)' }}>{p.investors}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9aaa9e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          AUM: <span style={{ color: 'var(--charcoal)', fontWeight: 500, fontFamily: 'var(--display-font)' }}>{p.aum}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9aaa9e', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          Leads: <span style={{ color: 'var(--charcoal)', fontWeight: 500, fontFamily: 'var(--display-font)' }}>{p.leads}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ padding: '14px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Pending: Approve + Reject */}
                        {p.status === 'pending' && <>
                          <button onClick={() => setPartners(prev => prev.map(x => x.id === p.id ? { ...x, status: 'live' } : x))} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px',
                            background: 'rgba(44,74,62,0.08)', color: 'var(--green)',
                            border: '1px solid rgba(44,74,62,0.2)', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--body-font)',
                            transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(44,74,62,0.16)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(44,74,62,0.08)'}
                          >✓ Approve</button>
                          <button onClick={() => setPartners(prev => prev.filter(x => x.id !== p.id))} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px',
                            background: 'rgba(192,57,43,0.06)', color: '#c0392b',
                            border: '1px solid rgba(192,57,43,0.2)', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--body-font)',
                            transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,57,43,0.12)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(192,57,43,0.06)'}
                          >✕ Reject</button>
                        </>}

                        {/* Live: Pause + View */}
                        {p.status === 'live' && <>
                          <button onClick={() => setPartners(prev => prev.map(x => x.id === p.id ? { ...x, status: 'paused' } : x))} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px',
                            background: 'rgba(184,150,90,0.08)', color: 'var(--gold)',
                            border: '1px solid rgba(184,150,90,0.25)', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--body-font)',
                            transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,150,90,0.16)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(184,150,90,0.08)'}
                          >⏸ Pause</button>
                          <button onClick={() => navigate(`/partners/${p.id}`)} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px',
                            background: 'var(--sage)', color: 'var(--green)',
                            border: '1px solid var(--border)', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--body-font)',
                            transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(44,74,62,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--sage)'}
                          >↗ View</button>
                        </>}

                        {/* Paused: Go Live + Delete */}
                        {p.status === 'paused' && <>
                          <button onClick={() => setPartners(prev => prev.map(x => x.id === p.id ? { ...x, status: 'live' } : x))} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px',
                            background: 'rgba(44,74,62,0.08)', color: 'var(--green)',
                            border: '1px solid rgba(44,74,62,0.2)', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--body-font)',
                            transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(44,74,62,0.16)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(44,74,62,0.08)'}
                          >▶ Go Live</button>
                          <button onClick={() => setPartners(prev => prev.filter(x => x.id !== p.id))} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px',
                            background: 'rgba(192,57,43,0.06)', color: '#c0392b',
                            border: '1px solid rgba(192,57,43,0.2)', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--body-font)',
                            transition: 'all 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,57,43,0.12)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(192,57,43,0.06)'}
                          >🗑 Delete</button>
                        </>}

                        {/* Always: Edit */}
                        <button onClick={() => setDrawer(p)} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '7px 13px', borderRadius: '7px',
                          background: '#fff', color: '#5a6a64',
                          border: '1px solid var(--border)', fontSize: '12px',
                          fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--body-font)',
                          marginLeft: 'auto', transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = '#5a6a64'; }}
                        >✎ Edit</button>
                      </div>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div style={{
                    gridColumn: '1 / -1', padding: '60px', textAlign: 'center',
                    background: '#fff', borderRadius: '16px', border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: '13px', color: '#8a9e96' }}>No {filterStatus === 'All' ? '' : filterStatus.toLowerCase()} partners yet</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ONBOARD PARTNER ── */}
          {activeSection === 'Onboard Partner' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              overflow: 'hidden',
            }}>
              {/* Form header */}
              <div style={{ padding: '24px 36px', borderBottom: '1px solid var(--border)' }}>
                <span style={sectionHead}>Onboard New Partner</span>
                <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '6px' }}>
                  Fill in the partner's details to create their micro-site page.
                </p>
              </div>

              <div style={{ padding: '36px' }}>

                {/* Section: Basic Info */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                    Basic Information
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <Label>First Name</Label>
                      <input value={form.fname} onChange={e => {
                        updateForm('fname', e.target.value);
                        const slug = (e.target.value + '-' + form.lname).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                        updateForm('slug', slug);
                      }}
                        placeholder="Arjun" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--green)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                    <div>
                      <Label>Last Name</Label>
                      <input value={form.lname} onChange={e => {
                        updateForm('lname', e.target.value);
                        const slug = (form.fname + '-' + e.target.value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                        updateForm('slug', slug);
                      }}
                        placeholder="Mehta" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--green)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                    <div>
                      <Label>Page URL Slug</Label>
                      <input value={form.slug || ''} onChange={e => updateForm('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="arjun-mehta" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--green)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--sage)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--green)', fontFamily: 'monospace' }}>
                          niomfintech.in/<strong>{form.slug || 'arjun-mehta'}</strong>
                        </span>
                        <button onClick={() => navigator.clipboard.writeText(`niomfintech.in/${form.slug || ''}`)} style={{
                          marginLeft: 'auto', padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                          border: '1px solid var(--border)', background: '#fff', color: '#8a9e96', cursor: 'pointer',
                        }}>Copy</button>
                      </div>
                    </div>
                    <div>
                      <Label>Sub-ARN Number</Label>
                      <input value={form.arn} onChange={e => updateForm('arn', e.target.value)}
                        placeholder="ARN-XXXXX" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--green)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  </div>

                  {/* Referred By */}
                  <div style={{ marginBottom: '20px' }}>
                    <Label>Referred By (MLM Upline)</Label>
                    <select value={form.referredBy} onChange={e => updateForm('referredBy', e.target.value)}
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                      <option value="—">— Direct (no referral)</option>
                      {mockPartners.map(p => (
                        <option key={p.id} value={p.name}>{p.name} · {p.arn}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section: Profile */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                    Profile
                  </div>

                  {/* Photo + Logo uploads */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Photo */}
                    <div>
                      <Label>Profile Photo</Label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1.5px dashed var(--border)', borderRadius: '10px', background: 'var(--sage)', cursor: 'pointer' }}>
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '50%',
                          background: form.photoPreview ? 'transparent' : 'rgba(44,74,62,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(184,150,90,0.3)',
                        }}>
                          {form.photoPreview
                            ? <img src={form.photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: '20px', color: '#8a9e96' }}>👤</span>}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500, marginBottom: '2px' }}>Click to upload photo</div>
                          <div style={{ fontSize: '11px', color: '#8a9e96' }}>JPG or PNG, square preferred</div>
                        </div>
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => updateForm('photoPreview', ev.target.result);
                              reader.readAsDataURL(file);
                            }
                          }} />
                      </label>
                    </div>

                    {/* Logo */}
                    <div>
                      <Label>Firm Logo</Label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '1.5px dashed var(--border)', borderRadius: '10px', background: 'var(--sage)', cursor: 'pointer' }}>
                        <div style={{
                          width: '80px', height: '48px', borderRadius: '6px',
                          background: form.logoPreview ? 'transparent' : 'rgba(44,74,62,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, overflow: 'hidden', border: '2px solid rgba(184,150,90,0.3)',
                        }}>
                          {form.logoPreview
                            ? <img src={form.logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : <span style={{ fontSize: '18px', color: '#8a9e96' }}>🏢</span>}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500, marginBottom: '2px' }}>Click to upload logo</div>
                          <div style={{ fontSize: '11px', color: '#8a9e96' }}>PNG with transparent background</div>
                        </div>
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = ev => updateForm('logoPreview', ev.target.result);
                              reader.readAsDataURL(file);
                            }
                          }} />
                      </label>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <Label>Tagline</Label>
                      <span style={{ fontSize: '11px', color: (form.tagline || '').length > 80 ? '#c05050' : '#8a9e96' }}>
                        {(form.tagline || '').length} / 80
                      </span>
                    </div>
                    <input value={form.tagline} onChange={e => updateForm('tagline', e.target.value.slice(0, 80))}
                      placeholder="Helping families invest with clarity and confidence"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'var(--green)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>

                  {/* Bio */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <Label>Bio</Label>
                      <span style={{ fontSize: '11px', color: '#8a9e96' }}>{(form.bio || '').length} / 500</span>
                    </div>
                    <textarea value={form.bio} onChange={e => updateForm('bio', e.target.value.slice(0, 500))}
                      placeholder="Write a short bio about yourself — your experience, your approach, and why clients trust you."
                      rows={5} style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => e.target.style.borderColor = 'var(--green)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                </div>

                {/* Section: Contact */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                    Contact Details
                  </div>

                  {/* Call number */}
                  <div style={{ marginBottom: '16px' }}>
                    <Label>Call Number</Label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select value={form.callCC} onChange={e => updateForm('callCC', e.target.value)}
                        style={{ ...inputStyle, width: '130px', flexShrink: 0, appearance: 'none', cursor: 'pointer' }}>
                        {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                      <input value={form.callNumber} onChange={e => updateForm('callNumber', e.target.value)}
                        placeholder="9876543210" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--green)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  </div>

                  {/* WhatsApp number */}
                  <div style={{ marginBottom: '8px' }}>
                    <Label>WhatsApp Number</Label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select value={form.waCC} onChange={e => updateForm('waCC', e.target.value)}
                        style={{ ...inputStyle, width: '130px', flexShrink: 0, appearance: 'none', cursor: 'pointer' }}>
                        {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                      <input value={form.waNumber} onChange={e => updateForm('waNumber', e.target.value)}
                        placeholder="9876543210" style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--green)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  </div>

                  {/* Same as call number checkbox */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#5a6a64', marginBottom: '4px' }}>
                    <input type="checkbox"
                      onChange={e => { if (e.target.checked) updateForm('waNumber', form.callNumber); }}
                      style={{ accentColor: 'var(--green)', width: '14px', height: '14px' }} />
                    Same as call number
                  </label>
                </div>

                {/* Section: Services */}
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '8px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                    Areas of Focus
                  </div>
                  <p style={{ fontSize: '12px', color: '#8a9e96', marginBottom: '16px' }}>Select exactly 3 services to display on the micro-site</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      'Mutual Funds', 'Insurance', 'Tax Planning',
                      'Financial Planning', 'PMS', 'NPS',
                      'Retirement Planning', "Children's Education", 'NRI Investments',
                    ].map(s => {
                      const selected = form.services.includes(s);
                      const disabled = !selected && form.services.length >= 3;
                      return (
                        <button key={s} onClick={() => !disabled && toggleService(s)} style={{
                          padding: '14px 10px', borderRadius: '10px', fontSize: '13px',
                          border: `1.5px solid ${selected ? 'var(--green)' : 'var(--border)'}`,
                          background: selected ? 'rgba(44,74,62,0.07)' : '#fff',
                          color: selected ? 'var(--green)' : disabled ? '#bbb' : '#5a6a64',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          fontWeight: selected ? 500 : 400,
                          opacity: disabled ? 0.5 : 1,
                          transition: 'all 0.2s', fontFamily: 'var(--body-font)',
                        }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: '12px', color: form.services.length === 3 ? 'var(--green)' : '#8a9e96', marginTop: '10px', fontWeight: form.services.length === 3 ? 500 : 400 }}>
                    {form.services.length} of 3 selected
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: '24px', borderTop: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '13px', color: '#8a9e96' }}>This will create the partner's micro-site page.</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => {
                      setForm({ fname: '', lname: '', slug: '', arn: '', waCC: '+91', waNumber: '', callCC: '+91', callNumber: '', tagline: '', bio: '', services: [], referredBy: '—', status: 'pending', photoPreview: null, logoPreview: null });
                      setSubmitted(false);
                    }} style={{
                      padding: '10px 20px', borderRadius: '8px', background: 'transparent',
                      color: '#8a9e96', border: '1.5px solid var(--border)', fontSize: '13px', cursor: 'pointer',
                    }}>Clear Form</button>
                    <button onClick={() => setSubmitted(true)} style={{
                      padding: '12px 32px', borderRadius: '8px',
                      background: form.services.length === 3 ? 'var(--green)' : '#ccc',
                      color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500,
                      cursor: form.services.length === 3 ? 'pointer' : 'not-allowed', letterSpacing: '0.06em',
                    }}
                      onMouseEnter={e => { if (form.services.length === 3) e.currentTarget.style.background = 'var(--gold)'; }}
                      onMouseLeave={e => { if (form.services.length === 3) e.currentTarget.style.background = 'var(--green)'; }}
                    >Create Partner Page →</button>
                    {submitted && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓ Created</span>}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── MLM REFERRAL TREE ── */}
          {activeSection === 'MLM Referral Tree' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '28px',
            }}>
              <span style={{ ...sectionHead, display: 'block', marginBottom: '24px' }}>MLM Referral Tree</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {rootPartners.map(p => <TreeNode key={p.id} partner={p} />)}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}