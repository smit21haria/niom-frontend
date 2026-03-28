import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { investors, formatINR } from '../lib/api';

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

const kycColor = {
  verified: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  pending:  { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
};

const LIMIT = 10;

// Skeleton row
function SkeletonRow() {
  return (
    <tr>
      {[200, 100, 120, 100, 80, 90, 90, 90, 100].map((w, i) => (
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

export default function Investors() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [sortKey, setSortKey] = useState('aum');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset page on filter change
  useEffect(() => { setPage(0); }, [partnerFilter, kycFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await investors.list({
        search: search || undefined,
        partner_id: partnerFilter || undefined,
        kyc_status: kycFilter || undefined,
        limit: LIMIT,
        offset: page * LIMIT,
      });
      setData(result.investors || []);
      setTotal(result.total || 0);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, partnerFilter, kycFilter, page]);

  useEffect(() => { load(); }, [load]);

  // Client-side sort (sorts current page)
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
      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Investors
        </h1>
        <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '4px' }}>
          {loading ? 'Loading...' : `${total} investor${total !== 1 ? 's' : ''} across all partners`}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.2)',
          borderRadius: '10px', padding: '14px 20px', marginBottom: '20px',
        }}>
          <span style={{ fontSize: '13px', color: '#c0392b', flex: 1 }}>
            Could not connect to server. Render may be starting up — please wait a moment.
          </span>
          <button onClick={load} style={{
            padding: '7px 16px', borderRadius: '7px', fontSize: '12px',
            background: '#c0392b', color: '#fff', border: 'none', cursor: 'pointer',
          }}>Retry</button>
        </div>
      )}

      {/* Filters + Table */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', fontSize: '14px', color: '#9aaa9e',
            }}>🔍</span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name, PAN or mobile..."
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

          {/* KYC filter */}
          <select value={kycFilter} onChange={e => setKycFilter(e.target.value)}
            style={{
              padding: '10px 14px', border: '1.5px solid var(--border)',
              borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--body-font)',
              color: kycFilter ? 'var(--charcoal)' : '#9aaa9e',
              background: 'var(--ivory)', outline: 'none',
              appearance: 'none', cursor: 'pointer', minWidth: '140px',
            }}>
            <option value="">All KYC Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>

          {/* Clear filters */}
          {(searchInput || partnerFilter || kycFilter) && (
            <button onClick={() => { setSearchInput(''); setPartnerFilter(''); setKycFilter(''); setPage(0); }}
              style={{
                padding: '10px 16px', borderRadius: '8px', fontSize: '12px',
                border: '1.5px solid var(--border)', background: '#fff',
                color: '#8a9e96', cursor: 'pointer',
              }}>Clear</button>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '960px' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {[
                  { label: 'Investor',         key: 'name' },
                  { label: 'PAN',              key: null },
                  { label: 'Partner',          key: 'partner_name' },
                  { label: 'Family',           key: 'family_name' },
                  { label: 'KYC',              key: 'kyc_status' },
                  { label: 'AUM',              key: 'aum' },
                  { label: 'SIP Amount',       key: 'sip_amount' },
                  { label: 'Holdings',         key: 'holdings_count' },
                  { label: 'Last Transaction', key: 'last_txn_date' },
                ].map(col => (
                  <th key={col.label}
                    onClick={() => col.key && toggleSort(col.key)}
                    style={{
                      padding: '12px 20px', textAlign: 'left',
                      ...tabLabel, fontFamily: 'var(--body-font)',
                      whiteSpace: 'nowrap',
                      cursor: col.key ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}>
                    {col.label}
                    {col.key && <SortIcon col={col.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: LIMIT }).map((_, i) => <SkeletonRow key={i} />)
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)', marginBottom: '8px' }}>
                      No investors yet
                    </div>
                    <div style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '20px' }}>
                      {search || kycFilter ? 'No results match your filters.' : 'Onboard your first investor from Admin Controls.'}
                    </div>
                    {!search && !kycFilter && (
                      <button onClick={() => navigate('/admin-controls/investors')} style={{
                        padding: '10px 24px', borderRadius: '8px',
                        background: 'var(--green)', color: 'var(--ivory)',
                        border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                      }}>Go to Investor Management</button>
                    )}
                  </td>
                </tr>
              ) : sorted.map(inv => (
                <tr key={inv.id}
                  onClick={() => navigate(`/investors/${inv.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>

                  {/* Name */}
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'rgba(44,74,62,0.1)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--display-font)', fontSize: '13px',
                        fontWeight: 600, color: 'var(--green)',
                      }}>
                        {(inv.first_name?.[0] || '') + (inv.last_name?.[0] || '')}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>
                          {inv.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9aaa9e' }}>{inv.email || '—'}</div>
                      </div>
                    </div>
                  </td>

                  {/* PAN masked */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#8a9e96', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                    {inv.pan ? `${inv.pan.slice(0, 3)}••••${inv.pan.slice(-2)}` : '—'}
                  </td>

                  {/* Partner */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    {inv.partner_name || '—'}
                  </td>

                  {/* Family */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    {inv.family_name || '—'}
                  </td>

                  {/* KYC */}
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                      borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.1em',
                      background: (kycColor[inv.kyc_status] || { bg: 'rgba(200,200,200,0.2)' }).bg,
                      color: (kycColor[inv.kyc_status] || { color: '#8a9e96' }).color,
                    }}>
                      {inv.kyc_status || 'unknown'}
                    </span>
                  </td>

                  {/* AUM */}
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    {formatINR(inv.aum)}
                  </td>

                  {/* SIP Amount */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    <span style={{ fontFamily: 'var(--display-font)', fontSize: '14px' }}>{formatINR(inv.sip_amount)}</span>
                    {inv.sip_count > 0 && (
                      <span style={{ fontSize: '11px', color: '#8a9e96', marginLeft: '4px' }}>· {inv.sip_count} SIPs</span>
                    )}
                  </td>

                  {/* Holdings */}
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>
                    {inv.holdings_count || 0}
                  </td>

                  {/* Last transaction */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>
                    {inv.last_txn_date
                      ? new Date(inv.last_txn_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
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
              Showing {from}–{to} of {total} investors
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
