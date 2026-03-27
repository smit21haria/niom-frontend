import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

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

const mockInvestors = {
  1: { name: 'Ramesh Patel', pan: 'ABCDE1234F', mobile: '+91 98765 43210', family: 'Patel Family', partner: 'Aakash Shethia', kyc: 'verified', risk: 'Moderate', niomAum: '₹24.6 L', externalAum: '₹8.2 L', totalAum: '₹32.8 L', invested: '₹18.4 L', gain: '+₹6.2 L', absReturn: '+33.7%', xirr: '14.2%', joined: '12 Jan 2024' },
  2: { name: 'Sunita Mehta', pan: 'FGHIJ5678K', mobile: '+91 91234 56789', family: 'Mehta Family', partner: 'Priya Mehta', kyc: 'verified', risk: 'Conservative', niomAum: '₹8.1 L', externalAum: '₹0', totalAum: '₹8.1 L', invested: '₹6.8 L', gain: '+₹1.3 L', absReturn: '+19.1%', xirr: '11.8%', joined: '5 Mar 2024' },
  3: { name: 'Arjun Sharma', pan: 'KLMNO9012P', mobile: '+91 99887 76655', family: '—', partner: 'Aakash Shethia', kyc: 'pending', risk: 'Aggressive', niomAum: '₹3.4 L', externalAum: '₹1.1 L', totalAum: '₹4.5 L', invested: '₹2.9 L', gain: '+₹0.5 L', absReturn: '+17.2%', xirr: '9.1%', joined: '20 Jun 2024' },
  4: { name: 'Kavya Nair', pan: 'PQRST3456U', mobile: '+91 98001 23456', family: 'Nair Family', partner: 'Aakash Shethia', kyc: 'verified', risk: 'Moderate', niomAum: '₹12.9 L', externalAum: '₹0', totalAum: '₹12.9 L', invested: '₹9.8 L', gain: '+₹3.1 L', absReturn: '+31.6%', xirr: '16.4%', joined: '8 Sep 2023' },
  5: { name: 'Vikram Singh', pan: 'UVWXY7890Z', mobile: '+91 97654 32109', family: 'Singh Family', partner: 'Priya Mehta', kyc: 'pending', risk: 'Aggressive', niomAum: '₹6.7 L', externalAum: '₹2.3 L', totalAum: '₹9.0 L', invested: '₹5.8 L', gain: '+₹0.9 L', absReturn: '+15.5%', xirr: '12.3%', joined: '14 Nov 2023' },
};

const kycColor = {
  verified: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  pending: { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
};

const navSections = [
  { id: 'profile', label: 'Profile' },
  { id: 'performance', label: 'Performance' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'allocation', label: 'Allocation' },
  { id: 'risk', label: 'Risk' },
  { id: 'holdings', label: 'Holdings' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'sips', label: 'SIPs' },
  { id: 'equity', label: 'Equity' },
  { id: 'debt', label: 'Debt' },
  { id: 'family', label: 'Family' },
  { id: 'cas', label: 'CAS Upload' },
  { id: 'reports', label: 'Reports' },
];

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
      height, background: 'var(--sage)', borderRadius: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: '13px', color: '#9aaa9e', fontStyle: 'italic' }}>Chart renders with real data</span>
    </div>
  );
}

export default function InvestorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const investor = mockInvestors[id];
  const [activeSection, setActiveSection] = useState('profile');
  const [perfPeriod, setPerfPeriod] = useState('1Y');

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    navSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!investor) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#8a9e96' }}>
      Investor not found.{' '}
      <span style={{ color: 'var(--green)', cursor: 'pointer', textDecoration: 'underline' }}
        onClick={() => navigate('/investors')}>Go back</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Back */}
        <button onClick={() => navigate('/investors')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '13px', color: '#8a9e96', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
        }}>← Back to Investors</button>

        {/* Profile Header */}
        <div id="profile" style={{ marginBottom: '24px', scrollMarginTop: '80px' }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)', lineHeight: 1, marginBottom: '12px' }}>
                  {investor.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#8a9e96' }}>{investor.pan.slice(0,3)}••••{investor.pan.slice(-2)}</span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <a href={`tel:${investor.mobile}`} style={{ fontSize: '13px', color: 'var(--green)', textDecoration: 'none' }}>{investor.mobile}</a>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: '13px', color: '#8a9e96' }}>{investor.family}</span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: '13px', color: '#8a9e96' }}>{investor.partner}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '100px', ...kycColor[investor.kyc] }}>
                  KYC {investor.kyc}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '100px', background: 'rgba(44,74,62,0.06)', color: 'var(--green)' }}>
                  {investor.risk}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance */}
        <Section id="performance" title="Performance">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['1Y', '3Y', '5Y', 'Inception'].map(t => (
                <button key={t} onClick={() => setPerfPeriod(t)} style={{
                  padding: '6px 14px', borderRadius: '100px', fontSize: '12px',
                  border: '1.5px solid var(--border)',
                  background: perfPeriod === t ? 'var(--green)' : '#fff',
                  color: perfPeriod === t ? 'var(--ivory)' : '#7a8a84',
                  cursor: 'pointer',
                }}>{t}</button>
              ))}
            </div>
            <span style={{ fontSize: '12px', color: '#8a9e96' }}>Growth of ₹10,000 vs Benchmark vs Category</span>
          </div>
          <ChartPlaceholder height={260} />
        </Section>

        {/* Portfolio Summary */}
        <Section id="portfolio" title="Portfolio Summary">
          <div style={{ display: 'flex', gap: '0', minHeight: '140px' }}>
            {/* Left — Total AUM */}
            <div style={{
              flex: '0 0 40%', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', paddingRight: '32px',
              borderRight: '1px solid var(--border)',
            }}>
              <div style={{ ...tabLabel, marginBottom: '10px' }}>Total AUM</div>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '48px', fontWeight: 600, color: 'var(--charcoal)', lineHeight: 1, marginBottom: '12px' }}>
                {investor.totalAum}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(44,74,62,0.08)', color: 'var(--green)', fontWeight: 500 }}>
                  Niom {investor.niomAum}
                </span>
                {investor.externalAum !== '₹0' && (
                  <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(184,150,90,0.1)', color: 'var(--gold)', fontWeight: 500 }}>
                    External {investor.externalAum}
                  </span>
                )}
              </div>
            </div>

            {/* Right — 2x2 metrics */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', paddingLeft: '32px', gap: '0' }}>
              {[
                { label: 'Total Invested', value: investor.invested, color: 'var(--charcoal)' },
                { label: 'Total Gain / Loss', value: investor.gain, color: '#2d8a55' },
                { label: 'Absolute Return', value: investor.absReturn, color: '#2d8a55' },
                { label: 'XIRR', value: investor.xirr, color: '#2d8a55' },
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

        {/* Asset Allocation */}
        <Section id="allocation" title="Asset Allocation">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {['Equity / Debt / Hybrid', 'Direct / Regular'].map(label => (
              <div key={label}>
                <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>{label}</div>
                <ChartPlaceholder height={180} />
              </div>
            ))}
          </div>
        </Section>

        {/* Risk Metrics */}
        <Section id="risk" title="Risk Metrics">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {['Alpha', 'Beta', 'Sharpe Ratio', 'Sortino Ratio', 'Std. Deviation', 'Portfolio Risk Score', 'Wtd. Avg Expense Ratio', 'Cumulative Expense Paid'].map(m => (
              <div key={m} style={{ background: 'var(--sage)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <div style={{ ...tabLabel, marginBottom: '8px', fontSize: '10px' }}>{m}</div>
                <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', fontWeight: 600, color: 'var(--charcoal)' }}>—</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Holdings */}
        <Section id="holdings" title="Holdings">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: 'var(--sage)' }}>
                  {['Fund Name', 'AMC', 'Units', 'Avg NAV', 'Curr NAV', 'Invested', 'Curr Value', 'Gain/Loss', 'XIRR', 'Source'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1,2,3].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    {['13px', '13px', '13px', '13px', '13px', '13px', '13px', '13px', '13px'].map((fs, j) => (
                      <td key={j} style={{ padding: '12px 14px', fontSize: fs, fontFamily: j >= 2 ? 'var(--display-font)' : 'inherit', color: j === 7 ? '#2d8a55' : j === 8 ? '#2d8a55' : j === 1 ? '#8a9e96' : 'var(--charcoal)', whiteSpace: 'nowrap' }}>—</td>
                    ))}
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(44,74,62,0.08)', color: 'var(--green)', fontWeight: 600 }}>Niom</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Transactions */}
        <Section id="transactions" title="Transactions">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--sage)' }}>
                  {['Date', 'Fund', 'Type', 'Amount', 'Units', 'NAV'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* SIPs */}
        <Section id="sips" title="SIPs">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'var(--sage)' }}>
                  {['Fund', 'Amount', 'Frequency', 'Start Date', 'Next Due', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1,2].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(44,74,62,0.08)', color: 'var(--green)', fontWeight: 600 }}>Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Equity Breakdown */}
        <Section id="equity" title="Equity Breakdown">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>Large / Mid / Small Cap</div>
              <ChartPlaceholder height={180} />
            </div>
            <div>
              <div style={{ ...tabLabel, marginBottom: '12px' }}>Top 10 Stock Holdings</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Company', 'Sector', 'Weight', 'Cap'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', fontSize: '10px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3,4,5].map(i => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--charcoal)' }}>—</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: '#8a9e96' }}>—</td>
                      <td style={{ padding: '8px 12px', fontFamily: 'var(--display-font)', fontSize: '12px' }}>—</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: '#8a9e96' }}>—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button style={{ marginTop: '10px', fontSize: '12px', color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                View all holdings →
              </button>
            </div>
          </div>
        </Section>

        {/* Debt Breakdown */}
        <Section id="debt" title="Debt Breakdown">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>By Duration / Maturity</div>
              <ChartPlaceholder height={160} />
            </div>
            <div>
              <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>By Credit Rating</div>
              <ChartPlaceholder height={160} />
            </div>
          </div>
        </Section>

        {/* Family Members */}
        <Section id="family" title="Family Members">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {['Name', 'Relation', 'AUM', 'XIRR'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1,2].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--green)', textDecoration: 'underline', cursor: 'pointer' }}>—</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#2d8a55' }}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* CAS Upload */}
        <Section id="cas" title="CAS Upload">
          <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '16px' }}>
              Upload a CAMS or KFintech CAS PDF to import holdings and transaction history
            </div>
            <button style={{ background: 'var(--green)', color: 'var(--ivory)', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
              Upload CAS PDF
            </button>
          </div>
        </Section>

        {/* Reports */}
        <div id="reports" style={{ marginBottom: '24px', scrollMarginTop: '80px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '28px' }}>
            <span style={{ ...sectionHead, display: 'block', marginBottom: '20px' }}>Reports</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {['Portfolio Report (Comprehensive)', 'Portfolio Report (Niom ARN)', 'Portfolio Report (External ARN)', 'Returns Report', 'Holdings Report', 'Capital Gains Report', 'Transaction History'].map(report => (
                <button key={report} style={{
                  padding: '14px 16px', borderRadius: '10px',
                  border: '1.5px solid var(--border)', background: '#fff',
                  fontSize: '13px', color: 'var(--charcoal)', cursor: 'pointer',
                  textAlign: 'left', fontFamily: 'var(--body-font)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--sage)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; }}>
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
        {navSections.map(({ id, label }) => (
          <div key={id} onClick={() => scrollTo(id)} style={{
            padding: '7px 16px', fontSize: '12px', cursor: 'pointer',
            color: activeSection === id ? 'var(--green)' : '#8a9e96',
            fontWeight: activeSection === id ? 600 : 400,
            borderLeft: activeSection === id ? '2px solid var(--green)' : '2px solid transparent',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (activeSection !== id) e.currentTarget.style.color = 'var(--charcoal)'; }}
          onMouseLeave={e => { if (activeSection !== id) e.currentTarget.style.color = '#8a9e96'; }}>
            {label}
          </div>
        ))}
      </div>

    </div>
  );
}
