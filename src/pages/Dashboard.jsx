import KPICard from '../components/ui/KPICard';

export default function Dashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <KPICard label="Total AUM" value="₹0" subtitle="As of today" />
        <KPICard label="Total Invested" value="₹0" subtitle="Cost value" />
        <KPICard label="Total Gain / Loss" value="₹0" subtitle="XIRR: 0%" />
        <KPICard label="Investors" value="0" subtitle="Active investors" to="/investors" />
        <KPICard label="Families" value="0" subtitle="Family groups" to="/families" />
        <KPICard label="SIP Book" value="₹0 / mo" subtitle="0 active SIPs · Avg ₹0" />
        <KPICard label="New Leads" value="0" subtitle="This month" to="/leads" />
      </div>

      {/* Alerts Strip */}
      <div style={{
        background: '#fff', borderRadius: '12px',
        border: '1px solid var(--border)', padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: 'var(--gold)', flexShrink: 0,
        }} />
        <span style={{ fontSize: '13px', color: 'var(--charcoal)' }}>
          <strong style={{ color: 'var(--green)' }}>SIPs due this week:</strong> 0 SIPs across 0 investors
        </span>
      </div>

      {/* Transaction Summary */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontFamily: 'var(--display-font)', fontSize: '18px', fontWeight: 600 }}>
            Transaction Summary
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['3D', '7D', '10D', '30D'].map(d => (
              <button key={d} style={{
                padding: '6px 14px', borderRadius: '100px',
                fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em',
                border: '1px solid var(--border)',
                background: d === '7D' ? 'var(--green)' : 'transparent',
                color: d === '7D' ? '#fff' : '#5a6a64',
                cursor: 'pointer',
              }}>{d}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0 }}>
          {[
            { label: 'Lumpsum', value: '₹0', count: '0 txns' },
            { label: 'SIP Purchase', value: '₹0', count: '0 txns' },
            { label: 'Redemption', value: '₹0', count: '0 txns' },
            { label: 'Rejection', value: '₹0', count: '0 txns' },
            { label: 'New Investors', value: '0', count: 'this period' },
            { label: 'New SIP Installs', value: '₹0', count: '0 SIPs' },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '20px 24px',
              borderRight: i < 5 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--gold)', fontWeight: 600, marginBottom: '8px' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '24px', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '4px' }}>
                {item.value}
              </div>
              <div style={{ fontSize: '12px', color: '#8a9e96' }}>{item.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AUM Chart placeholder */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--display-font)', fontSize: '18px', fontWeight: 600 }}>AUM Over Time</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Monthly Comparison', 'Trend'].map(t => (
              <button key={t} style={{
                padding: '6px 16px', borderRadius: '100px', fontSize: '12px',
                border: '1px solid var(--border)',
                background: t === 'Trend' ? 'var(--green)' : 'transparent',
                color: t === 'Trend' ? '#fff' : '#5a6a64',
                cursor: 'pointer',
              }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{
          height: '240px', background: 'var(--sage)',
          borderRadius: '8px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#8a9e96', fontStyle: 'italic' }}>Chart will render here with real data</span>
        </div>
      </div>

      {/* Top Investors + Families */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {['Top Investors', 'Top Families'].map(title => (
          <div key={title} style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid var(--border)',
            }}>
              <h2 style={{ fontFamily: 'var(--display-font)', fontSize: '18px', fontWeight: 600 }}>{title}</h2>
              <button style={{
                fontSize: '12px', color: 'var(--green)', background: 'none',
                border: 'none', cursor: 'pointer', letterSpacing: '0.04em',
                textDecoration: 'underline',
              }}>View More</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--sage)' }}>
                  {['Name', 'AUM', 'XIRR'].map(h => (
                    <th key={h} style={{
                      padding: '10px 24px', textAlign: 'left',
                      fontSize: '10px', textTransform: 'uppercase',
                      letterSpacing: '0.14em', color: 'var(--gold)',
                      fontWeight: 600, fontFamily: 'var(--body-font)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>₹0</td>
                    <td style={{ padding: '14px 24px', fontSize: '13px', color: '#8a9e96' }}>0%</td>
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
