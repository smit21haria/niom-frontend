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

const mockFamilies = {
  1: {
    name: 'Patel Family', head: 'Ramesh Patel', partner: 'Aakash Shethia',
    members: [
      { id: 1, name: 'Ramesh Patel', relation: 'Head', aum: '₹24.6 L', xirr: '14.2%' },
      { id: 2, name: 'Sunita Patel', relation: 'Spouse', aum: '₹14.8 L', xirr: '12.9%' },
      { id: 3, name: 'Aryan Patel', relation: 'Child', aum: '₹8.8 L', xirr: '11.4%' },
    ],
    totalAum: '₹48.2 L', niomAum: '₹42.0 L', externalAum: '₹6.2 L',
    invested: '₹36.4 L', gain: '+₹11.8 L', absReturn: '+32.4%', xirr: '13.8%',
  },
  2: {
    name: 'Mehta Family', head: 'Sunita Mehta', partner: 'Priya Mehta',
    members: [
      { id: 2, name: 'Sunita Mehta', relation: 'Head', aum: '₹8.1 L', xirr: '11.8%' },
      { id: 4, name: 'Ravi Mehta', relation: 'Spouse', aum: '₹4.3 L', xirr: '10.6%' },
    ],
    totalAum: '₹12.4 L', niomAum: '₹12.4 L', externalAum: '₹0',
    invested: '₹10.2 L', gain: '+₹2.2 L', absReturn: '+21.6%', xirr: '11.2%',
  },
  3: {
    name: 'Nair Family', head: 'Kavya Nair', partner: 'Aakash Shethia',
    members: [
      { id: 4, name: 'Kavya Nair', relation: 'Head', aum: '₹12.9 L', xirr: '16.4%' },
      { id: 5, name: 'Suresh Nair', relation: 'Spouse', aum: '₹8.6 L', xirr: '14.8%' },
      { id: 6, name: 'Meera Nair', relation: 'Child', aum: '₹4.2 L', xirr: '13.1%' },
      { id: 7, name: 'Arjun Nair', relation: 'Child', aum: '₹3.4 L', xirr: '12.7%' },
    ],
    totalAum: '₹29.1 L', niomAum: '₹26.8 L', externalAum: '₹2.3 L',
    invested: '₹21.4 L', gain: '+₹7.7 L', absReturn: '+36.0%', xirr: '15.6%',
  },
  4: {
    name: 'Singh Family', head: 'Vikram Singh', partner: 'Priya Mehta',
    members: [
      { id: 5, name: 'Vikram Singh', relation: 'Head', aum: '₹6.7 L', xirr: '12.3%' },
      { id: 8, name: 'Priya Singh', relation: 'Spouse', aum: '₹7.1 L', xirr: '11.9%' },
    ],
    totalAum: '₹13.8 L', niomAum: '₹11.5 L', externalAum: '₹2.3 L',
    invested: '₹11.2 L', gain: '+₹2.6 L', absReturn: '+23.2%', xirr: '12.1%',
  },
};

const navSections = [
  { id: 'header', label: 'Family' },
  { id: 'performance', label: 'Performance' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'allocation', label: 'Allocation' },
  { id: 'risk', label: 'Risk' },
  { id: 'holdings', label: 'Holdings' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'sips', label: 'SIPs' },
  { id: 'equity', label: 'Equity' },
  { id: 'debt', label: 'Debt' },
  { id: 'members', label: 'Members' },
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

export default function FamilyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const family = mockFamilies[id];
  const [activeSection, setActiveSection] = useState('header');
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

  if (!family) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#8a9e96' }}>
      Family not found.{' '}
      <span style={{ color: 'var(--green)', cursor: 'pointer', textDecoration: 'underline' }}
        onClick={() => navigate('/families')}>Go back</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Back */}
        <button onClick={() => navigate('/families')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '13px', color: '#8a9e96', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
        }}>← Back to Families</button>

        {/* Family Header */}
        <div id="header" style={{ marginBottom: '24px', scrollMarginTop: '80px' }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)', lineHeight: 1, marginBottom: '12px' }}>
                  {family.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#8a9e96' }}>Head: <span style={{ color: 'var(--charcoal)', fontWeight: 500 }}>{family.head}</span></span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: '13px', color: '#8a9e96' }}>{family.members.length} members</span>
                  <span style={{ color: 'var(--border)' }}>·</span>
                  <span style={{ fontSize: '13px', color: '#8a9e96' }}>{family.partner}</span>
                </div>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', padding: '4px 12px', borderRadius: '100px',
                background: 'rgba(44,74,62,0.06)', color: 'var(--green)', flexShrink: 0,
              }}>Family Portfolio</span>
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
            <div style={{
              flex: '0 0 40%', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', paddingRight: '32px',
              borderRight: '1px solid var(--border)',
            }}>
              <div style={{ ...tabLabel, marginBottom: '10px' }}>Total AUM</div>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '48px', fontWeight: 600, color: 'var(--charcoal)', lineHeight: 1, marginBottom: '12px' }}>
                {family.totalAum}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(44,74,62,0.08)', color: 'var(--green)', fontWeight: 500 }}>
                  Niom {family.niomAum}
                </span>
                {family.externalAum !== '₹0' && (
                  <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(184,150,90,0.1)', color: 'var(--gold)', fontWeight: 500 }}>
                    External {family.externalAum}
                  </span>
                )}
              </div>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', paddingLeft: '32px' }}>
              {[
                { label: 'Total Invested', value: family.invested, color: 'var(--charcoal)' },
                { label: 'Total Gain / Loss', value: family.gain, color: '#2d8a55' },
                { label: 'Absolute Return', value: family.absReturn, color: '#2d8a55' },
                { label: 'XIRR', value: family.xirr, color: '#2d8a55' },
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
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
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#2d8a55', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#2d8a55', whiteSpace: 'nowrap' }}>—</td>
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
                  {['Date', 'Member', 'Fund', 'Type', 'Amount', 'Units', 'NAV'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1,2,3].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>—</td>
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
                  {['Member', 'Fund', 'Amount', 'Frequency', 'Next Due', 'Status'].map(h => (
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
                    <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>—</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>—</td>
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
            {['By Duration / Maturity', 'By Credit Rating'].map(label => (
              <div key={label}>
                <div style={{ ...tabLabel, marginBottom: '12px', textAlign: 'center' }}>{label}</div>
                <ChartPlaceholder height={160} />
              </div>
            ))}
          </div>
        </Section>

        {/* Family Members */}
        <Section id="members" title="Family Members">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {['Name', 'Relation', 'AUM', 'XIRR'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {family.members.map(m => (
                <tr key={m.id}
                  onClick={() => navigate(`/investors/${m.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '13px 20px', fontSize: '13px', color: 'var(--green)', textDecoration: 'underline' }}>{m.name}</td>
                  <td style={{ padding: '13px 20px', fontSize: '13px', color: '#8a9e96' }}>{m.relation}</td>
                  <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: 'var(--charcoal)' }}>{m.aum}</td>
                  <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#2d8a55' }}>{m.xirr}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
