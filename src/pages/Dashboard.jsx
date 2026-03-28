import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/ui/KPICard';
import DonutChart from '../components/ui/DonutChart';
import AreaBarChart from '../components/ui/AreaBarChart';
import HorizontalBarChart from '../components/ui/HorizontalBarChart';
import { dashboard, formatINR, formatPct } from '../lib/api';

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

const TXN_PERIODS = ['3D', '7D', '10D', '30D'];
const TREND_FILTERS = ['12M', '24M', '36M'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [txnPeriod, setTxnPeriod] = useState('7D');
  const [chartMode, setChartMode] = useState('Trend');
  const [trendFilter, setTrendFilter] = useState('12M');

  const [kpis, setKpis] = useState(null);
  const [txnSummary, setTxnSummary] = useState(null);
  const [aumHistory, setAumHistory] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [sipsDue, setSipsDue] = useState([]);

  // Load static data once
  useEffect(() => {
    async function load() {
      try {
        const [k, b, s] = await Promise.all([
          dashboard.kpis().catch(() => null),
          dashboard.aumBreakdown().catch(() => null),
          dashboard.sipsDue(7).catch(() => []),
        ]);
        setKpis(k);
        setBreakdown(b);
        setSipsDue(s || []);
      } catch(e) { console.error(e); }
    }
    load();
  }, []);

  // Reload transaction summary when period changes
  useEffect(() => {
    async function loadTxn() {
      try {
        const days = txnPeriod.replace('D', '');
        const t = await dashboard.transactionSummary(days).catch(() => null);
        setTxnSummary(t);
      } catch(e) { console.error(e); }
    }
    loadTxn();
  }, [txnPeriod]);

  // Reload AUM history when trend filter changes
  useEffect(() => {
    async function loadHistory() {
      try {
        const months = parseInt(trendFilter.replace('M', ''));
        const h = await dashboard.aumHistory(months).catch(() => []);
        setAumHistory(h || []);
      } catch(e) { console.error(e); }
    }
    loadHistory();
  }, [trendFilter]);

  function getTxn(type) {
    if (!txnSummary?.by_type) return { count: 0, total_amount: 0 };
    const row = txnSummary.by_type.find(r =>
      r.transaction_type?.toLowerCase().includes(type.toLowerCase())
    );
    return row || { count: 0, total_amount: 0 };
  }

  const aumByBroadCategory = breakdown?.by_broad_category || [];
  const aumByCategory = breakdown?.by_category?.map(d => ({ name: d.category_name || 'Unknown', aum: d.aum })) || [];
  const aumByAmc = breakdown?.by_amc?.map(d => ({ name: d.amc_name || 'Unknown', aum: d.aum })) || [];
  const aumByStyle = breakdown?.by_style?.map(d => ({ name: d.style_box || 'Unknown', aum: d.aum })) || [];

  const totalRatingsAum = breakdown?.ratings_distribution?.reduce((s, x) => s + parseFloat(x.aum || 0), 0) || 1;

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Client Dashboard
        </h1>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <KPICard label="Total AUM"         value={kpis ? formatINR(kpis.total_aum) : '₹0'}        subtitle="As of today" />
        <KPICard label="Total Invested"    value={kpis ? formatINR(kpis.total_invested) : '₹0'} />
        <KPICard label="Total Gain / Loss" value={kpis ? formatINR(kpis.total_gain) : '₹0'}        subtitle={kpis ? `${formatPct(kpis.gain_pct)} absolute` : 'XIRR: 0%'} />
        <KPICard label="Investors"         value={kpis ? String(kpis.investor_count) : '0'}         to="/investors" />
        <KPICard label="Families"          value={kpis ? String(kpis.family_count) : '0'}           to="/families" />
        <KPICard label="SIP Book"          value={kpis ? formatINR(kpis.sip_amount) : '₹0'} />
        <KPICard label="New Leads"         value={kpis ? String(kpis.leads_mtd) : '0'}              to="/leads" />
      </div>

      {/* Transaction Summary */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden', marginBottom: '28px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: '1px solid var(--border)',
        }}>
          <span style={sectionHead}>Transaction Summary</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {TXN_PERIODS.map(d => (
              <button key={d} onClick={() => setTxnPeriod(d)} style={{
                padding: '6px 14px', borderRadius: '100px',
                fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em',
                border: '1.5px solid var(--border)',
                background: txnPeriod === d ? 'var(--green)' : '#fff',
                color: txnPeriod === d ? 'var(--ivory)' : '#7a8a84',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>{d}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
          {[
            { label: 'Lumpsum Purchase',  value: formatINR(getTxn('lumpsum').total_amount), sub: `${getTxn('lumpsum').count || 0} transactions` },
            { label: 'SIP Purchase',      value: formatINR(getTxn('sip').total_amount),     sub: `${getTxn('sip').count || 0} transactions` },
            { label: 'Redemption',        value: formatINR(getTxn('redeem').total_amount),  sub: `${getTxn('redeem').count || 0} transactions` },
            { label: 'Rejection',         value: formatINR(getTxn('reject').total_amount),  sub: `${getTxn('reject').count || 0} transactions` },
            { label: 'New Investors',     value: String(txnSummary?.new_investors || 0),    sub: null },
            { label: 'New SIP',           value: formatINR(getTxn('sip').total_amount),     sub: `${getTxn('sip').count || 0} SIPs` },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '24px 12px',
              borderRight: i < 5 ? '1px solid var(--border)' : 'none',
              textAlign: 'center', display: 'flex', flexDirection: 'column',
              alignItems: 'center', minHeight: '140px',
            }}>
              <div style={{ ...tabLabel, minHeight: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '36px', fontWeight: 600, color: 'var(--charcoal)', lineHeight: 1, flex: 1, display: 'flex', alignItems: 'center' }}>
                {item.value}
              </div>
              <div style={{ fontSize: '13px', color: item.sub ? '#9aaa9e' : 'transparent', minHeight: '20px', display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                {item.sub || '·'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AUM Growth */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '28px', marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <span style={sectionHead}>AUM Growth</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--sage)', borderRadius: '100px', padding: '4px', gap: '2px' }}>
              {['Monthly Comparison', 'Trend'].map(m => (
                <button key={m} onClick={() => setChartMode(m)} style={{
                  padding: '6px 16px', borderRadius: '100px', fontSize: '12px',
                  fontWeight: 500, border: 'none',
                  background: chartMode === m ? 'var(--green)' : 'transparent',
                  color: chartMode === m ? 'var(--ivory)' : '#7a8a84',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>{m}</button>
              ))}
            </div>
            {chartMode === 'Trend' && (
              <div style={{ display: 'flex', gap: '4px' }}>
                {TREND_FILTERS.map(f => (
                  <button key={f} onClick={() => setTrendFilter(f)} style={{
                    padding: '6px 12px', borderRadius: '100px', fontSize: '12px',
                    border: '1.5px solid var(--border)',
                    background: trendFilter === f ? 'rgba(44,74,62,0.08)' : '#fff',
                    color: trendFilter === f ? 'var(--green)' : '#7a8a84',
                    cursor: 'pointer', fontWeight: trendFilter === f ? 500 : 400,
                  }}>{f}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <AreaBarChart data={aumHistory} mode={chartMode === 'Trend' ? 'trend' : 'bar'} height={280} />
      </div>

      {/* AUM Breakdown */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ marginBottom: '20px' }}>
          <span style={sectionHead}>AUM Breakdown</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* By Category */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px' }}>
            <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>By Category</div>
            <DonutChart data={aumByBroadCategory} nameKey="name" valueKey="aum" formatValue={formatINR} height={220} />
          </div>
          {/* By Subcategory */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px' }}>
            <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>By Subcategory</div>
            <HorizontalBarChart data={aumByCategory} nameKey="name" valueKey="aum" height={220} />
          </div>
          {/* By AMC */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px' }}>
            <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>By AMC</div>
            <DonutChart data={aumByAmc} nameKey="name" valueKey="aum" formatValue={formatINR} height={220} />
          </div>
          {/* By Fund Style */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px' }}>
            <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>By Fund Style</div>
            <DonutChart data={aumByStyle} nameKey="name" valueKey="aum" formatValue={formatINR} height={220} />
          </div>
        </div>
      </div>

      {/* SIP Breakdown */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ marginBottom: '20px' }}>
          <span style={sectionHead}>SIP Breakdown</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* By Category */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px' }}>
            <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>By Category</div>
            <DonutChart data={aumByBroadCategory} nameKey="name" valueKey="aum" formatValue={formatINR} height={220} />
          </div>
          {/* By AMC */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px' }}>
            <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>By AMC</div>
            <DonutChart data={aumByAmc} nameKey="name" valueKey="aum" formatValue={formatINR} height={220} />
          </div>
          {/* By Fund Style */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px' }}>
            <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>By Fund Style</div>
            <DonutChart data={aumByStyle} nameKey="name" valueKey="aum" formatValue={formatINR} height={220} />
          </div>
          {/* SIPs Due This Week */}
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>SIPs Due This Week</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sipsDue.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', background: 'var(--sage)' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#c4d4d0', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#9aaa9e' }}>No SIPs due this week</span>
                </div>
              ) : sipsDue.slice(0, 4).map((sip, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', background: 'var(--sage)' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: 'var(--charcoal)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sip.investor_name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8a9e96' }}>{sip.scheme_name} · {formatINR(sip.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fund Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {/* Top Schemes */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <span style={sectionHead}>Top Schemes by AUM</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Fund', 'AMC', 'AUM', 'Rating'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', background: 'var(--sage)', ...tabLabel }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(breakdown?.top_schemes || []).slice(0, 5).map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '13px 20px', fontSize: '13px', color: 'var(--charcoal)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.plan_name}</td>
                  <td style={{ padding: '13px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{s.amc_name}</td>
                  <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{formatINR(s.aum)}</td>
                  <td style={{ padding: '13px 20px', fontSize: '13px', color: 'var(--gold)' }}>{'★'.repeat(s.star_rating || 0)}</td>
                </tr>
              ))}
              {!breakdown?.top_schemes?.length && (
                <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9aaa9e' }}>No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Scheme Ratings */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <span style={{ ...sectionHead, marginBottom: '24px' }}>Scheme Ratings Distribution</span>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {[5, 4, 3, 2, 1, null].map((star, i) => {
              const label = star ? `${star} Star` : 'Not Rated';
              const row = breakdown?.ratings_distribution?.find(x =>
                star ? parseInt(x.star_rating) === star : x.star_rating === null
              );
              const pct = row ? ((parseFloat(row.aum) / totalRatingsAum) * 100).toFixed(1) : 0;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#5a6a64', width: '64px', flexShrink: 0 }}>{label}</span>
                  <div style={{ flex: 1, height: '10px', background: 'var(--sage)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: '100px', transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: '#9aaa9e', width: '36px', textAlign: 'right' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Investors + Families */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[
          { title: 'Top Investors', data: breakdown?.top_investors || [], link: '/investors', idKey: 'id', nameKey: 'name' },
          { title: 'Top Families',  data: breakdown?.top_families || [],  link: '/families',  idKey: 'id', nameKey: 'name' },
        ].map(({ title, data, link, idKey, nameKey }) => (
          <div key={title} style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <span style={sectionHead}>{title}</span>
              <a href={link} style={{ fontSize: '12px', color: 'var(--green)', textDecoration: 'underline', cursor: 'pointer' }}>View More</a>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'AUM', 'XIRR'].map(h => (
                    <th key={h} style={{ padding: '10px 24px', textAlign: 'left', background: 'var(--sage)', ...tabLabel }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((item, i) => (
                  <tr key={i}
                    onClick={() => navigate(`${link}/${item[idKey]}`)}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '13px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>{item[nameKey]}</td>
                    <td style={{ padding: '13px 24px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)' }}>{formatINR(item.aum)}</td>
                    <td style={{ padding: '13px 24px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                  </tr>
                ))}
                {!data.length && (
                  <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', fontSize: '13px', color: '#9aaa9e' }}>No data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
