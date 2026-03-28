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

  // Onboard form state
  const [form, setForm] = useState({
    fname: '', lname: '', arn: '',
    waCC: '+91', waNumber: '',
    callCC: '+91', callNumber: '',
    tagline: '', bio: '',
    services: [],
    referredBy: '—',
    status: 'pending',
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

  const rootPartners = mockPartners.filter(p => p.referredBy === '—');
  const filtered = filterStatus === 'All'
    ? mockPartners
    : mockPartners.filter(p => p.status === filterStatus.toLowerCase());

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

          {/* ── PARTNER LIST — identical to Partners.jsx ── */}
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

              {/* Table */}
              <div style={{
                background: '#fff', borderRadius: '16px',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '20px 28px', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={sectionHead}>All Partners</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['All', 'Live', 'Pending', 'Paused'].map(f => (
                      <button key={f} onClick={() => setFilterStatus(f)} style={{
                        padding: '6px 14px', borderRadius: '100px',
                        fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em',
                        border: '1.5px solid var(--border)',
                        background: filterStatus === f ? 'var(--green)' : '#fff',
                        color: filterStatus === f ? 'var(--ivory)' : '#7a8a84',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>{f}</button>
                    ))}
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                    <thead>
                      <tr style={{ background: 'var(--sage)' }}>
                        {['Partner', 'ARN', 'Status', 'Total AUM', 'AUM MoM', 'Investors', 'SIP Amount', 'Commission Due', 'Leads MTD', 'Last Txn'].map(h => (
                          <th key={h} style={{
                            padding: '12px 20px', textAlign: 'left',
                            ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id}
                          onClick={() => navigate(`/partners/${p.id}`)}
                          style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '34px', height: '34px', borderRadius: '50%',
                                background: 'rgba(44,74,62,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '12px', fontWeight: 600, color: 'var(--green)', flexShrink: 0,
                              }}>
                                {p.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{p.arn}</td>
                          <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{
                              fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                              textTransform: 'uppercase', padding: '4px 10px', borderRadius: '100px',
                              ...statusColor[p.status],
                            }}>{p.status}</span>
                          </td>
                          <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{p.aum}</td>
                          <td style={{ padding: '16px 20px', fontSize: '13px', whiteSpace: 'nowrap', color: p.aumChange.startsWith('+') ? '#2d8a55' : p.aumChange === '—' ? '#8a9e96' : '#c0392b' }}>{p.aumChange}</td>
                          <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)' }}>{p.investors}</td>
                          <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                            {p.sip}<span style={{ color: '#8a9e96', fontSize: '12px' }}> · {p.sipCount} SIPs</span>
                          </td>
                          <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{p.commission}</td>
                          <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)' }}>{p.leads}</td>
                          <td style={{ padding: '16px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{p.lastTxn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ONBOARD PARTNER ── */}
          {activeSection === 'Onboard Partner' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '36px',
            }}>
              <span style={{ ...sectionHead, display: 'block', marginBottom: '28px' }}>Onboard New Partner</span>

              {/* Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <Label>First Name</Label>
                  <input value={form.fname} onChange={e => updateForm('fname', e.target.value)}
                    placeholder="First name" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <input value={form.lname} onChange={e => updateForm('lname', e.target.value)}
                    placeholder="Last name" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </div>

              {/* ARN */}
              <div style={{ marginBottom: '20px' }}>
                <Label>Sub-ARN Number</Label>
                <input value={form.arn} onChange={e => updateForm('arn', e.target.value)}
                  placeholder="ARN-XXXXX" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* WhatsApp */}
              <div style={{ marginBottom: '20px' }}>
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

              {/* Call */}
              <div style={{ marginBottom: '20px' }}>
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

              {/* Referred By — NEW */}
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

              {/* Tagline */}
              <div style={{ marginBottom: '20px' }}>
                <Label>Tagline</Label>
                <input value={form.tagline} onChange={e => updateForm('tagline', e.target.value)}
                  placeholder="Short tagline for micro-site" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* Bio */}
              <div style={{ marginBottom: '20px' }}>
                <Label>Bio</Label>
                <textarea value={form.bio} onChange={e => updateForm('bio', e.target.value)}
                  placeholder="Brief professional bio..." rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = 'var(--green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>

              {/* Services */}
              <div style={{ marginBottom: '28px' }}>
                <Label>Services Offered</Label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {SERVICES.map(s => (
                    <button key={s} onClick={() => toggleService(s)} style={{
                      padding: '8px 16px', borderRadius: '100px', fontSize: '13px',
                      border: '1.5px solid var(--border)', cursor: 'pointer',
                      background: form.services.includes(s) ? 'var(--green)' : '#fff',
                      color: form.services.includes(s) ? 'var(--ivory)' : '#7a8a84',
                      transition: 'all 0.2s',
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button onClick={() => setSubmitted(true)} style={{
                  padding: '12px 32px', borderRadius: '8px',
                  background: 'var(--green)', color: 'var(--ivory)',
                  border: 'none', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', letterSpacing: '0.06em',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                >Onboard Partner</button>
                {submitted && (
                  <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>
                    ✓ Partner onboarded
                  </span>
                )}
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