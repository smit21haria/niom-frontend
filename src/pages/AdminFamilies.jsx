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

const mockFamilies = [
  { id: 1, name: 'Patel Family', head: 'Ramesh Patel', members: 3, partner: 'Aakash Shethia', aum: '₹48.2 L' },
  { id: 2, name: 'Mehta Family', head: 'Sunita Mehta', members: 2, partner: 'Priya Mehta', aum: '₹12.4 L' },
  { id: 3, name: 'Nair Family', head: 'Kavya Nair', members: 4, partner: 'Aakash Shethia', aum: '₹29.1 L' },
];

const mockInvestors = ['Ramesh Patel', 'Sunita Mehta', 'Arjun Sharma', 'Kavya Nair', 'Vikram Singh'];

const subSections = ['Family List', 'Create Family'];

export default function AdminFamilies() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Family List');
  const [form, setForm] = useState({ name: '', head: '', members: [] });
  const [saved, setSaved] = useState(false);

  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Family Management
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
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
          {activeSection === 'Family List' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                <span style={sectionHead}>All Families</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Family Name', 'Head Investor', 'Members', 'AUM', 'Partner', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockFamilies.map(f => (
                    <tr key={f.id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{f.name}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{f.head}</td>
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{f.members}</td>
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{f.aum}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{f.partner}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => navigate(`/families/${f.id}`)} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', border: '1.5px solid var(--border)', background: '#fff', color: 'var(--charcoal)', cursor: 'pointer' }}>View</button>
                          <button style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', border: '1.5px solid var(--border)', background: '#fff', color: 'var(--charcoal)', cursor: 'pointer' }}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'Create Family' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '28px',
            }}>
              <span style={{ ...sectionHead, display: 'block', marginBottom: '24px' }}>Create Family</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '480px' }}>
                <div>
                  <Label>Family Name</Label>
                  <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Sharma Family" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <Label>Head Investor</Label>
                  <select value={form.head} onChange={e => update('head', e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">— Select head investor</option>
                    {mockInvestors.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Add Members</Label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {mockInvestors.filter(i => i !== form.head).map(inv => (
                      <label key={inv} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--charcoal)' }}>
                        <input type="checkbox"
                          checked={form.members.includes(inv)}
                          onChange={e => update('members', e.target.checked ? [...form.members, inv] : form.members.filter(m => m !== inv))}
                          style={{ accentColor: 'var(--green)', width: '15px', height: '15px' }} />
                        {inv}
                      </label>
                    ))}
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
                  >Create Family</button>
                  {saved && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓ Created</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}