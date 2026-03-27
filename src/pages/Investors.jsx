import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const mockInvestors = [
  { id: 1, name: 'Ramesh Patel', pan: 'ABCDE1234F', mobile: '+91 98765 43210', family: 'Patel Family', partner: 'Aakash Shethia', aum: 2460000, aumDisplay: '₹24.6 L', xirr: 14.2, xirrDisplay: '14.2%', sip: 15000, sipDisplay: '₹15,000', kyc: 'verified', lastTxn: '22 Mar 2026', joined: '12 Jan 2024', joinedTs: 20240112 },
  { id: 2, name: 'Sunita Mehta', pan: 'FGHIJ5678K', mobile: '+91 91234 56789', family: 'Mehta Family', partner: 'Priya Mehta', aum: 810000, aumDisplay: '₹8.1 L', xirr: 11.8, xirrDisplay: '11.8%', sip: 8000, sipDisplay: '₹8,000', kyc: 'verified', lastTxn: '20 Mar 2026', joined: '5 Mar 2024', joinedTs: 20240305 },
  { id: 3, name: 'Arjun Sharma', pan: 'KLMNO9012P', mobile: '+91 99887 76655', family: '—', partner: 'Aakash Shethia', aum: 340000, aumDisplay: '₹3.4 L', xirr: 9.1, xirrDisplay: '9.1%', sip: 5000, sipDisplay: '₹5,000', kyc: 'pending', lastTxn: '15 Mar 2026', joined: '20 Jun 2024', joinedTs: 20240620 },
  { id: 4, name: 'Kavya Nair', pan: 'PQRST3456U', mobile: '+91 98001 23456', family: 'Nair Family', partner: 'Aakash Shethia', aum: 1290000, aumDisplay: '₹12.9 L', xirr: 16.4, xirrDisplay: '16.4%', sip: 12000, sipDisplay: '₹12,000', kyc: 'verified', lastTxn: '18 Mar 2026', joined: '8 Sep 2023', joinedTs: 20230908 },
  { id: 5, name: 'Vikram Singh', pan: 'UVWXY7890Z', mobile: '+91 97654 32109', family: 'Singh Family', partner: 'Priya Mehta', aum: 670000, aumDisplay: '₹6.7 L', xirr: 12.3, xirrDisplay: '12.3%', sip: 10000, sipDisplay: '₹10,000', kyc: 'pending', lastTxn: '10 Mar 2026', joined: '14 Nov 2023', joinedTs: 20231114 },
];

const partners = ['All Partners', 'Aakash Shethia', 'Priya Mehta'];

const kycColor = {
  verified: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  pending: { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
};

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'pan', label: 'PAN' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'family', label: 'Family' },
  { key: 'partner', label: 'Partner' },
  { key: 'aum', label: 'Total AUM' },
  { key: 'xirr', label: 'XIRR' },
  { key: 'sip', label: 'SIP Amount' },
  { key: 'kyc', label: 'KYC' },
  { key: 'lastTxn', label: 'Last Txn' },
  { key: 'joinedTs', label: 'Joined' },
];

export default function Investors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('joinedTs');
  const [sortDir, setSortDir] = useState('desc');
  const [kycFilter, setKycFilter] = useState('All');
  const [partnerFilter, setPartnerFilter] = useState('All Partners');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = mockInvestors
    .filter(inv => {
      const matchSearch = !search ||
        inv.name.toLowerCase().includes(search.toLowerCase()) ||
        inv.pan.toLowerCase().includes(search.toLowerCase()) ||
        inv.mobile.includes(search);
      const matchKyc = kycFilter === 'All' || inv.kyc === kycFilter.toLowerCase();
      const matchPartner = partnerFilter === 'All Partners' || inv.partner === partnerFilter;
      return matchSearch && matchKyc && matchPartner;
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
          Investors
        </h1>
        <button
          style={{
            background: 'var(--green)', color: 'var(--ivory)',
            border: 'none', borderRadius: '8px',
            padding: '10px 20px', fontSize: '13px', fontWeight: 500,
            letterSpacing: '0.06em', cursor: 'pointer', whiteSpace: 'nowrap',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
        >
          + Create Investor
        </button>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', flexShrink: 0 }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, PAN or mobile..."
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

        {/* Partner dropdown */}
        <select
          value={partnerFilter}
          onChange={e => { setPartnerFilter(e.target.value); setPage(1); }}
          style={{
            padding: '10px 16px', border: '1.5px solid var(--border)',
            borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--body-font)',
            color: 'var(--charcoal)', background: '#fff', outline: 'none',
            cursor: 'pointer', appearance: 'none',
            paddingRight: '32px',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a9e96' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          {partners.map(p => <option key={p}>{p}</option>)}
        </select>

        {/* KYC filter */}
        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          {['All', 'Verified', 'Pending'].map(f => (
            <button key={f} onClick={() => { setKycFilter(f); setPage(1); }} style={{
              padding: '8px 16px', borderRadius: '100px',
              fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em',
              border: '1.5px solid var(--border)',
              background: kycFilter === f ? 'var(--green)' : '#fff',
              color: kycFilter === f ? 'var(--ivory)' : '#7a8a84',
              cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{
                      padding: '12px 20px', textAlign: 'left',
                      ...tabLabel, fontFamily: 'var(--body-font)',
                      cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                    }}
                  >
                    {col.label}{' '}
                    <span style={{ opacity: sortKey === col.key ? 1 : 0.3, fontSize: '10px' }}>
                      {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(inv => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/investors/${inv.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{inv.name}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>
                    {inv.pan.slice(0, 3)}••••{inv.pan.slice(-2)}
                  </td>
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <a href={`tel:${inv.mobile}`} onClick={e => e.stopPropagation()}
                      style={{ fontSize: '13px', color: 'var(--green)', textDecoration: 'none' }}>
                      {inv.mobile}
                    </a>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{inv.family}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{inv.partner}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{inv.aumDisplay}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#2d8a55', whiteSpace: 'nowrap' }}>{inv.xirrDisplay}</td>
                  <td style={{ padding: '14px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>{inv.sipDisplay}</td>
                  <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                      textTransform: 'uppercase', padding: '4px 10px', borderRadius: '100px',
                      background: kycColor[inv.kyc].bg, color: kycColor[inv.kyc].color,
                    }}>{inv.kyc}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{inv.lastTxn}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>{inv.joined}</td>
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
            Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length} investors
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
