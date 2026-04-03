import { useState, useEffect, useCallback, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { schemes, formatINR } from '../lib/api';

// ── Design tokens ──────────────────────────────────────────────────────────
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

// One color per fund slot
const FUND_COLORS = ['#2C4A3E', '#B8965A', '#5B7FA6'];

const PERIODS = ['1Y', '3Y', '5Y', 'Max'];

// ── Helpers ────────────────────────────────────────────────────────────────

function StarRating({ rating, size = 13 }) {
  if (!rating) return <span style={{ color: '#ccc', fontSize: size }}>—</span>;
  return (
    <span style={{ fontSize: size, letterSpacing: '1px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? 'var(--gold)' : '#ddd' }}>★</span>
      ))}
    </span>
  );
}

function SkeletonBlock({ h = 160 }) {
  return (
    <div style={{
      height: h, borderRadius: '10px',
      background: 'linear-gradient(90deg, var(--sage) 25%, #e8eeec 50%, var(--sage) 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
    }} />
  );
}

function SectionCard({ title, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
      overflow: 'hidden', marginBottom: '20px',
    }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
        <span style={sectionHead}>{title}</span>
      </div>
      {children}
    </div>
  );
}

// Comparison table — label column + one column per fund
function CompareTable({ rows, funds, loading, skeletonRows = 4 }) {
  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <SkeletonBlock h={skeletonRows * 44} />
      </div>
    );
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--sage)' }}>
            <th style={{ padding: '10px 20px', textAlign: 'left', ...tabLabelStyle, fontFamily: 'var(--body-font)', width: '200px' }}>
              &nbsp;
            </th>
            {funds.map((f, i) => (
              <th key={f.plan_id} style={{ padding: '10px 20px', textAlign: 'center', ...tabLabelStyle, fontFamily: 'var(--body-font)', color: FUND_COLORS[i] }}>
                {f.plan_name?.split(' ').slice(0, 3).join(' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: '1px solid var(--border)', background: ri % 2 === 0 ? '#fff' : 'rgba(239,242,238,0.4)' }}>
              <td style={{ padding: '13px 20px', fontSize: '13px', color: '#5a6a64', fontWeight: 500 }}>
                {row.label}
              </td>
              {funds.map((f, fi) => (
                <td key={f.plan_id} style={{
                  padding: '13px 20px', textAlign: 'center',
                  fontFamily: row.numeric ? 'var(--display-font)' : 'var(--body-font)',
                  fontSize: row.numeric ? '15px' : '13px',
                  fontWeight: row.numeric ? 600 : 400,
                  color: row.colorFn ? row.colorFn(row.getValue(f)) : 'var(--charcoal)',
                }}>
                  {row.render ? row.render(f, fi) : (row.getValue(f) ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Fund search modal
function AddFundModal({ onAdd, onClose, existing }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const inputRef                = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await schemes.search({ q: query, limit: 8, offset: 0 });
        setResults((r.schemes || []).filter(f => !existing.find(e => e.plan_id === f.plan_id)));
      } catch(e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '20px',
        width: '520px', maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9aaa9e" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search fund name or AMC..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '15px', fontFamily: 'var(--body-font)',
              color: 'var(--charcoal)', background: 'transparent',
            }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9aaa9e', fontSize: '20px', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {loading && (
            <div style={{ padding: '20px 24px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ height: '48px', borderRadius: '8px', marginBottom: '8px', background: 'linear-gradient(90deg, var(--sage) 25%, #e8eeec 50%, var(--sage) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
              ))}
            </div>
          )}
          {!loading && query && results.length === 0 && (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: '#9aaa9e', fontSize: '13px' }}>
              No funds found for "{query}"
            </div>
          )}
          {!loading && !query && (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: '#9aaa9e', fontSize: '13px' }}>
              Start typing to search funds
            </div>
          )}
          {!loading && results.map(f => (
            <div
              key={f.plan_id}
              onClick={() => { onAdd(f); onClose(); }}
              style={{
                padding: '14px 24px', cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '3px' }}>
                {f.plan_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#9aaa9e' }}>{f.amc_name}</span>
                {f.category_name && (
                  <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '100px', background: 'var(--sage)', color: '#5a6a64', fontWeight: 500 }}>
                    {f.category_name}
                  </span>
                )}
                {f.star_rating && (
                  <span style={{ fontSize: '11px', color: 'var(--gold)' }}>{'★'.repeat(f.star_rating)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ResearchCompare() {
  const [selectedFunds, setSelectedFunds] = useState([]); // list of {plan_id, plan_name, ...} from search
  const [compareData, setCompareData]     = useState([]);  // full data from compare-all endpoint
  const [navData, setNavData]             = useState([]);  // normalized NAV series
  const [loading, setLoading]             = useState(false);
  const [chartLoading, setChartLoading]   = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [period, setPeriod]               = useState('1Y');
  const [riskPeriod, setRiskPeriod]       = useState('3yr');

  const MAX_FUNDS = 3;

  // Load compare data whenever selected funds change
  useEffect(() => {
    if (!selectedFunds.length) {
      setCompareData([]);
      setNavData([]);
      return;
    }
    async function load() {
      setLoading(true);
      try {
        const plans = selectedFunds.map(f => f.plan_id).join(',');
        const data  = await schemes.compareAll(plans);
        setCompareData(data);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedFunds]);

  // Load NAV chart data whenever funds or period changes
  useEffect(() => {
    if (!selectedFunds.length) { setNavData([]); return; }
    async function loadNav() {
      setChartLoading(true);
      try {
        const plans = selectedFunds.map(f => f.plan_id).join(',');
        const data  = await schemes.compareNav(plans, period);
        setNavData(data);
      } catch(e) {
        console.error(e);
      } finally {
        setChartLoading(false);
      }
    }
    loadNav();
  }, [selectedFunds, period]);

  const addFund = (fund) => {
    if (selectedFunds.length >= MAX_FUNDS) return;
    setSelectedFunds(prev => [...prev, fund]);
  };

  const removeFund = (plan_id) => {
    setSelectedFunds(prev => prev.filter(f => f.plan_id !== plan_id));
  };

  // Get the full data object for a fund
  const getFundData = (plan_id) => compareData.find(d => d.plan_id === plan_id) || {};

  // Funds with full data (for table rendering)
  const funds = selectedFunds.map(f => ({ ...f, ...getFundData(f.plan_id) }));

  // Build chart series — merge all fund NAV series by date
  const buildChartData = () => {
    if (!navData.length) return [];
    const allDates = [...new Set(navData.flatMap(s => (s.data || []).map(d => d.date)))].sort();
    return allDates.map(date => {
      const point = { date };
      navData.forEach((series, i) => {
        const fund = selectedFunds[i];
        if (!fund) return;
        const found = series.data?.find(d => d.date === date);
        point[fund.plan_name] = found?.value ?? null;
      });
      return point;
    });
  };
  const chartData = buildChartData();

  // Format return % for display
  const fmtPct = (v) => v != null ? `${parseFloat(v).toFixed(2)}%` : '—';
  const fmtNum = (v, dec = 2) => v != null ? parseFloat(v).toFixed(dec) : '—';
  const fmtINR = (v) => v ? formatINR(v) : '—';

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Compare Funds
        </h1>
        <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '6px' }}>
          Compare up to 3 funds side by side
        </p>
      </div>

      {/* ── SECTION 1: HEADER ── */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '24px', marginBottom: '20px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MAX_FUNDS + 1}, 1fr)`, gap: '12px' }}>
          {/* Label column */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--display-font)', fontSize: '18px', fontWeight: 600, color: 'var(--green)', marginBottom: '6px' }}>
              Compare Funds
            </div>
            <div style={{ fontSize: '12px', color: '#9aaa9e', lineHeight: 1.5 }}>
              Select up to 3 funds to compare side by side
            </div>
          </div>

          {/* Fund slots */}
          {[0, 1, 2].map(i => {
            const fund = selectedFunds[i];
            const data = fund ? getFundData(fund.plan_id) : null;
            return (
              <div key={i} style={{
                border: `2px ${fund ? 'solid' : 'dashed'} ${fund ? FUND_COLORS[i] : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '16px',
                position: 'relative',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                background: fund ? `${FUND_COLORS[i]}08` : 'transparent',
                transition: 'all 0.2s',
              }}>
                {fund ? (
                  <>
                    {/* Remove button */}
                    <button
                      onClick={() => removeFund(fund.plan_id)}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9aaa9e', fontSize: '16px', lineHeight: 1, padding: '2px 4px',
                        borderRadius: '50%', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#c05050'}
                      onMouseLeave={e => e.currentTarget.style.color = '#9aaa9e'}
                    >×</button>

                    {/* Fund name */}
                    <div style={{
                      fontSize: '13px', fontWeight: 600, color: 'var(--charcoal)',
                      lineHeight: 1.3, marginBottom: '8px',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {fund.plan_name}
                    </div>

                    {/* Category pill + Star rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {(data?.category_name || fund.category_name) && (
                        <span style={{
                          fontSize: '10px', padding: '2px 8px',
                          borderRadius: '100px', background: `${FUND_COLORS[i]}18`,
                          color: FUND_COLORS[i], fontWeight: 600,
                          textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          {data?.category_name || fund.category_name}
                        </span>
                      )}
                      {(data?.star_rating || fund.star_rating) && (
                        <StarRating rating={data?.star_rating || fund.star_rating} size={12} />
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setShowModal(true)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '8px', padding: '16px', width: '100%',
                    }}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      border: '2px dashed var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#9aaa9e', fontSize: '22px', lineHeight: 1,
                    }}>+</div>
                    <span style={{ fontSize: '12px', color: '#9aaa9e', fontFamily: 'var(--body-font)' }}>
                      Add a fund
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {!selectedFunds.length && (
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          padding: '60px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--display-font)', fontSize: '24px', color: 'var(--green)', marginBottom: '8px' }}>
            Select funds to compare
          </div>
          <div style={{ fontSize: '13px', color: '#9aaa9e' }}>
            Click "Add a fund" above to get started
          </div>
        </div>
      )}

      {/* Only show sections once at least one fund is selected */}
      {selectedFunds.length > 0 && (
        <>
          {/* ── SECTION 2: NAV CHART ── */}
          <SectionCard title="NAV Performance">
            {/* Period toggles */}
            <div style={{ display: 'flex', gap: '8px', padding: '16px 24px 0', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  padding: '8px 16px', border: 'none',
                  borderBottom: `2px solid ${period === p ? 'var(--green)' : 'transparent'}`,
                  background: 'transparent',
                  fontSize: '13px', fontWeight: period === p ? 600 : 400,
                  color: period === p ? 'var(--green)' : '#8a9e96',
                  cursor: 'pointer', fontFamily: 'var(--body-font)',
                  transition: 'all 0.2s',
                }}>{p}</button>
              ))}
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Legend */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {selectedFunds.map((f, i) => {
                  const series = navData.find(s => s.plan_id === f.plan_id);
                  const ret    = series?.period_return;
                  return (
                    <div key={f.plan_id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '2px', background: FUND_COLORS[i], borderRadius: '1px' }} />
                      <span style={{ fontSize: '12px', color: 'var(--charcoal)' }}>
                        {f.plan_name?.split(' ').slice(0, 4).join(' ')}
                        {ret != null && (
                          <span style={{ fontFamily: 'var(--display-font)', fontWeight: 700, marginLeft: '6px', color: FUND_COLORS[i] }}>
                            ({ret >= 0 ? '+' : ''}{ret.toFixed(1)}%{series?.annualized ? ' p.a.' : ''})
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chart */}
              {chartLoading ? <SkeletonBlock h={260} /> : chartData.length === 0 ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aaa9e', fontSize: '13px' }}>
                  NAV data not yet available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9aaa9e' }}
                      tickFormatter={d => {
                        const date = new Date(d);
                        return period === '1Y'
                          ? date.toLocaleDateString('en-IN', { month: 'short' })
                          : date.getFullYear();
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9aaa9e' }}
                      tickFormatter={v => `${v}`}
                      domain={['auto', 'auto']}
                      width={44}
                    />
                    <Tooltip
                      formatter={(v, name) => [`${v?.toFixed(1)}`, name?.split(' ').slice(0, 3).join(' ')]}
                      labelFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      contentStyle={{ fontSize: '12px', fontFamily: 'var(--body-font)', border: '1px solid var(--border)', borderRadius: '8px' }}
                    />
                    {selectedFunds.map((f, i) => (
                      <Line
                        key={f.plan_id}
                        type="monotone"
                        dataKey={f.plan_name}
                        stroke={FUND_COLORS[i]}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>

          {/* ── SECTION 3: FUND DETAILS ── */}
          <SectionCard title="Fund Details">
            <CompareTable
              funds={funds}
              loading={loading}
              skeletonRows={8}
              rows={[
                {
                  label: 'VR Star Rating',
                  getValue: f => f.star_rating,
                  render: (f) => <StarRating rating={f.star_rating} size={14} />,
                },
                {
                  label: 'Risk Level',
                  getValue: f => f.risk_label,
                  render: (f) => f.risk_label || '—',
                },
                {
                  label: 'Min SIP',
                  getValue: f => f.sip_min,
                  render: (f) => f.sip_min ? fmtINR(f.sip_min) : '—',
                  numeric: true,
                },
                {
                  label: 'Expense Ratio',
                  getValue: f => f.expense_ratio,
                  render: (f) => f.expense_ratio ? `${parseFloat(f.expense_ratio).toFixed(2)}%` : '—',
                  numeric: true,
                },
                {
                  label: 'NAV',
                  getValue: f => f.nav,
                  render: (f) => {
                    if (!f.nav) return '—';
                    const date = f.nav_date ? new Date(f.nav_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                    return `₹${parseFloat(f.nav).toFixed(2)}${date ? ` (${date})` : ''}`;
                  },
                  numeric: true,
                },
                {
                  label: 'Fund Started',
                  getValue: f => f.launch_date,
                  render: (f) => f.launch_date ? new Date(f.launch_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
                },
                {
                  label: 'Fund Size (AUM)',
                  getValue: f => f.aum,
                  render: (f) => fmtINR(f.aum),
                  numeric: true,
                },
                {
                  label: 'Exit Load',
                  getValue: f => f.exit_load_text,
                  render: (f) => f.exit_load_text || '—',
                },
              ]}
            />
          </SectionCard>

          {/* ── SECTION 4: RETURNS ── */}
          <SectionCard title="Returns">
            <CompareTable
              funds={funds}
              loading={loading}
              skeletonRows={10}
              rows={[
                { label: '1Y Return',       getValue: f => f.ret_1yr,          render: f => fmtPct(f.ret_1yr),         numeric: true },
                { label: '3Y Return (CAGR)', getValue: f => f.ret_3yr,         render: f => fmtPct(f.ret_3yr),         numeric: true },
                { label: '5Y Return (CAGR)', getValue: f => f.ret_5yr,         render: f => fmtPct(f.ret_5yr),         numeric: true },
                { label: 'Since Launch',    getValue: f => f.ret_since_launch, render: f => fmtPct(f.ret_since_launch), numeric: true },
                // Divider row
                { label: '3Y Rolling — Avg', getValue: f => f.rolling?.[3]?.avg, render: f => fmtPct(f.rolling?.[3]?.avg), numeric: true },
                { label: '3Y Rolling — Min', getValue: f => f.rolling?.[3]?.min, render: f => fmtPct(f.rolling?.[3]?.min), numeric: true },
                { label: '3Y Rolling — Max', getValue: f => f.rolling?.[3]?.max, render: f => fmtPct(f.rolling?.[3]?.max), numeric: true },
                { label: '5Y Rolling — Avg', getValue: f => f.rolling?.[5]?.avg, render: f => fmtPct(f.rolling?.[5]?.avg), numeric: true },
                { label: '5Y Rolling — Min', getValue: f => f.rolling?.[5]?.min, render: f => fmtPct(f.rolling?.[5]?.min), numeric: true },
                { label: '5Y Rolling — Max', getValue: f => f.rolling?.[5]?.max, render: f => fmtPct(f.rolling?.[5]?.max), numeric: true },
              ]}
            />
          </SectionCard>

          {/* ── SECTION 5: RISK ── */}
          <SectionCard title="Risk">
            {/* Period toggle */}
            <div style={{ display: 'flex', gap: '8px', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
              {[['3yr', '3-Year'], ['5yr', '5-Year']].map(([key, label]) => (
                <button key={key} onClick={() => setRiskPeriod(key)} style={{
                  padding: '7px 16px', borderRadius: '100px',
                  border: '1.5px solid var(--border)',
                  background: riskPeriod === key ? 'var(--green)' : '#fff',
                  color: riskPeriod === key ? 'var(--ivory)' : '#7a8a84',
                  fontSize: '12px', fontWeight: riskPeriod === key ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'var(--body-font)', transition: 'all 0.2s',
                }}>{label}</button>
              ))}
            </div>
            <CompareTable
              funds={funds}
              loading={loading}
              skeletonRows={7}
              rows={[
                { label: 'Alpha',              getValue: f => f.alpha,    render: f => fmtNum(f.alpha),    numeric: true },
                { label: 'Beta',               getValue: f => f.beta,     render: f => fmtNum(f.beta),     numeric: true },
                { label: 'Sharpe Ratio',       getValue: f => f.sharpe,   render: f => fmtNum(f.sharpe),   numeric: true },
                { label: 'Sortino Ratio',      getValue: f => f.sortino,  render: f => fmtNum(f.sortino),  numeric: true },
                { label: 'Standard Deviation', getValue: f => f.std_dev,  render: f => fmtNum(f.std_dev),  numeric: true },
                {
                  label: 'Upside Capture',
                  getValue: f => f.upside_downside?.find(u => u.period === (riskPeriod === '3yr' ? '3Y' : '5Y'))?.upside_capture,
                  render: f => {
                    const u = f.upside_downside?.find(u => u.period === (riskPeriod === '3yr' ? '3Y' : '5Y'));
                    return u?.upside_capture ? fmtNum(u.upside_capture, 1) : '—';
                  },
                  numeric: true,
                },
                {
                  label: 'Downside Capture',
                  getValue: f => f.upside_downside?.find(u => u.period === (riskPeriod === '3yr' ? '3Y' : '5Y'))?.downside_capture,
                  render: f => {
                    const u = f.upside_downside?.find(u => u.period === (riskPeriod === '3yr' ? '3Y' : '5Y'));
                    return u?.downside_capture ? fmtNum(u.downside_capture, 1) : '—';
                  },
                  numeric: true,
                },
              ]}
            />
          </SectionCard>

          {/* ── SECTION 6: HOLDINGS ANALYSIS ── */}
          <SectionCard title="Holdings Analysis">
            <CompareTable
              funds={funds}
              loading={loading}
              skeletonRows={10}
              rows={[
                { label: 'Top 5 Holdings %',   getValue: f => f.top5_pct,        render: f => f.top5_pct != null ? `${f.top5_pct}%` : '—',        numeric: true },
                { label: 'Top 10 Holdings %',  getValue: f => f.top10_pct,       render: f => f.top10_pct != null ? `${f.top10_pct}%` : '—',       numeric: true },
                { label: 'Turnover %',         getValue: f => f.turnover_pct,    render: f => f.turnover_pct ? `${parseFloat(f.turnover_pct).toFixed(1)}%` : '—', numeric: true },
                { label: 'P/E',                getValue: f => f.pe,              render: f => fmtNum(f.pe),   numeric: true },
                { label: 'P/B',                getValue: f => f.pb,              render: f => fmtNum(f.pb),   numeric: true },
                { label: 'Equity %',           getValue: f => f.equity_pct,      render: f => f.equity_pct      != null ? `${parseFloat(f.equity_pct).toFixed(1)}%`      : '—', numeric: true },
                { label: 'Debt %',             getValue: f => f.debt_pct,        render: f => f.debt_pct        != null ? `${parseFloat(f.debt_pct).toFixed(1)}%`        : '—', numeric: true },
                { label: 'Others %',           getValue: f => f.others_pct,      render: f => f.others_pct      != null ? `${parseFloat(f.others_pct).toFixed(1)}%`      : '—', numeric: true },
                { label: 'Commodities %',      getValue: f => f.commodities_pct, render: f => f.commodities_pct != null ? `${parseFloat(f.commodities_pct).toFixed(1)}%` : '—', numeric: true },
                { label: 'Real Estate %',      getValue: f => f.realestate_pct,  render: f => f.realestate_pct  != null ? `${parseFloat(f.realestate_pct).toFixed(1)}%`  : '—', numeric: true },
              ]}
            />
          </SectionCard>

          {/* ── SECTION 7: FUND MANAGER ── */}
          <SectionCard title="Fund Manager">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    <th style={{ padding: '10px 20px', textAlign: 'left', ...tabLabelStyle, fontFamily: 'var(--body-font)', width: '200px' }}>&nbsp;</th>
                    {funds.map((f, i) => (
                      <th key={f.plan_id} style={{ padding: '10px 20px', textAlign: 'center', ...tabLabelStyle, fontFamily: 'var(--body-font)', color: FUND_COLORS[i] }}>
                        {f.plan_name?.split(' ').slice(0, 3).join(' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5a6a64', fontWeight: 500 }}>Manager(s)</td>
                    {funds.map(f => (
                      <td key={f.plan_id} style={{ padding: '16px 20px', textAlign: 'center', verticalAlign: 'top' }}>
                        {loading ? (
                          <div style={{ height: '40px', borderRadius: '6px', background: 'var(--sage)', animation: 'shimmer 1.4s infinite' }} />
                        ) : (f.managers || []).length === 0 ? (
                          <span style={{ color: '#ccc' }}>—</span>
                        ) : (
                          f.managers.map((m, mi) => (
                            <div key={mi} style={{ marginBottom: mi < f.managers.length - 1 ? '10px' : 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--charcoal)' }}>{m.name}</div>
                              {m.start_date && (
                                <div style={{ fontSize: '11px', color: '#9aaa9e', marginTop: '2px' }}>
                                  Managing since {new Date(m.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      )}

      {/* Add Fund Modal */}
      {showModal && (
        <AddFundModal
          onAdd={addFund}
          onClose={() => setShowModal(false)}
          existing={selectedFunds}
        />
      )}
    </div>
  );
}
