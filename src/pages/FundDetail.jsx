import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DonutChart from '../components/ui/DonutChart';
import HorizontalBarChart from '../components/ui/HorizontalBarChart';
import { schemes, formatINR } from '../lib/api';

// ── Design tokens ─────────────────────────────────────────────────────────────
const sectionHead = {
  fontFamily: 'var(--display-font)',
  fontSize: '20px',
  fontWeight: 600,
  color: 'var(--green)',
};

const tabLabelStyle = {
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--gold)',
  fontWeight: 600,
};

const TABS = ['Overview', 'Portfolio', 'Risk & Returns', 'Scheme Information'];

const quartileColor = {
  Q1: { bg: 'rgba(44,74,62,0.12)', color: 'var(--green)' },
  Q2: { bg: 'rgba(44,74,62,0.06)', color: '#5a8a70' },
  Q3: { bg: 'rgba(184,150,90,0.14)', color: 'var(--gold)' },
  Q4: { bg: 'rgba(200,80,80,0.10)', color: '#c05050' },
};

// ── Helper components ─────────────────────────────────────────────────────────

function StarRating({ rating, size = 16 }) {
  if (!rating) return null;
  return (
    <span style={{ fontSize: `${size}px`, letterSpacing: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? 'var(--gold)' : '#ddd' }}>★</span>
      ))}
    </span>
  );
}

function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow)',
      overflow: 'hidden',
      marginBottom: '20px',
      ...style,
    }}>
      {title && (
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
          <span style={sectionHead}>{title}</span>
        </div>
      )}
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ ...tabLabelStyle, fontSize: '10px', marginBottom: '4px' }}>{label}</div>
      <div style={{
        fontFamily: 'var(--display-font)',
        fontSize: '17px',
        fontWeight: 600,
        color: 'var(--charcoal)',
      }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

function SkeletonBlock({ h = 200, radius = 12 }) {
  return (
    <div style={{
      height: h,
      borderRadius: radius,
      background: 'linear-gradient(90deg, var(--sage) 25%, #e8eeec 50%, var(--sage) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

// Morningstar-style quartile histogram icon
function QuartileIcon({ quartile }) {
  if (!quartile) return <span style={{ color: '#ccc' }}>—</span>;
  const filled = { Q1: 4, Q2: 3, Q3: 2, Q4: 1 }[quartile] || 0;
  const color = { Q1: 'var(--green)', Q2: '#5a8a70', Q3: 'var(--gold)', Q4: '#c05050' }[quartile];
  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: '2px' }}>
      {[1, 2, 3, 4].map(b => (
        <div key={b} style={{
          width: '5px',
          height: `${5 + b * 4}px`,
          borderRadius: '1px',
          background: b <= filled ? color : '#ddd',
        }} />
      ))}
    </div>
  );
}

// Qualitative gauge — Risk vs Category / Return vs Category
function QualitativeGauge({ label, ratingValue }) {
  const labels = ['Low', 'Below Avg', 'Average', 'Above Avg', 'High'];
  const val = Math.min(5, Math.max(1, parseInt(ratingValue) || 3));
  const markerPct = ((val - 1) / 4) * 100;
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '12px', color: '#8a9e96', marginBottom: '8px' }}>{label}</div>
      <div style={{
        position: 'relative', height: '10px', borderRadius: '5px', overflow: 'hidden',
        background: 'linear-gradient(to right, #4caf82, #8ac87a 25%, #e6b94a 50%, #e8874a 75%, #e05050)',
      }}>
        <div style={{
          position: 'absolute',
          left: `${markerPct}%`,
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#fff',
          border: '2.5px solid var(--green)',
          boxShadow: '0 1px 4px rgba(44,74,62,0.3)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        {labels.map((l, i) => (
          <span key={l} style={{
            fontSize: '10px',
            color: val === i + 1 ? 'var(--green)' : '#9aaa9e',
            fontWeight: val === i + 1 ? 600 : 400,
          }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// Style box — equity or debt
function StyleBox({ styleText, isDebt, debtStyle }) {
  if (isDebt && debtStyle) {
    const cols     = ['Limited', 'Moderate', 'Extensive'];
    const colShort = ['Ltd', 'Mod', 'Ext'];
    const rows     = ['High', 'Medium', 'Low'];
    const creditQ  = (debtStyle.credit_quality || '').toLowerCase();
    const durationS = (debtStyle.interest_rate_sensitivity || '').toLowerCase();
    const activeCol = cols.findIndex(c => c.toLowerCase() === durationS);
    const activeRow = rows.findIndex(r => r.toLowerCase() === creditQ);
    return (
      <div>
        <div style={{ display: 'flex', gap: '2px', marginBottom: '4px', paddingLeft: '40px' }}>
          {colShort.map(l => (
            <div key={l} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: '#9aaa9e', fontWeight: 600, textTransform: 'uppercase' }}>{l}</div>
          ))}
        </div>
        {rows.map((row, ri) => (
          <div key={row} style={{ display: 'flex', gap: '2px', marginBottom: '2px', alignItems: 'center' }}>
            <div style={{ width: '36px', fontSize: '9px', color: '#9aaa9e', textAlign: 'right', paddingRight: '6px' }}>{row}</div>
            {cols.map((col, ci) => (
              <div key={col} style={{
                flex: 1, aspectRatio: '1', borderRadius: '3px',
                border: '1px solid var(--border)',
                background: (ri === activeRow && ci === activeCol) ? 'var(--green)' : 'var(--sage)',
              }} />
            ))}
          </div>
        ))}
        <div style={{ fontSize: '10px', color: '#9aaa9e', marginTop: '8px', textAlign: 'center' }}>
          Credit Quality × Duration
        </div>
      </div>
    );
  }

  // Equity style box
  const colLabels = ['Val', 'Bld', 'Gwth'];
  const rowLabels = ['Large', 'Mid', 'Small'];
  const lower = (styleText || '').toLowerCase();
  const activeRow = lower.includes('large') ? 0 : lower.includes('mid') ? 1 : lower.includes('small') ? 2 : -1;
  const activeCol = lower.includes('value') ? 0 : lower.includes('growth') ? 2 : lower.includes('blend') ? 1 : -1;
  return (
    <div>
      <div style={{ display: 'flex', gap: '2px', marginBottom: '4px', paddingLeft: '40px' }}>
        {colLabels.map(l => (
          <div key={l} style={{ flex: 1, textAlign: 'center', fontSize: '9px', color: '#9aaa9e', fontWeight: 600, textTransform: 'uppercase' }}>{l}</div>
        ))}
      </div>
      {rowLabels.map((row, ri) => (
        <div key={row} style={{ display: 'flex', gap: '2px', marginBottom: '2px', alignItems: 'center' }}>
          <div style={{ width: '36px', fontSize: '9px', color: '#9aaa9e', textAlign: 'right', paddingRight: '6px' }}>{row}</div>
          {colLabels.map((col, ci) => (
            <div key={col} style={{
              flex: 1, aspectRatio: '1', borderRadius: '3px',
              border: '1px solid var(--border)',
              background: (ri === activeRow && ci === activeCol) ? 'var(--green)' : 'var(--sage)',
            }} />
          ))}
        </div>
      ))}
      <div style={{ fontSize: '10px', color: '#9aaa9e', marginTop: '8px', textAlign: 'center' }}>
        {styleText || 'Style Box'}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function FundDetail() {
  const { plan_id } = useParams();
  const navigate    = useNavigate();

  const [activeTab, setActiveTab]       = useState('Overview');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [data, setData]                 = useState(null);
  const [chartData, setChartData]       = useState(null);
  const [riskPeriod, setRiskPeriod]     = useState('3yr');
  const [holdingsPage, setHoldingsPage] = useState(0);
  const [showFullObj, setShowFullObj]   = useState(false);
  const HOLDINGS_PER_PAGE = 10;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [detail, chart] = await Promise.all([
          schemes.detail(plan_id),
          schemes.growthChart(plan_id).catch(() => null),
        ]);
        setData(detail);
        setChartData(chart);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [plan_id]);

  if (error) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--display-font)', fontSize: '24px', color: 'var(--green)', marginBottom: '12px' }}>
          Fund not found
        </div>
        <div style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '24px' }}>{error}</div>
        <button
          onClick={() => navigate('/research/funds')}
          style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: 'var(--green)', color: 'var(--ivory)',
            cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--body-font)',
          }}
        >← Back to Fund Explorer</button>
      </div>
    );
  }

  // Destructure data safely
  const fund      = data?.fund      || {};
  const ret       = data?.returns   || {};
  const risk      = data?.risk      || {};
  const catRisk   = data?.category_risk || {};
  const quartile  = data?.quartile;
  const nav       = data?.nav;
  const aum       = data?.aum;
  const expense   = data?.expense;
  const load_     = data?.load;
  const sipSwpStp = data?.sip_swp_stp;
  const managers  = data?.managers        || [];
  const stocks    = data?.stocks          || [];
  const amfiSecs  = data?.amfi_sectors    || [];
  const comp      = data?.composition;
  const debtStyle = data?.debt_style;
  const styleBox  = data?.style_box;
  const upDown    = data?.upside_downside || [];
  const annRet    = data?.annual_returns  || [];
  const catAnn    = data?.cat_annual      || [];
  const turnover  = data?.turnover;
  const isin      = data?.isin;
  const top10Pct  = data?.top10_pct;

  // Determine debt fund for style box
  const isDebt = ['debt', 'bond', 'liquid', 'duration', 'credit', 'gilt',
    'money market', 'overnight', 'ultra short', 'low duration',
    'short term', 'banking', 'psu', 'floater']
    .some(k => (fund.category_name || '').toLowerCase().includes(k));

  // Asset allocation donut data
  const allocData = comp ? [
    { name: 'Equity',      value: parseFloat(comp.equity)      || 0 },
    { name: 'Debt',        value: parseFloat(comp.debt)        || 0 },
    { name: 'Commodities', value: parseFloat(comp.commodities) || 0 },
    { name: 'Real Estate', value: parseFloat(comp.realestate)  || 0 },
    { name: 'Others',      value: parseFloat(comp.others)      || 0 },
  ].filter(d => d.value > 0.01) : [];

  // Annual returns
  const catAnnMap   = Object.fromEntries(catAnn.map(r => [r.year, r]));
  const annualYears = [...new Set(annRet.map(r => r.year))].sort((a, b) => a - b).slice(-10);

  // Sector chart
  const sectorData = amfiSecs.map(s => ({ name: s.sector_name, value: parseFloat(s.percentage) || 0 }));

  // Holdings pagination
  const pagedStocks        = stocks.slice(holdingsPage * HOLDINGS_PER_PAGE, (holdingsPage + 1) * HOLDINGS_PER_PAGE);
  const holdingsTotalPages = Math.ceil(stocks.length / HOLDINGS_PER_PAGE);

  // Growth of 10,000 chart series
  const buildChartSeries = () => {
    if (!chartData) return [];
    const fundMap = Object.fromEntries((chartData.fund     || []).map(r => [String(r.date), r.value]));
    const catMap  = Object.fromEntries((chartData.category || []).map(r => [String(r.date), r.value]));
    const idxMap  = Object.fromEntries((chartData.index    || []).map(r => [String(r.date), r.value]));
    const allDates = [...new Set([
      ...(chartData.fund     || []).map(r => String(r.date)),
      ...(chartData.category || []).map(r => String(r.date)),
      ...(chartData.index    || []).map(r => String(r.date)),
    ])].sort();
    return allDates.map(d => ({
      date:     d,
      Fund:     fundMap[d] ?? null,
      Category: catMap[d]  ?? null,
      Index:    idxMap[d]  ?? null,
    }));
  };
  const chartSeries = buildChartSeries();
  const hasCatLine  = (chartData?.category || []).length > 0;
  const hasIdxLine  = (chartData?.index    || []).length > 0;

  const formatNavDate = d =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>

      {/* ══════════════════════════════════════════════════
          STICKY HEADER
      ══════════════════════════════════════════════════ */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,248,244,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 16px rgba(44,74,62,0.06)',
      }}>
        {/* Back button */}
        <div style={{ padding: '10px 32px 0' }}>
          <button
            onClick={() => navigate('/research/funds')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: '#8a9e96', padding: 0,
              display: 'flex', alignItems: 'center', gap: '4px',
              fontFamily: 'var(--body-font)',
            }}
          >← Fund Explorer</button>
        </div>

        {/* Section 1 — Fund identity + stats strip */}
        <div style={{
          padding: '8px 32px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', flexWrap: 'wrap',
        }}>
          <div>
            {loading ? (
              <div style={{ width: '320px', height: '24px', borderRadius: '6px', background: 'var(--sage)', animation: 'shimmer 1.4s infinite', marginBottom: '8px' }} />
            ) : (
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '21px', fontWeight: 600, color: 'var(--green)', lineHeight: 1.2, marginBottom: '6px' }}>
                {fund.plan_name || '—'}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#8a9e96' }}>{fund.amc_short_name}</span>
              {fund.category_name && (
                <>
                  <span style={{ color: '#ddd' }}>·</span>
                  <span style={{ fontSize: '12px', color: '#8a9e96' }}>{fund.category_name}</span>
                </>
              )}
              {ret.star_rating && (
                <>
                  <span style={{ color: '#ddd' }}>·</span>
                  <StarRating rating={ret.star_rating} size={14} />
                </>
              )}
              {quartile && (
                <span style={{
                  fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                  borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.08em',
                  ...quartileColor[quartile],
                }}>{quartile}</span>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <StatPill label="NAV"       value={nav ? `₹${parseFloat(nav.nav).toFixed(4)}` : '—'} />
            <StatPill label="NAV Date"  value={formatNavDate(nav?.nav_date)} />
            <StatPill label="AUM"       value={aum ? formatINR(aum) : '—'} />
            <StatPill label="Expense"   value={expense?.expense_ratio ? `${parseFloat(expense.expense_ratio).toFixed(2)}%` : '—'} />
            <StatPill label="Exit Load" value={load_?.exit_load_text || '—'} />
            <StatPill label="Min SIP"   value={sipSwpStp?.sip_min ? formatINR(sipSwpStp.sip_min) : '—'} />
            {styleBox?.style_box && <StatPill label="Style" value={styleBox.style_box} />}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', padding: '10px 32px 0', borderTop: '1px solid var(--border)', marginTop: '10px' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px', border: 'none',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--green)' : 'transparent'}`,
                background: 'transparent',
                fontSize: '13px', fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--green)' : '#8a9e96',
                cursor: 'pointer', fontFamily: 'var(--body-font)',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >{tab}</button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PAGE CONTENT
      ══════════════════════════════════════════════════ */}
      <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>

        {/* ──────────── OVERVIEW ──────────── */}
        {activeTab === 'Overview' && (
          <>
            {/* Growth of ₹10,000 */}
            <Card title="Growth of ₹10,000">
              {loading ? <SkeletonBlock h={280} /> : chartSeries.length === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aaa9e', fontSize: '13px' }}>
                  NAV data not yet available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartSeries} margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9aaa9e' }}
                      tickFormatter={d => new Date(d).getFullYear()}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9aaa9e' }}
                      tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`}
                      width={52}
                    />
                    <Tooltip
                      formatter={(v, name) => [`₹${Number(v).toLocaleString('en-IN')}`, name]}
                      labelFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      contentStyle={{ fontSize: '12px', fontFamily: 'var(--body-font)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                    <Line type="monotone" dataKey="Fund" stroke="#2C4A3E" strokeWidth={2} dot={false} connectNulls />
                    {hasCatLine && <Line type="monotone" dataKey="Category" stroke="#B8965A" strokeWidth={1.5} dot={false} strokeDasharray="5 3" connectNulls />}
                    {hasIdxLine && <Line type="monotone" dataKey="Index" stroke="#9aaa9e" strokeWidth={1.5} dot={false} strokeDasharray="2 3" connectNulls />}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Annual Returns table */}
            <Card title="Annual Returns">
              {loading ? <SkeletonBlock h={180} /> : annualYears.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9aaa9e', fontSize: '13px', padding: '24px 0' }}>
                  Annual returns data not yet available
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                    <thead>
                      <tr style={{ background: 'var(--sage)' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', color: '#9aaa9e', fontWeight: 500, width: '130px' }}></th>
                        {annualYears.map(y => (
                          <th key={y} style={{ padding: '10px 14px', textAlign: 'right', ...tabLabelStyle, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>
                            {y}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Investment */}
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '11px 14px', fontSize: '12px', color: '#8a9e96', fontWeight: 500 }}>Investment</td>
                        {annualYears.map(y => {
                          const r = annRet.find(a => a.year === y);
                          const v = r?.returns;
                          return (
                            <td key={y} style={{ padding: '11px 14px', textAlign: 'right', fontFamily: 'var(--display-font)', fontSize: '14px', whiteSpace: 'nowrap', color: v != null ? (parseFloat(v) >= 0 ? 'var(--green)' : '#c05050') : '#ccc' }}>
                              {v != null ? `${parseFloat(v).toFixed(2)}%` : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Category */}
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '11px 14px', fontSize: '12px', color: '#8a9e96', fontWeight: 500 }}>Category</td>
                        {annualYears.map(y => {
                          const v = catAnnMap[y]?.returns;
                          return (
                            <td key={y} style={{ padding: '11px 14px', textAlign: 'right', fontFamily: 'var(--display-font)', fontSize: '14px', whiteSpace: 'nowrap', color: v != null ? (parseFloat(v) >= 0 ? '#5a8a70' : '#c05050') : '#ccc' }}>
                              {v != null ? `${parseFloat(v).toFixed(2)}%` : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Quartile Rank */}
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '11px 14px', fontSize: '12px', color: '#8a9e96', fontWeight: 500 }}>Quartile Rank</td>
                        {annualYears.map(y => {
                          const r = annRet.find(a => a.year === y);
                          const q = (r?.rank && r?.total_funds && r.total_funds > 0)
                            ? (r.rank / r.total_funds <= 0.25 ? 'Q1' : r.rank / r.total_funds <= 0.5 ? 'Q2' : r.rank / r.total_funds <= 0.75 ? 'Q3' : 'Q4')
                            : null;
                          return (
                            <td key={y} style={{ padding: '11px 14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <QuartileIcon quartile={q} />
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Percentile Rank */}
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '11px 14px', fontSize: '12px', color: '#8a9e96', fontWeight: 500 }}>Percentile</td>
                        {annualYears.map(y => {
                          const r   = annRet.find(a => a.year === y);
                          const pct = (r?.rank && r?.total_funds && r.total_funds > 0) ? Math.round((r.rank / r.total_funds) * 100) : null;
                          return (
                            <td key={y} style={{ padding: '11px 14px', textAlign: 'right', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>
                              {pct != null ? pct : '—'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* # in Category */}
                      <tr>
                        <td style={{ padding: '11px 14px', fontSize: '12px', color: '#8a9e96', fontWeight: 500 }}># in Cat.</td>
                        {annualYears.map(y => {
                          const r  = annRet.find(a => a.year === y);
                          const ct = r?.total_funds || catAnnMap[y]?.fund_count;
                          return (
                            <td key={y} style={{ padding: '11px 14px', textAlign: 'right', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#9aaa9e' }}>
                              {ct || '—'}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Asset Allocation + Style Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Card title="Asset Allocation" style={{ margin: 0 }}>
                {loading ? <SkeletonBlock h={200} /> : allocData.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9aaa9e', fontSize: '13px', padding: '24px 0' }}>Not yet available</div>
                ) : (
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ flex: '0 0 140px' }}>
                      <DonutChart data={allocData} nameKey="name" valueKey="value" formatValue={v => `${v.toFixed(1)}%`} height={140} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '6px 8px', textAlign: 'left', ...tabLabelStyle, fontSize: '10px', fontFamily: 'var(--body-font)' }}>Asset Class</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', ...tabLabelStyle, fontSize: '10px', fontFamily: 'var(--body-font)' }}>%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allocData.map(d => (
                            <tr key={d.name} style={{ borderTop: '1px solid var(--border)' }}>
                              <td style={{ padding: '8px', fontSize: '12px', color: '#8a9e96' }}>{d.name}</td>
                              <td style={{ padding: '8px', textAlign: 'right', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>
                                {d.value.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>

              <Card title={isDebt ? 'Fixed Income Style Box' : 'Equity Style Box'} style={{ margin: 0 }}>
                {loading ? <SkeletonBlock h={200} /> : (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                    <div style={{ width: '180px' }}>
                      <StyleBox styleText={styleBox?.style_box} isDebt={isDebt} debtStyle={debtStyle} />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </>
        )}

        {/* ──────────── PORTFOLIO ──────────── */}
        {activeTab === 'Portfolio' && (
          <>
            {/* Stats strip */}
            <Card>
              {loading ? <SkeletonBlock h={64} /> : (
                <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                  <StatPill label="Total Holdings"     value={stocks.length > 0 ? `${stocks.length}+` : '—'} />
                  <StatPill label="% in Top 10"        value={top10Pct != null ? `${top10Pct}%` : '—'} />
                  <StatPill label="Portfolio Turnover" value={turnover?.turnover_pct ? `${parseFloat(turnover.turnover_pct).toFixed(1)}%` : '—'} />
                </div>
              )}
            </Card>

            {/* Sector Allocation */}
            <Card title="Sector Allocation">
              {loading ? <SkeletonBlock h={240} /> : sectorData.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9aaa9e', fontSize: '13px', padding: '24px 0' }}>Sector data not yet available</div>
              ) : (
                <HorizontalBarChart data={sectorData} nameKey="name" valueKey="value" formatValue={v => `${v.toFixed(1)}%`} />
              )}
            </Card>

            {/* Top Holdings */}
            <Card title="Top Holdings">
              {loading ? <SkeletonBlock h={300} /> : stocks.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9aaa9e', fontSize: '13px', padding: '24px 0' }}>Holdings data not yet available</div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'var(--sage)' }}>
                          <th style={{ padding: '10px 16px', textAlign: 'left', ...tabLabelStyle, fontFamily: 'var(--body-font)', width: '40px' }}>#</th>
                          <th style={{ padding: '10px 16px', textAlign: 'left', ...tabLabelStyle, fontFamily: 'var(--body-font)' }}>Company</th>
                          <th style={{ padding: '10px 16px', textAlign: 'right', ...tabLabelStyle, fontFamily: 'var(--body-font)' }}>% Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedStocks.map((s, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '13px 16px', fontSize: '12px', color: '#9aaa9e' }}>
                              {holdingsPage * HOLDINGS_PER_PAGE + idx + 1}
                            </td>
                            <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--charcoal)', fontWeight: 500 }}>
                              {s.company_name}
                            </td>
                            <td style={{ padding: '13px 16px', textAlign: 'right', fontFamily: 'var(--display-font)', fontSize: '15px', color: 'var(--charcoal)', fontWeight: 600 }}>
                              {parseFloat(s.percentage).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {holdingsTotalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '4px' }}>
                      <button
                        onClick={() => setHoldingsPage(p => Math.max(0, p - 1))}
                        disabled={holdingsPage === 0}
                        style={{ padding: '6px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', background: holdingsPage === 0 ? 'var(--sage)' : '#fff', color: holdingsPage === 0 ? '#9aaa9e' : 'var(--green)', fontSize: '12px', cursor: holdingsPage === 0 ? 'default' : 'pointer', fontFamily: 'var(--body-font)' }}
                      >← Prev</button>
                      <span style={{ fontSize: '12px', color: '#8a9e96' }}>{holdingsPage + 1} / {holdingsTotalPages}</span>
                      <button
                        onClick={() => setHoldingsPage(p => Math.min(holdingsTotalPages - 1, p + 1))}
                        disabled={holdingsPage >= holdingsTotalPages - 1}
                        style={{ padding: '6px 14px', borderRadius: '8px', border: '1.5px solid var(--border)', background: holdingsPage >= holdingsTotalPages - 1 ? 'var(--sage)' : '#fff', color: holdingsPage >= holdingsTotalPages - 1 ? '#9aaa9e' : 'var(--green)', fontSize: '12px', cursor: holdingsPage >= holdingsTotalPages - 1 ? 'default' : 'pointer', fontFamily: 'var(--body-font)' }}
                      >Next →</button>
                    </div>
                  )}
                </>
              )}
            </Card>
          </>
        )}

        {/* ──────────── RISK & RETURNS ──────────── */}
        {activeTab === 'Risk & Returns' && (
          <>
            {/* Period toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[['3yr', '3-Year'], ['5yr', '5-Year']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRiskPeriod(key)}
                  style={{
                    padding: '8px 20px', borderRadius: '100px',
                    border: '1.5px solid var(--border)',
                    background: riskPeriod === key ? 'var(--green)' : '#fff',
                    color: riskPeriod === key ? 'var(--ivory)' : '#7a8a84',
                    fontSize: '13px', fontWeight: riskPeriod === key ? 600 : 400,
                    cursor: 'pointer', fontFamily: 'var(--body-font)', transition: 'all 0.2s',
                  }}
                >{label}</button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {/* Qualitative gauges */}
              <Card title="Risk vs Category" style={{ margin: 0 }}>
                {loading ? <SkeletonBlock h={140} /> : (
                  <>
                    <QualitativeGauge label="Risk vs Category"   ratingValue={ret.risk_rating} />
                    <QualitativeGauge label="Return vs Category" ratingValue={ret.return_rating} />
                  </>
                )}
              </Card>

              {/* Capture Ratios */}
              <Card title="Capture Ratios" style={{ margin: 0 }}>
                {loading ? <SkeletonBlock h={140} /> : upDown.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9aaa9e', fontSize: '13px', padding: '24px 0' }}>Not yet available</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--sage)' }}>
                        <th style={{ padding: '10px 14px', textAlign: 'left', ...tabLabelStyle, fontSize: '10px', fontFamily: 'var(--body-font)' }}>Metric</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right', ...tabLabelStyle, fontSize: '10px', fontFamily: 'var(--body-font)' }}>Fund</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upDown.flatMap(r => [
                        { label: `Upside Capture (${r.period})`,   val: r.upside_capture,   positive: true },
                        { label: `Downside Capture (${r.period})`, val: r.downside_capture, positive: false },
                      ]).map(({ label, val, positive }) => (
                        <tr key={label} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 14px', fontSize: '12px', color: '#8a9e96' }}>{label}</td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--display-font)', fontSize: '15px', fontWeight: 600,
                            color: val == null ? '#ccc' : positive
                              ? (parseFloat(val) >= 100 ? 'var(--green)' : 'var(--charcoal)')
                              : (parseFloat(val) <= 100 ? 'var(--green)' : '#c05050'),
                          }}>
                            {val != null ? parseFloat(val).toFixed(1) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>
            </div>

            {/* Risk & Volatility Measures */}
            <Card title="Risk & Volatility Measures">
              {loading ? <SkeletonBlock h={220} /> : !risk.alpha && !risk.beta ? (
                <div style={{ textAlign: 'center', color: '#9aaa9e', fontSize: '13px', padding: '24px 0' }}>
                  Risk metrics not yet available
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--sage)' }}>
                        <th style={{ padding: '10px 16px', textAlign: 'left', ...tabLabelStyle, fontSize: '10px', fontFamily: 'var(--body-font)' }}>Metric</th>
                        <th style={{ padding: '10px 16px', textAlign: 'right', ...tabLabelStyle, fontSize: '10px', fontFamily: 'var(--body-font)' }}>Fund</th>
                        {catRisk.alpha != null && (
                          <th style={{ padding: '10px 16px', textAlign: 'right', ...tabLabelStyle, fontSize: '10px', fontFamily: 'var(--body-font)' }}>Category Avg</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Alpha',              fk: 'alpha',   ck: 'alpha' },
                        { label: 'Beta',               fk: 'beta',    ck: 'beta' },
                        { label: 'Sharpe Ratio',       fk: 'sharpe',  ck: 'sharpe' },
                        { label: 'Sortino Ratio',      fk: 'sortino', ck: 'sortino' },
                        { label: 'Standard Deviation', fk: 'std_dev', ck: 'std_dev' },
                      ].map(m => (
                        <tr key={m.label} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#8a9e96' }}>{m.label}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--display-font)', fontSize: '16px', color: 'var(--charcoal)', fontWeight: 600 }}>
                            {risk[m.fk] != null ? parseFloat(risk[m.fk]).toFixed(2) : '—'}
                          </td>
                          {catRisk.alpha != null && (
                            <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--display-font)', fontSize: '16px', color: '#8a9e96' }}>
                              {catRisk[m.ck] != null ? parseFloat(catRisk[m.ck]).toFixed(2) : '—'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}

        {/* ──────────── SCHEME INFORMATION ──────────── */}
        {activeTab === 'Scheme Information' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Fund Details */}
            <Card title="Fund Details" style={{ margin: 0 }}>
              {loading ? <SkeletonBlock h={220} /> : (
                <dl style={{ margin: 0 }}>
                  {[
                    { label: 'Fund House',  value: fund.amc_full_name || fund.amc_short_name },
                    { label: 'Category',    value: fund.category_name },
                    { label: 'Fund Type',   value: fund.fund_type },
                    { label: 'Plan Type',   value: fund.plan_type },
                    { label: 'Benchmark',   value: fund.benchmark_name },
                    { label: 'Launch Date', value: fund.launch_date ? new Date(fund.launch_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null },
                    { label: 'Face Value',  value: fund.face_value ? `₹${fund.face_value}` : null },
                  ].filter(d => d.value).map(d => (
                    <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <dt style={{ fontSize: '12px', color: '#8a9e96', flexShrink: 0 }}>{d.label}</dt>
                      <dd style={{ fontSize: '13px', color: 'var(--charcoal)', fontWeight: 500, textAlign: 'right', margin: 0 }}>{d.value}</dd>
                    </div>
                  ))}
                  {fund.investment_objective && (
                    <div style={{ paddingTop: '12px' }}>
                      <dt style={{ fontSize: '12px', color: '#8a9e96', marginBottom: '6px' }}>Investment Objective</dt>
                      <dd style={{ fontSize: '12px', color: 'var(--charcoal)', lineHeight: 1.6, margin: 0 }}>
                        {showFullObj || fund.investment_objective.length <= 180
                          ? fund.investment_objective
                          : `${fund.investment_objective.slice(0, 180)}...`
                        }
                        {fund.investment_objective.length > 180 && (
                          <button
                            onClick={() => setShowFullObj(v => !v)}
                            style={{ background: 'none', border: 'none', color: 'var(--green)', fontSize: '12px', cursor: 'pointer', padding: '0 0 0 6px', fontFamily: 'var(--body-font)', fontWeight: 600 }}
                          >{showFullObj ? 'Read less' : 'Read more'}</button>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </Card>

            {/* Financials */}
            <Card title="Financials" style={{ margin: 0 }}>
              {loading ? <SkeletonBlock h={140} /> : (
                <dl style={{ margin: 0 }}>
                  {[
                    { label: 'AUM',                value: aum ? formatINR(aum) : null },
                    { label: 'Expense Ratio',      value: expense?.expense_ratio ? `${parseFloat(expense.expense_ratio).toFixed(2)}%` : null },
                    { label: 'Exit Load',          value: load_?.exit_load_text },
                    { label: 'Portfolio Turnover', value: turnover?.turnover_pct ? `${parseFloat(turnover.turnover_pct).toFixed(1)}%` : null },
                  ].filter(d => d.value).map(d => (
                    <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <dt style={{ fontSize: '12px', color: '#8a9e96' }}>{d.label}</dt>
                      <dd style={{ fontSize: '13px', color: 'var(--charcoal)', fontWeight: 500, textAlign: 'right', margin: 0 }}>{d.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Card>

            {/* Investment Details */}
            <Card title="Investment Details" style={{ margin: 0 }}>
              {loading ? <SkeletonBlock h={160} /> : (
                <dl style={{ margin: 0 }}>
                  {[
                    { label: 'Min SIP',          value: sipSwpStp?.sip_min ? formatINR(sipSwpStp.sip_min) : null },
                    { label: 'SIP Frequencies',  value: sipSwpStp?.sip_frequencies },
                    { label: 'SIP Dates',        value: sipSwpStp?.sip_dates },
                    { label: 'Min SWP',          value: sipSwpStp?.swp_min ? formatINR(sipSwpStp.swp_min) : null },
                    { label: 'Min STP',          value: sipSwpStp?.stp_min ? formatINR(sipSwpStp.stp_min) : null },
                  ].filter(d => d.value).map(d => (
                    <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <dt style={{ fontSize: '12px', color: '#8a9e96', flexShrink: 0 }}>{d.label}</dt>
                      <dd style={{ fontSize: '13px', color: 'var(--charcoal)', fontWeight: 500, textAlign: 'right', margin: 0 }}>{d.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Card>

            {/* Administration */}
            <Card title="Administration" style={{ margin: 0 }}>
              {loading ? <SkeletonBlock h={160} /> : (
                <dl style={{ margin: 0 }}>
                  {managers.length > 0 && (
                    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <dt style={{ fontSize: '12px', color: '#8a9e96', marginBottom: '6px' }}>
                        Fund Manager{managers.length > 1 ? 's' : ''}
                      </dt>
                      {managers.map((m, i) => (
                        <dd key={i} style={{ margin: '0 0 4px 0', fontSize: '13px', color: 'var(--charcoal)', fontWeight: 500 }}>
                          {m.name}
                          {m.start_date && (
                            <span style={{ fontSize: '11px', color: '#9aaa9e', fontWeight: 400, marginLeft: '8px' }}>
                              since {new Date(m.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </dd>
                      ))}
                    </div>
                  )}
                  {[
                    { label: 'ISIN',                      value: isin?.isin },
                    { label: 'AMFI Code',                 value: isin?.amfi_code },
                    { label: 'Custodian',                 value: fund.custodian },
                    { label: 'Registrar & Transfer Agent', value: fund.registrar },
                  ].filter(d => d.value).map(d => (
                    <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <dt style={{ fontSize: '12px', color: '#8a9e96', flexShrink: 0 }}>{d.label}</dt>
                      <dd style={{
                        fontSize: '13px', color: 'var(--charcoal)', fontWeight: 500,
                        textAlign: 'right', margin: 0,
                        fontFamily: ['ISIN', 'AMFI Code'].includes(d.label) ? 'var(--display-font)' : 'inherit',
                      }}>{d.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Card>

            {/* Documents */}
            <Card title="Documents" style={{ margin: 0, gridColumn: '1 / -1' }}>
              {loading ? <SkeletonBlock h={60} /> : (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'SID',           url: fund.sid_url },
                    { label: 'KIM',           url: fund.kim_url },
                    { label: 'AMC Factsheet', url: fund.factsheet_url },
                    { label: 'VR Factsheet',  url: fund.vr_factsheet_url },
                  ].filter(d => d.url).map(d => (
                    <a
                      key={d.label}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '8px',
                        border: '1.5px solid var(--border)',
                        fontSize: '13px', color: 'var(--green)', fontWeight: 500,
                        textDecoration: 'none', fontFamily: 'var(--body-font)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.borderColor = 'var(--green)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {d.label}
                    </a>
                  ))}
                  {![fund.sid_url, fund.kim_url, fund.factsheet_url, fund.vr_factsheet_url].some(Boolean) && (
                    <div style={{ fontSize: '13px', color: '#9aaa9e' }}>Documents not yet available</div>
                  )}
                </div>
              )}
            </Card>

          </div>
        )}

      </div>
    </div>
  );
}
