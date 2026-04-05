import { useState, useEffect } from 'react';
import { commission, portfolio, formatINR, getPartnerId, getPartnerSlug } from '../lib/api';

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

const TRAIL_RATE = 0.0001; // 0.01% per month placeholder
const PARTNER_SHARE = 0.70; // 70% goes to partner (30% to Niom)
const LEVEL1_PCT = 0.12;    // 12% of referral's trail goes to referrer
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 4 }, (_, i) => String(currentYear - i));

function KPICard({ label, value, sub, highlight }) {
  return (
    <div style={{
      flex: 1, background: '#fff', borderRadius: '16px',
      border: `1px solid ${highlight ? 'rgba(44,74,62,0.2)' : 'var(--border)'}`,
      boxShadow: 'var(--shadow)', padding: '24px 20px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      minHeight: '130px', justifyContent: 'space-between',
    }}>
      <div style={tabLabel}>{label}</div>
      <div style={{
        fontFamily: 'var(--display-font)', fontSize: '34px',
        fontWeight: 600, color: highlight ? 'var(--green)' : 'var(--charcoal)', lineHeight: 1,
      }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#9aaa9e' }}>{sub}</div>}
    </div>
  );
}

function SkeletonRow({ cols }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '14px 20px' }}>
          <div style={{ height: '13px', borderRadius: '4px', width: `${60 + Math.random() * 80}px`, background: 'linear-gradient(90deg, var(--sage) 25%, #e8ede8 50%, var(--sage) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
        </td>
      ))}
    </tr>
  );
}

// ── Subtree MLM tree — shows only this partner's downline ─────────────────────
function SubTreeNode({ partner, allPartners, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const children = allPartners.filter(p => p.referred_by_slug === partner.slug);

  return (
    <div style={{ marginLeft: level * 28 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '12px 16px', background: '#fff',
        borderRadius: '10px', border: '1px solid var(--border)',
        marginBottom: '8px',
        cursor: children.length ? 'pointer' : 'default',
      }} onClick={() => children.length && setExpanded(v => !v)}>
        {children.length > 0 ? (
          <span style={{ fontSize: '10px', color: '#8a9e96', transform: expanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>▶</span>
        ) : <span style={{ width: '14px' }} />}

        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(44,74,62,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: 'var(--green)', flexShrink: 0 }}>
          {/* Level 0 = direct referral: show initials. Level 1+ = masked */}
          {level === 0
            ? (partner.name || '').split(' ').map(w => w[0]).join('').slice(0, 2)
            : '••'
          }
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {level === 0 ? (
            <>
              <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{partner.name}</div>
              <div style={{ fontSize: '11px', color: '#9aaa9e' }}>{partner.arn || 'No ARN'}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#8a9e96' }}>Sub-partner</div>
              <div style={{ fontSize: '11px', color: '#c4d4d0' }}>Details hidden</div>
            </>
          )}
        </div>

        <span style={{
          fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '100px',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          background: partner.status === 'live' ? 'rgba(44,74,62,0.08)' : 'rgba(200,200,200,0.2)',
          color: partner.status === 'live' ? 'var(--green)' : '#8a9e96',
        }}>{partner.status}</span>

        {children.length > 0 && (
          <span style={{ fontSize: '12px', color: '#9aaa9e', marginLeft: '4px' }}>
            {children.length} sub-partner{children.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {expanded && children.map(child => (
        <SubTreeNode key={child.id} partner={child} allPartners={allPartners} level={level + 1} />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PartnerCommission() {
  const [selectedMonth, setSelectedMonth] = useState(monthNames[new Date().getMonth()]);
  const [selectedYear,  setSelectedYear]  = useState(String(currentYear));

  const [summaryData,  setSummaryData]  = useState(null);
  const [holdings,     setHoldings]     = useState([]);
  const [mlmTree,      setMlmTree]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  const partnerId   = getPartnerId();
  const partnerSlug = getPartnerSlug();

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null);
      try {
        const monthIdx = monthNames.indexOf(selectedMonth) + 1;

        const [sum, hold, tree] = await Promise.all([
          commission.summary(monthIdx, parseInt(selectedYear)),
          portfolio.holdings({ partner_id: partnerId }),
          commission.mlmTree(),
        ]);

        setSummaryData(sum);
        setHoldings(Array.isArray(hold) ? hold : []);
        setMlmTree(Array.isArray(tree) ? tree : []);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedMonth, selectedYear, partnerId]);

  // ── Derive partner-specific numbers from summary ───────────────────────────
  const myRow      = summaryData?.partners?.find(p => p.id === partnerId);
  const myAum      = myRow?.aum || 0;
  const myTrail    = parseFloat(((myAum * TRAIL_RATE) * PARTNER_SHARE).toFixed(2));

  // Referral earnings: sum of 12% of each direct referral's trail
  const mySlug     = partnerSlug;
  const directRefs = (summaryData?.partners || []).filter(p => p.referred_by_slug === mySlug);
  const referralEarnings = directRefs.reduce((s, p) => {
    const refTrail = parseFloat(p.aum || 0) * TRAIL_RATE;
    return s + refTrail * LEVEL1_PCT;
  }, 0);

  const totalPayable = myTrail + referralEarnings;

  // ── Scheme breakdown from holdings ────────────────────────────────────────
  // Group by scheme, sum AUM, apply trail rate
  const schemeMap = {};
  holdings.forEach(h => {
    const key   = h.plan_id || h.scheme_name;
    const name  = h.scheme_name || 'Unknown Scheme';
    const aum   = parseFloat(h.current_value || 0);
    if (!schemeMap[key]) schemeMap[key] = { name, aum: 0, category: h.category_name || '—' };
    schemeMap[key].aum += aum;
  });
  const schemeRows = Object.values(schemeMap)
    .map(s => ({
      ...s,
      monthly_commission: parseFloat((s.aum * TRAIL_RATE * PARTNER_SHARE).toFixed(2)),
    }))
    .sort((a, b) => b.aum - a.aum)
    .slice(0, 20);

  // ── MLM subtree: only partners referred by this partner (and their referrals) ──
  // Build the subtree starting from direct referrals
  const myDirectReferrals = mlmTree.filter(p => p.referred_by_slug === mySlug);

  // ── Selects styling ────────────────────────────────────────────────────────
  const selectStyle = {
    padding: '10px 16px', border: '1.5px solid var(--border)',
    borderRadius: '10px', fontSize: '13px', fontFamily: 'var(--body-font)',
    color: 'var(--charcoal)', background: '#fff', outline: 'none',
    cursor: 'pointer', appearance: 'none', minWidth: '120px',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a9e96' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
    paddingRight: '32px',
  };

  return (
    <div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Commission
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={selectStyle}>
            {monthNames.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={selectStyle}>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(192,80,80,0.08)', color: '#c05050', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <KPICard
          label="Brokerage Received"
          value={loading ? '—' : formatINR(myAum * TRAIL_RATE)}
          sub={`${selectedMonth} ${selectedYear} · estimated`}
        />
        <KPICard
          label="Your Payable"
          value={loading ? '—' : formatINR(myTrail)}
          sub="70% of brokerage received"
          highlight
        />
        <KPICard
          label="Referral Earnings"
          value={loading ? '—' : formatINR(referralEarnings)}
          sub={`From ${directRefs.length} direct referral${directRefs.length !== 1 ? 's' : ''}`}
        />
      </div>

      {/* Placeholder notice */}
      <div style={{ marginBottom: '24px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(184,150,90,0.08)', border: '1px solid rgba(184,150,90,0.2)', fontSize: '13px', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>⚠</span>
        <span>Commission figures are estimated based on a 0.01%/month trail rate. Actual brokerage statements from AMCs will replace these once integrated.</span>
      </div>

      {/* ── Scheme Breakdown Table ── */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: '28px' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <span style={sectionHead}>Scheme-wise Commission</span>
          <p style={{ fontSize: '12px', color: '#9aaa9e', marginTop: '4px' }}>
            Estimated trail commission per scheme based on your clients' holdings
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {['Scheme', 'Category', 'Total AUM', 'Trail Rate (Monthly)', 'Est. Commission'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
              ) : schemeRows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', fontSize: '13px', color: '#9aaa9e' }}>
                    No holdings found. Upload a CAS file to see scheme-wise breakdown.
                  </td>
                </tr>
              ) : schemeRows.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)', maxWidth: '260px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12px', color: '#8a9e96' }}>{s.category}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '15px', color: 'var(--charcoal)' }}>
                    {formatINR(s.aum)}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96', fontFamily: 'monospace' }}>
                    0.01% / month
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '15px', color: 'var(--green)' }}>
                    {formatINR(s.monthly_commission)}
                  </td>
                </tr>
              ))}
            </tbody>
            {schemeRows.length > 0 && (
              <tfoot>
                <tr style={{ background: 'var(--sage)', borderTop: '2px solid var(--border)' }}>
                  <td colSpan={2} style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600, color: 'var(--charcoal)' }}>Total</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '15px', fontWeight: 600, color: 'var(--charcoal)' }}>
                    {formatINR(schemeRows.reduce((s, r) => s + r.aum, 0))}
                  </td>
                  <td style={{ padding: '14px 20px' }} />
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '15px', fontWeight: 600, color: 'var(--green)' }}>
                    {formatINR(schemeRows.reduce((s, r) => s + r.monthly_commission, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Referral Tree ── */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <span style={sectionHead}>My Referral Network</span>
          <p style={{ fontSize: '12px', color: '#9aaa9e', marginTop: '4px' }}>
            Partners you've referred and their sub-networks. Names are shown only for your direct referrals.
          </p>
        </div>
        <div style={{ padding: '24px 28px' }}>
          {loading ? (
            <div style={{ height: '120px', borderRadius: '10px', background: 'linear-gradient(90deg, var(--sage) 25%, #e8eeec 50%, var(--sage) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
          ) : myDirectReferrals.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9aaa9e', fontSize: '13px' }}>
              You haven't referred any partners yet. When you refer someone using your partner link, they'll appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {myDirectReferrals.map(p => (
                <SubTreeNode key={p.id} partner={p} allPartners={mlmTree} level={0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
