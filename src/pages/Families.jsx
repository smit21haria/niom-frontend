import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { families, partners as partnersApi, formatINR } from '../lib/api';

const tabLabel = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--gold)',
  fontWeight: 600,
};

const LIMIT = 10;

function SkeletonRow() {
  return (
    <tr>
      {[180, 140, 60, 90, 70, 90, 120].map((w, i) => (
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

const columns = [
  { key: 'name',               label: 'Family Name' },
  { key: 'head_investor_name', label: 'Head Investor' },
  { key: 'member_count',       label: 'Members' },
  { key: 'aum',                label: 'Total AUM' },
  { key: 'xirr',               label: 'XIRR' },
  { key: 'sip_amount',         label: 'SIP Amount' },
  { key: 'partner_name',       label: 'Partner' },
];

export default function Families() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [partnersList, setPartnersList] = useState([]);
  const [sortKey, setSortKey] = useState('aum');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Load partners for filter dropdown
  useEffect(() => {
    partnersApi.list({ limit: 100 })
      .then(r => setPartnersList(Array.isArray(r) ? r : []))
      .catch(() => {});
  }, []);

  useEffect(() => { setPage(0); }, [partnerFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await families.list({
        search: search || undefined,
        partner_id: partnerFilter || undefined,
        limit: LIMIT,
        offset: page * LIMIT,
      });
      setData(result.families || []);
      setTotal(result.total || 0);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, partnerFilter, page]);

  useEffect(() => { load(); }, [load]);

  // Client-side sort
  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] ?? 0;
    const bv = b[sortKey] ?? 0;
    if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    return sortDir === 'asc' ? av - bv : bv - av;
  });

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <span style={{ color: '#c4d4d0', marginLeft: '4px' }}>↕</span>;
    return <span style={{ color: 'var(--gold)', marginLeft: '4px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  const totalPages = Math.ceil(total / LIMIT);
  const from = total === 0 ? 0 : page * LIMIT + 1;
  const to = Math.min((page + 1) * LIMIT, total);

  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
            Families
          </h1>
          <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '4px' }}>
            {loading ? 'Loading...' : `${total} famil${total !== 1 ? 'ies' : 'y'} across all partners`}
          </p>
        </div>
        <button onClick={() => navigate('/admin-controls/families')} style={{
          background: 'var(--green)', color: 'var(--ivory)',
          border: 'none', borderRadius: '8px',
          padding: '10px 20px', fontSize: '13px', fontWeight: 500,
          letterSpacing: '0.06em', cursor: 'pointer', whiteSpace: 'nowrap',
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
        >+ Create Family</button>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)',
          borderRadius: '10px', padding: '14px 20px', marginBottom: '20px',
        }}>
          <span style={{ fontSize: '13px', color: '#c0392b', flex: 1 }}>
            Could not connect to server. Render may be starting up.
          </span>
          <button onClick={load} style={{
            padding: '7px 16px', borderRadius: '7px', fontSize: '12px',
            background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer',
          }}>Retry</button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', fontSize: '14px', color: '#9aaa9e',
          }}>🔍</span>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by family name or head investor..."
            style={{
              width: '100%', padding: '10px 14px 10px 34px',
              border: '1.5px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', fontFamily: 'var(--body-font)',
              color: 'var(--charcoal)', background: 'var(--ivory)', outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <select value={partnerFilter} onChange={e => { setPartnerFilter(e.target.value); setPage(0); }}
          style={{
            padding: '10px 14px', border: '1.5px solid var(--border)',
            borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--body-font)',
            color: partnerFilter ? 'var(--charcoal)' : '#9aaa9e',
            background: 'var(--ivory)', outline: 'none',
            appearance: 'none', cursor: 'pointer', minWidth: '160px',
          }}>
          <option value="">All Partners</option>
          {partnersList.map(p => (
            <option key={p.id} value={p.id}>{p.fname} {p.lname}</option>
          ))}
        </select>

        {(searchInput || partnerFilter) && (
          <button onClick={() => { setSearchInput(''); setPartnerFilter(''); setPage(0); }} style={{
            padding: '10px 16px', borderRadius: '8px', fontSize: '12px',
            border: '1.5px solid var(--border)', background: '#fff',
            color: '#8a9e96', cursor: 'pointer',
          }}>Clear</button>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {columns.map(col => (
                  <th key={col.key} onClick={() => toggleSort(col.key)} style={{
                    padding: '12px 20px', textAlign: 'left',
                    ...tabLabel, fontFamily: 'var(--body-font)',
                    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                  }}>
                    {col.label}<SortIcon col={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: LIMIT }).map((_, i) => <SkeletonRow key={i} />)
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)', marginBottom: '8px' }}>
                      No families yet
                    </div>
                    <div style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '20px' }}>
                      {search ? 'No results match your search.' : 'Create your first family from Admin Controls.'}
                    </div>
                    {!search && (
                      <button onClick={() => navigate('/admin-controls/families')} style={{
                        padding: '10px 24px', borderRadius: '8px',
                        background: 'var(--green)', color: 'var(--ivory)',
                        border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                      }}>Go to Family Management</button>
                    )}
                  </td>
                </tr>
              ) : sorted.map(f => (
                <tr key={f.id}
                  onClick={() => navigate(`/families/${f.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    {f.head_investor_name || '—'}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>
                    {f.member_count || 0}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    {formatINR(f.aum || 0)}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#2d8a55', whiteSpace: 'nowrap' }}>
                    {f.xirr ? `${parseFloat(f.xirr).toFixed(1)}%` : '—'}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    {formatINR(f.sip_amount || 0)}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    {f.partner_name || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > LIMIT && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '13px', color: '#8a9e96' }}>
              Showing {from}–{to} of {total} families
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0} style={{
                padding: '7px 14px', borderRadius: '7px', fontSize: '13px',
                border: '1.5px solid var(--border)',
                background: page === 0 ? 'var(--sage)' : '#fff',
                color: page === 0 ? '#c4d4d0' : 'var(--charcoal)',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}>← Prev</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i : page < 4 ? i : page > totalPages - 4 ? totalPages - 7 + i : page - 3 + i;
                return (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width: '34px', height: '34px', borderRadius: '7px', fontSize: '13px',
                    border: '1.5px solid var(--border)',
                    background: page === p ? 'var(--green)' : '#fff',
                    color: page === p ? 'var(--ivory)' : 'var(--charcoal)',
                    cursor: 'pointer', fontWeight: page === p ? 600 : 400,
                  }}>{p + 1}</button>
                );
              })}
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} style={{
                padding: '7px 14px', borderRadius: '7px', fontSize: '13px',
                border: '1.5px solid var(--border)',
                background: page >= totalPages - 1 ? 'var(--sage)' : '#fff',
                color: page >= totalPages - 1 ? '#c4d4d0' : 'var(--charcoal)',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
