import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import KPICard from '../components/ui/KPICard';
import DonutChart from '../components/ui/DonutChart';
import AreaBarChart from '../components/ui/AreaBarChart';
import { partners, investors, dashboard, formatINR } from '../lib/api';

const BASE = import.meta.env.VITE_API_URL || 'https://niom-backend.onrender.com';

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

const statusColor = {
  live:    { bg: '#e6f7ec', color: '#1a7a3c' },
  pending: { bg: '#fef9ec', color: '#8a6200' },
  paused:  { bg: '#f5f5f5', color: '#7a7a7a' },
};

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [partner, setPartner]     = useState(null);
  const [kpis, setKpis]           = useState(null);
  const [aumHistory, setAumHistory] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [invList, setInvList]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [partnerData, kpiData, histData, breakData, invData] = await Promise.all([
        partners.get(id).catch(() => null),
        dashboard.kpis({ partner_id: id }).catch(() => null),
        dashboard.aumHistory(12, id).catch(() => []),
        dashboard.aumBreakdown(id).catch(() => null),
        investors.list({ partner_id: id, limit: 5 }).catch(() => ({ investors: [] })),
      ]);
      setPartner(partnerData);
      setKpis(kpiData);
      setAumHistory(histData || []);
      setBreakdown(breakData);
      setInvList(invData?.investors || []);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)' }}>
        Loading partner profile...
      </div>
    </div>
  );

  if (error || !partner) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)' }}>Partner not found</div>
      <button onClick={() => navigate('/partners')} style={{
        padding: '10px 24px', borderRadius: '8px', background: 'var(--green)',
        color: 'var(--ivory)', border: 'none', fontSize: '13px', cursor: 'pointer',
      }}>← Back to Partners</button>
    </div>
  );

  const aumByCategory = breakdown?.by_category?.map(d => ({ name: d.category_name || 'Unknown', aum: d.aum })) || [];
  const aumByAmc      = breakdown?.by_amc?.map(d => ({ name: d.amc_name || 'Unknown', aum: d.aum })) || [];

  return (
    <div>
      {/* Back nav */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('/partners')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '13px', color: '#8a9e96',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'var(--body-font)',
        }}>← Partners</button>
        <span style={{ color: '#c4d4d0' }}>/</span>
        <span style={{ fontSize: '13px', color: 'var(--charcoal)', fontWeight: 500 }}>
          {partner.fname} {partner.lname}
        </span>
      </div>

      {/* Partner Header */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '28px', marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
          {/* Avatar */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            border: '2px solid var(--gold)', flexShrink: 0,
            background: 'var(--sage)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--display-font)', fontSize: '24px',
            fontWeight: 600, color: 'var(--green)', overflow: 'hidden',
          }}>
            {partner.photo_url
              ? <img src={`${BASE}${partner.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (partner.fname?.[0] || '') + (partner.lname?.[0] || '')}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: 'var(--display-font)', fontSize: '28px', fontWeight: 600, color: 'var(--green)' }}>
                {partner.fname} {partner.lname}
              </h2>
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.08em',
                ...(statusColor[partner.status] || statusColor.paused),
                background: (statusColor[partner.status] || statusColor.paused).bg,
              }}>{partner.status}</span>
            </div>
            {partner.tagline && (
              <p style={{ fontSize: '14px', color: '#8a9e96', marginBottom: '12px', fontStyle: 'italic' }}>
                {partner.tagline}
              </p>
            )}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {[
                { label: 'ARN',       value: partner.arn || '—' },
                { label: 'Slug',      value: `niomfintech.in/${partner.slug}` },
                { label: 'WhatsApp',  value: partner.wa_number ? `${partner.wa_cc || ''} ${partner.wa_number}` : '—' },
                { label: 'Call',      value: partner.call_number ? `${partner.call_cc || ''} ${partner.call_number}` : '—' },
                { label: 'Joined',    value: partner.created_at ? new Date(partner.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '3px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--charcoal)' }}>{item.value}</div>
                </div>
              ))}
            </div>
            {/* Services */}
            {partner.services?.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                {(Array.isArray(partner.services) ? partner.services : JSON.parse(partner.services || '[]')).map(s => (
                  <span key={s} style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '100px',
                    background: 'rgba(44,74,62,0.06)', color: 'var(--green)',
                    fontWeight: 500,
                  }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <KPICard label="Total AUM"       value={kpis ? formatINR(kpis.total_aum) : '₹0'}      subtitle="As of today" />
        <KPICard label="Investors"       value={kpis ? String(kpis.investor_count) : '0'} />
        <KPICard label="Monthly SIP"     value={kpis ? formatINR(kpis.sip_amount) : '₹0'}     subtitle={`${kpis?.sip_count || 0} active SIPs`} />
        <KPICard label="Commission Due"  value="₹0"                                            subtitle="This month" />
        <KPICard label="Leads MTD"       value={kpis ? String(kpis.leads_mtd) : '0'}          subtitle="From micro-site" />
      </div>

      {/* AUM Growth */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '28px', marginBottom: '28px',
      }}>
        <span style={{ ...sectionHead, display: 'block', marginBottom: '24px' }}>AUM Growth</span>
        <AreaBarChart data={aumHistory} mode="trend" height={240} />
      </div>

      {/* Investors Table */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden', marginBottom: '28px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: '1px solid var(--border)',
        }}>
          <span style={sectionHead}>Investors</span>
          <button
            onClick={() => navigate(`/investors?partner_id=${id}`)}
            style={{
              fontSize: '13px', color: 'var(--green)', background: 'none',
              border: '1.5px solid var(--border)', borderRadius: '8px',
              padding: '7px 16px', cursor: 'pointer', fontFamily: 'var(--body-font)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--sage)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'none'; }}
          >View All →</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--sage)' }}>
              {['Name', 'AUM', 'Holdings', 'SIP Amount', 'Last Txn'].map(h => (
                <th key={h} style={{
                  padding: '12px 24px', textAlign: 'left',
                  ...tabLabel, fontFamily: 'var(--body-font)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invList.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: '#9aaa9e' }}>
                  No investors yet
                </td>
              </tr>
            ) : invList.map(inv => (
              <tr key={inv.id}
                onClick={() => navigate(`/investors/${inv.id}`)}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <td style={{ padding: '14px 24px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>
                    {inv.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9aaa9e' }}>{inv.email || '—'}</div>
                </td>
                <td style={{ padding: '14px 24px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>
                  {formatINR(inv.aum || 0)}
                </td>
                <td style={{ padding: '14px 24px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>
                  {inv.holdings_count || 0}
                </td>
                <td style={{ padding: '14px 24px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>
                  {formatINR(inv.sip_amount || 0)}
                </td>
                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#8a9e96' }}>
                  {inv.last_txn_date
                    ? new Date(inv.last_txn_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AUM + SIP Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[
          { label: 'AUM by Category', data: aumByCategory },
          { label: 'AUM by AMC',      data: aumByAmc },
          { label: 'SIP by Category', data: aumByCategory },
          { label: 'SIP by AMC',      data: aumByAmc },
        ].map(({ label, data }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            padding: '24px',
          }}>
            <div style={{ ...tabLabel, marginBottom: '16px' }}>{label}</div>
            <DonutChart data={data} nameKey="name" valueKey="aum" formatValue={formatINR} height={200} />
          </div>
        ))}
      </div>
    </div>
  );
}