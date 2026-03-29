import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import KPICard from '../components/ui/KPICard';
import { partners, dashboard, formatINR } from '../lib/api';

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
  live:    { bg: 'rgba(44,74,62,0.08)',    color: 'var(--green)' },
  pending: { bg: 'rgba(184,150,90,0.12)',  color: 'var(--gold)' },
  paused:  { bg: 'rgba(200,200,200,0.2)',  color: '#8a9e96' },
};

function SkeletonRow() {
  return (
    <tr>
      {[180, 100, 80, 90, 70, 60, 90, 90, 60, 90].map((w, i) => (
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

export default function Partners() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [data, setData] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [partnerList, kpiData] = await Promise.all([
        partners.list({ limit: 100 }),
        dashboard.kpis().catch(() => null),
      ]);
      setData(Array.isArray(partnerList) ? partnerList : []);
      setKpis(kpiData);
    } catch(e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'All'
    ? data
    : data.filter(p => p.status === filter.toLowerCase());

  const liveCount    = data.filter(p => p.status === 'live').length;
  const pendingCount = data.filter(p => p.status === 'pending').length;
  const pausedCount  = data.filter(p => p.status === 'paused').length;

  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Partner Dashboard
        </h1>
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

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <KPICard label="Total AUM"        value={kpis ? formatINR(kpis.total_aum) : '₹0'}          subtitle="All partners" />
        <KPICard label="Active Partners"  value={String(liveCount)}                                  subtitle={`${pendingCount} pending · ${pausedCount} paused`} />
        <KPICard label="Monthly SIP Book" value={kpis ? formatINR(kpis.sip_amount) : '₹0'}          subtitle="All partners" />
        <KPICard label="Commission Due"   value="₹0"                                                 subtitle="This month" />
        <KPICard label="Total Leads MTD"  value={kpis ? String(kpis.leads_mtd) : '0'}               subtitle="All micro-sites" />
        <KPICard label="Total Investors"  value={kpis ? String(kpis.investor_count) : '0'}           subtitle="Across all partners" />
      </div>

      {/* Partner Table */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden',
      }}>
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

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {['Partner', 'ARN', 'Status', 'Total AUM', 'Investors', 'SIP Amount', 'Leads MTD', 'Joined'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left',
                    ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--green)', marginBottom: '8px' }}>
                      No {filter === 'All' ? '' : filter.toLowerCase()} partners yet
                    </div>
                    <div style={{ fontSize: '13px', color: '#8a9e96' }}>
                      Onboard your first partner from Admin Controls.
                    </div>
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id}
                  onClick={() => navigate(`/partners/${p.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>

                  {/* Partner name + avatar */}
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        border: '2px solid var(--gold)', flexShrink: 0,
                        background: 'var(--sage)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--display-font)', fontSize: '13px',
                        fontWeight: 600, color: 'var(--green)', overflow: 'hidden',
                      }}>
                        {p.photo_url
                          ? <img src={`https://niom-backend.onrender.com${p.photo_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (p.fname?.[0] || '') + (p.lname?.[0] || '')
                        }
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>
                          {p.fname} {p.lname}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9aaa9e' }}>
                          niomfintech.in/{p.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ARN */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>
                    {p.arn || '—'}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                      borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.08em',
                      ...(statusColor[p.status] || statusColor.paused),
                      background: (statusColor[p.status] || statusColor.paused).bg,
                    }}>{p.status}</span>
                  </td>

                  {/* AUM */}
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    {formatINR(p.aum || 0)}
                  </td>

                  {/* Investors */}
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>
                    {p.investor_count || 0}
                  </td>

                  {/* SIP Amount */}
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)', whiteSpace: 'nowrap' }}>
                    {formatINR(p.sip_amount || 0)}
                  </td>

                  {/* Leads MTD */}
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>
                    {p.leads_mtd || 0}
                  </td>

                  {/* Joined */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#8a9e96', whiteSpace: 'nowrap' }}>
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
