import { useState } from 'react';
import KPICard from '../components/ui/KPICard';

const TXN_PERIODS = ['3D', '7D', '10D', '30D'];
const TREND_FILTERS = ['12M', '24M', '36M'];

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
  lineHeight: 1.4,
};

const tabValue = {
  fontFamily: 'var(--display-font)',
  fontSize: '36px',
  fontWeight: 600,
  color: 'var(--charcoal)',
  lineHeight: 1,
};

const tabSub = {
  fontSize: '13px',
  color: '#9aaa9e',
  letterSpacing: '0.02em',
};

export default function Dashboard() {
  const [txnPeriod, setTxnPeriod] = useState('7D');
  const [chartMode, setChartMode] = useState('Trend');
  const [trendFilter, setTrendFilter] = useState('12M');

  const txnItems = [
    { label: 'Lumpsum Purchase', value: '₹0', sub: '0 transactions' },
    { label: 'SIP Purchase',     value: '₹0', sub: '0 transactions' },
    { label: 'Redemption',       value: '₹0', sub: '0 transactions' },
    { label: 'Rejection',        value: '₹0', sub: '0 transactions' },
    { label: 'New Investors',    value: '0',   sub: null },
    { label: 'New SIP',          value: '₹0', sub: '0 SIPs' },
  ];

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--display-font)',
          fontSize: '34px',
          fontWeight: 600,
          color: 'var(--green)',
        }}>
          Client Dashboard
        </h1>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <KPICard label="Total AUM"        value="₹0" subtitle="As of today" />
        <KPICard label="Total Invested"   value="₹0" />
        <KPICard label="Total Gain / Loss" value="₹0" subtitle="XIRR: 0%" />
        <KPICard label="Investors"        value="0"  to="/investors" />
        <KPICard label="Families"         value="0"  to="/families" />
        <KPICard label="SIP Book"         value="₹0" />
        <KPICard label="New Leads"        value="0"  to="/leads" />
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
          {txnItems.map((item, i) => (
            <div key={i} style={{
              padding: '24px 12px',
              borderRight: i < 5 ? '1px solid var(--border)' : 'none',
              textAlign: 'center',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center',
              minHeight: '140px',
            }}>
              {/* Label */}
              <div style={{
                ...tabLabel,
                minHeight: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px',
              }}>
                {item.label}
              </div>
              {/* Value */}
              <div style={{ ...tabValue, flex: 1, display: 'flex', alignItems: 'center' }}>
                {item.value}
              </div>
              {/* Sub */}
              <div style={{
                ...tabSub,
                minHeight: '20px',
                display: 'flex', alignItems: 'center',
                color: item.sub ? '#9aaa9e' : 'transparent',
                marginTop: '8px',
              }}>
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
            <div style={{
              display: 'flex', background: 'var(--sage)',
              borderRadius: '100px', padding: '4px', gap: '2px',
            }}>
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
                    cursor: 'pointer',
                    fontWeight: trendFilter === f ? 500 : 400,
                  }}>{f}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{
          height: '280px', background: 'var(--sage)', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#9aaa9e', fontStyle: 'italic' }}>
            Chart renders with real data
          </span>
        </div>
      </div>

      {/* AUM Breakdown */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ marginBottom: '20px' }}>
          <span style={sectionHead}>AUM Breakdown</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {['By Category', 'By Subcategory', 'By AMC', 'By Fund Style'].map(label => (
            <div key={label} style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '24px',
            }}>
              <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>{label}</div>
              <div style={{
                height: '200px', background: 'var(--sage)', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '12px', color: '#9aaa9e', fontStyle: 'italic' }}>Chart</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SIP Breakdown */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ marginBottom: '20px' }}>
          <span style={sectionHead}>SIP Breakdown</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {['By Category', 'By AMC'].map(label => (
            <div key={label} style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '24px',
            }}>
              <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>{label}</div>
              <div style={{
                height: '200px', background: 'var(--sage)', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '12px', color: '#9aaa9e', fontStyle: 'italic' }}>Chart</span>
              </div>
            </div>
          ))}

          {/* By Fund Style */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            padding: '24px',
          }}>
            <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>By Fund Style</div>
            <div style={{
              height: '200px', background: 'var(--sage)', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '12px', color: '#9aaa9e', fontStyle: 'italic' }}>Chart</span>
            </div>
          </div>

          {/* SIPs Due This Week */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            padding: '24px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ ...tabLabel, textAlign: 'left', marginBottom: '16px' }}>SIPs Due This Week</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '8px',
                  background: 'var(--sage)',
                }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: 'var(--gold)', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: '13px', color: 'var(--charcoal)' }}>
                    No SIPs due this week
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fund Intelligence */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {/* Top Schemes */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <span style={sectionHead}>Top Schemes by AUM</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Fund', 'AMC', 'AUM', 'Rating'].map(h => (
                  <th key={h} style={{
                    padding: '10px 20px', textAlign: 'left',
                    background: 'var(--sage)', ...tabLabel,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '13px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                  <td style={{ padding: '13px 20px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                  <td style={{ padding: '13px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>₹0</td>
                  <td style={{ padding: '13px 20px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scheme Ratings */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          padding: '24px', display: 'flex', flexDirection: 'column',
        }}>
          <span style={{ ...sectionHead, marginBottom: '24px' }}>Scheme Ratings Distribution</span>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {['5 Star', '4 Star', '3 Star', '2 Star', '1 Star', 'Not Rated'].map(r => (
              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#5a6a64', width: '64px', flexShrink: 0 }}>{r}</span>
                <div style={{ flex: 1, height: '10px', background: 'var(--sage)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '0%', background: 'var(--green)', borderRadius: '100px', transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ fontSize: '13px', color: '#9aaa9e', width: '36px', textAlign: 'right' }}>0%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Investors + Top Families */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[
          { title: 'Top Investors', link: '/investors' },
          { title: 'Top Families', link: '/families' },
        ].map(({ title, link }) => (
          <div key={title} style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid var(--border)',
            }}>
              <span style={sectionHead}>{title}</span>
              <a href={link} style={{ fontSize: '12px', color: 'var(--green)', textDecoration: 'underline', cursor: 'pointer' }}>
                View More
              </a>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'AUM', 'XIRR'].map(h => (
                    <th key={h} style={{
                      padding: '10px 24px', textAlign: 'left',
                      background: 'var(--sage)', ...tabLabel,
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
    </div>
  );
}