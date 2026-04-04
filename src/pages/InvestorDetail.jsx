import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import DonutChart from '../components/ui/DonutChart';
import { investors, portfolio, cas, getToken, formatINR, formatPct } from '../lib/api';

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

const kycColor = {
  verified: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  pending:  { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
};

const navSections = [
  { id: 'profile',      label: 'Profile' },
  { id: 'performance',  label: 'Performance' },
  { id: 'portfolio',    label: 'Portfolio' },
  { id: 'allocation',   label: 'Allocation' },
  { id: 'risk',         label: 'Risk' },
  { id: 'holdings',     label: 'Holdings' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'sips',         label: 'SIPs' },
  { id: 'equity',       label: 'Equity' },
  { id: 'debt',         label: 'Debt' },
  { id: 'family',       label: 'Family' },
  { id: 'cas',          label: 'CAS Upload' },
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
          <div style={{
            padding: '20px 28px', borderBottom: '1px solid var(--border)',
          }}>
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

export default function InvestorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [perfPeriod, setPerfPeriod] = useState('1Y');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data state
  const [investor, setInvestor] = useState(null);
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [allocation, setAllocation] = useState(null);
  const [risk, setRisk] = useState(null);
  const [equityBreak, setEquityBreak] = useState(null);
  const [debtBreak, setDebtBreak] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);

  // CAS upload state
  const [casFile, setCasFile] = useState(null);
  const [casPassword, setCasPassword] = useState('');
  const [casUploading, setCasUploading] = useState(false);
  const [casResult, setCasResult] = useState(null);
  const [casError, setCasError] = useState('');
  const fileInputRef = useRef(null);

  // IntersectionObserver for sticky nav
  useEffect(() => {
    const observers = [];
    navSections.forEach(({ id: sectionId }) => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(sectionId); },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(obs => obs.disconnect());
  }, [loading]);

  // Load all data in parallel
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [inv, sum, hold, alloc, rsk, eq, debt] = await Promise.all([
          investors.get(id).catch(() => null),
          portfolio.summary({ investor_id: id }).catch(() => null),
          portfolio.holdings({ investor_id: id }).catch(() => []),
          portfolio.allocation({ investor_id: id }).catch(() => null),
          portfolio.risk({ investor_id: id }).catch(() => null),
          portfolio.equityBreakdown({ investor_id: id }).catch(() => null),
          portfolio.debtBreakdown({ investor_id: id }).catch(() => null),
        ]);

        setInvestor(inv);
        setSummary(sum);
        setHoldings(Array.isArray(hold) ? hold : []);
        setAllocation(alloc);
        setRisk(rsk);
        setEquityBreak(eq);
        setDebtBreak(debt);

        // Load family members if investor belongs to a family
        if (inv?.family_id) {
          const { families } = await import('../lib/api');
          const fam = await families.get(inv.family_id).catch(() => null);
          if (fam?.members) setFamilyMembers(fam.members);
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

  async function handleCasUpload() {
    if (!casFile) return;
    setCasUploading(true);
    setCasError('');
    setCasResult(null);
    try {
      const fd = new FormData();
      fd.append('cas', casFile);
      if (casPassword) fd.append('password', casPassword);
      fd.append('investor_id', id);
      const result = await cas.parse(fd, getToken());
      setCasResult(result);
    } catch(e) {
      setCasError('Upload failed. Please check the file and try again.');
    } finally {
      setCasUploading(false);
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)' }}>
        Loading investor profile...
      </div>
    </div>
  );

  if (error || !investor) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)' }}>Investor not found</div>
      <button onClick={() => navigate('/investors')} style={{
        padding: '10px 24px', borderRadius: '8px', background: 'var(--green)',
        color: 'var(--ivory)', border: 'none', fontSize: '13px', cursor: 'pointer',
      }}>← Back to Investors</button>
    </div>
  );

  const name = `${investor.first_name || ''} ${investor.last_name || ''}`.trim();
  const gain = summary?.gain || 0;
  const gainColor = gain >= 0 ? '#2d8a55' : '#c0392b';
  const gainPrefix = gain >= 0 ? '+' : '';

  return (
    <div>
      {/* Back nav */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('/investors')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '13px', color: '#8a9e96', display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--body-font)',
        }}>← Investors</button>
        <span style={{ color: '#c4d4d0' }}>/</span>
        <span style={{ fontSize: '13px', color: 'var(--charcoal)', fontWeight: 500 }}>{name}</span>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* PROFILE */}
          <Section id="profile" title={null}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                border: '2px solid var(--gold)', background: 'rgba(44,74,62,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--display-font)', fontSize: '24px', fontWeight: 600,
                color: 'var(--green)', flexShrink: 0,
              }}>
                {(investor.first_name?.[0] || '') + (investor.last_name?.[0] || '')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h2 style={{ fontFamily: 'var(--display-font)', fontSize: '28px', fontWeight: 600, color: 'var(--green)' }}>
                    {name}
                  </h2>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                    borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.1em',
                    background: (kycColor[investor.kyc_status] || { bg: '#f5f5f5' }).bg,
                    color: (kycColor[investor.kyc_status] || { color: '#7a7a7a' }).color,
                  }}>{investor.kyc_status || 'Unknown'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
                  {[
                    { label: 'PAN',          value: investor.pan ? `${investor.pan.slice(0,3)}••••${investor.pan.slice(-2)}` : '—' },
                    { label: 'Mobile',       value: investor.mobile || '—' },
                    { label: 'Email',        value: investor.email || '—' },
                    { label: 'DOB',          value: investor.date_of_birth ? new Date(investor.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                    { label: 'Partner',      value: investor.partner_name || '—' },
                    { label: 'Family',       value: investor.family_name || '—' },
                    { label: 'Risk Profile', value: investor.risk_profile || '—' },
                    { label: 'Joined',       value: investor.created_at ? new Date(investor.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '4px' }}>{item.label}</div>
                      <div style={{ fontSize: '13px', color: 'var(--charcoal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

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
                  { label: 'Total Invested',    value: formatINR(summary?.invested || 0),                        color: 'var(--charcoal)' },
                  { label: 'Total Gain / Loss',  value: `${gainPrefix}${formatINR(Math.abs(gain))}`,             color: gainColor },
                  { label: 'Absolute Return',    value: formatPct(summary?.gain_pct || 0),                       color: gainColor },
                  { label: 'XIRR',               value: summary?.xirr ? formatPct(summary.xirr) : '—',           color: gainColor },
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
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
                    {['Fund Name', 'AMC', 'Units', 'Avg NAV', 'Curr NAV', 'Invested', 'Curr Value', 'Gain/Loss', 'Returns', 'Source'].map(h => (
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
                        No holdings yet — upload a CAS file below to get started
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
                        <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--charcoal)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {h.scheme_name || '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{h.amc_name || '—'}</td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)' }}>
                          {h.units ? parseFloat(h.units).toFixed(3) : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)' }}>
                          {h.avg_nav ? `₹${parseFloat(h.avg_nav).toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)' }}>
                          {h.latest_nav ? `₹${parseFloat(h.latest_nav).toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                          {formatINR(h.invested_value)}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                          {formatINR(h.current_value)}
                        </td>
                        <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', color: hGainColor, whiteSpace: 'nowrap' }}>
                          {holdingGain >= 0 ? '+' : ''}{formatINR(holdingGain)} ({gainPct}%)
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                          {h.ret_1yr ? `${parseFloat(h.ret_1yr).toFixed(1)}% 1Y` : '—'}
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
                        <td colSpan={3} style={{ padding: '16px 12px', fontSize: '12px', color: '#9aaa9e', textAlign: 'center' }}>
                          No data yet
                        </td>
                      </tr>
                    ) : (equityBreak?.top_stocks || []).map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--charcoal)', fontWeight: 500 }}>
                          {s.company_name || '—'}
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '12px', color: '#8a9e96' }}>
                          {s.sector_name || '—'}
                        </td>
                        <td style={{ padding: '8px 12px', fontFamily: 'var(--display-font)', fontSize: '12px', color: 'var(--charcoal)' }}>
                          {s.effective_pct ? `${parseFloat(s.effective_pct).toFixed(2)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(equityBreak?.top_stocks?.length || 0) > 5 && (
                  <button style={{
                    marginTop: '10px', fontSize: '12px', color: 'var(--green)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textDecoration: 'underline', padding: 0,
                  }}>View all holdings →</button>
                )}
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
          <Section id="family" title="Family">
            {!investor.family_id ? (
              <div style={{ padding: '12px 0', fontSize: '13px', color: '#9aaa9e' }}>
                Not part of a family group
              </div>
            ) : familyMembers.length === 0 ? (
              <div style={{ padding: '12px 0', fontSize: '13px', color: '#9aaa9e' }}>
                Loading family members...
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Name', 'PAN', 'KYC', 'Risk Profile'].map(h => (
                      <th key={h} style={{
                        padding: '10px 20px', textAlign: 'left',
                        ...tabLabel, fontFamily: 'var(--body-font)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {familyMembers.map(m => (
                    <tr key={m.id}
                      onClick={() => navigate(`/investors/${m.id}`)}
                      style={{ borderBottom: '1px solid var(--border)', cursor: m.id !== parseInt(id) ? 'pointer' : 'default' }}
                      onMouseEnter={e => { if (m.id !== parseInt(id)) e.currentTarget.style.background = 'var(--sage)'; }}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '13px 20px', fontSize: '13px', color: m.id !== parseInt(id) ? 'var(--green)' : 'var(--charcoal)', textDecoration: m.id !== parseInt(id) ? 'underline' : 'none', fontWeight: m.id === parseInt(id) ? 600 : 400 }}>
                        {m.first_name} {m.last_name || ''}
                        {m.id === parseInt(id) && <span style={{ fontSize: '11px', color: '#9aaa9e', fontWeight: 400, marginLeft: '8px' }}>(this investor)</span>}
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: '13px', color: '#8a9e96', fontFamily: 'monospace' }}>
                        {m.pan ? `${m.pan.slice(0,3)}••••${m.pan.slice(-2)}` : '—'}
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 600, padding: '3px 8px',
                          borderRadius: '100px', textTransform: 'uppercase',
                          background: (kycColor[m.kyc_status] || { bg: '#f5f5f5' }).bg,
                          color: (kycColor[m.kyc_status] || { color: '#7a7a7a' }).color,
                        }}>{m.kyc_status || '—'}</span>
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>
                        {m.risk_profile || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          {/* CAS UPLOAD */}
          <div id="cas" style={{ marginBottom: '24px', scrollMarginTop: '80px' }}>
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                <span style={sectionHead}>CAS Upload</span>
              </div>
              <div style={{ padding: '28px' }}>
                <p style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '20px', lineHeight: 1.7 }}>
                  Upload a CAS (Consolidated Account Statement) PDF to import this investor's holdings and transaction history.
                </p>

                {/* File drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${casFile ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: '10px', padding: '32px', textAlign: 'center',
                    background: casFile ? 'rgba(44,74,62,0.03)' : 'var(--sage)',
                    cursor: 'pointer', marginBottom: '16px', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = casFile ? 'var(--green)' : 'var(--border)'}
                >
                  {casFile ? (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--green)', marginBottom: '4px' }}>
                        {casFile.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8a9e96' }}>
                        {(casFile.size / 1024).toFixed(1)} KB · Click to change
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '14px', color: 'var(--charcoal)', fontWeight: 500, marginBottom: '6px' }}>
                        Click to upload CAS PDF
                      </div>
                      <div style={{ fontSize: '12px', color: '#8a9e96' }}>
                        PDF only · Max 10MB
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    style={{ display: 'none' }}
                    onChange={e => { setCasFile(e.target.files[0] || null); setCasResult(null); setCasError(''); }}
                  />
                </div>

                {/* Password field */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ ...tabLabel, fontSize: '10px', display: 'block', marginBottom: '8px' }}>
                    PDF Password (if encrypted)
                  </label>
                  <input
                    type="password"
                    value={casPassword}
                    onChange={e => setCasPassword(e.target.value)}
                    placeholder="Leave blank if not password protected"
                    style={{
                      width: '100%', padding: '10px 14px',
                      border: '1.5px solid var(--border)', borderRadius: '8px',
                      fontSize: '13px', fontFamily: 'var(--body-font)',
                      color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--green)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                {/* Error */}
                {casError && (
                  <div style={{ fontSize: '13px', color: '#c0392b', marginBottom: '12px' }}>{casError}</div>
                )}

                {/* Result */}
                {casResult && (
                  <div style={{
                    background: 'rgba(44,74,62,0.06)', borderRadius: '8px',
                    padding: '14px 16px', marginBottom: '16px',
                    fontSize: '13px', color: 'var(--green)',
                  }}>
                    ✓ CAS processed successfully — {casResult.holdings_count || 0} holdings imported
                  </div>
                )}

                <button
                  onClick={handleCasUpload}
                  disabled={!casFile || casUploading}
                  style={{
                    padding: '11px 28px', borderRadius: '8px',
                    background: !casFile || casUploading ? '#ccc' : 'var(--green)',
                    color: 'var(--ivory)', border: 'none',
                    fontSize: '13px', fontWeight: 500, cursor: !casFile || casUploading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (casFile && !casUploading) e.currentTarget.style.background = 'var(--gold)'; }}
                  onMouseLeave={e => { if (casFile && !casUploading) e.currentTarget.style.background = 'var(--green)'; }}
                >
                  {casUploading ? 'Processing...' : 'Upload CAS'}
                </button>
              </div>
            </div>
          </div>

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
