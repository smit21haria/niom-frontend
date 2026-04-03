import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { investors, families, portfolio, partners, formatINR, formatPct, getToken } from '../lib/api';

// ── Design tokens (print-safe) ────────────────────────────────────────────────
const green    = '#2C4A3E';
const gold     = '#B8965A';
const charcoal = '#2E2E2E';
const sage     = '#EFF2EE';
const border   = 'rgba(44,74,62,0.14)';

const DONUT_COLORS = [green, gold, '#5B7FA6', '#8B6B8B', '#6B8B6B', '#9aaa9e'];

const tabLabel = {
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: gold,
  fontWeight: 600,
  fontFamily: "'Jost', sans-serif",
};

const sectionHead = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: '18px',
  fontWeight: 600,
  color: green,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || 'https://niom-backend.onrender.com';

async function apiFetch(path) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '28px', pageBreakInside: 'avoid' }}>
      <div style={{ borderBottom: `2px solid ${green}`, paddingBottom: '6px', marginBottom: '16px' }}>
        <span style={sectionHead}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ label, value, color = charcoal }) {
  return (
    <div style={{ background: sage, borderRadius: '8px', padding: '14px 16px' }}>
      <div style={{ ...tabLabel, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

function SkeletonBlock({ h = 100 }) {
  return (
    <div style={{
      height: h, borderRadius: '8px',
      background: 'linear-gradient(90deg, #eff2ee 25%, #e4e8e2 50%, #eff2ee 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function DonutChart({ data, nameKey, valueKey, formatValue, height = 180 }) {
  if (!data || !data.length) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aaa9e', fontSize: '12px' }}>No data</div>;
  }
  const total = data.reduce((s, d) => s + (parseFloat(d[valueKey]) || 0), 0);
  return (
    <div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={74} paddingAngle={2} dataKey={valueKey} strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [formatValue ? formatValue(v) : v, n]} contentStyle={{ fontSize: '11px', fontFamily: "'Jost',sans-serif" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: '10px', color: '#5a6a64' }}>{d[nameKey]}</span>
            {total > 0 && <span style={{ fontSize: '10px', color: '#9aaa9e' }}>({((parseFloat(d[valueKey]) || 0) / total * 100).toFixed(0)}%)</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PortfolioReport() {
  const { type, id } = useParams(); // type = 'investor' | 'family'
  const isFamily = type === 'family';

  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [subject, setSubject]         = useState(null);   // investor or family
  const [partnerData, setPartnerData] = useState(null);
  const [summary, setSummary]         = useState(null);
  const [holdingsData, setHoldings]   = useState([]);
  const [allocation, setAllocation]   = useState(null);
  const [riskData, setRisk]           = useState(null);
  const [equityBreak, setEquityBreak] = useState(null);
  const [debtBreak, setDebtBreak]     = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = isFamily ? { family_id: id } : { investor_id: id };

        // Load subject first to get partner_id
        const subjectData = isFamily
          ? await apiFetch(`/api/families/${id}`)
          : await apiFetch(`/api/investors/${id}`);
        setSubject(subjectData);

        // Load partner for logo
        const pid = subjectData.partner_id;
        if (pid) {
          const p = await apiFetch(`/api/partners/${pid}`).catch(() => null);
          setPartnerData(p);
        }

        // Load all portfolio data in parallel
        const [sum, hold, alloc, risk, eq, debt] = await Promise.all([
          apiFetch(`/api/portfolio/summary?${new URLSearchParams(params)}`).catch(() => null),
          apiFetch(`/api/portfolio/holdings?${new URLSearchParams(params)}`).catch(() => []),
          apiFetch(`/api/portfolio/allocation?${new URLSearchParams(params)}`).catch(() => null),
          apiFetch(`/api/portfolio/risk?${new URLSearchParams(params)}`).catch(() => null),
          apiFetch(`/api/portfolio/equity-breakdown?${new URLSearchParams(params)}`).catch(() => null),
          apiFetch(`/api/portfolio/debt-breakdown?${new URLSearchParams(params)}`).catch(() => null),
        ]);

        setSummary(sum);
        setHoldings(Array.isArray(hold) ? hold : []);
        setAllocation(alloc);
        setRisk(risk);
        setEquityBreak(eq);
        setDebtBreak(debt);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, type]);

  const gain      = parseFloat(summary?.gain || 0);
  const gainColor = gain >= 0 ? green : '#c05050';
  const gainPfx   = gain >= 0 ? '+' : '';

  const subjectName = isFamily
    ? subject?.name
    : subject ? `${subject.first_name || ''} ${subject.last_name || ''}`.trim() : '';

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const logoUrl = partnerData?.logo_url
    ? `${BASE}${partnerData.logo_url}`
    : null;

  return (
    <div style={{ fontFamily: "'Jost', sans-serif", background: '#fff', minHeight: '100vh' }}>
      {/* Print CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Print button — hidden on print */}
      <div className="no-print" style={{
        position: 'fixed', top: '20px', right: '24px', zIndex: 100,
        display: 'flex', gap: '8px',
      }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '10px 24px', borderRadius: '8px',
            background: green, color: '#FAF8F4',
            border: 'none', fontSize: '13px', fontWeight: 500,
            cursor: 'pointer', fontFamily: "'Jost', sans-serif",
            boxShadow: '0 2px 12px rgba(44,74,62,0.2)',
          }}
        >
          ⬇ Download PDF
        </button>
      </div>

      {/* Report content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 40px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: `2px solid ${green}` }}>
          {/* Logo */}
          <div>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '4px' }} />
            ) : (
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: green }}>Niom</div>
            )}
            <div style={{ fontSize: '10px', color: '#8a9e96', marginTop: '4px', letterSpacing: '0.08em' }}>
              AMFI-Registered Mutual Fund Distributor
            </div>
          </div>

          {/* Report info */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: charcoal, marginBottom: '4px' }}>
              Portfolio Report
            </div>
            <div style={{ fontSize: '11px', color: '#8a9e96' }}>Generated: {today}</div>
            <div style={{
              marginTop: '8px', display: 'inline-block',
              background: 'rgba(184,150,90,0.12)', color: gold,
              padding: '3px 12px', borderRadius: '100px',
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>Confidential</div>
          </div>
        </div>

        {/* ── SUBJECT BLOCK ── */}
        {loading ? (
          <div style={{ marginBottom: '32px' }}><SkeletonBlock h={72} /></div>
        ) : (
          <div style={{ background: sage, borderRadius: '12px', padding: '20px 24px', marginBottom: '32px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ ...tabLabel, marginBottom: '4px' }}>{isFamily ? 'Family' : 'Investor'}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: green }}>
                {subjectName || '—'}
              </div>
            </div>
            {!isFamily && subject?.pan && (
              <div>
                <div style={{ ...tabLabel, marginBottom: '4px' }}>PAN</div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: charcoal, fontFamily: "'Cormorant Garamond', serif" }}>
                  {subject.pan}
                </div>
              </div>
            )}
            {partnerData && (
              <div>
                <div style={{ ...tabLabel, marginBottom: '4px' }}>Partner</div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: charcoal }}>
                  {partnerData.fname} {partnerData.lname}
                </div>
              </div>
            )}
            {isFamily && subject?.head_investor_name && (
              <div>
                <div style={{ ...tabLabel, marginBottom: '4px' }}>Head Investor</div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: charcoal }}>
                  {subject.head_investor_name}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[200, 160, 260, 180].map((h, i) => <SkeletonBlock key={i} h={h} />)}
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {error && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#c05050', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* ── REPORT SECTIONS ── */}
        {!loading && !error && (
          <>
            {/* 1. PORTFOLIO SUMMARY */}
            <Section title="Portfolio Summary">
              <div style={{ display: 'flex', gap: '0', border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                {/* Total AUM */}
                <div style={{ flex: '0 0 38%', padding: '24px 28px', borderRight: `1px solid ${border}` }}>
                  <div style={{ ...tabLabel, marginBottom: '8px' }}>Total AUM</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 600, color: charcoal, lineHeight: 1, marginBottom: '12px' }}>
                    {formatINR(summary?.aum || 0)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(44,74,62,0.08)', color: green, fontWeight: 500 }}>
                      Niom {formatINR(summary?.niom_aum || 0)}
                    </span>
                    {(summary?.external_aum || 0) > 0 && (
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(184,150,90,0.1)', color: gold, fontWeight: 500 }}>
                        External {formatINR(summary.external_aum)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2×2 metrics grid */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  {[
                    { label: 'Total Invested',   value: formatINR(summary?.invested || 0),                             color: charcoal },
                    { label: 'Total Gain / Loss', value: `${gainPfx}${formatINR(Math.abs(gain))}`,                     color: gainColor },
                    { label: 'Absolute Return',   value: formatPct(summary?.gain_pct || 0),                            color: gainColor },
                    { label: 'XIRR',              value: summary?.xirr ? formatPct(summary.xirr) : '—',               color: gainColor },
                  ].map((m, i) => (
                    <div key={i} style={{
                      padding: '20px',
                      borderRight: i % 2 === 0 ? `1px solid ${border}` : 'none',
                      borderBottom: i < 2 ? `1px solid ${border}` : 'none',
                    }}>
                      <div style={{ ...tabLabel, marginBottom: '6px' }}>{m.label}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: m.color }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* 2. ASSET ALLOCATION */}
            <Section title="Asset Allocation">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>By Asset Class</div>
                  <DonutChart
                    data={allocation?.by_broad_category || []}
                    nameKey="name" valueKey="aum"
                    formatValue={formatINR} height={180}
                  />
                </div>
                <div>
                  <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>Direct vs Regular</div>
                  <DonutChart
                    data={allocation?.direct_regular || []}
                    nameKey="name" valueKey="aum"
                    formatValue={formatINR} height={180}
                  />
                </div>
              </div>
            </Section>

            {/* 3. RISK METRICS */}
            <Section title="Risk Metrics">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Alpha',              value: riskData?.alpha   ? parseFloat(riskData.alpha).toFixed(2)   : '—' },
                  { label: 'Beta',               value: riskData?.beta    ? parseFloat(riskData.beta).toFixed(2)    : '—' },
                  { label: 'Sharpe Ratio',       value: riskData?.sharpe  ? parseFloat(riskData.sharpe).toFixed(2)  : '—' },
                  { label: 'Sortino Ratio',      value: riskData?.sortino ? parseFloat(riskData.sortino).toFixed(2) : '—' },
                  { label: 'Std. Deviation',     value: riskData?.std_dev ? parseFloat(riskData.std_dev).toFixed(2) : '—' },
                  { label: 'Portfolio Risk Score', value: '—' },
                ].map(m => <MetricCard key={m.label} label={m.label} value={m.value} />)}
              </div>
            </Section>

            {/* 4. HOLDINGS */}
            <Section title="Holdings">
              {holdingsData.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9aaa9e', fontSize: '13px' }}>No holdings</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: sage }}>
                        {['Fund Name', 'AMC', ...(isFamily ? ['Investor'] : []), 'Units', 'Avg NAV', 'Curr NAV', 'Invested', 'Curr Value', 'Gain/Loss', 'Source'].map(h => (
                          <th key={h} style={{ padding: '9px 12px', textAlign: 'left', ...tabLabel, fontFamily: "'Jost',sans-serif", whiteSpace: 'nowrap', borderBottom: `1px solid ${border}` }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holdingsData.map((h, i) => {
                        const hGain = (parseFloat(h.current_value) || 0) - (parseFloat(h.invested_value) || 0);
                        const hGainPct = h.invested_value > 0 ? (hGain / h.invested_value * 100).toFixed(1) : 0;
                        const hColor = hGain >= 0 ? green : '#c05050';
                        return (
                          <tr key={i} style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? '#fff' : 'rgba(239,242,238,0.4)' }}>
                            <td style={{ padding: '9px 12px', fontWeight: 500, color: charcoal, maxWidth: '200px' }}>
                              {h.scheme_name || h.plan_name || '—'}
                            </td>
                            <td style={{ padding: '9px 12px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{h.amc_name || '—'}</td>
                            {isFamily && <td style={{ padding: '9px 12px', color: '#8a9e96' }}>{h.investor_name || '—'}</td>}
                            <td style={{ padding: '9px 12px', fontFamily: "'Cormorant Garamond',serif", textAlign: 'right' }}>
                              {parseFloat(h.units).toFixed(3)}
                            </td>
                            <td style={{ padding: '9px 12px', fontFamily: "'Cormorant Garamond',serif", textAlign: 'right' }}>
                              {h.avg_cost_nav ? `₹${parseFloat(h.avg_cost_nav).toFixed(2)}` : '—'}
                            </td>
                            <td style={{ padding: '9px 12px', fontFamily: "'Cormorant Garamond',serif", textAlign: 'right' }}>
                              {h.latest_nav ? `₹${parseFloat(h.latest_nav).toFixed(2)}` : '—'}
                            </td>
                            <td style={{ padding: '9px 12px', fontFamily: "'Cormorant Garamond',serif", textAlign: 'right' }}>
                              {formatINR(h.invested_value)}
                            </td>
                            <td style={{ padding: '9px 12px', fontFamily: "'Cormorant Garamond',serif", textAlign: 'right', fontWeight: 600 }}>
                              {formatINR(h.current_value)}
                            </td>
                            <td style={{ padding: '9px 12px', fontFamily: "'Cormorant Garamond',serif", textAlign: 'right', color: hColor }}>
                              {hGain >= 0 ? '+' : ''}{formatINR(hGain)} ({hGainPct}%)
                            </td>
                            <td style={{ padding: '9px 12px' }}>
                              <span style={{
                                fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                                borderRadius: '100px', textTransform: 'uppercase',
                                background: h.source === 'Niom' ? 'rgba(44,74,62,0.08)' : 'rgba(184,150,90,0.1)',
                                color: h.source === 'Niom' ? green : gold,
                              }}>{h.source || '—'}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* 5. EQUITY BREAKDOWN */}
            {(equityBreak?.style_breakdown?.length > 0 || equityBreak?.top_stocks?.length > 0) && (
              <Section title="Equity Breakdown">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>Large / Mid / Small Cap</div>
                    <DonutChart
                      data={equityBreak?.style_breakdown || []}
                      nameKey="name" valueKey="aum"
                      formatValue={formatINR} height={160}
                    />
                  </div>
                  <div>
                    <div style={{ ...tabLabel, marginBottom: '10px' }}>Top Holdings</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                      <thead>
                        <tr style={{ background: sage }}>
                          {['Company', 'Sector', 'Weight'].map(h => (
                            <th key={h} style={{ padding: '7px 10px', textAlign: 'left', ...tabLabel, fontFamily: "'Jost',sans-serif", borderBottom: `1px solid ${border}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(equityBreak?.top_stocks || []).slice(0, 8).map((s, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${border}` }}>
                            <td style={{ padding: '7px 10px', fontWeight: 500, color: charcoal }}>{s.company_name || '—'}</td>
                            <td style={{ padding: '7px 10px', color: '#8a9e96' }}>{s.sector_name || '—'}</td>
                            <td style={{ padding: '7px 10px', fontFamily: "'Cormorant Garamond',serif", color: charcoal }}>
                              {s.effective_pct ? `${parseFloat(s.effective_pct).toFixed(1)}%` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Section>
            )}

            {/* 6. DEBT BREAKDOWN */}
            {(debtBreak?.by_duration?.length > 0 || debtBreak?.by_credit_quality?.length > 0) && (
              <Section title="Debt Breakdown">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>By Duration / Maturity</div>
                    <DonutChart
                      data={debtBreak?.by_duration || []}
                      nameKey="name" valueKey="aum"
                      formatValue={formatINR} height={160}
                    />
                  </div>
                  <div>
                    <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>By Credit Rating</div>
                    <DonutChart
                      data={debtBreak?.by_credit_quality || []}
                      nameKey="name" valueKey="aum"
                      formatValue={formatINR} height={160}
                    />
                  </div>
                </div>
              </Section>
            )}
          </>
        )}

        {/* ── FOOTER ── */}
        <div style={{ borderTop: `1px solid ${border}`, paddingTop: '20px', marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
          <div style={{ fontSize: '9px', color: '#8a9e96', lineHeight: 1.6, maxWidth: '600px' }}>
            Mutual fund investments are subject to market risks. Please read all scheme-related documents carefully before investing. Past performance is not indicative of future results.
            This report is generated by an AMFI-registered Mutual Fund Distributor and is meant for the exclusive use of the named investor.
            Redistribution without prior written consent is strictly prohibited.
          </div>
          <div style={{ fontSize: '10px', color: '#8a9e96', textAlign: 'right', whiteSpace: 'nowrap' }}>
            Page 1
          </div>
        </div>
      </div>
    </div>
  );
}
