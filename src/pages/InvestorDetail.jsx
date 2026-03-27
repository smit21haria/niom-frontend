import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

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
  1: { name: 'Ramesh Patel', pan: 'ABCDE1234F', mobile: '+91 98765 43210', family: 'Patel Family', partner: 'Aakash Shethia', kyc: 'verified', risk: 'Moderate', aum: '₹24.6 L', externalAum: '₹8.2 L', invested: '₹18.4 L', gain: '₹6.2 L', gainPct: '+33.7%', xirr: '14.2%', joined: '12 Jan 2024' },
  2: { name: 'Sunita Mehta', pan: 'FGHIJ5678K', mobile: '+91 91234 56789', family: 'Mehta Family', partner: 'Priya Mehta', kyc: 'verified', risk: 'Conservative', aum: '₹8.1 L', externalAum: '₹0', invested: '₹6.8 L', gain: '₹1.3 L', gainPct: '+19.1%', xirr: '11.8%', joined: '5 Mar 2024' },
  3: { name: 'Arjun Sharma', pan: 'KLMNO9012P', mobile: '+91 99887 76655', family: '—', partner: 'Aakash Shethia', kyc: 'pending', risk: 'Aggressive', aum: '₹3.4 L', externalAum: '₹1.1 L', invested: '₹2.9 L', gain: '₹0.5 L', gainPct: '+17.2%', xirr: '9.1%', joined: '20 Jun 2024' },
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
    <div id={id} style={{ marginBottom: '28px' }}>
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
        <div style={{ padding: '28px' }}>
          {children}
        </div>
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
  const sectionRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
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
      Investor not found. <span style={{ color: 'var(--green)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/investors')}>Go back</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '24px' }}>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Back */}
        <button onClick={() => navigate('/investors')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '13px', color: '#8a9e96', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
        }}>← Back to Investors</button>

        {/* Profile Header */}
        <div id="profile" style={{ marginBottom: '28px' }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)', lineHeight: 1, marginBottom: '10px' }}>
                  {investor.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#8a9e96', letterSpacing: '0.04em' }}>{investor.pan.slice(0,3)}••••{investor.pan.slice(-2)}</span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <a href={`tel:${investor.mobile}`} style={{ fontSize: '13px', color: 'var(--green)', textDecoration: 'none' }}>{investor.mobile}</a>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: '13px', color: '#8a9e96' }}>{investor.family}</span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: '13px', color: '#8a9e96' }}>{investor.partner}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '4px 12px', borderRadius: '100px',
                  background: kycColor[investor.kyc].bg, color: kycColor[investor.kyc].color,
                }}>KYC {investor.kyc}</span>
                <span style={{
                  fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                  textTransform: 'uppercase', padding: '4px 12px', borderRadius: '100px',
                  background: 'rgba(44,74,62,0.06)', color: 'var(--green)',
                }}>{investor.risk}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <Section id="performance" title="Performance">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['1Y', '3Y', '5Y', 'Inception'].map(t => (
              <button key={t} style={{
                padding: '6px 14px', borderRadius: '100px', fontSize: '12px',
                border: '1.5px solid var(--border)', background: t === '1Y' ? 'var(--green)' : '#fff',
                color: t === '1Y' ? 'var(--ivory)' : '#7a8a84', cursor: 'pointer',
              }}>{t}</button>
            ))}
            <span style={{ fontSize: '12px', color: '#8a9e96', marginLeft: 'auto', alignSelf: 'center' }}>Growth of ₹10,000 vs Benchmark vs Category</span>
          </div>
          <ChartPlaceholder height={260} />
        </Section>

        {/* Portfolio Summary */}
        <Section id="portfolio" title="Portfolio Summary">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
            {[
              { label: 'Niom AUM', value: investor.aum },
              { label: 'External AUM', value: investor.externalAum },
              { label: 'Total Invested', value: investor.invested },
              { label: 'Total Gain', value: investor.gain },
            ].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ ...tabLabel, marginBottom: '8px' }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--display-font)', fontSize: '28px', fontWeight: 600, color: 'var(--charcoal)' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...tabLabel, marginBottom: '6px' }}>Absolute Return</div>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', fontWeight: 600, color: '#2d8a55' }}>{investor.gainPct}</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...tabLabel, marginBottom: '6px' }}>XIRR</div>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', fontWeight: 600, color: '#2d8a55' }}>{investor.xirr}</div>
            </div>
          </div>
        </Section>

        {/* Asset Allocation */}
        <Section id="allocation" title="Asset Allocation">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {['Equity / Debt / Hybrid', 'Large / Mid / Small Cap', 'Direct / Regular'].map(label => (
              <div key={label}>
                <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>{label}</div>
                <ChartPlaceholder height={160} />
              </div>
            ))}
          </div>
        </Section>

        {/* Risk Metrics */}
        <Section id="risk" title="Risk Metrics">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Alpha', value: '—' },
              { label: 'Beta', value: '—' },
              { label: 'Sharpe Ratio', value: '—' },
              { label: 'Sortino Ratio', value: '—' },
              { label: 'Std. Deviation', value: '—' },
              { label: 'Portfolio Risk Score', value: '—' },
            ].map(m => (
              <div key={m.label} style={{
                background: 'var(--sage)', borderRadius: '10px',
                padding: '16px 20px', textAlign: 'center',
              }}>
                <div style={{ ...tabLabel, marginBottom: '8px' }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--display-font)', fontSize: '24px', fontWeight: 600, color: 'var(--charcoal)' }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'var(--sage)', borderRadius: '10px', padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ ...tabLabel, marginBottom: '8px' }}>Weighted Avg Expense Ratio</div>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '24px', fontWeight: 600, color: 'var(--charcoal)' }}>—</div>
            </div>
            <div style={{ background: 'var(--sage)', borderRadius: '10px', padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ ...tabLabel, marginBottom: '8px' }}>Cumulative Expense Paid</div>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '24px', fontWeight: 600, color: 'var(--charcoal)' }}>—</div>
            </div>
          </div>
        </Section>

        {/* Holdings */}
        <Section id="holdings" title="Holdings">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {['Fund Name', 'AMC', 'Folio', 'Units', 'Avg NAV', 'Current NAV', 'Invested', 'Current Value', 'Gain/Loss', 'XIRR', 'Source'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1,2,3].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#2d8a55' }}>—</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#2d8a55' }}>—</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(44,74,62,0.08)', color: 'var(--green)', fontWeight: 600 }}>Niom</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Transactions */}
        <Section id="transactions" title="Transactions">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {['Date', 'Fund', 'Type', 'Amount', 'Units', 'NAV'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* SIPs */}
        <Section id="sips" title="SIPs">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {['Fund', 'Amount', 'Frequency', 'Start Date', 'Next Due', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1,2].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                  <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                  <td style={{ padding: '12px 20px', fontSize: '13px', color: '#8a9e96' }}>—</td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(44,74,62,0.08)', color: 'var(--green)', fontWeight: 600 }}>Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Equity Breakdown */}
        <Section id="equity" title="Equity Breakdown">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <div style={{ ...tabLabel, marginBottom: '12px' }}>Large / Mid / Small Cap</div>
              <ChartPlaceholder height={180} />
            </div>
            <div>
              <div style={{ ...tabLabel, marginBottom: '12px' }}>Top 10 Stock Holdings</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Company', 'Sector', 'Weight %', 'Cap'].map(h => (
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
              <button style={{
                marginTop: '10px', fontSize: '12px', color: 'var(--green)',
                background: 'none', border: 'none', cursor: 'pointer',
                textDecoration: 'underline', padding: 0,
              }}>View all holdings →</button>
            </div>
          </div>
        </Section>

        {/* Debt Breakdown */}
        <Section id="debt" title="Debt Breakdown">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ ...tabLabel, marginBottom: '12px' }}>By Duration / Maturity</div>
              <ChartPlaceholder height={160} />
            </div>
            <div>
              <div style={{ ...tabLabel, marginBottom: '12px' }}>By Credit Rating</div>
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
                <tr key={i}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
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
          <div style={{
            border: '2px dashed var(--border)', borderRadius: '12px',
            padding: '40px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '16px' }}>
              Upload a CAMS or KFintech CAS PDF to import holdings and transaction history
            </div>
            <button style={{
              background: 'var(--green)', color: 'var(--ivory)',
              border: 'none', borderRadius: '8px', padding: '10px 24px',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}>Upload CAS PDF</button>
          </div>
        </Section>

        {/* Reports */}
        <div id="reports" style={{ marginBottom: '28px' }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            padding: '28px',
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
                  <span style={{ fontSize: '16px', color: 'var(--gold)' }}>↓</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Sticky side nav */}
      <div style={{
        width: '160px', flexShrink: 0, position: 'sticky',
        top: '80px', height: 'fit-content',
        background: '#fff', borderRadius: '12px',
        border: '1px solid var(--border)', padding: '16px 0',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{ padding: '0 16px 12px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--gold)', fontWeight: 600 }}>
          On this page
        </div>
        {navSections.map(({ id, label }) => (
          <div
            key={id}
            onClick={() => scrollTo(id)}
            style={{
              padding: '8px 16px', fontSize: '12px', cursor: 'pointer',
              color: activeSection === id ? 'var(--green)' : '#8a9e96',
              fontWeight: activeSection === id ? 600 : 400,
              borderLeft: activeSection === id ? '2px solid var(--green)' : '2px solid transparent',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (activeSection !== id) e.currentTarget.style.color = 'var(--charcoal)'; }}
            onMouseLeave={e => { if (activeSection !== id) e.currentTarget.style.color = '#8a9e96'; }}
          >
            {label}
          </div>
        ))}
      </div>

    </div>
  );
}
