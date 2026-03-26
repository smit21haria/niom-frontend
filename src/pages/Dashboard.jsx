import { useState } from 'react';
import KPICard from '../components/ui/KPICard';

const TXN_PERIODS = ['3D', '7D', '10D', '30D'];
const CHART_MODES = ['Monthly Comparison', 'Trend'];
const TREND_FILTERS = ['12M', '24M', '36M'];

export default function Dashboard() {
  const [txnPeriod, setTxnPeriod] = useState('7D');
  const [chartMode, setChartMode] = useState('Trend');
  const [trendFilter, setTrendFilter] = useState('12M');

  return (
    <div>
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)', marginBottom: '6px' }}>
          Client Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#8a9e96', fontWeight: 300 }}>
          Overview of all investor portfolios and activity
        </p>
      </div>

      {/* Alerts Strip */}
      <div style={{
        background: '#fff', borderRadius: '10px',
        border: '1px solid var(--border)', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: '12px',
        marginBottom: '28px',
      }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: 'var(--charcoal)' }}>
          <strong style={{ color: 'var(--green)', fontWeight: 500 }}>SIPs due this week:</strong>
          {' '}0 SIPs across 0 investors
        </span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <KPICard label="Total AUM" value="₹0" subtitle="As of today" />
        <KPICard label="Total Invested" value="₹0" subtitle="Cost value" />
        <KPICard label="Total Gain / Loss" value="₹0" subtitle="XIRR: 0%" />
        <KPICard label="Investors" value="0" subtitle="Active investors" to="/investors" />
        <KPICard label="Families" value="0" subtitle="Family groups" to="/families" />
        <KPICard label="SIP Book" value="₹0" subtitle="0 active SIPs · Avg ₹0" />
        <KPICard label="New Leads" value="0" subtitle="This month" to="/leads" />
      </div>

      {/* Transaction Summary */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden', marginBottom: '28px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600 }}>
            Transaction Summary
          </div>
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
            { label: 'Lumpsum Purchase', value: '₹0', sub: '0 transactions' },
            { label: 'SIP Purchase', value: '₹0', sub: '0 transactions' },
            { label: 'Redemption', value: '₹0', sub: '0 transactions' },
            { label: 'Rejection', value: '₹0', sub: '0 transactions' },
            { label: 'New Investors', value: '0', sub: 'this period' },
            { label: 'New SIP Installs', value: '₹0', sub: '0 SIPs' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '20px 24px',
              borderRight: i < 5 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--gold)', fontWeight: 600, marginBottom: '10px' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '26px', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '4px' }}>
                {item.value}
              </div>
              <div style={{ fontSize: '12px', color: '#9aaa9e' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AUM Chart */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '28px', marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600 }}>
            AUM Over Time
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {CHART_MODES.map(m => (
              <button key={m} onClick={() => setChartMode(m)} style={{
                padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 500,
                border: '1.5px solid var(--border)',
                background: chartMode === m ? 'var(--green)' : '#fff',
                color: chartMode === m ? 'var(--ivory)' : '#7a8a84',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>{m}</button>
            ))}
            {chartMode === 'Trend' && (
              <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                {TREND_FILTERS.map(f => (
                  <button key={f} onClick={() => setTrendFilter(f)} style={{
                    padding: '6px 12px', borderRadius: '100px', fontSize: '12px',
                    border: '1.5px solid var(--border)',
                    background: trendFilter === f ? 'rgba(44,74,62,0.08)' : '#fff',
                    color: trendFilter === f ? 'var(--green)' : '#7a8a84',
                    cursor: 'pointer',
                    fontWeight: trendFilter === f ? 500 : 400,
                  }}>{f}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{
          height: '240px', background: 'var(--sage)', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#9aaa9e', fontStyle: 'italic' }}>Chart renders with real data</span>
        </div>
      </div>

      {/* AUM Breakdowns */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600, marginBottom: '16px' }}>
          AUM Breakdown
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {['By Category', 'By Subcategory', 'By AMC', 'By Fund Style'].map(label => (
            <div key={label} style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px',
            }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--gold)', fontWeight: 600, marginBottom: '16px' }}>
                {label}
              </div>
              <div style={{ height: '140px', background: 'var(--sage)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: '#9aaa9e', fontStyle: 'italic' }}>Chart</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SIP Breakdowns */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600, marginBottom: '16px' }}>
          SIP Breakdown
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {['By Category', 'By AMC', 'By Fund Style'].map(label => (
            <div key={label} style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px',
            }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--gold)', fontWeight: 600, marginBottom: '16px' }}>
                {label}
              </div>
              <div style={{ height: '140px', background: 'var(--sage)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', color: '#9aaa9e', fontStyle: 'italic' }}>Chart</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Investors + Families */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {[
          { title: 'Top Investors', link: '/investors' },
          { title: 'Top Families', link: '/families' },
        ].map(({ title, link }) => (
          <div key={title} style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600 }}>
                {title}
              </div>
              <a href={link} style={{ fontSize: '12px', color: 'var(--green)', textDecoration: 'underline', cursor: 'pointer' }}>
                View More
              </a>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'AUM', 'XIRR'].map(h => (
                    <th key={h} style={{
                      padding: '10px 24px', textAlign: 'left', background: 'var(--sage)',
                      fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em',
                      color: 'var(--gold)', fontWeight: 600, fontFamily: 'var(--body-font)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '13px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                    <td style={{ padding: '13px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>₹0</td>
                    <td style={{ padding: '13px 24px', fontSize: '13px', color: '#8a9e96' }}>0%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Fund Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)', overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600 }}>
              Top Schemes by AUM
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Fund', 'AMC', 'AUM', 'Rating'].map(h => (
                  <th key={h} style={{
                    padding: '10px 24px', textAlign: 'left', background: 'var(--sage)',
                    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em',
                    color: 'var(--gold)', fontWeight: 600, fontFamily: 'var(--body-font)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '13px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                  <td style={{ padding: '13px 24px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                  <td style={{ padding: '13px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>₹0</td>
                  <td style={{ padding: '13px 24px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '24px',
        }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 600, marginBottom: '20px' }}>
            Scheme Ratings Distribution
          </div>
          {['5 Star', '4 Star', '3 Star', '2 Star', '1 Star', 'Not Rated'].map(r => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#5a6a64', width: '60px', flexShrink: 0 }}>{r}</span>
              <div style={{ flex: 1, height: '6px', background: 'var(--sage)', borderRadius: '100px' }}>
                <div style={{ height: '100%', width: '0%', background: 'var(--green)', borderRadius: '100px' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#9aaa9e', width: '36px', textAlign: 'right' }}>0%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
