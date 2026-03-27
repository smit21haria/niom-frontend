import { useState } from 'react';

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
  { id: 1, name: 'Aakash Shethia', arn: 'ARN-12345', status: 'live', referredBy: '—', investors: 18, aum: '₹2.4 Cr', joined: '12 Jan 2024' },
  { id: 2, name: 'Priya Mehta', arn: 'ARN-67890', status: 'live', referredBy: 'Aakash Shethia', investors: 9, aum: '₹1.1 Cr', joined: '5 Mar 2024' },
  { id: 3, name: 'Rahul Sharma', arn: 'ARN-11223', status: 'pending', referredBy: '—', investors: 0, aum: '₹0', joined: '20 Jun 2024' },
  { id: 4, name: 'Neha Gupta', arn: 'ARN-44556', status: 'paused', referredBy: 'Priya Mehta', investors: 5, aum: '₹78 L', joined: '8 Sep 2023' },
];

const statusColor = {
  live: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  pending: { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
  paused: { bg: 'rgba(200,200,200,0.2)', color: '#8a9e96' },
};

const subSections = ['Partner List', 'MLM Referral Tree', 'Onboarding Links'];

// Drawer component
function PartnerDrawer({ partner, onClose, allPartners }) {
  const isEdit = !!partner?.id;
  const [form, setForm] = useState({
    name: partner?.name || '',
    arn: partner?.arn || '',
    status: partner?.status || 'pending',
    referredBy: partner?.referredBy || '—',
    email: '',
    phone: '',
  });

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(26,43,37,0.4)', zIndex: 200,
      }} />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px',
        background: '#fff', zIndex: 201, overflowY: 'auto',
        boxShadow: '-8px 0 40px rgba(44,74,62,0.12)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={sectionHead}>{isEdit ? 'Edit Partner' : 'Create Partner'}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '18px', color: '#8a9e96', lineHeight: 1,
          }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <Label>Full Name</Label>
            <input value={form.name} onChange={e => update('name', e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <Label>Sub-ARN Number</Label>
            <input value={form.arn} onChange={e => update('arn', e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <Label>Email</Label>
              <input value={form.email} onChange={e => update('email', e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <Label>Phone</Label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <div>
            <Label>Referred By (MLM Upline)</Label>
            <select value={form.referredBy} onChange={e => update('referredBy', e.target.value)}
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
              <option value="—">— Direct (no referral)</option>
              {allPartners.filter(p => !partner || p.id !== partner.id).map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Status</Label>
            <select value={form.status} onChange={e => update('status', e.target.value)}
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
              <option value="pending">Pending</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 28px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: '10px', flexShrink: 0,
        }}>
          <button style={{
            flex: 1, padding: '12px', borderRadius: '8px',
            background: 'var(--green)', color: 'var(--ivory)',
            border: 'none', fontSize: '13px', fontWeight: 500,
            cursor: 'pointer', letterSpacing: '0.06em',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
          >{isEdit ? 'Save Changes' : 'Create Partner'}</button>
          <button onClick={onClose} style={{
            padding: '12px 20px', borderRadius: '8px',
            background: 'transparent', color: '#8a9e96',
            border: '1.5px solid var(--border)', fontSize: '13px', cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </div>
    </>
  );
}

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
        marginBottom: '8px', cursor: children.length ? 'pointer' : 'default',
      }} onClick={() => children.length && setExpanded(v => !v)}>
        {children.length > 0 && (
          <span style={{ fontSize: '10px', color: '#8a9e96', transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▶</span>
        )}
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'rgba(44,74,62,0.1)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 600, color: 'var(--green)', flexShrink: 0,
        }}>
          {partner.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)' }}>{partner.name}</div>
          <div style={{ fontSize: '11px', color: '#8a9e96' }}>{partner.arn} · {partner.investors} investors · {partner.aum}</div>
        </div>
        <span style={{
          marginLeft: 'auto', fontSize: '11px', fontWeight: 600,
          padding: '3px 8px', borderRadius: '100px',
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
  const [activeSection, setActiveSection] = useState('Partner List');
  const [drawer, setDrawer] = useState(null); // null | 'create' | partner object
  const [filterStatus, setFilterStatus] = useState('All');

  const rootPartners = mockPartners.filter(p => p.referredBy === '—');
  const filtered = filterStatus === 'All' ? mockPartners : mockPartners.filter(p => p.status === filterStatus.toLowerCase());

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
          width: '200px', flexShrink: 0,
          background: '#fff', borderRadius: '12px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          overflow: 'hidden',
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

          {/* Partner List */}
          {activeSection === 'Partner List' && (
            <div>
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
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['All', 'Live', 'Pending', 'Paused'].map(f => (
                        <button key={f} onClick={() => setFilterStatus(f)} style={{
                          padding: '6px 14px', borderRadius: '100px', fontSize: '12px',
                          border: '1.5px solid var(--border)',
                          background: filterStatus === f ? 'var(--green)' : '#fff',
                          color: filterStatus === f ? 'var(--ivory)' : '#7a8a84',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}>{f}</button>
                      ))}
                    </div>
                    <button onClick={() => setDrawer('create')} style={{
                      padding: '8px 18px', borderRadius: '8px',
                      background: 'var(--green)', color: 'var(--ivory)',
                      border: 'none', fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                    >+ Add Partner</button>
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ background: 'var(--sage)' }}>
                        {['Partner', 'ARN', 'Status', 'Referred By', 'Investors', 'AUM', 'Joined', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '32px', height: '32px', borderRadius: '50%',
                                background: 'rgba(44,74,62,0.1)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: 600, color: 'var(--green)', flexShrink: 0,
                              }}>{p.name.split(' ').map(n => n[0]).join('')}</div>
                              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{p.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{p.arn}</td>
                          <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '100px', ...statusColor[p.status] }}>{p.status}</span>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{p.referredBy}</td>
                          <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{p.investors}</td>
                          <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{p.aum}</td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{p.joined}</td>
                          <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                            <button onClick={() => setDrawer(p)} style={{
                              padding: '6px 14px', borderRadius: '6px', fontSize: '12px',
                              border: '1.5px solid var(--border)', background: '#fff',
                              color: 'var(--charcoal)', cursor: 'pointer',
                            }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--charcoal)'; }}
                            >Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MLM Referral Tree */}
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

          {/* Onboarding Links */}
          {activeSection === 'Onboarding Links' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 28px', borderBottom: '1px solid var(--border)',
              }}>
                <span style={sectionHead}>Onboarding Links</span>
                <button style={{
                  padding: '8px 18px', borderRadius: '8px',
                  background: 'var(--green)', color: 'var(--ivory)',
                  border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                >+ Generate Link</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Partner', 'Onboarding URL', 'Created', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockPartners.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)' }}>{p.name}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'monospace' }}>
                          niomfintech.in/onboard/{p.name.split(' ')[0].toLowerCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96' }}>{p.joined}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '100px', ...statusColor[p.status] }}>{p.status}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button style={{
                          padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                          border: '1.5px solid var(--border)', background: '#fff',
                          color: 'var(--charcoal)', cursor: 'pointer',
                        }}>Copy</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      {drawer && (
        <PartnerDrawer
          partner={drawer === 'create' ? null : drawer}
          onClose={() => setDrawer(null)}
          allPartners={mockPartners}
        />
      )}
    </div>
  );
}