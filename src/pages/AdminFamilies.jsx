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

const allInvestors = ['Ramesh Patel', 'Sunita Mehta', 'Arjun Sharma', 'Kavya Nair', 'Vikram Singh', 'Sunita Patel', 'Aryan Patel'];

const mockFamilies = [
  { id: 1, name: 'Patel Family', head: 'Ramesh Patel', members: ['Ramesh Patel', 'Sunita Patel', 'Aryan Patel'], partner: 'Aakash Shethia', aum: '₹48.2 L' },
  { id: 2, name: 'Mehta Family', head: 'Sunita Mehta', members: ['Sunita Mehta', 'Arjun Sharma'], partner: 'Priya Mehta', aum: '₹12.4 L' },
  { id: 3, name: 'Nair Family', head: 'Kavya Nair', members: ['Kavya Nair', 'Vikram Singh'], partner: 'Aakash Shethia', aum: '₹29.1 L' },
];

const subSections = ['Family List', 'Create Family'];

function FamilyDrawer({ family, onClose }) {
  const [form, setForm] = useState({
    name: family.name,
    head: family.head,
    members: [...family.members],
  });
  const [saved, setSaved] = useState(false);
  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };
  const toggleMember = (inv) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(inv)
        ? f.members.filter(m => m !== inv)
        : [...f.members, inv],
    }));
    setSaved(false);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,43,37,0.4)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '480px',
        background: '#fff', zIndex: 201, overflowY: 'auto',
        boxShadow: '-8px 0 40px rgba(44,74,62,0.12)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={sectionHead}>Edit Family</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#8a9e96' }}>✕</button>
        </div>

        <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <Label>Family Name</Label>
            <input value={form.name} onChange={e => update('name', e.target.value)} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <Label>Head Investor</Label>
            <select value={form.head} onChange={e => update('head', e.target.value)} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
              {allInvestors.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <Label>Members</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {allInvestors.map(inv => (
                <label key={inv} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--charcoal)' }}>
                  <input type="checkbox"
                    checked={form.members.includes(inv)}
                    onChange={() => toggleMember(inv)}
                    style={{ accentColor: 'var(--green)', width: '15px', height: '15px' }} />
                  {inv}
                  {inv === form.head && <span style={{ fontSize: '11px', color: '#8a9e96', marginLeft: '4px' }}>(head)</span>}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={() => setSaved(true)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
          >Save Changes</button>
          <button onClick={onClose} style={{ padding: '12px 20px', borderRadius: '8px', background: 'transparent', color: '#8a9e96', border: '1.5px solid var(--border)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
          {saved && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓</span>}
        </div>
      </div>
    </>
  );
}

export default function AdminFamilies() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Family List');
  const [editingFamily, setEditingFamily] = useState(null);
  const [form, setForm] = useState({ name: '', head: '', members: [] });
  const [saved, setSaved] = useState(false);
  const update = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };
  const toggleMember = (inv) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(inv) ? f.members.filter(m => m !== inv) : [...f.members, inv],
    }));
    setSaved(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Family Management
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ width: '200px', flexShrink: 0, background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
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
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
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
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{f.members.length}</td>
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{f.aum}</td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{f.partner}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => navigate(`/families/${f.id}`)} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', border: '1.5px solid var(--border)', background: '#fff', color: 'var(--charcoal)', cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--charcoal)'; }}>View</button>
                          <button onClick={() => setEditingFamily(f)} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', border: '1.5px solid var(--border)', background: '#fff', color: 'var(--charcoal)', cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--charcoal)'; }}>Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'Create Family' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '28px' }}>
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
                    {allInvestors.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Add Members</Label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {allInvestors.filter(i => i !== form.head).map(inv => (
                      <label key={inv} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--charcoal)' }}>
                        <input type="checkbox"
                          checked={form.members.includes(inv)}
                          onChange={() => toggleMember(inv)}
                          style={{ accentColor: 'var(--green)', width: '15px', height: '15px' }} />
                        {inv}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={() => setSaved(true)} style={{ padding: '11px 28px', borderRadius: '8px', background: 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
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

      {editingFamily && (
        <FamilyDrawer family={editingFamily} onClose={() => setEditingFamily(null)} />
      )}
    </div>
  );
}