import { useState } from 'react';

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

const amcs = ['All AMCs', 'HDFC MF', 'SBI MF', 'ICICI Prudential', 'Axis MF', 'Mirae Asset', 'Kotak MF'];
const categories = ['All Categories', 'Large Cap', 'Mid Cap', 'Small Cap', 'Flexi Cap', 'ELSS', 'Liquid', 'Short Duration', 'Corporate Bond'];
const ratings = ['All Ratings', '5 Star', '4 Star', '3 Star', '2 Star', '1 Star', 'Not Rated'];
const quartiles = ['All Quartiles', 'Q1', 'Q2', 'Q3', 'Q4'];

const mockFunds = [
  { id: 1, name: 'HDFC Top 100 Fund', amc: 'HDFC MF', category: 'Large Cap', rating: 5, quartile: 'Q1', nav: '₹892.4', ret1yr: '18.4%', ret3yr: '14.2%', ret5yr: '16.8%', aum: '₹28,420 Cr', expense: '1.02%' },
  { id: 2, name: 'Mirae Asset Large Cap Fund', amc: 'Mirae Asset', category: 'Large Cap', rating: 5, quartile: 'Q1', nav: '₹104.2', ret1yr: '19.1%', ret3yr: '15.6%', ret5yr: '18.2%', aum: '₹36,100 Cr', expense: '0.54%' },
  { id: 3, name: 'Axis Midcap Fund', amc: 'Axis MF', category: 'Mid Cap', rating: 4, quartile: 'Q2', nav: '₹78.6', ret1yr: '22.3%', ret3yr: '18.9%', ret5yr: '21.4%', aum: '₹24,800 Cr', expense: '0.67%' },
  { id: 4, name: 'SBI Small Cap Fund', amc: 'SBI MF', category: 'Small Cap', rating: 4, quartile: 'Q1', nav: '₹142.8', ret1yr: '28.6%', ret3yr: '24.1%', ret5yr: '26.7%', aum: '₹18,900 Cr', expense: '0.72%' },
  { id: 5, name: 'ICICI Pru Bluechip Fund', amc: 'ICICI Prudential', category: 'Large Cap', rating: 4, quartile: 'Q2', nav: '₹98.4', ret1yr: '16.8%', ret3yr: '13.4%', ret5yr: '15.9%', aum: '₹42,600 Cr', expense: '0.98%' },
  { id: 6, name: 'Kotak Flexi Cap Fund', amc: 'Kotak MF', category: 'Flexi Cap', rating: 3, quartile: 'Q3', nav: '₹64.2', ret1yr: '14.2%', ret3yr: '11.8%', ret5yr: '13.6%', aum: '₹12,400 Cr', expense: '1.12%' },
];

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: '12px', color: i <= rating ? 'var(--gold)' : '#ddd' }}>★</span>
      ))}
    </div>
  );
}

const quartileColor = {
  Q1: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  Q2: { bg: 'rgba(44,74,62,0.04)', color: '#5a8a70' },
  Q3: { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
  Q4: { bg: 'rgba(200,80,80,0.08)', color: '#c05050' },
};

export default function ResearchFunds() {
  const [search, setSearch] = useState('');
  const [selectedAmc, setSelectedAmc] = useState('All AMCs');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedRating, setSelectedRating] = useState('All Ratings');
  const [selectedQuartile, setSelectedQuartile] = useState('All Quartiles');
  const [selectedFund, setSelectedFund] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Performance', 'Portfolio', 'Risk', 'Fund Info'];

  const filtered = mockFunds.filter(f => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.amc.toLowerCase().includes(search.toLowerCase());
    const matchAmc = selectedAmc === 'All AMCs' || f.amc === selectedAmc;
    const matchCat = selectedCategory === 'All Categories' || f.category === selectedCategory;
    const matchRating = selectedRating === 'All Ratings' || f.rating === parseInt(selectedRating[0]);
    const matchQuartile = selectedQuartile === 'All Quartiles' || f.quartile === selectedQuartile;
    return matchSearch && matchAmc && matchCat && matchRating && matchQuartile;
  });

  const selectStyle = {
    padding: '9px 32px 9px 12px', border: '1.5px solid var(--border)',
    borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--body-font)',
    color: 'var(--charcoal)', background: '#fff', outline: 'none',
    cursor: 'pointer', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a9e96' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
  };

  if (selectedFund) {
    return (
      <div>
        {/* Back */}
        <button onClick={() => setSelectedFund(null)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '13px', color: '#8a9e96', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '6px', padding: 0,
        }}>← Back to Fund Explorer</button>

        {/* Fund header */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          padding: '28px', marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '28px', fontWeight: 600, color: 'var(--green)', marginBottom: '8px' }}>
                {selectedFund.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: '#8a9e96' }}>{selectedFund.amc}</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span style={{ fontSize: '13px', color: '#8a9e96' }}>{selectedFund.category}</span>
                <span style={{ color: 'var(--border)' }}>·</span>
                <StarRating rating={selectedFund.rating} />
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                  borderRadius: '100px', ...quartileColor[selectedFund.quartile],
                }}>{selectedFund.quartile}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexShrink: 0 }}>
              {[
                { label: 'NAV', value: selectedFund.nav },
                { label: 'AUM', value: selectedFund.aum },
                { label: 'Expense Ratio', value: selectedFund.expense },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '4px' }}>{m.label}</div>
                  <div style={{ fontFamily: 'var(--display-font)', fontSize: '18px', fontWeight: 600, color: 'var(--charcoal)' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0', background: '#fff',
          borderRadius: '12px', border: '1px solid var(--border)',
          overflow: 'hidden', marginBottom: '20px',
        }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '13px 0', fontSize: '13px', fontWeight: 500,
              border: 'none', borderRight: '1px solid var(--border)',
              background: activeTab === tab ? 'var(--green)' : '#fff',
              color: activeTab === tab ? 'var(--ivory)' : '#7a8a84',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'var(--body-font)',
            }}>{tab}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          padding: '28px',
        }}>
          {activeTab === 'Overview' && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <div style={{ ...tabLabel, marginBottom: '12px' }}>Growth of ₹10,000 vs Benchmark vs Category</div>
                <div style={{ height: '260px', background: 'var(--sage)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#9aaa9e', fontStyle: 'italic' }}>Chart renders with real VR data</span>
                </div>
              </div>
              <div style={{ ...tabLabel, marginBottom: '16px' }}>Trailing Returns</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Period', 'Fund', 'Category Avg', 'Benchmark', 'Quartile'].map(h => (
                      <th key={h} style={{ padding: '10px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', fontSize: '10px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[['1 Year', selectedFund.ret1yr], ['3 Years', selectedFund.ret3yr], ['5 Years', selectedFund.ret5yr], ['Since Launch', '—']].map(([period, ret]) => (
                    <tr key={period} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{period}</td>
                      <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#2d8a55', fontWeight: 600 }}>{ret}</td>
                      <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#8a9e96' }}>—</td>
                      <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#8a9e96' }}>—</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '100px', ...quartileColor[selectedFund.quartile] }}>{selectedFund.quartile}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab !== 'Overview' && (
            <div style={{ height: '300px', background: 'var(--sage)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', color: '#9aaa9e', fontStyle: 'italic' }}>{activeTab} data renders with real VR data</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Fund Explorer
        </h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search fund name or AMC..."
            style={{
              width: '100%', padding: '9px 16px 9px 36px',
              border: '1.5px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', fontFamily: 'var(--body-font)',
              color: 'var(--charcoal)', background: '#fff', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#8a9e96' }}>⌕</span>
        </div>
        <select value={selectedAmc} onChange={e => setSelectedAmc(e.target.value)} style={selectStyle}>
          {amcs.map(a => <option key={a}>{a}</option>)}
        </select>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={selectStyle}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={selectedRating} onChange={e => setSelectedRating(e.target.value)} style={selectStyle}>
          {ratings.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={selectedQuartile} onChange={e => setSelectedQuartile(e.target.value)} style={selectStyle}>
          {quartiles.map(q => <option key={q}>{q}</option>)}
        </select>
      </div>

      {/* Fund table */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {['Fund Name', 'Category', 'Rating', 'Quartile', 'NAV', '1Y Return', '3Y Return', '5Y Return', 'AUM', 'Expense'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(fund => (
                <tr key={fund.id}
                  onClick={() => setSelectedFund(fund)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{fund.name}</div>
                    <div style={{ fontSize: '12px', color: '#8a9e96' }}>{fund.amc}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{fund.category}</td>
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}><StarRating rating={fund.rating} /></td>
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '100px', ...quartileColor[fund.quartile] }}>{fund.quartile}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>{fund.nav}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#2d8a55', whiteSpace: 'nowrap' }}>{fund.ret1yr}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#2d8a55', whiteSpace: 'nowrap' }}>{fund.ret3yr}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#2d8a55', whiteSpace: 'nowrap' }}>{fund.ret5yr}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', whiteSpace: 'nowrap' }}>{fund.aum}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{fund.expense}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
