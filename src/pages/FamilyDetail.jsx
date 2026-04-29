import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DonutChart from '../components/ui/DonutChart';
import { families, portfolio, formatINR, formatPct } from '../lib/api';

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

const navSections = [
  { id: 'header',       label: 'Family' },
  { id: 'performance',  label: 'Performance' },
  { id: 'portfolio',    label: 'Portfolio' },
  { id: 'allocation',   label: 'Allocation' },
  { id: 'risk',         label: 'Risk' },
  { id: 'holdings',     label: 'Holdings' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'sips',         label: 'SIPs' },
  { id: 'equity',       label: 'Equity' },
  { id: 'debt',         label: 'Debt' },
  { id: 'members',      label: 'Members' },
  { id: 'reports',      label: 'Reports' },
];

const PERF_PERIODS = ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'Max'];

function Section({ id, title, children }) {
  return (
    <div id={id} style={{ marginBottom: '24px', scrollMarginTop: '80px' }}>
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        {title && (
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
            <span style={sectionHead}>{title}</span>
          </div>
        )}
        <div style={{ padding: '28px' }}>{children}</div>
      </div>
    </div>
  );
}

function ChartPlaceholder({ height = 200 }) {
  return (
    <div style={{
      height, borderRadius: '10px', background: 'var(--sage)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: '12px', color: '#9aaa9e' }}>Chart placeholder</span>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--sage)', borderRadius: '10px',
      padding: '16px', textAlign: 'center',
    }}>
      <div style={{ ...tabLabel, marginBottom: '8px', fontSize: '10px' }}>{label}</div>
      <div style={{
        fontFamily: 'var(--display-font)', fontSize: '22px',
        fontWeight: 600, color: 'var(--charcoal)',
      }}>{value ?? '—'}</div>
    </div>
  );
}

export default function FamilyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('header');
  const [perfPeriod, setPerfPeriod] = useState('1Y');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [family, setFamily] = useState(null);
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [risk, setRisk] = useState(null);
  const [equityBreak, setEquityBreak] = useState(null);
  const [debtBreak, setDebtBreak] = useState(null);
  const [memberSummaries, setMemberSummaries] = useState({});

  // Scroll spy for sticky nav
  useEffect(() => {
    if (loading) return;
    const handleScroll = () => {
      const offset = 120;
      let current = navSections[0].id;
      for (const { id: sectionId } of navSections) {
        const el = document.getElementById(sectionId);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) current = sectionId;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  // Load all data in parallel
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [fam, sum, hold, alloc, rsk, eq, debt] = await Promise.all([
          families.get(id).catch(() => null),
          portfolio.summary({ family_id: id }).catch(() => null),
          portfolio.holdings({ family_id: id }).catch(() => []),
          portfolio.allocation({ family_id: id }).catch(() => null),
          portfolio.risk({ family_id: id }).catch(() => null),
          portfolio.equityBreakdown({ family_id: id }).catch(() => null),
          portfolio.debtBreakdown({ family_id: id }).catch(() => null),
        ]);

        setFamily(fam);
        setSummary(sum);
        setHoldings(Array.isArray(hold) ? hold : []);
        setAllocation(alloc);
        setRisk(rsk);
        setEquityBreak(eq);
        setDebtBreak(debt);

        // Load per-member summaries in parallel
        if (fam?.members?.length) {
          const summaryResults = await Promise.all(
            fam.members.map(m =>
              portfolio.summary({ investor_id: m.id })
                .then(s => ({ id: m.id, summary: s }))
                .catch(() => ({ id: m.id, summary: null }))
            )
          );
          const summaryMap = {};
          summaryResults.forEach(({ id: mid, summary: s }) => { summaryMap[mid] = s; });
          setMemberSummaries(summaryMap);
        }
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function scrollTo(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(sectionId);
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)' }}>
        Loading family portfolio...
      </div>
    </div>
  );

  if (error || !family) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)' }}>Family not found</div>
      <button onClick={() => navigate('/families')} style={{
        padding: '10px 24px', borderRadius: '8px', background: 'var(--green)',
        color: 'var(--ivory)', border: 'none', fontSize: '13px', cursor: 'pointer',
      }}>← Back to Families</button>
    </div>
  );

  const gain = summary?.gain || 0;
  const gainColor = gain >= 0 ? '#2d8a55' : '#c0392b';
  const gainPrefix = gain >= 0 ? '+' : '';

  return (
    <div>
      {/* Back nav */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('/families')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '13px', color: '#8a9e96',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--body-font)',
        }}>← Families</button>
        <span style={{ color: '#c4d4d0' }}>/</span>
        <span style={{ fontSize: '13px', color: 'var(--charcoal)', fontWeight: 500 }}>{family.name}</span>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* FAMILY HEADER */}
          <div id="header" style={{ marginBottom: '24px', scrollMarginTop: '80px' }}>
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '28px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{
                    fontFamily: 'var(--display-font)', fontSize: '34px',
                    fontWeight: 600, color: 'var(--green)', lineHeight: 1, marginBottom: '12px',
                  }}>
                    {family.name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: '#8a9e96' }}>
                      Head: <span style={{ color: 'var(--charcoal)', fontWeight: 500 }}>{family.head_investor_name || '—'}</span>
                    </span>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span style={{ fontSize: '13px', color: '#8a9e96' }}>
                      {family.members?.length || 0} members
                    </span>
                    <span style={{ color: 'var(--border)' }}>·</span>
                    <span style={{ fontSize: '13px', color: '#8a9e96' }}>
                      {family.partner_name || '—'}
                    </span>
                  </div>
                </div>
                <span style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '4px 12px', borderRadius: '100px',
                  background: 'rgba(44,74,62,0.06)', color: 'var(--green)', flexShrink: 0,
                }}>Family Portfolio</span>
              </div>
            </div>
          </div>

          {/* PERFORMANCE */}
          <Section id="performance" title="Performance">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '4px', background: 'var(--sage)', borderRadius: '100px', padding: '4px' }}>
                {PERF_PERIODS.map(t => (
                  <button key={t} onClick={() => setPerfPeriod(t)} style={{
                    padding: '6px 14px', borderRadius: '100px', fontSize: '12px',
                    border: 'none', fontWeight: perfPeriod === t ? 500 : 400,
                    background: perfPeriod === t ? 'var(--green)' : 'transparent',
                    color: perfPeriod === t ? 'var(--ivory)' : '#7a8a84',
                    cursor: 'pointer',
                  }}>{t}</button>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: '#8a9e96' }}>Growth of ₹10,000 vs Benchmark vs Category</span>
            </div>
            <ChartPlaceholder height={260} />
          </Section>

          {/* PORTFOLIO SUMMARY */}
          <Section id="portfolio" title="Portfolio Summary">
            <div style={{ display: 'flex', gap: '0', minHeight: '140px' }}>
              {/* Left — Total AUM */}
              <div style={{
                flex: '0 0 40%', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', paddingRight: '32px',
                borderRight: '1px solid var(--border)',
              }}>
                <div style={{ ...tabLabel, marginBottom: '10px' }}>Total AUM</div>
                <div style={{
                  fontFamily: 'var(--display-font)', fontSize: '48px',
                  fontWeight: 600, color: 'var(--charcoal)', lineHeight: 1, marginBottom: '12px',
                }}>
                  {formatINR(summary?.aum || 0)}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '12px', padding: '3px 10px', borderRadius: '100px',
                    background: 'rgba(44,74,62,0.08)', color: 'var(--green)', fontWeight: 500,
                  }}>
                    Niom {formatINR(summary?.niom_aum || 0)}
                  </span>
                  {(summary?.external_aum || 0) > 0 && (
                    <span style={{
                      fontSize: '12px', padding: '3px 10px', borderRadius: '100px',
                      background: 'rgba(184,150,90,0.1)', color: 'var(--gold)', fontWeight: 500,
                    }}>
                      External {formatINR(summary.external_aum)}
                    </span>
                  )}
                </div>
              </div>

              {/* Right — 2x2 metrics */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', paddingLeft: '32px' }}>
                {[
                  { label: 'Total Invested',   value: formatINR(summary?.invested || 0),             color: 'var(--charcoal)' },
                  { label: 'Total Gain / Loss', value: `${gainPrefix}${formatINR(Math.abs(gain))}`,  color: gainColor },
                  { label: 'Absolute Return',   value: formatPct(summary?.gain_pct || 0),             color: gainColor },
                  { label: 'XIRR',              value: summary?.xirr ? formatPct(summary.xirr) : '—', color: gainColor },
                ].map((m, i) => (
                  <div key={m.label} style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    padding: '16px 20px',
                    borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ ...tabLabel, marginBottom: '8px' }}>{m.label}</div>
                    <div style={{ fontFamily: 'var(--display-font)', fontSize: '26px', fontWeight: 600, color: m.color }}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ASSET ALLOCATION */}
          <Section id="allocation" title="Asset Allocation">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>Equity / Debt / Real Assets / International</div>
                <DonutChart
                  data={allocation?.by_broad_category || []}
                  nameKey="name" valueKey="aum"
                  formatValue={formatINR} height={200}
                />
              </div>
              <div>
                <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>Direct / Regular</div>
                <DonutChart
                  data={allocation?.direct_regular || []}
                  nameKey="name" valueKey="aum"
                  formatValue={formatINR} height={200}
                />
              </div>
            </div>
          </Section>

          {/* RISK METRICS */}
          <Section id="risk" title="Risk Metrics">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { label: 'Alpha',                   value: risk?.alpha             ? parseFloat(risk.alpha).toFixed(2)             : '—' },
                { label: 'Beta',                    value: risk?.beta              ? parseFloat(risk.beta).toFixed(2)              : '—' },
                { label: 'Sharpe Ratio',            value: risk?.sharpe            ? parseFloat(risk.sharpe).toFixed(2)            : '—' },
                { label: 'Sortino Ratio',           value: risk?.sortino           ? parseFloat(risk.sortino).toFixed(2)           : '—' },
                { label: 'Std. Deviation',          value: risk?.std_dev           ? parseFloat(risk.std_dev).toFixed(2)           : '—' },
                { label: 'Portfolio Risk Score',    value: '—' },
                { label: 'Wtd. Avg Expense Ratio',  value: risk?.wtd_expense_ratio ? `${parseFloat(risk.wtd_expense_ratio).toFixed(2)}%` : '—' },
                { label: 'Cumulative Expense Paid', value: '—' },
              ].map(m => <MetricCard key={m.label} label={m.label} value={m.value} />)}
            </div>
          </Section>

          {/* HOLDINGS */}
          <Section id="holdings" title="Holdings">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Fund Name', 'AMC', 'Member', 'Units', 'Avg NAV', 'Curr NAV', 'Invested', 'Curr Value', 'Gain/Loss', 'Source'].map(h => (
                      <th key={h} style={{
                        padding: '10px 14px', textAlign: 'left',
                        ...tabLabel, fontFamily: 'var(--body-font)',
                        whiteSpace: 'nowrap', fontSize: '10px',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holdings.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9aaa9e' }}>
                        No holdings yet
                      </td>
                    </tr>
                  ) : holdings.map((h, i) => {
                    const holdingGain = (parseFloat(h.current_value) || 0) - (parseFloat(h.invested_value) || 0);
                    const gainPct = h.invested_value > 0 ? (holdingGain / h.invested_value * 100).toFixed(1) : 0;
                    const hGainColor = holdingGain >= 0 ? '#2d8a55' : '#c0392b';
                    return (
                      <tr key={i}
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--charcoal)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {h.scheme_name || '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{h.amc_name || '—'}</td>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{h.investor_name || '—'}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>
                          {h.units ? parseFloat(h.units).toFixed(3) : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>
                          {h.avg_nav ? `₹${parseFloat(h.avg_nav).toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>
                          {h.latest_nav ? `₹${parseFloat(h.latest_nav).toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                          {formatINR(h.invested_value)}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                          {formatINR(h.current_value)}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', color: hGainColor, whiteSpace: 'nowrap' }}>
                          {holdingGain >= 0 ? '+' : ''}{formatINR(holdingGain)} ({gainPct}%)
                        </td>
                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '11px', fontWeight: 600, padding: '3px 8px',
                            borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.08em',
                            background: h.source === 'Niom' ? 'rgba(44,74,62,0.08)' : 'rgba(184,150,90,0.1)',
                            color: h.source === 'Niom' ? 'var(--green)' : 'var(--gold)',
                          }}>{h.source || '—'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          {/* TRANSACTIONS — placeholder */}
          <Section id="transactions" title="Transactions">
            <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9aaa9e' }}>
              Transaction history coming soon
            </div>
          </Section>

          {/* SIPs — placeholder */}
          <Section id="sips" title="SIP Summary">
            <div style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9aaa9e' }}>
              SIP summary coming soon
            </div>
          </Section>

          {/* EQUITY BREAKDOWN */}
          <Section id="equity" title="Equity Breakdown">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>Large / Mid / Small Cap</div>
                <DonutChart
                  data={equityBreak?.style_breakdown || []}
                  nameKey="name" valueKey="aum"
                  formatValue={formatINR} height={200}
                />
              </div>
              <div>
                <div style={{ ...tabLabel, marginBottom: '12px' }}>Top 10 Stock Holdings</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--sage)' }}>
                      {['Company', 'Sector', 'Weight'].map(h => (
                        <th key={h} style={{
                          padding: '8px 12px', textAlign: 'left',
                          ...tabLabel, fontFamily: 'var(--body-font)', fontSize: '10px',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(equityBreak?.top_stocks || []).length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '16px 12px', fontSize: '12px', color: '#9aaa9e', textAlign: 'center' }}>No data yet</td>
                      </tr>
                    ) : (equityBreak?.top_stocks || []).map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--charcoal)', fontWeight: 500 }}>{s.company_name || '—'}</td>
                        <td style={{ padding: '8px 12px', fontSize: '12px', color: '#8a9e96' }}>{s.sector_name || '—'}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--display-font)', fontSize: '12px' }}>
                          {s.effective_pct ? `${parseFloat(s.effective_pct).toFixed(2)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          {/* DEBT BREAKDOWN */}
          <Section id="debt" title="Debt Breakdown">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>By Duration / Maturity</div>
                <DonutChart
                  data={debtBreak?.by_duration || []}
                  nameKey="name" valueKey="aum"
                  formatValue={formatINR} height={200}
                />
              </div>
              <div>
                <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>By Credit Rating</div>
                <DonutChart
                  data={debtBreak?.by_credit_quality || []}
                  nameKey="name" valueKey="aum"
                  formatValue={formatINR} height={200}
                />
              </div>
            </div>
          </Section>

          {/* FAMILY MEMBERS */}
          <Section id="members" title="Family Members">
            {!family.members?.length ? (
              <div style={{ fontSize: '13px', color: '#9aaa9e', padding: '12px 0' }}>
                No members found
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Name', 'AUM', 'Absolute Return', 'XIRR'].map(h => (
                      <th key={h} style={{
                        padding: '10px 20px', textAlign: 'left',
                        ...tabLabel, fontFamily: 'var(--body-font)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {family.members.map(m => {
                    const ms = memberSummaries[m.id];
                    const absReturn = ms?.gain_pct
                      ? `${ms.gain_pct >= 0 ? '+' : ''}${parseFloat(ms.gain_pct).toFixed(1)}%`
                      : '—';
                    return (
                      <tr key={m.id}
                        onClick={() => navigate(`/investors/${m.id}`)}
                        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '13px 20px', fontSize: '13px', color: 'var(--green)', textDecoration: 'underline', fontWeight: 500 }}>
                          {m.first_name} {m.last_name || ''}
                          {m.id === family.head_investor_id && (
                            <span style={{ fontSize: '11px', color: '#9aaa9e', fontWeight: 400, marginLeft: '8px' }}>(head)</span>
                          )}
                        </td>
                        <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)' }}>
                          {ms ? formatINR(ms.aum) : '—'}
                        </td>
                        <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: ms?.gain_pct >= 0 ? '#2d8a55' : '#c0392b' }}>
                          {absReturn}
                        </td>
                        <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#2d8a55' }}>
                          {ms?.xirr ? `${parseFloat(ms.xirr).toFixed(1)}%` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Section>

          {/* REPORTS */}
          <div id="reports" style={{ marginBottom: '24px', scrollMarginTop: '80px' }}>
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '28px',
            }}>
              <span style={{ ...sectionHead, display: 'block', marginBottom: '20px' }}>Reports</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  'Portfolio Report (Comprehensive)',
                  'Portfolio Report (Niom ARN)',
                  'Portfolio Report (External ARN)',
                  'Returns Report',
                  'Holdings Report',
                  'Capital Gains Report',
                  'Transaction History',
                ].map(report => (
                  <button key={report} style={{
                    padding: '14px 16px', borderRadius: '10px',
                    border: '1.5px solid var(--border)', background: '#fff',
                    fontSize: '13px', color: 'var(--charcoal)', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'var(--body-font)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--sage)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}
                  >
                    {report}
                    <span style={{ fontSize: '16px', color: 'var(--gold)', flexShrink: 0 }}>↓</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Sticky side nav */}
        <div style={{
          width: '148px', flexShrink: 0,
          position: 'sticky', top: '80px',
          alignSelf: 'flex-start',
          background: '#fff', borderRadius: '12px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          padding: '16px 0',
        }}>
          <div style={{ padding: '0 16px 12px', ...tabLabel, fontSize: '10px' }}>On this page</div>
          {navSections.map(({ id: sectionId, label }) => (
            <div key={sectionId} onClick={() => scrollTo(sectionId)} style={{
              padding: '7px 16px', fontSize: '12px', cursor: 'pointer',
              color: activeSection === sectionId ? 'var(--green)' : '#8a9e96',
              fontWeight: activeSection === sectionId ? 600 : 400,
              borderLeft: activeSection === sectionId ? '2px solid var(--green)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (activeSection !== sectionId) e.currentTarget.style.color = 'var(--charcoal)'; }}
              onMouseLeave={e => { if (activeSection !== sectionId) e.currentTarget.style.color = '#8a9e96'; }}
            >{label}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
