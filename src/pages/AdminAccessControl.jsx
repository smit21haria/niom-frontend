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

const features = [
  { section: 'Dashboards', items: ['Client Dashboard', 'Partner Dashboard'] },
  { section: 'Clients', items: ['View Investors', 'Create Investors', 'Edit Investors', 'View Families', 'Create Families', 'Edit Families'] },
  { section: 'Reports', items: ['Client Reports', 'Download PDF', 'Download Excel'] },
  { section: 'Finance', items: ['View Commission', 'Commission Details'] },
  { section: 'Research', items: ['Fund Explorer', 'Compare Funds', 'Category Analysis', 'Calculators'] },
];

const roles = ['Partner', 'Investor'];

export default function AdminAccessControl() {
  const allFeatures = features.flatMap(s => s.items);
  const [access, setAccess] = useState(() => {
    const initial = {};
    roles.forEach(role => {
      initial[role] = {};
      allFeatures.forEach(f => {
        // Default access
        if (role === 'Partner') initial[role][f] = !['Commission Details', 'Create Investors', 'Edit Investors', 'Create Families', 'Edit Families'].includes(f);
        if (role === 'Investor') initial[role][f] = ['Client Dashboard', 'View Investors', 'View Families', 'Client Reports', 'Download PDF', 'Fund Explorer', 'Calculators'].includes(f);
      });
    });
    return initial;
  });
  const [saved, setSaved] = useState(false);

  const toggle = (role, feature) => {
    setAccess(prev => ({
      ...prev,
      [role]: { ...prev[role], [feature]: !prev[role][feature] },
    }));
    setSaved(false);
  };

  const toggleAll = (role, value) => {
    setAccess(prev => ({
      ...prev,
      [role]: Object.fromEntries(allFeatures.map(f => [f, value])),
    }));
    setSaved(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Access Control
        </h1>
        <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '6px' }}>
          Control which features are visible and accessible per role.
        </p>
      </div>

      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                <th style={{ padding: '14px 24px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', width: '280px' }}>
                  Feature
                </th>
                {roles.map(role => (
                  <th key={role} style={{ padding: '14px 24px', textAlign: 'center', ...tabLabel, fontFamily: 'var(--body-font)' }}>
                    <div style={{ marginBottom: '8px' }}>{role}</div>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => toggleAll(role, true)} style={{
                        padding: '3px 8px', borderRadius: '4px', fontSize: '10px',
                        border: '1px solid var(--border)', background: '#fff',
                        color: 'var(--green)', cursor: 'pointer', fontWeight: 600,
                      }}>All</button>
                      <button onClick={() => toggleAll(role, false)} style={{
                        padding: '3px 8px', borderRadius: '4px', fontSize: '10px',
                        border: '1px solid var(--border)', background: '#fff',
                        color: '#c05050', cursor: 'pointer', fontWeight: 600,
                      }}>None</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map(section => (
                <>
                  <tr key={section.section} style={{ background: 'rgba(184,150,90,0.05)' }}>
                    <td colSpan={roles.length + 1} style={{
                      padding: '10px 24px',
                      ...tabLabel, fontSize: '10px',
                      color: 'var(--gold)', fontFamily: 'var(--body-font)',
                    }}>
                      {section.section}
                    </td>
                  </tr>
                  {section.items.map(feature => (
                    <tr key={feature} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '13px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>
                        {feature}
                      </td>
                      {roles.map(role => (
                        <td key={role} style={{ padding: '13px 24px', textAlign: 'center' }}>
                          <div
                            onClick={() => toggle(role, feature)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '40px', height: '22px', borderRadius: '100px',
                              background: access[role][feature] ? 'var(--green)' : '#ddd',
                              cursor: 'pointer', transition: 'background 0.2s', position: 'relative',
                            }}
                          >
                            <div style={{
                              width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
                              position: 'absolute',
                              left: access[role][feature] ? '21px' : '3px',
                              transition: 'left 0.2s',
                            }} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => setSaved(true)} style={{
            padding: '11px 28px', borderRadius: '8px',
            background: 'var(--green)', color: 'var(--ivory)',
            border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
          >Save Access Settings</button>
          {saved && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}