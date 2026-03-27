import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const tabLabel = {
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--gold)',
  fontWeight: 600,
};

const mockFamilies = [
  { id: 1, name: 'Patel Family', head: 'Ramesh Patel', members: 3, aum: 4820000, aumDisplay: '₹48.2 L', xirr: 13.8, xirrDisplay: '13.8%', sip: 28000, sipDisplay: '₹28,000', partner: 'Aakash Shethia' },
  { id: 2, name: 'Mehta Family', head: 'Sunita Mehta', members: 2, aum: 1240000, aumDisplay: '₹12.4 L', xirr: 11.2, xirrDisplay: '11.2%', sip: 12000, sipDisplay: '₹12,000', partner: 'Priya Mehta' },
  { id: 3, name: 'Nair Family', head: 'Kavya Nair', members: 4, aum: 2910000, aumDisplay: '₹29.1 L', xirr: 15.6, xirrDisplay: '15.6%', sip: 22000, sipDisplay: '₹22,000', partner: 'Aakash Shethia' },
  { id: 4, name: 'Singh Family', head: 'Vikram Singh', members: 2, aum: 1380000, aumDisplay: '₹13.8 L', xirr: 12.1, xirrDisplay: '12.1%', sip: 15000, sipDisplay: '₹15,000', partner: 'Priya Mehta' },
];

const partners = ['All Partners', 'Aakash Shethia', 'Priya Mehta'];

const columns = [
  { key: 'name', label: 'Family Name' },
  { key: 'head', label: 'Head Investor' },
  { key: 'members', label: 'Members' },
  { key: 'aum', label: 'Total AUM' },
  { key: 'xirr', label: 'XIRR' },
  { key: 'sip', label: 'SIP Amount' },
  { key: 'partner', label: 'Partner' },
];

export default function Families() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('All Partners');
  const [sortKey, setSortKey] = useState('aum');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = mockFamilies
    .filter(f => {
      const matchSearch = !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.head.toLowerCase().includes(search.toLowerCase());
      const matchPartner = partnerFilter === 'All Partners' || f.partner === partnerFilter;
      return matchSearch && matchPartner;
    })
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      {/* Page title + create button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Families
        </h1>
        <button style={{
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

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '320px', flexShrink: 0 }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by family name or head investor..."
            style={{
              width: '100%', padding: '10px 16px 10px 36px',
              border: '1.5px solid var(--border)', borderRadius: '8px',
              fontSize: '13px', fontFamily: 'var(--body-font)',
              color: 'var(--charcoal)', background: '#fff', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#8a9e96' }}>⌕</span>
        </div>

        <select
          value={partnerFilter}
          onChange={e => { setPartnerFilter(e.target.value); setPage(1); }}
          style={{
            padding: '10px 32px 10px 16px', border: '1.5px solid var(--border)',
            borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--body-font)',
            color: 'var(--charcoal)', background: '#fff', outline: 'none',
            cursor: 'pointer', appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a9e96' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
          }}
        >
          {partners.map(p => <option key={p}>{p}</option>)}
        </select>
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
                  <th key={col.key} onClick={() => handleSort(col.key)} style={{
                    padding: '12px 20px', textAlign: 'left',
                    ...tabLabel, fontFamily: 'var(--body-font)',
                    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                  }}>
                    {col.label}{' '}
                    <span style={{ opacity: sortKey === col.key ? 1 : 0.3, fontSize: '10px' }}>
                      {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(f => (
                <tr key={f.id}
                  onClick={() => navigate(`/families/${f.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{f.name}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{f.head}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{f.members}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{f.aumDisplay}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#2d8a55', whiteSpace: 'nowrap' }}>{f.xirrDisplay}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{f.sipDisplay}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{f.partner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderTop: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: '13px', color: '#8a9e96' }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} families
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
              border: '1.5px solid var(--border)', background: '#fff',
              color: page === 1 ? '#ccc' : 'var(--charcoal)', cursor: page === 1 ? 'default' : 'pointer',
            }}>← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '13px',
                border: '1.5px solid var(--border)',
                background: page === p ? 'var(--green)' : '#fff',
                color: page === p ? 'var(--ivory)' : 'var(--charcoal)', cursor: 'pointer',
              }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
              border: '1.5px solid var(--border)', background: '#fff',
              color: page === totalPages ? '#ccc' : 'var(--charcoal)', cursor: page === totalPages ? 'default' : 'pointer',
            }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
