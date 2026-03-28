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
  {
    section: 'Dashboards',
    items: ['Client Dashboard', 'Partner Dashboard'],
  },
  {
    section: 'Clients',
    items: ['View Investors', 'Create Investors', 'Edit Investors', 'View Families', 'Create Families', 'Edit Families'],
  },
  {
    section: 'Client Reports',
    items: ['Portfolio Report (Comprehensive)', 'Portfolio Report (Niom ARN)', 'Portfolio Report (External ARN)', 'Returns Report', 'Holdings Report', 'Capital Gains Report', 'Transaction History'],
  },
  {
    section: 'Commission',
    items: ['View Commission', 'Commission Details', 'Mark as Paid'],
  },
  {
    section: 'Research',
    items: ['Fund Explorer', 'Compare Funds', 'Category Analysis', 'Calculators'],
  },
  {
    section: 'Admin Controls',
    items: ['Admin Profile', 'Partner Management', 'Investor Management', 'Family Management', 'Access Control', 'Commission Config', 'Brokerage Management'],
  },
];

const roles = ['Partner', 'Investor'];

const defaultAccess = {
  Partner: {
    'Client Dashboard': true,
    'Partner Dashboard': false,
    'View Investors': true,
    'Create Investors': false,
    'Edit Investors': false,
    'View Families': true,
    'Create Families': false,
    'Edit Families': false,
    'Portfolio Report (Comprehensive)': true,
    'Portfolio Report (Niom ARN)': true,
    'Portfolio Report (External ARN)': false,
    'Returns Report': true,
    'Holdings Report': true,
    'Capital Gains Report': true,
    'Transaction History': true,
    'View Commission': true,
    'Commission Details': false,
    'Mark as Paid': false,
    'Fund Explorer': true,
    'Compare Funds': true,
    'Category Analysis': true,
    'Calculators': true,
    'Admin Profile': false,
    'Partner Management': false,
    'Investor Management': false,
    'Family Management': false,
    'Access Control': false,
    'Commission Config': false,
    'Brokerage Management': false,
  },
  Investor: {
    'Client Dashboard': true,
    'Partner Dashboard': false,
    'View Investors': false,
    'Create Investors': false,
    'Edit Investors': false,
    'View Families': false,
    'Create Families': false,
    'Edit Families': false,
    'Portfolio Report (Comprehensive)': true,
    'Portfolio Report (Niom ARN)': true,
    'Portfolio Report (External ARN)': false,
    'Returns Report': true,
    'Holdings Report': true,
    'Capital Gains Report': true,
    'Transaction History': false,
    'View Commission': false,
    'Commission Details': false,
    'Mark as Paid': false,
    'Fund Explorer': true,
    'Compare Funds': false,
    'Category Analysis': false,
    'Calculators': true,
    'Admin Profile': false,
    'Partner Management': false,
    'Investor Management': false,
    'Family Management': false,
    'Access Control': false,
    'Commission Config': false,
    'Brokerage Management': false,
  },
};

function Toggle({ on, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center',
      width: '40px', height: '22px', borderRadius: '100px',
      background: on ? 'var(--green)' : '#ddd',
      cursor: 'pointer', transition: 'background 0.2s',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
        position: 'absolute',
        left: on ? '21px' : '3px',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </div>
  );
}

export default function AdminAccessControl() {
  const allFeatures = features.flatMap(s => s.items);
  const [access, setAccess] = useState(defaultAccess);
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

  const toggleSection = (role, sectionItems, value) => {
    setAccess(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        ...Object.fromEntries(sectionItems.map(f => [f, value])),
      },
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
                <th style={{
                  padding: '14px 24px', textAlign: 'left',
                  ...tabLabel, fontFamily: 'var(--body-font)', width: '300px',
                }}>Feature</th>
                {roles.map(role => (
                  <th key={role} style={{
                    padding: '14px 24px', textAlign: 'center',
                    ...tabLabel, fontFamily: 'var(--body-font)',
                  }}>
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
                  {/* Section header row */}
                  <tr key={section.section} style={{ background: 'rgba(184,150,90,0.05)' }}>
                    <td style={{
                      padding: '10px 24px',
                      ...tabLabel, fontSize: '10px',
                      color: 'var(--gold)', fontFamily: 'var(--body-font)',
                    }}>
                      {section.section}
                    </td>
                    {roles.map(role => {
                      const allOn = section.items.every(f => access[role][f]);
                      const allOff = section.items.every(f => !access[role][f]);
                      return (
                        <td key={role} style={{ padding: '10px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button onClick={() => toggleSection(role, section.items, true)} style={{
                              padding: '2px 8px', borderRadius: '4px', fontSize: '10px',
                              border: '1px solid var(--border)',
                              background: allOn ? 'var(--green)' : '#fff',
                              color: allOn ? '#fff' : 'var(--green)',
                              cursor: 'pointer', fontWeight: 600,
                            }}>All</button>
                            <button onClick={() => toggleSection(role, section.items, false)} style={{
                              padding: '2px 8px', borderRadius: '4px', fontSize: '10px',
                              border: '1px solid var(--border)',
                              background: allOff ? '#c05050' : '#fff',
                              color: allOff ? '#fff' : '#c05050',
                              cursor: 'pointer', fontWeight: 600,
                            }}>None</button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Feature rows */}
                  {section.items.map(feature => (
                    <tr key={feature} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '13px 24px 13px 36px', fontSize: '13px', color: 'var(--charcoal)' }}>
                        {feature}
                      </td>
                      {roles.map(role => (
                        <td key={role} style={{ padding: '13px 24px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Toggle on={access[role][feature]} onClick={() => toggle(role, feature)} />
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

        <div style={{
          padding: '20px 28px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: '12px', alignItems: 'center',
        }}>
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