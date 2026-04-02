import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { schemes } from '../lib/api';

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

const quartileColor = {
  Q1: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  Q2: { bg: 'rgba(44,74,62,0.04)', color: '#5a8a70' },
  Q3: { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
  Q4: { bg: 'rgba(200,80,80,0.08)', color: '#c05050' },
};

const LIMIT = 20;

function StarRating({ rating }) {
  return (
    <span style={{ fontSize: '13px', letterSpacing: '1px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? 'var(--gold)' : '#ddd' }}>★</span>
      ))}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[220, 120, 80, 70, 70, 70, 80, 60].map((w, i) => (
        <td key={i} style={{ padding: '16px 20px' }}>
          <div style={{
            height: '13px', borderRadius: '6px',
            background: 'linear-gradient(90deg, var(--sage) 25%, #e8eeec 50%, var(--sage) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
            width: `${w}px`, maxWidth: '100%',
          }} />
        </td>
      ))}
    </tr>
  );
}

const selectStyle = {
  padding: '9px 32px 9px 12px',
  border: '1.5px solid var(--border)',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: 'var(--body-font)',
  color: 'var(--charcoal)',
  background: '#fff',
  outline: 'none',
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a9e96' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
};

function formatAum(aum) {
  if (!aum) return '—';
  const n = parseFloat(aum);
  if (n >= 10000000000) return `₹${(n / 10000000000).toFixed(1)}K Cr`;
  if (n >= 10000000)    return `₹${(n / 10000000).toFixed(0)} Cr`;
  if (n >= 100000)      return `₹${(n / 100000).toFixed(0)} L`;
  return `₹${n}`;
}

export default function ResearchFunds() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput]           = useState('');
  const [search, setSearch]                     = useState('');
  const [selectedAmc, setSelectedAmc]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRating, setSelectedRating]     = useState('');
  const [selectedQuartile, setSelectedQuartile] = useState('');
  const [page, setPage]                         = useState(0);

  const [funds, setFunds]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [amcList, setAmcList] = useState([]);
  const [catList, setCatList] = useState([]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page on filter change
  useEffect(() => { setPage(0); }, [selectedAmc, selectedCategory, selectedRating, selectedQuartile]);

  // Load dropdown options once
  useEffect(() => {
    schemes.amcs().then(r => setAmcList(Array.isArray(r) ? r : [])).catch(() => {});
    schemes.categories().then(r => setCatList(Array.isArray(r) ? r : [])).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: LIMIT, offset: page * LIMIT };
      if (search)           params.q           = search;
      if (selectedAmc)      params.amc_id      = selectedAmc;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedRating)   params.rating      = selectedRating;
      if (selectedQuartile) params.quartile    = selectedQuartile;

      const result = await schemes.search(params);
      setFunds(result.schemes || []);
      setTotal(result.total || 0);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, selectedAmc, selectedCategory, selectedRating, selectedQuartile, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / LIMIT);
  const hasFilters = search || selectedAmc || selectedCategory || selectedRating || selectedQuartile;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Fund Explorer
        </h1>
        <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '6px' }}>
          Search and filter across all mutual fund schemes
        </p>
      </div>

      {/* Filter bar */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '20px 24px', marginBottom: '20px',
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search fund or AMC..."
            style={{
              width: '100%', padding: '9px 12px 9px 36px',
              border: '1.5px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', fontFamily: 'var(--body-font)',
              color: 'var(--charcoal)', background: '#fff', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9aaa9e' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>

        <select value={selectedAmc} onChange={e => setSelectedAmc(e.target.value)} style={selectStyle}>
          <option value="">All AMCs</option>
          {amcList.map(a => <option key={a.amc_id} value={a.amc_id}>{a.amc_short_name}</option>)}
        </select>

        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={selectStyle}>
          <option value="">All Categories</option>
          {catList.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
        </select>

        <select value={selectedRating} onChange={e => setSelectedRating(e.target.value)} style={selectStyle}>
          <option value="">All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star</option>)}
        </select>

        <select value={selectedQuartile} onChange={e => setSelectedQuartile(e.target.value)} style={selectStyle}>
          <option value="">All Quartiles</option>
          {['Q1','Q2','Q3','Q4'].map(q => <option key={q} value={q}>{q}</option>)}
        </select>

        {hasFilters && (
          <button onClick={() => {
            setSearchInput(''); setSearch('');
            setSelectedAmc(''); setSelectedCategory('');
            setSelectedRating(''); setSelectedQuartile('');
            setPage(0);
          }} style={{
            padding: '9px 16px', borderRadius: '8px',
            border: '1.5px solid var(--border)',
            background: '#fff', color: '#8a9e96',
            fontSize: '12px', cursor: 'pointer',
            fontFamily: 'var(--body-font)',
          }}>
            Clear
          </button>
        )}
      </div>

      {/* Results table */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: '1px solid var(--border)',
        }}>
          <span style={sectionHead}>
            {loading ? 'Loading...' : `${total.toLocaleString()} funds`}
          </span>
          {total > 0 && !loading && (
            <span style={{ fontSize: '12px', color: '#8a9e96' }}>
              {page * LIMIT + 1}–{Math.min((page + 1) * LIMIT, total)} of {total.toLocaleString()}
            </span>
          )}
        </div>

        {error && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#c05050', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {!error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: 'var(--sage)' }}>
                  {['Fund', 'Category', 'Rating', '1Y Return', '3Y Return', '5Y Return', 'AUM', 'Quartile'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left',
                      ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                  : funds.length === 0
                  ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '60px 24px', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)', marginBottom: '8px' }}>
                          No funds found
                        </div>
                        <div style={{ fontSize: '13px', color: '#8a9e96' }}>
                          Try adjusting your search or filters
                        </div>
                      </td>
                    </tr>
                  )
                  : funds.map(f => (
                    <tr
                      key={f.plan_id}
                      onClick={() => navigate(`/research/funds/${f.plan_id}`)}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 20px', maxWidth: '260px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '3px', lineHeight: 1.3 }}>
                          {f.plan_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9aaa9e' }}>{f.amc_name}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '12px', color: '#8a9e96', whiteSpace: 'nowrap' }}>
                        {f.category_name || '—'}
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        {f.star_rating ? <StarRating rating={f.star_rating} /> : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      {['ret_1yr','ret_3yr','ret_5yr'].map(key => (
                        <td key={key} style={{
                          padding: '16px 20px',
                          fontFamily: 'var(--display-font)', fontSize: '14px',
                          color: f[key] != null ? (parseFloat(f[key]) >= 0 ? 'var(--green)' : '#c05050') : '#ccc',
                          whiteSpace: 'nowrap',
                        }}>
                          {f[key] != null ? `${parseFloat(f[key]).toFixed(1)}%` : '—'}
                        </td>
                      ))}
                      <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                        {formatAum(f.aum)}
                      </td>
                      <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                        {f.quartile
                          ? <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.08em', ...quartileColor[f.quartile] }}>{f.quartile}</span>
                          : <span style={{ color: '#ccc', fontSize: '12px' }}>—</span>
                        }
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', padding: '20px', borderTop: '1px solid var(--border)',
          }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                padding: '8px 18px', borderRadius: '8px',
                border: '1.5px solid var(--border)',
                background: page === 0 ? 'var(--sage)' : '#fff',
                color: page === 0 ? '#9aaa9e' : 'var(--green)',
                fontSize: '13px', cursor: page === 0 ? 'default' : 'pointer',
                fontFamily: 'var(--body-font)',
              }}
            >← Prev</button>
            <span style={{ fontSize: '13px', color: '#8a9e96', padding: '0 8px' }}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                padding: '8px 18px', borderRadius: '8px',
                border: '1.5px solid var(--border)',
                background: page >= totalPages - 1 ? 'var(--sage)' : '#fff',
                color: page >= totalPages - 1 ? '#9aaa9e' : 'var(--green)',
                fontSize: '13px', cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                fontFamily: 'var(--body-font)',
              }}
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
