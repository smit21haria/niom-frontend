import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/ui/KPICard';

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

const mockPartners = [
  { id: 1, name: 'Aakash Shethia', arn: 'ARN-12345', status: 'live', aum: '₹2.4 Cr', aumChange: '+4.2%', investors: 18, sip: '₹1,20,000', sipCount: 24, commission: '₹8,400', leads: 6, lastTxn: '22 Mar 2026' },
  { id: 2, name: 'Priya Mehta', arn: 'ARN-67890', status: 'live', aum: '₹1.1 Cr', aumChange: '+1.8%', investors: 9, sip: '₹45,000', sipCount: 11, commission: '₹3,200', leads: 2, lastTxn: '20 Mar 2026' },
  { id: 3, name: 'Rahul Sharma', arn: 'ARN-11223', status: 'pending', aum: '₹0', aumChange: '—', investors: 0, sip: '₹0', sipCount: 0, commission: '₹0', leads: 1, lastTxn: '—' },
  { id: 4, name: 'Neha Gupta', arn: 'ARN-44556', status: 'paused', aum: '₹78 L', aumChange: '-0.3%', investors: 5, sip: '₹22,000', sipCount: 6, commission: '₹1,100', leads: 0, lastTxn: '10 Mar 2026' },
];

const statusColor = {
  live: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  pending: { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
  paused: { bg: 'rgba(200,200,200,0.2)', color: '#8a9e96' },
};

export default function Partners() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All'
    ? mockPartners
    : mockPartners.filter(p => p.status === filter.toLowerCase());

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--display-font)',
          fontSize: '34px', fontWeight: 600, color: 'var(--green)',
        }}>Partner Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <KPICard label="Total AUM" value="₹3.6 Cr" subtitle="All partners" />
        <KPICard label="Active Partners" value="2" subtitle="1 pending · 1 paused" />
        <KPICard label="Monthly SIP Book" value="₹1.87 L" subtitle="All partners" />
        <KPICard label="Commission Due" value="₹12,700" subtitle="This month" />
        <KPICard label="Total Leads MTD" value="9" subtitle="All micro-sites" />
        <KPICard label="Net New AUM" value="+₹14 L" subtitle="vs last month" />
      </div>

      {/* Partner Table */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: '1px solid var(--border)',
        }}>
          <span style={sectionHead}>All Partners</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Live', 'Pending', 'Paused'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 14px', borderRadius: '100px',
                fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em',
                border: '1.5px solid var(--border)',
                background: filter === f ? 'var(--green)' : '#fff',
                color: filter === f ? 'var(--ivory)' : '#7a8a84',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--sage)' }}>
              {[
                'Partner', 'ARN', 'Status', 'Total AUM',
                'AUM MoM', 'Investors', 'SIP Amount',
                'Commission Due', 'Leads MTD', 'Last Txn',
              ].map(h => (
                <th key={h} style={{
                  padding: '12px 20px', textAlign: 'left',
                  ...tabLabel, fontFamily: 'var(--body-font)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr
                key={p.id}
                onClick={() => navigate(`/partners/${p.id}`)}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: 'rgba(44,74,62,0.1)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 600, color: 'var(--green)',
                      flexShrink: 0,
                    }}>
                      {p.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#8a9e96' }}>{p.arn}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '4px 10px', borderRadius: '100px',
                    background: statusColor[p.status].bg, color: statusColor[p.status].color,
                  }}>{p.status}</span>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '14px', fontFamily: 'var(--display-font)', color: 'var(--charcoal)' }}>{p.aum}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: p.aumChange.startsWith('+') ? '#2d8a55' : p.aumChange === '—' ? '#8a9e96' : '#c0392b' }}>{p.aumChange}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{p.investors}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{p.sip}<span style={{ color: '#8a9e96', fontSize: '12px' }}> · {p.sipCount} SIPs</span></td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{p.commission}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>{p.leads}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#8a9e96' }}>{p.lastTxn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
