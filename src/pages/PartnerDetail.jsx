import { useParams, useNavigate } from 'react-router-dom';
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

const mockPartners = {
  1: { name: 'Aakash Shethia', arn: 'ARN-12345', status: 'live', aum: '₹2.4 Cr', investors: 18, sip: '₹1,20,000', sipCount: 24, commission: '₹8,400', leads: 6 },
  2: { name: 'Priya Mehta', arn: 'ARN-67890', status: 'live', aum: '₹1.1 Cr', investors: 9, sip: '₹45,000', sipCount: 11, commission: '₹3,200', leads: 2 },
  3: { name: 'Rahul Sharma', arn: 'ARN-11223', status: 'pending', aum: '₹0', investors: 0, sip: '₹0', sipCount: 0, commission: '₹0', leads: 1 },
  4: { name: 'Neha Gupta', arn: 'ARN-44556', status: 'paused', aum: '₹78 L', investors: 5, sip: '₹22,000', sipCount: 6, commission: '₹1,100', leads: 0 },
};

const statusColor = {
  live: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  pending: { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
  paused: { bg: 'rgba(200,200,200,0.2)', color: '#8a9e96' },
};

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const partner = mockPartners[id];

  if (!partner) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#8a9e96' }}>
      Partner not found. <span style={{ color: 'var(--green)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/partners')}>Go back</span>
    </div>
  );

  return (
    <div>
      {/* Back + header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/partners')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', color: '#8a9e96', letterSpacing: '0.04em',
            marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px',
            padding: 0,
          }}
        >
          ← Back to Partners
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'rgba(44,74,62,0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 600, color: 'var(--green)', flexShrink: 0,
          }}>
            {partner.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--display-font)',
              fontSize: '34px', fontWeight: 600, color: 'var(--green)',
              lineHeight: 1,
            }}>{partner.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span style={{ fontSize: '13px', color: '#8a9e96' }}>{partner.arn}</span>
              <span style={{
                fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase', padding: '3px 10px', borderRadius: '100px',
                background: statusColor[partner.status].bg, color: statusColor[partner.status].color,
              }}>{partner.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <KPICard label="Total AUM" value={partner.aum} subtitle="As of today" />
        <KPICard label="Investors" value={String(partner.investors)} />
        <KPICard label="Monthly SIP" value={partner.sip} subtitle={`${partner.sipCount} active SIPs`} />
        <KPICard label="Commission Due" value={partner.commission} subtitle="This month" />
        <KPICard label="Leads MTD" value={String(partner.leads)} subtitle="From micro-site" />
      </div>

      {/* AUM Growth Chart */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '28px', marginBottom: '28px',
      }}>
        <span style={sectionHead}>AUM Growth</span>
        <div style={{
          height: '240px', background: 'var(--sage)', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: '24px',
        }}>
          <span style={{ fontSize: '13px', color: '#9aaa9e', fontStyle: 'italic' }}>Chart renders with real data</span>
        </div>
      </div>

      {/* Investor List */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden', marginBottom: '28px',
      }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <span style={sectionHead}>Investors</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--sage)' }}>
              {['Name', 'AUM', 'XIRR', 'SIP Amount', 'Last Txn'].map(h => (
                <th key={h} style={{
                  padding: '12px 24px', textAlign: 'left',
                  ...tabLabel, fontFamily: 'var(--body-font)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1,2,3,4,5].map(i => (
              <tr key={i}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>₹0</td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#8a9e96' }}>0%</td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--charcoal)' }}>₹0</td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#8a9e96' }}>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AUM + SIP Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        {['AUM by Category', 'AUM by AMC', 'SIP by Category', 'SIP by AMC'].map(label => (
          <div key={label} style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            padding: '24px',
          }}>
            <div style={{ ...tabLabel, marginBottom: '16px' }}>{label}</div>
            <div style={{
              height: '160px', background: 'var(--sage)', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '12px', color: '#9aaa9e', fontStyle: 'italic' }}>Chart</span>
            </div>
          </div>
        ))}
      </div>

      {/* Commission + Leads */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          padding: '24px',
        }}>
          <span style={sectionHead}>Commission History</span>
          <div style={{
            height: '160px', background: 'var(--sage)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '20px',
          }}>
            <span style={{ fontSize: '13px', color: '#9aaa9e', fontStyle: 'italic' }}>No data yet</span>
          </div>
        </div>
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          padding: '24px',
        }}>
          <span style={sectionHead}>Leads from Micro-site</span>
          <div style={{
            height: '160px', background: 'var(--sage)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '20px',
          }}>
            <span style={{ fontSize: '13px', color: '#9aaa9e', fontStyle: 'italic' }}>No leads yet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
