import { useState, useEffect, useCallback } from 'react';
import { commission } from '../lib/api';

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

// Default to 1st of next month
function defaultEffectiveDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function PctInput({ label, description, value, onChange, disabled }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 28px', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: disabled ? '#8a9e96' : 'var(--charcoal)', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '12px', color: '#9aaa9e' }}>{description}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <input
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          disabled={disabled}
          style={{
            width: '80px', padding: '10px 12px', textAlign: 'right',
            border: `1.5px solid ${disabled ? 'rgba(44,74,62,0.08)' : 'var(--border)'}`,
            borderRadius: '8px', fontSize: '16px',
            fontFamily: 'var(--display-font)', fontWeight: 600,
            color: disabled ? '#8a9e96' : 'var(--charcoal)',
            background: disabled ? 'var(--sage)' : '#fff',
            outline: 'none',
          }}
          onFocus={e => { if (!disabled) e.target.style.borderColor = 'var(--green)'; }}
          onBlur={e => e.target.style.borderColor = disabled ? 'rgba(44,74,62,0.08)' : 'var(--border)'}
        />
        <span style={{ fontSize: '16px', fontFamily: 'var(--display-font)', fontWeight: 600, color: disabled ? '#8a9e96' : 'var(--charcoal)', width: '16px' }}>%</span>
      </div>
    </div>
  );
}

export default function AdminCommissionConfig() {
  const [activeSection, setActiveSection] = useState('Split Settings');

  // Config state
  const [level0, setLevel0]           = useState(60);
  const [level1, setLevel1]           = useState(10);
  const [level2, setLevel2]           = useState(5);
  const [effectiveFrom, setEffectiveFrom] = useState(defaultEffectiveDate());

  // UI state
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState(null);
  const [history,  setHistory]  = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  // Auto-cap logic — L0 takes priority, then L1, then L2
  const handleLevel0 = (v) => {
    const l0 = Math.min(v, 100);
    const l1 = Math.min(level1, Math.max(0, 100 - l0));
    const l2 = Math.min(level2, Math.max(0, 100 - l0 - l1));
    setLevel0(l0); setLevel1(l1); setLevel2(l2);
  };

  const handleLevel1 = (v) => {
    const l1 = Math.min(v, Math.max(0, 100 - level0));
    const l2 = Math.min(level2, Math.max(0, 100 - level0 - l1));
    setLevel1(l1); setLevel2(l2);
  };

  const handleLevel2 = (v) => {
    const l2 = Math.min(v, Math.max(0, 100 - level0 - level1));
    setLevel2(l2);
  };

  const niomShare = parseFloat((100 - level0 - level1 - level2).toFixed(2));

  // Load config on mount
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await commission.config();
      setLevel0(parseFloat(data.level0_pct) || 60);
      setLevel1(parseFloat(data.level1_pct) || 10);
      setLevel2(parseFloat(data.level2_pct) || 5);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const data = await commission.configHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch(e) {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  useEffect(() => {
    if (activeSection === 'Change History') loadHistory();
  }, [activeSection, loadHistory]);

  const handleSave = async () => {
    setSaving(true); setError(null); setSaved(false);
    try {
      await commission.updateConfig({
        level0_pct: level0,
        level1_pct: level1,
        level2_pct: level2,
        effective_from: effectiveFrom,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch(e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const subSections = ['Split Settings', 'Change History'];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Commission Config
        </h1>
        <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '4px' }}>
          Configure how AMC brokerage commissions are split between partners and Niom
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <div style={{
          width: '200px', flexShrink: 0, background: '#fff',
          borderRadius: '12px', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)', overflow: 'hidden',
          position: 'sticky', top: '20px',
        }}>
          {subSections.map(s => (
            <div key={s} onClick={() => setActiveSection(s)} style={{
              padding: '14px 16px', cursor: 'pointer', fontSize: '13px',
              fontWeight: activeSection === s ? 600 : 400,
              color: activeSection === s ? 'var(--green)' : '#5a6a64',
              background: activeSection === s ? 'rgba(44,74,62,0.06)' : '#fff',
              borderLeft: `3px solid ${activeSection === s ? 'var(--green)' : 'transparent'}`,
              borderBottom: '1px solid var(--border)',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (activeSection !== s) e.currentTarget.style.background = 'var(--sage)'; }}
              onMouseLeave={e => { if (activeSection !== s) e.currentTarget.style.background = '#fff'; }}
            >{s}</div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ── SPLIT SETTINGS ── */}
          {activeSection === 'Split Settings' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>

              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                <span style={sectionHead}>Split Settings</span>
                <p style={{ fontSize: '12px', color: '#9aaa9e', marginTop: '4px' }}>
                  Percentages are applied to the gross AMC commission earned on each partner's AUM
                </p>
              </div>

              {error && (
                <div style={{ margin: '20px 28px 0', padding: '12px 16px', borderRadius: '8px', background: 'rgba(192,80,80,0.08)', color: '#c05050', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              {loading ? (
                <div style={{ padding: '60px 28px', textAlign: 'center', color: '#9aaa9e', fontSize: '13px' }}>
                  Loading config...
                </div>
              ) : (
                <>
                  <PctInput
                    label="Level 0 — Partner's Own Share"
                    description="Every partner keeps this % of the commission earned from their own clients' AUM"
                    value={level0}
                    onChange={handleLevel0}
                  />
                  <PctInput
                    label="Level 1 — Direct Referral Bonus"
                    description="A partner earns this additional % of commission from each partner they directly referred"
                    value={level1}
                    onChange={handleLevel1}
                  />
                  <PctInput
                    label="Level 2 — Second-Level Referral Bonus"
                    description="A partner earns this additional % of commission from their referrals' referrals"
                    value={level2}
                    onChange={handleLevel2}
                  />

                  {/* Niom share — auto-calculated, read-only */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 28px', borderBottom: '1px solid var(--border)',
                    background: 'var(--sage)',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--green)', marginBottom: '4px' }}>
                        Niom's Share — Auto Calculated
                      </div>
                      <div style={{ fontSize: '12px', color: '#8a9e96' }}>
                        Remainder after all partner level payouts. This is the minimum cut on the deepest-level partner's commission.
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{
                        fontFamily: 'var(--display-font)', fontSize: '28px', fontWeight: 600,
                        color: niomShare < 0 ? '#c05050' : 'var(--green)',
                      }}>
                        {niomShare}%
                      </span>
                    </div>
                  </div>

                  {/* Effective from date + save */}
                  <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '8px' }}>Apply From</div>
                      <input
                        type="date"
                        value={effectiveFrom}
                        onChange={e => setEffectiveFrom(e.target.value)}
                        style={{
                          padding: '10px 14px', border: '1.5px solid var(--border)',
                          borderRadius: '8px', fontSize: '13px',
                          fontFamily: 'var(--body-font)', color: 'var(--charcoal)',
                          background: '#fff', outline: 'none',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--green)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                      <div style={{ fontSize: '11px', color: '#9aaa9e', marginTop: '4px' }}>
                        Defaults to 1st of next month
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {saved && (
                        <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>
                          ✓ Saved successfully
                        </span>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                          padding: '11px 28px', borderRadius: '8px',
                          background: saving ? '#9aaa9e' : 'var(--green)',
                          color: 'var(--ivory)', border: 'none',
                          fontSize: '13px', fontWeight: 500,
                          cursor: saving ? 'default' : 'pointer',
                          fontFamily: 'var(--body-font)', transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--gold)'; }}
                        onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--green)'; }}
                      >
                        {saving ? 'Saving...' : 'Save — Apply to Future Commissions'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── CHANGE HISTORY ── */}
          {activeSection === 'Change History' && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                <span style={sectionHead}>Change History</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: 'var(--sage)' }}>
                      {['Effective From', 'Level 0', 'Level 1', 'Level 2', 'Niom Share', 'Changed On'].map(h => (
                        <th key={h} style={{
                          padding: '12px 20px', textAlign: 'left',
                          ...tabLabel, fontFamily: 'var(--body-font)',
                          fontSize: '10px', whiteSpace: 'nowrap',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {histLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          {Array.from({ length: 6 }).map((__, j) => (
                            <td key={j} style={{ padding: '14px 20px' }}>
                              <div style={{ height: '13px', borderRadius: '4px', width: '60px', background: 'linear-gradient(90deg, var(--sage) 25%, #e8ede8 50%, var(--sage) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : history.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '60px 24px', textAlign: 'center', fontSize: '13px', color: '#9aaa9e' }}>
                          No changes recorded yet. Save a config to create the first history entry.
                        </td>
                      </tr>
                    ) : history.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)' }}>
                          {formatDate(row.effective_from)}
                        </td>
                        <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '15px', color: 'var(--green)', fontWeight: 600 }}>
                          {parseFloat(row.level0_pct)}%
                        </td>
                        <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '15px', color: 'var(--green)', fontWeight: 600 }}>
                          {parseFloat(row.level1_pct)}%
                        </td>
                        <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '15px', color: 'var(--green)', fontWeight: 600 }}>
                          {parseFloat(row.level2_pct)}%
                        </td>
                        <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '15px', color: 'var(--charcoal)' }}>
                          {parseFloat(row.niom_pct)}%
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '12px', color: '#8a9e96' }}>
                          {formatDate(row.changed_on)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}
