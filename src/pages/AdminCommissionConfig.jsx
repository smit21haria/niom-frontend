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
  padding: '10px 14px',
  border: '1.5px solid var(--border)', borderRadius: '8px',
  fontSize: '14px', fontFamily: 'var(--body-font)',
  color: 'var(--charcoal)', background: '#fff', outline: 'none',
  width: '100px', textAlign: 'right',
};

const changeHistory = [
  { date: '1 Mar 2026', level1Before: '10%', level1After: '12%', level2Before: '5%', level2After: '5%', changedBy: 'Niom Admin' },
  { date: '1 Jan 2026', level1Before: '8%', level1After: '10%', level2Before: '4%', level2After: '5%', changedBy: 'Niom Admin' },
  { date: '1 Oct 2025', level1Before: '—', level1After: '8%', level2Before: '—', level2After: '4%', changedBy: 'Niom Admin' },
];

const subSections = ['Split Settings', 'Change History'];

export default function AdminCommissionConfig() {
  const [activeSection, setActiveSection] = useState('Split Settings');
  const [level1, setLevel1] = useState(12);
  const [level2, setLevel2] = useState(5);
  const [saved, setSaved] = useState(false);

  const niomShare = 100 - level1 - level2;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Commission Config
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
          {activeSection === 'Split Settings' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '28px',
            }}>
              <span style={{ ...sectionHead, display: 'block', marginBottom: '8px' }}>Global MLM Split</span>
              <p style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '28px', lineHeight: 1.6 }}>
                Set the commission split percentages for each MLM level. Changes apply to future commissions only. Partner's own share is fixed at the remainder.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px', marginBottom: '28px' }}>
                {[
                  { label: 'Level 1 — Direct Referrer Cut', key: 'level1', value: level1, set: setLevel1, desc: 'The partner who directly referred the earning partner' },
                  { label: 'Level 2 — Indirect Referrer Cut', key: 'level2', value: level2, set: setLevel2, desc: 'The partner who referred the Level 1 referrer' },
                ].map(item => (
                  <div key={item.key} style={{
                    background: 'var(--sage)', borderRadius: '12px', padding: '20px',
                  }}>
                    <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>{item.label}</div>
                    <div style={{ fontSize: '12px', color: '#8a9e96', marginBottom: '12px' }}>{item.desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="number" min={0} max={50} value={item.value}
                        onChange={e => { item.set(+e.target.value); setSaved(false); }}
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = 'var(--green)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                      <span style={{ fontSize: '16px', color: 'var(--charcoal)', fontWeight: 500 }}>%</span>
                    </div>
                  </div>
                ))}

                {/* Niom share — auto calculated */}
                <div style={{
                  background: niomShare < 0 ? 'rgba(192,57,43,0.06)' : 'rgba(44,74,62,0.06)',
                  borderRadius: '12px', padding: '20px',
                  border: `1.5px solid ${niomShare < 0 ? 'rgba(192,57,43,0.3)' : 'rgba(44,74,62,0.15)'}`,
                }}>
                  <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>Niom's Share — Auto Calculated</div>
                  <div style={{ fontSize: '12px', color: '#8a9e96', marginBottom: '12px' }}>Remainder after all partner splits</div>
                  <div style={{ fontFamily: 'var(--display-font)', fontSize: '36px', fontWeight: 600, color: niomShare < 0 ? '#c05050' : 'var(--green)' }}>
                    {niomShare}%
                  </div>
                  {niomShare < 0 && (
                    <div style={{ fontSize: '12px', color: '#c05050', marginTop: '8px' }}>
                      ⚠ Total exceeds 100% — please reduce Level 1 or Level 2
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => niomShare >= 0 && setSaved(true)}
                  disabled={niomShare < 0}
                  style={{
                    padding: '11px 28px', borderRadius: '8px',
                    background: niomShare < 0 ? '#ccc' : 'var(--green)',
                    color: 'var(--ivory)', border: 'none',
                    fontSize: '13px', fontWeight: 500,
                    cursor: niomShare < 0 ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={e => { if (niomShare >= 0) e.currentTarget.style.background = 'var(--gold)'; }}
                  onMouseLeave={e => { if (niomShare >= 0) e.currentTarget.style.background = 'var(--green)'; }}
                >Save — Apply to Future Commissions</button>
                {saved && <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>✓ Saved</span>}
              </div>
            </div>
          )}

          {activeSection === 'Change History' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                <span style={sectionHead}>Change History</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Effective Date', 'Level 1 (Before)', 'Level 1 (After)', 'Level 2 (Before)', 'Level 2 (After)', 'Changed By'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', fontSize: '10px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {changeHistory.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '13px 20px', fontSize: '13px', color: '#8a9e96' }}>{row.date}</td>
                      <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#c05050' }}>{row.level1Before}</td>
                      <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--green)', fontWeight: 600 }}>{row.level1After}</td>
                      <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#c05050' }}>{row.level2Before}</td>
                      <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--green)', fontWeight: 600 }}>{row.level2After}</td>
                      <td style={{ padding: '13px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{row.changedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}