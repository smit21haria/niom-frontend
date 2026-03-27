import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const mockInvestors = [
  { id: 1, name: 'Ramesh Patel', pan: 'ABCDE1234F', partner: 'Aakash Shethia', family: 'Patel Family', kyc: 'verified', joined: '12 Jan 2024' },
  { id: 2, name: 'Sunita Mehta', pan: 'FGHIJ5678K', partner: 'Priya Mehta', family: 'Mehta Family', kyc: 'verified', joined: '5 Mar 2024' },
  { id: 3, name: 'Arjun Sharma', pan: 'KLMNO9012P', partner: 'Aakash Shethia', family: '—', kyc: 'pending', joined: '20 Jun 2024' },
];

const mockPartners = ['Aakash Shethia', 'Priya Mehta'];
const mockFamilies = ['Patel Family', 'Mehta Family', 'Nair Family', 'Singh Family'];

const kycColor = {
  verified: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  pending: { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
};

const subSections = ['Investor List', 'Create Investor'];

export default function AdminInvestors() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Investor List');
  const [form, setForm] = useState({
    firstName: '', lastName: '', pan: '', mobile: '',
    email: '', dob: '', partner: '', family: '', riskProfile: 'Moderate',
  });
  const [saved, setSaved] = useState(false);

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Investor Management
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

        <div style={{ flex: 1, minWidth: 0 }}>
          {activeSection === 'Investor List' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                <span style={sectionHead}>All Investors</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Name', 'PAN', 'Partner', 'Family', 'KYC', 'Joined', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockInvestors.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{inv.name}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96' }}>{inv.pan.slice(0,3)}••••{inv.pan.slice(-2)}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{inv.partner}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{inv.family}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.1em', ...kycColor[inv.kyc] }}>{inv.kyc}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96' }}>{inv.joined}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => navigate(`/investors/${inv.id}`)} style={{
                            padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                            border: '1.5px solid var(--border)', background: '#fff',
                            color: 'var(--charcoal)', cursor: 'pointer',
                          }}>View</button>
                          <button style={{
                            padding: '5px 12px', borderRadius: '6px', fontSize: '12px',
                            border: '1.5px solid var(--border)', background: '#fff',
                            color: 'var(--charcoal)', cursor: 'pointer',
                          }}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'Create Investor' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '28px',
            }}>
              <span style={{ ...sectionHead, display: 'block', marginBottom: '24px' }}>Create Investor</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
                <div><Label>First Name</Label><input value={form.firstName} onChange={e => update('firstName', e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                <div><Label>Last Name</Label><input value={form.lastName} onChange={e => update('lastName', e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                <div><Label>PAN Number</Label><input value={form.pan} onChange={e => update('pan', e.target.value.toUpperCase())} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                <div><Label>Mobile</Label><input value={form.mobile} onChange={e => update('mobile', e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                <div><Label>Email</Label><input value={form.email} onChange={e => update('email', e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} /></div>
                <div><Label>Date of Birth</Label><input type="date" value={form.dob} onChange={e => update('dob', e.target.value)} style={inputStyle} /></div>
                <div>
                  <Label>Assign to Partner</Label>
                  <select value={form.partner} onChange={e => update('partner', e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">— Select partner</option>
                    {mockPartners.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Assign to Family</Label>
                  <select value={form.family} onChange={e => update('family', e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">— No family</option>
                    {mockFamilies.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Risk Profile</Label>
                  <select value={form.riskProfile} onChange={e => update('riskProfile', e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                    {['Conservative', 'Moderate', 'Aggressive'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => setSaved(true)} style={{
                  padding: '11px 28px', borderRadius: '8px',
                  background: 'var(--green)', color: 'var(--ivory)',
                  border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                >Create Investor</button>
                {saved && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓ Created</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}