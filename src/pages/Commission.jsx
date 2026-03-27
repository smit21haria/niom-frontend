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

const months = [
  'Jan 2026', 'Feb 2026', 'Mar 2026',
  'Dec 2025', 'Nov 2025', 'Oct 2025',
];

const mockPartners = [
  { id: 1, name: 'Aakash Shethia', arn: 'ARN-12345', aum: '₹2.4 Cr', trail: '₹8,400', estimated: '₹8,400', confirmed: '₹8,400', paid: false },
  { id: 2, name: 'Priya Mehta', arn: 'ARN-67890', aum: '₹1.1 Cr', trail: '₹3,200', estimated: '₹3,200', confirmed: '₹3,200', paid: true },
  { id: 3, name: 'Rahul Sharma', arn: 'ARN-11223', aum: '₹0', trail: '₹0', estimated: '₹0', confirmed: '—', paid: false },
  { id: 4, name: 'Neha Gupta', arn: 'ARN-44556', aum: '₹78 L', trail: '₹1,100', estimated: '₹1,100', confirmed: '₹1,100', paid: false },
];

export default function Commission() {
  const [selectedMonth, setSelectedMonth] = useState('Mar 2026');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [partners, setPartners] = useState(mockPartners);
  const [uploadState, setUploadState] = useState('idle'); // idle | processing | done
  const [dragging, setDragging] = useState(false);

  const markPaid = (id) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, paid: true } : p));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setUploadState('processing');
    setTimeout(() => setUploadState('done'), 1800);
  };

  const handleFileChange = () => {
    setUploadState('processing');
    setTimeout(() => setUploadState('done'), 1800);
  };

  const totalBrokerage = '₹12,700';
  const totalPayables = '₹12,700';
  const niomEarnings = '₹4,127';

  return (
    <div>
      {/* Page title + month picker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Commission
        </h1>

        {/* Month selector */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMonthPicker(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px',
              border: '1.5px solid var(--border)', background: '#fff',
              fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)',
              cursor: 'pointer', fontFamily: 'var(--body-font)',
            }}
          >
            <span style={{ fontSize: '12px', color: 'var(--gold)' }}>📅</span>
            {selectedMonth}
            <span style={{ fontSize: '10px', color: '#8a9e96' }}>▾</span>
          </button>
          {showMonthPicker && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: '10px', boxShadow: 'var(--shadow)',
              overflow: 'hidden', zIndex: 50, minWidth: '160px',
            }}>
              {months.map(m => (
                <div key={m}
                  onClick={() => { setSelectedMonth(m); setShowMonthPicker(false); }}
                  style={{
                    padding: '11px 18px', fontSize: '13px', cursor: 'pointer',
                    color: selectedMonth === m ? 'var(--green)' : 'var(--charcoal)',
                    fontWeight: selectedMonth === m ? 600 : 400,
                    background: selectedMonth === m ? 'var(--sage)' : '#fff',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (selectedMonth !== m) e.currentTarget.style.background = 'var(--sage)'; }}
                  onMouseLeave={e => { if (selectedMonth !== m) e.currentTarget.style.background = '#fff'; }}
                >
                  {m}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Brokerage Received', value: totalBrokerage, sub: `${selectedMonth}` },
          { label: 'Total Partner Payables', value: totalPayables, sub: 'Across all partners' },
          { label: "Niom's Net Earnings", value: niomEarnings, sub: 'After partner splits' },
        ].map(card => (
          <div key={card.label} style={{
            flex: 1, background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            padding: '24px 20px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center', minHeight: '140px',
            justifyContent: 'space-between',
          }}>
            <div style={{ ...tabLabel }}>{card.label}</div>
            <div style={{ fontFamily: 'var(--display-font)', fontSize: '36px', fontWeight: 600, color: 'var(--charcoal)', lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: '#9aaa9e' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Partner Payables */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        overflow: 'hidden', marginBottom: '28px',
      }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
          <span style={sectionHead}>Partner Payables — {selectedMonth}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
            <thead>
              <tr style={{ background: 'var(--sage)' }}>
                {['Partner', 'ARN', 'AUM', 'Trail Commission', 'Estimated Payable', 'Confirmed Payable', 'Status', 'Action'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left',
                    ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partners.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(44,74,62,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 600, color: 'var(--green)', flexShrink: 0,
                      }}>
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--charcoal)' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#8a9e96' }}>{p.arn}</td>
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{p.aum}</td>
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{p.trail}</td>
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: '#8a9e96', fontStyle: 'italic' }}>{p.estimated}</td>
                  <td style={{ padding: '16px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{p.confirmed}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em',
                      textTransform: 'uppercase', padding: '4px 10px', borderRadius: '100px',
                      background: p.paid ? 'rgba(44,74,62,0.08)' : 'rgba(184,150,90,0.12)',
                      color: p.paid ? 'var(--green)' : 'var(--gold)',
                    }}>
                      {p.paid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {!p.paid ? (
                      <button
                        onClick={() => markPaid(p.id)}
                        style={{
                          padding: '7px 16px', borderRadius: '8px',
                          background: 'var(--green)', color: 'var(--ivory)',
                          border: 'none', fontSize: '12px', fontWeight: 500,
                          cursor: 'pointer', letterSpacing: '0.04em',
                          transition: 'background 0.2s', whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#9aaa9e' }}>✓ Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Brokerage Upload */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '28px',
      }}>
        <div style={{ marginBottom: '24px' }}>
          <span style={sectionHead}>Brokerage File Upload</span>
          <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '6px' }}>
            Upload your AMC brokerage file (CSV or Excel) to process commissions for {selectedMonth}.
          </p>
        </div>

        {/* Drop zone */}
        {uploadState === 'idle' && (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragging ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: '12px', padding: '48px 24px', textAlign: 'center',
              background: dragging ? 'rgba(44,74,62,0.03)' : 'var(--sage)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.4 }}>⬆</div>
            <div style={{ fontSize: '14px', color: 'var(--charcoal)', fontWeight: 500, marginBottom: '6px' }}>
              Drag and drop your brokerage file here
            </div>
            <div style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '20px' }}>
              Supports CSV and Excel (.xlsx) from any AMC
            </div>
            <label style={{
              display: 'inline-block',
              padding: '10px 24px', borderRadius: '8px',
              background: 'var(--green)', color: 'var(--ivory)',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              letterSpacing: '0.06em',
            }}>
              Browse File
              <input type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleFileChange} />
            </label>
          </div>
        )}

        {/* Processing */}
        {uploadState === 'processing' && (
          <div style={{
            border: '1.5px solid var(--border)', borderRadius: '12px',
            padding: '40px', textAlign: 'center', background: 'var(--sage)',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500, marginBottom: '8px' }}>
              Processing file...
            </div>
            <div style={{ fontSize: '12px', color: '#8a9e96' }}>Mapping rows to investors and partners</div>
          </div>
        )}

        {/* Done — results */}
        {uploadState === 'done' && (
          <div>
            {/* Summary strip */}
            <div style={{
              display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap',
            }}>
              {[
                { label: 'Total Rows', value: '312' },
                { label: 'Mapped', value: '298', color: 'var(--green)' },
                { label: 'Unmapped', value: '14', color: '#c0392b' },
                { label: 'Total Amount', value: '₹12,700' },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, background: 'var(--sage)', borderRadius: '10px',
                  padding: '16px 20px', textAlign: 'center', minWidth: '120px',
                }}>
                  <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>{s.label}</div>
                  <div style={{
                    fontFamily: 'var(--display-font)', fontSize: '26px',
                    fontWeight: 600, color: s.color || 'var(--charcoal)',
                  }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Unmapped rows */}
            <div style={{
              border: '1.5px solid rgba(192,57,43,0.2)', borderRadius: '12px',
              overflow: 'hidden', marginBottom: '16px',
            }}>
              <div style={{
                padding: '14px 20px', background: 'rgba(192,57,43,0.05)',
                borderBottom: '1px solid rgba(192,57,43,0.15)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '12px', color: '#c0392b', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  14 Unmapped Rows — Review Required
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Folio', 'Scheme', 'Amount', 'Assign to Partner'].map(h => (
                      <th key={h} style={{ padding: '10px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', fontSize: '10px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(i => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)', fontFamily: 'var(--display-font)' }}>—</td>
                      <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                      <td style={{ padding: '12px 20px', fontSize: '13px', fontFamily: 'var(--display-font)', color: 'var(--charcoal)' }}>—</td>
                      <td style={{ padding: '12px 20px' }}>
                        <select style={{
                          padding: '6px 12px', border: '1.5px solid var(--border)',
                          borderRadius: '6px', fontSize: '12px',
                          fontFamily: 'var(--body-font)', color: 'var(--charcoal)',
                          background: '#fff', outline: 'none', cursor: 'pointer',
                        }}>
                          <option>Select partner...</option>
                          {mockPartners.map(p => <option key={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{
                padding: '10px 24px', borderRadius: '8px',
                background: 'var(--green)', color: 'var(--ivory)',
                border: 'none', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', letterSpacing: '0.06em',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
              >
                Confirm & Process
              </button>
              <button
                onClick={() => setUploadState('idle')}
                style={{
                  padding: '10px 20px', borderRadius: '8px',
                  background: 'transparent', color: '#8a9e96',
                  border: '1.5px solid var(--border)', fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Upload Different File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
