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

const mockFunds = [
  { id: 1, name: 'HDFC Top 100 Fund', amc: 'HDFC MF', category: 'Large Cap', rating: 5, nav: '₹892.4', ret1yr: '18.4%', ret3yr: '14.2%', ret5yr: '16.8%', aum: '₹28,420 Cr', expense: '1.02%', alpha: '1.8', beta: '0.92', sharpe: '1.4' },
  { id: 2, name: 'Mirae Asset Large Cap Fund', amc: 'Mirae Asset', category: 'Large Cap', rating: 5, nav: '₹104.2', ret1yr: '19.1%', ret3yr: '15.6%', ret5yr: '18.2%', aum: '₹36,100 Cr', expense: '0.54%', alpha: '2.4', beta: '0.88', sharpe: '1.7' },
  { id: 3, name: 'Axis Midcap Fund', amc: 'Axis MF', category: 'Mid Cap', rating: 4, nav: '₹78.6', ret1yr: '22.3%', ret3yr: '18.9%', ret5yr: '21.4%', aum: '₹24,800 Cr', expense: '0.67%', alpha: '3.1', beta: '1.12', sharpe: '1.9' },
  { id: 4, name: 'SBI Small Cap Fund', amc: 'SBI MF', category: 'Small Cap', rating: 4, nav: '₹142.8', ret1yr: '28.6%', ret3yr: '24.1%', ret5yr: '26.7%', aum: '₹18,900 Cr', expense: '0.72%', alpha: '4.2', beta: '1.24', sharpe: '2.1' },
];

function StarRating({ rating }) {
  return (
    <span>{[1,2,3,4,5].map(i => (
      <span key={i} style={{ fontSize: '12px', color: i <= rating ? 'var(--gold)' : '#ddd' }}>★</span>
    ))}</span>
  );
}

export default function ResearchCompare() {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const available = mockFunds.filter(f =>
    !selected.find(s => s.id === f.id) &&
    (!search || f.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addFund = (fund) => {
    if (selected.length < 4) {
      setSelected(prev => [...prev, fund]);
      setSearch('');
      setShowSearch(false);
    }
  };

  const removeFund = (id) => setSelected(prev => prev.filter(f => f.id !== id));

  const metrics = [
    { label: '1Y Return', key: 'ret1yr' },
    { label: '3Y Return', key: 'ret3yr' },
    { label: '5Y Return', key: 'ret5yr' },
    { label: 'AUM', key: 'aum' },
    { label: 'Expense Ratio', key: 'expense' },
    { label: 'VR Rating', key: 'rating' },
    { label: 'Alpha', key: 'alpha' },
    { label: 'Beta', key: 'beta' },
    { label: 'Sharpe Ratio', key: 'sharpe' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Compare Funds
        </h1>
        <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '6px' }}>Compare up to 4 funds side by side</p>
      </div>

      {/* Fund selector slots */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[0,1,2,3].map(i => (
          <div key={i}>
            {selected[i] ? (
              <div style={{
                background: '#fff', borderRadius: '12px',
                border: '1.5px solid var(--green)', padding: '16px',
                position: 'relative',
              }}>
                <button onClick={() => removeFund(selected[i].id)} style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '14px', color: '#8a9e96', lineHeight: 1,
                }}>✕</button>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '4px', paddingRight: '20px' }}>
                  {selected[i].name}
                </div>
                <div style={{ fontSize: '12px', color: '#8a9e96' }}>{selected[i].amc}</div>
                <div style={{ marginTop: '6px' }}><StarRating rating={selected[i].rating} /></div>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowSearch(i)}
                  style={{
                    width: '100%', padding: '20px', borderRadius: '12px',
                    border: '2px dashed var(--border)', background: 'var(--sage)',
                    fontSize: '13px', color: '#8a9e96', cursor: 'pointer',
                    fontFamily: 'var(--body-font)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.color = 'var(--green)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = '#8a9e96'; }}
                >
                  + Add Fund
                </button>
                {showSearch === i && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: '#fff', border: '1px solid var(--border)',
                    borderRadius: '10px', boxShadow: 'var(--shadow)', zIndex: 50, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>
                      <input
                        autoFocus
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search fund..."
                        style={{
                          width: '100%', padding: '8px 12px',
                          border: '1.5px solid var(--border)', borderRadius: '6px',
                          fontSize: '13px', fontFamily: 'var(--body-font)',
                          outline: 'none',
                        }}
                      />
                    </div>
                    {available.map(f => (
                      <div key={f.id}
                        onClick={() => addFund(f)}
                        style={{ padding: '11px 16px', cursor: 'pointer', fontSize: '13px', color: 'var(--charcoal)', borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                        <div style={{ fontWeight: 500 }}>{f.name}</div>
                        <div style={{ fontSize: '12px', color: '#8a9e96' }}>{f.amc} · {f.category}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison table */}
      {selected.length >= 2 && (
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
            <span style={sectionHead}>Comparison</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--sage)' }}>
                  <th style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', width: '160px' }}>Metric</th>
                  {selected.map(f => (
                    <th key={f.id} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: 'var(--green)', fontWeight: 600, fontFamily: 'var(--body-font)' }}>
                      {f.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map(m => (
                  <tr key={m.key} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '13px 20px', ...tabLabel, fontSize: '10px', fontFamily: 'var(--body-font)' }}>{m.label}</td>
                    {selected.map(f => (
                      <td key={f.id} style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>
                        {m.key === 'rating' ? <StarRating rating={f[m.key]} /> : f[m.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected.length < 2 && (
        <div style={{
          background: '#fff', borderRadius: '16px', border: '1px solid var(--border)',
          padding: '48px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '13px', color: '#8a9e96' }}>Add at least 2 funds to see the comparison</div>
        </div>
      )}
    </div>
  );
}
