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
  const [confirm, setConfirm] = useState(null);
  const [mode, setMode] = useState('yourself');
  const [linkName, setLinkName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkStepsActive, setLinkStepsActive] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Onboard form state
  const [form, setForm] = useState({
    fname: '', lname: '', slug: '', arn: '',
    waCC: '+91', waNumber: '',
    callCC: '+91', callNumber: '',
    sameNumber: false,
    tagline: '', bio: '',
    services: [],
    referredBy: '—',
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
              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
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
                  padding: '9px 20px', borderRadius: '8px',
                  background: 'var(--green)', color: 'var(--ivory)',
                  border: 'none', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', letterSpacing: '0.06em',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                >+ Add Partner</button>
              </div>

              {/* Confirm modal */}
              {confirm && (
                <div style={{
                  position: 'fixed', inset: 0, background: 'rgba(26,43,37,0.7)',
                  backdropFilter: 'blur(4px)', zIndex: 3000,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
                }}>
                  <div style={{
                    background: 'var(--ivory)', borderRadius: '14px', padding: '40px 36px',
                    maxWidth: '400px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
                  }}>
                    <div style={{ fontFamily: 'var(--display-font)', fontSize: '24px', fontWeight: 600, color: 'var(--green)', marginBottom: '12px' }}>
                      {confirm.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#5a6a64', lineHeight: 1.7, marginBottom: '28px' }}>
                      {confirm.body}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setConfirm(null)} style={{
                        padding: '10px 20px', borderRadius: '8px', fontSize: '13px',
                        border: '1.5px solid var(--border)', background: '#fff',
                        color: '#5a6a64', cursor: 'pointer',
                      }}>Cancel</button>
                      <button onClick={() => { confirm.action(); setConfirm(null); }} style={{
                        padding: '10px 24px', borderRadius: '8px', fontSize: '13px',
                        background: confirm.danger ? '#c0392b' : 'var(--green)',
                        color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer',
                      }}>{confirm.label}</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Partners grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filtered.map(p => {
                  const initials = p.name.split(' ').map(n => n[0]).join('');
                  const slug = p.name.split(' ').join('-').toLowerCase();

                  return (
                    <div key={p.id} style={{
                      background: '#fff', borderRadius: '14px',
                      border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
                      overflow: 'hidden', transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(44,74,62,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Top */}
                      <div style={{ padding: '22px 24px 16px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '50%',
                          border: '2px solid var(--gold)', flexShrink: 0,
                          background: 'var(--sage)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--display-font)', fontSize: '20px', color: 'var(--green)', fontWeight: 600,
                        }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'var(--display-font)', fontSize: '20px', fontWeight: 600, color: 'var(--green)', lineHeight: 1.1, marginBottom: '4px' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#8a9e96', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.arn}
                          </div>
                        </div>
                        {/* Status badge with dot */}
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '4px 10px', borderRadius: '100px',
                          fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em', flexShrink: 0,
                          background: p.status === 'live' ? '#e6f7ec' : p.status === 'pending' ? '#fef9ec' : '#f5f5f5',
                          color: p.status === 'live' ? '#1a7a3c' : p.status === 'pending' ? '#8a6200' : '#7a7a7a',
                        }}>
                          <div style={{
                            width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                            background: p.status === 'live' ? '#2ecc71' : p.status === 'pending' ? '#f39c12' : '#aaa',
                          }} />
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </div>
                      </div>

                      {/* Meta row: slug + date */}
                      <div style={{ padding: '0 24px 16px', display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '12px', color: '#9aaa9e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          🔗 <span style={{ color: 'var(--charcoal)', fontWeight: 500 }}>niomfintech.in/{slug}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#9aaa9e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          📅 <span style={{ color: 'var(--charcoal)', fontWeight: 500 }}>{p.lastTxn}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ padding: '14px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Preview — always */}
                        <button onClick={() => window.open(`https://niom-backend.onrender.com/${slug}`, '_blank')} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '7px 13px', borderRadius: '7px', fontSize: '12px',
                          fontWeight: 500, cursor: 'pointer', border: '1.5px solid var(--border)',
                          background: '#fff', color: '#5a6a64', fontFamily: 'var(--body-font)',
                          transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'rgba(44,74,62,0.04)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = '#5a6a64'; e.currentTarget.style.background = '#fff'; }}
                        >👁 Preview</button>

                        {/* Edit — always */}
                        <button onClick={() => setDrawer(p)} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '7px 13px', borderRadius: '7px', fontSize: '12px',
                          fontWeight: 500, cursor: 'pointer', border: '1.5px solid var(--border)',
                          background: '#fff', color: '#5a6a64', fontFamily: 'var(--body-font)',
                          transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.background = 'rgba(44,74,62,0.04)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = '#5a6a64'; e.currentTarget.style.background = '#fff'; }}
                        >✎ Edit</button>

                        {/* Pending: Approve + Reject */}
                        {p.status === 'pending' && <>
                          <button onClick={() => setConfirm({
                            title: 'Approve & Go Live',
                            body: `This will publish ${p.name}'s page. Are you sure?`,
                            label: 'Approve',
                            danger: false,
                            action: () => setPartners(prev => prev.map(x => x.id === p.id ? { ...x, status: 'live' } : x)),
                          })} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer',
                            background: 'var(--green)', color: 'var(--ivory)',
                            border: '1.5px solid var(--green)', fontFamily: 'var(--body-font)',
                            transition: 'all 0.2s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = '#1a3a2e'}
                            onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                          >✓ Approve</button>
                          <button onClick={() => setConfirm({
                            title: 'Reject Partner',
                            body: `This will reject ${p.name}'s onboarding.`,
                            label: 'Reject',
                            danger: true,
                            action: () => setPartners(prev => prev.filter(x => x.id !== p.id)),
                          })} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer',
                            color: '#c0392b', border: '1.5px solid rgba(192,57,43,0.25)',
                            background: '#fff', fontFamily: 'var(--body-font)', transition: 'all 0.2s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fdf2f0'; e.currentTarget.style.borderColor = '#c0392b'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(192,57,43,0.25)'; }}
                          >✕ Reject</button>
                        </>}

                        {/* Live: Pause */}
                        {p.status === 'live' && (
                          <button onClick={() => setConfirm({
                            title: 'Pause Partner Page',
                            body: `This will take ${p.name}'s page offline.`,
                            label: 'Pause',
                            danger: false,
                            action: () => setPartners(prev => prev.map(x => x.id === p.id ? { ...x, status: 'paused' } : x)),
                          })} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer',
                            color: '#c0392b', border: '1.5px solid rgba(192,57,43,0.25)',
                            background: '#fff', fontFamily: 'var(--body-font)', transition: 'all 0.2s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fdf2f0'; e.currentTarget.style.borderColor = '#c0392b'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(192,57,43,0.25)'; }}
                          >⏸ Pause</button>
                        )}

                        {/* Paused: Go Live + Delete */}
                        {p.status === 'paused' && <>
                          <button onClick={() => setConfirm({
                            title: 'Restore to Live',
                            body: `This will re-publish ${p.name}'s page.`,
                            label: 'Go Live',
                            danger: false,
                            action: () => setPartners(prev => prev.map(x => x.id === p.id ? { ...x, status: 'live' } : x)),
                          })} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer',
                            background: '#1a7a3c', color: '#fff',
                            border: '1.5px solid #1a7a3c', fontFamily: 'var(--body-font)', transition: 'all 0.2s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = '#155e2e'}
                            onMouseLeave={e => e.currentTarget.style.background = '#1a7a3c'}
                          >▶ Go Live</button>
                          <button onClick={() => setConfirm({
                            title: 'Delete Partner Page',
                            body: `This will permanently delete ${p.name}'s page. This cannot be undone.`,
                            label: 'Delete',
                            danger: true,
                            action: () => setPartners(prev => prev.filter(x => x.id !== p.id)),
                          })} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '7px 13px', borderRadius: '7px', fontSize: '12px',
                            fontWeight: 500, cursor: 'pointer',
                            color: '#c0392b', border: '1.5px solid rgba(192,57,43,0.25)',
                            background: '#fff', fontFamily: 'var(--body-font)', transition: 'all 0.2s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fdf2f0'; e.currentTarget.style.borderColor = '#c0392b'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(192,57,43,0.25)'; }}
                          >🗑 Delete</button>
                        </>}
                      </div>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div style={{
                    gridColumn: '1 / -1', padding: '80px 24px', textAlign: 'center',
                    background: '#fff', borderRadius: '16px', border: '1px solid var(--border)',
                    color: '#8a9e96',
                  }}>
                    <div style={{ fontSize: '15px', marginBottom: '6px', color: '#5a6a64' }}>No {filterStatus === 'All' ? '' : filterStatus.toLowerCase()} partners yet</div>
                    <div style={{ fontSize: '13px' }}>Onboard your first partner to get started.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ONBOARD PARTNER ── */}
          {activeSection === 'Onboard Partner' && (
  <div style={{ maxWidth: '860px' }}>

    {/* Success banner */}
    {submitted && (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'rgba(44,74,62,0.08)', border: '1px solid rgba(44,74,62,0.2)',
        borderRadius: '10px', padding: '16px 20px', marginBottom: '24px',
      }}>
        <span style={{ color: 'var(--green)', fontSize: '18px' }}>✓</span>
        <p style={{ fontSize: '14px', color: 'var(--green)', fontWeight: 500 }}>
          Partner page created successfully! — share the preview link or go to the partner list to manage it.
        </p>
        <button onClick={() => setSubmitted(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#8a9e96' }}>✕</button>
      </div>
    )}

    {/* Mode toggle */}
    <div style={{
      display: 'flex', background: '#fff',
      border: '1px solid var(--border)', borderRadius: '10px',
      padding: '4px', width: 'fit-content', marginBottom: '32px',
      boxShadow: 'var(--shadow)',
    }}>
      {[
        { key: 'yourself', label: '✏ Fill it yourself' },
        { key: 'link', label: '↗ Send a link' },
      ].map(m => (
        <button key={m.key} onClick={() => setMode(m.key)} style={{
          padding: '10px 24px', borderRadius: '7px',
          fontFamily: 'var(--body-font)', fontSize: '13px', fontWeight: 500,
          letterSpacing: '0.04em', cursor: 'pointer', border: 'none',
          background: mode === m.key ? 'var(--green)' : 'none',
          color: mode === m.key ? 'var(--ivory)' : '#8a9e96',
          boxShadow: mode === m.key ? '0 2px 8px rgba(44,74,62,0.2)' : 'none',
          transition: 'all 0.2s',
        }}>{m.label}</button>
      ))}
    </div>

    {/* ── FILL YOURSELF ── */}
    {mode === 'yourself' && (
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
        overflow: 'hidden', maxWidth: '860px',
      }}>

        {/* BASIC INFORMATION */}
        <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600, marginBottom: '24px' }}>Basic Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* First Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500 }}>First Name</label>
              <input value={form.fname} onChange={e => { updateForm('fname', e.target.value); updateForm('slug', (e.target.value + '-' + form.lname).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }}
                placeholder="Arjun"
                style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            {/* Last Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500 }}>Last Name</label>
              <input value={form.lname} onChange={e => { updateForm('lname', e.target.value); updateForm('slug', (form.fname + '-' + e.target.value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }}
                placeholder="Mehta"
                style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            {/* Slug */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500 }}>Page URL Slug</label>
              <input value={form.slug} onChange={e => updateForm('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="arjun-mehta"
                style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <span style={{ fontSize: '12px', color: '#9aaa9e' }}>Only lowercase letters, numbers, hyphens</span>
            </div>
            {/* ARN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500 }}>ARN Number</label>
              <input value={form.arn} onChange={e => updateForm('arn', e.target.value)}
                placeholder="ARN-XXXXXX"
                style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>

          {/* URL Preview */}
          <div style={{ marginTop: '16px', background: 'var(--sage)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#4a6a5e', flex: 1 }}>
              niomfintech.in/<strong style={{ color: 'var(--green)' }}>{form.slug || 'partner-name'}</strong>
            </span>
            <button onClick={() => navigator.clipboard.writeText(`niomfintech.in/${form.slug || ''}`)}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', color: 'var(--green)', cursor: 'pointer', fontFamily: 'var(--body-font)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--green)'; e.currentTarget.style.color = 'var(--ivory)'; e.currentTarget.style.borderColor = 'var(--green)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >Copy URL</button>
          </div>

          {/* Referred By — below URL preview */}
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500 }}>Referred By (MLM Upline)</label>
            <select value={form.referredBy} onChange={e => updateForm('referredBy', e.target.value)}
              style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
              <option value="—">— Direct (no referral)</option>
              {mockPartners.map(p => <option key={p.id} value={p.name}>{p.name} · {p.arn}</option>)}
            </select>
          </div>
        </div>

        {/* PROFILE */}
        <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600, marginBottom: '24px' }}>Profile</div>

          {/* Photo upload */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500, display: 'block', marginBottom: '10px' }}>Profile Photo</label>
            <div onClick={() => document.getElementById('ap-photo-input').click()}
              style={{
                border: '2px dashed var(--border)', borderRadius: '12px', padding: '28px',
                display: 'flex', alignItems: 'center', gap: '24px', cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'rgba(44,74,62,0.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = ''; }}
            >
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                border: '2px solid var(--gold)', flexShrink: 0,
                overflow: 'hidden', background: 'var(--sage)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {form.photoPreview
                  ? <img src={form.photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '24px', color: '#aaa' }}>👤</span>}
              </div>
              <div>
                <p style={{ fontSize: '14px', color: 'var(--green)', fontWeight: 500, marginBottom: '4px' }}>Click to upload photo</p>
                <span style={{ fontSize: '12px', color: '#9aaa9e' }}>JPG or PNG, square preferred. Max 5MB.</span>
              </div>
              <input id="ap-photo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => updateForm('photoPreview', ev.target.result);
                reader.readAsDataURL(file);
              }} />
            </div>
          </div>

          {/* Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500 }}>Tagline</label>
            <input value={form.tagline} onChange={e => updateForm('tagline', e.target.value.slice(0, 80))}
              placeholder="Helping families invest with clarity and confidence"
              style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <div style={{ fontSize: '12px', color: (form.tagline || '').length >= 72 ? '#c0392b' : '#9aaa9e', textAlign: 'right' }}>{(form.tagline || '').length} / 80</div>
          </div>

          {/* Bio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500 }}>Bio</label>
            <textarea value={form.bio} onChange={e => updateForm('bio', e.target.value.slice(0, 300))}
              placeholder="Write a short bio for the partner. This will appear on their micro-site below the tagline."
              rows={4}
              style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none', resize: 'vertical', lineHeight: 1.7 }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <div style={{ fontSize: '12px', color: (form.bio || '').length >= 270 ? '#c0392b' : '#9aaa9e', textAlign: 'right' }}>{(form.bio || '').length} / 300</div>
          </div>

          {/* Logo upload */}
          <div>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500, display: 'block', marginBottom: '10px' }}>Partner Logo</label>
            <div onClick={() => document.getElementById('ap-logo-input').click()}
              style={{
                border: '2px dashed var(--border)', borderRadius: '12px', padding: '24px 28px',
                display: 'flex', alignItems: 'center', gap: '24px', cursor: 'pointer',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'rgba(44,74,62,0.02)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = ''; }}
            >
              <div style={{
                width: '80px', height: '48px', borderRadius: '6px',
                border: '2px solid rgba(184,150,90,0.4)', flexShrink: 0,
                overflow: 'hidden', background: 'var(--sage)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {form.logoPreview
                  ? <img src={form.logoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ fontSize: '20px', color: '#aaa' }}>🖼</span>}
              </div>
              <div>
                <p style={{ fontSize: '14px', color: 'var(--green)', fontWeight: 500, marginBottom: '4px' }}>Click to upload logo</p>
                <span style={{ fontSize: '12px', color: '#9aaa9e' }}>PNG with transparent background preferred. Max 5MB.</span>
              </div>
              <input id="ap-logo-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => updateForm('logoPreview', ev.target.result);
                reader.readAsDataURL(file);
              }} />
            </div>
          </div>
        </div>

        {/* CONTACT DETAILS */}
        <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600, marginBottom: '24px' }}>Contact Details</div>

          {/* Call number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500 }}>Call Number</label>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '10px' }}>
              <select value={form.callCC} onChange={e => updateForm('callCC', e.target.value)}
                style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code} ({c.label})</option>)}
              </select>
              <input value={form.callNumber}
                onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 10); updateForm('callNumber', v); if (form.sameNumber) updateForm('waNumber', v); }}
                placeholder="9876543210" inputMode="numeric" maxLength={10}
                style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>

          {/* Same number checkbox — BEFORE WhatsApp */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px', width: 'fit-content' }}>
            <input type="checkbox" checked={form.sameNumber}
              onChange={e => { updateForm('sameNumber', e.target.checked); if (e.target.checked) updateForm('waNumber', form.callNumber); }}
              style={{ width: '16px', height: '16px', accentColor: 'var(--green)', cursor: 'pointer' }} />
            <span style={{ fontSize: '13px', color: '#5a6a64' }}>WhatsApp number is the same as call number</span>
          </label>

          {/* WhatsApp number */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--green)', fontWeight: 500 }}>WhatsApp Number</label>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '10px' }}>
              <select value={form.waCC} onChange={e => updateForm('waCC', e.target.value)}
                disabled={form.sameNumber}
                style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none', appearance: 'none', cursor: form.sameNumber ? 'not-allowed' : 'pointer', opacity: form.sameNumber ? 0.5 : 1 }}>
                {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code} ({c.label})</option>)}
              </select>
              <input value={form.waNumber}
                onChange={e => updateForm('waNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                disabled={form.sameNumber}
                placeholder="9876543210" inputMode="numeric" maxLength={10}
                style={{ border: '1.5px solid var(--border)', borderRadius: '8px', padding: '12px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none', opacity: form.sameNumber ? 0.5 : 1, cursor: form.sameNumber ? 'not-allowed' : 'text' }}
                onFocus={e => { if (!form.sameNumber) e.target.style.borderColor = 'var(--green)'; }}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <div style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600, marginBottom: '24px' }}>Areas of Focus</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { label: 'Mutual Funds', icon: '📈' },
              { label: 'Insurance', icon: '🛡' },
              { label: 'Tax Planning', icon: '📋' },
              { label: 'Financial Planning', icon: '🎯' },
              { label: 'PMS', icon: '💼' },
              { label: 'NPS', icon: '🏦' },
              { label: 'Retirement Planning', icon: '☂' },
              { label: "Children's Education", icon: '🎓' },
              { label: 'NRI Investments', icon: '🌐' },
            ].map(s => {
              const selected = form.services.includes(s.label);
              const disabled = !selected && form.services.length >= 3;
              return (
                <div key={s.label}
                  onClick={() => !disabled && toggleService(s.label)}
                  style={{
                    border: `1.5px solid ${selected ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: '10px', padding: '14px 12px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    textAlign: 'center', fontSize: '13px',
                    fontWeight: selected ? 500 : 400,
                    color: selected ? 'var(--green)' : disabled ? '#bbb' : '#5a6a64',
                    background: selected ? 'rgba(44,74,62,0.07)' : 'var(--ivory)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                    opacity: disabled ? 0.4 : 1,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!disabled && !selected) { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}}
                  onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = disabled ? '#bbb' : '#5a6a64'; }}}
                >
                  <span style={{ fontSize: '18px' }}>{s.icon}</span>
                  {s.label}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '12px', color: '#9aaa9e', marginTop: '10px' }}>
            {form.services.length} of 3 selected
          </div>
          {form.services.length === 0 && <div id="services-error" style={{ fontSize: '12px', color: '#c0392b', marginTop: '6px', display: 'none' }}>Please select exactly 3 areas of focus</div>}
        </div>

        {/* FORM FOOTER */}
        <div style={{
          padding: '24px 40px', background: 'var(--sage)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <span style={{ fontSize: '13px', color: '#8a9e96' }}>This will generate the partner's micro-site page.</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => {
              setForm({ fname: '', lname: '', slug: '', arn: '', waCC: '+91', waNumber: '', callCC: '+91', callNumber: '', sameNumber: false, tagline: '', bio: '', services: [], referredBy: '—', photoPreview: null, logoPreview: null });
              setSubmitted(false);
            }} style={{
              padding: '11px 22px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              border: '1.5px solid var(--border)', background: '#fff', color: '#5a6a64',
              cursor: 'pointer', fontFamily: 'var(--body-font)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = '#5a6a64'; }}
            >Clear Form</button>
            <button onClick={() => { if (form.services.length === 3) setSubmitted(true); }} style={{
              padding: '11px 28px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
              letterSpacing: '0.06em', fontFamily: 'var(--body-font)',
              background: form.services.length === 3 ? 'var(--green)' : '#ccc',
              color: 'var(--ivory)', border: 'none',
              cursor: form.services.length === 3 ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => { if (form.services.length === 3) e.currentTarget.style.background = 'var(--gold)'; }}
              onMouseLeave={e => { if (form.services.length === 3) e.currentTarget.style.background = 'var(--green)'; }}
            >Create Partner Page →</button>
          </div>
        </div>
      </div>
    )}

    {/* ── SEND A LINK ── */}
    {mode === 'link' && (
      <div style={{
        background: '#fff', borderRadius: '16px',
        boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
        maxWidth: '860px',
      }}>
        <div style={{ padding: '40px' }}>
          <div style={{ fontFamily: 'var(--display-font)', fontSize: '26px', fontWeight: 600, color: 'var(--green)', marginBottom: '8px' }}>Send Onboarding Link</div>
          <p style={{ fontSize: '14px', color: '#8a9e96', fontWeight: 300, lineHeight: 1.7, marginBottom: '32px' }}>
            Generate a unique link and send it to your partner. They'll fill in their own details and the page will be created once you approve.
          </p>

          {/* Step 1 */}
          <div style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--sage)', border: '1.5px solid rgba(44,74,62,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--green)', flexShrink: 0, marginTop: '2px' }}>1</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: 'var(--charcoal)', marginBottom: '6px' }}>Enter the partner's full name to generate their unique link</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center' }}>
                <input value={linkName} onChange={e => setLinkName(e.target.value)}
                  placeholder="Partner's full name (e.g. Priya Sharma)"
                  style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: '8px', padding: '11px 14px', fontFamily: 'var(--body-font)', fontSize: '14px', color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button onClick={() => {
                  if (!linkName.trim()) return;
                  const slug = linkName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                  setGeneratedLink(`https://niom-backend.onrender.com/onboard/${slug}?token=demo123`);
                  setLinkStepsActive(true);
                }} style={{
                  background: 'var(--green)', color: 'var(--ivory)', border: 'none',
                  borderRadius: '8px', padding: '11px 20px', fontFamily: 'var(--body-font)',
                  fontSize: '13px', fontWeight: 500, letterSpacing: '0.06em',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                >🔗 Generate Link</button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid var(--border)', opacity: linkStepsActive ? 1 : 0.4, pointerEvents: linkStepsActive ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--sage)', border: '1.5px solid rgba(44,74,62,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--green)', flexShrink: 0, marginTop: '2px' }}>2</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', color: 'var(--charcoal)', marginBottom: '6px' }}>Copy and share this link with your partner</p>
              {generatedLink && (
                <div style={{ background: 'var(--sage)', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#4a6a5e', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ flex: 1, wordBreak: 'break-all' }}>{generatedLink}</span>
                  <button onClick={() => { navigator.clipboard.writeText(generatedLink); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1500); }}
                    style={{ background: 'var(--green)', color: 'var(--ivory)', border: 'none', borderRadius: '6px', padding: '7px 14px', fontSize: '12px', fontFamily: 'var(--body-font)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                  >{linkCopied ? 'Copied!' : 'Copy'}</button>
                </div>
              )}
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: '20px', padding: '20px 0', opacity: linkStepsActive ? 1 : 0.4, transition: 'opacity 0.3s' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--sage)', border: '1.5px solid rgba(44,74,62,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: 'var(--green)', flexShrink: 0, marginTop: '2px' }}>3</div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--charcoal)', marginBottom: '4px' }}>Review &amp; approve in your dashboard</p>
              <span style={{ fontSize: '13px', color: '#9aaa9e' }}>Once your partner submits their details, they'll appear as a pending partner in the Partner List for you to approve.</span>
            </div>
          </div>
        </div>
      </div>
    )}
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