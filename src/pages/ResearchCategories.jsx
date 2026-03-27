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

const mockCategories = [
  { name: 'Large Cap', funds: 32, ret1yr: '17.4%', ret3yr: '13.8%', ret5yr: '15.2%', q1: '19.8%', q4: '12.1%' },
  { name: 'Mid Cap', funds: 28, ret1yr: '21.6%', ret3yr: '17.4%', ret5yr: '19.8%', q1: '26.2%', q4: '14.8%' },
  { name: 'Small Cap', funds: 24, ret1yr: '26.8%', ret3yr: '22.1%', ret5yr: '24.4%', q1: '34.1%', q4: '18.2%' },
  { name: 'Flexi Cap', funds: 36, ret1yr: '18.9%', ret3yr: '15.2%', ret5yr: '17.4%', q1: '22.4%', q4: '13.6%' },
  { name: 'ELSS', funds: 42, ret1yr: '19.2%', ret3yr: '15.8%', ret5yr: '17.9%', q1: '23.1%', q4: '14.2%' },
  { name: 'Liquid', funds: 18, ret1yr: '7.2%', ret3yr: '6.8%', ret5yr: '6.4%', q1: '7.6%', q4: '6.8%' },
  { name: 'Short Duration', funds: 22, ret1yr: '8.4%', ret3yr: '7.6%', ret5yr: '7.2%', q1: '9.1%', q4: '7.4%' },
  { name: 'Corporate Bond', funds: 20, ret1yr: '9.1%', ret3yr: '8.2%', ret5yr: '7.8%', q1: '10.2%', q4: '7.8%' },
];

export default function ResearchCategories() {
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Category Analysis
        </h1>
      </div>

      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {['Category', 'No. of Funds', '1Y Avg Return', '3Y Avg Return', '5Y Avg Return', 'Q1 (Top 25%)', 'Q4 (Bottom 25%)'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockCategories.map(cat => (
                <tr key={cat.name} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{cat.name}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{cat.funds}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#2d8a55' }}>{cat.ret1yr}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#2d8a55' }}>{cat.ret3yr}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#2d8a55' }}>{cat.ret5yr}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--green)', fontWeight: 600 }}>{cat.q1}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#c05050' }}>{cat.q4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
