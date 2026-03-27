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

const processingHistory = [
  { date: '1 Mar 2026', amc: 'HDFC MF', rows: 142, mapped: 140, unmapped: 2, amount: '₹6,200', status: 'processed' },
  { date: '1 Mar 2026', amc: 'SBI MF', rows: 98, mapped: 95, unmapped: 3, amount: '₹4,100', status: 'processed' },
  { date: '1 Mar 2026', amc: 'ICICI Prudential', rows: 72, mapped: 63, unmapped: 9, amount: '₹2,400', status: 'review' },
  { date: '1 Feb 2026', amc: 'HDFC MF', rows: 138, mapped: 138, unmapped: 0, amount: '₹5,900', status: 'processed' },
];

const statusColor = {
  processed: { bg: 'rgba(44,74,62,0.08)', color: 'var(--green)' },
  review: { bg: 'rgba(184,150,90,0.12)', color: 'var(--gold)' },
};

const subSections = ['Upload', 'Processing History'];

export default function AdminBrokerage() {
  const [activeSection, setActiveSection] = useState('Upload');
  const [uploadState, setUploadState] = useState('idle');
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setUploadState('processing');
    setTimeout(() => setUploadState('done'), 1800);
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Brokerage Management
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{
          width: '200px', flexShrink: 0, background: '#fff',
          borderRadius: '12px', border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)', overflow: 'hidden',
        }}>
          {subSections.map(s => (
            <div key={s} onClick={() => setActiveSection(s)} style={{
              padding: '14px 16px', cursor: 'pointer', fontSize: '13px',
              fontWeight: activeSection === s ? 600 : 400,
              color: activeSection === s ? 'var(--green)' : '#5a6a64',
              background: activeSection === s ? 'rgba(44,74,62,0.08)' : '#fff',
              borderLeft: activeSection === s ? '3px solid var(--green)' : '3px solid transparent',
              borderBottom: '1px solid var(--border)', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (activeSection !== s) { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.color = 'var(--green)'; }}}
              onMouseLeave={e => { if (activeSection !== s) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#5a6a64'; }}}
            >{s}</div>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {activeSection === 'Upload' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              padding: '28px',
            }}>
              <span style={{ ...sectionHead, display: 'block', marginBottom: '8px' }}>Upload Brokerage File</span>
              <p style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '24px' }}>
                Upload AMC brokerage files (CSV or Excel). Each AMC sends a separate file monthly.
              </p>

              {uploadState === 'idle' && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragging ? 'var(--green)' : 'var(--border)'}`,
                    borderRadius: '12px', padding: '56px 24px', textAlign: 'center',
                    background: dragging ? 'rgba(44,74,62,0.03)' : 'var(--sage)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>⬆</div>
                  <div style={{ fontSize: '14px', color: 'var(--charcoal)', fontWeight: 500, marginBottom: '6px' }}>
                    Drag and drop your brokerage file here
                  </div>
                  <div style={{ fontSize: '13px', color: '#8a9e96', marginBottom: '24px' }}>
                    Supports CSV and Excel (.xlsx) from any AMC
                  </div>
                  <label style={{
                    display: 'inline-block', padding: '10px 28px',
                    borderRadius: '8px', background: 'var(--green)',
                    color: 'var(--ivory)', fontSize: '13px',
                    fontWeight: 500, cursor: 'pointer', letterSpacing: '0.06em',
                  }}>
                    Browse File
                    <input type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
                      onChange={() => { setUploadState('processing'); setTimeout(() => setUploadState('done'), 1800); }} />
                  </label>
                </div>
              )}

              {uploadState === 'processing' && (
                <div style={{
                  border: '1.5px solid var(--border)', borderRadius: '12px',
                  padding: '48px', textAlign: 'center', background: 'var(--sage)',
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500, marginBottom: '8px' }}>Processing file...</div>
                  <div style={{ fontSize: '12px', color: '#8a9e96' }}>Mapping rows to investors and partners</div>
                </div>
              )}

              {uploadState === 'done' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Total Rows', value: '312' },
                      { label: 'Mapped', value: '298', color: 'var(--green)' },
                      { label: 'Unmapped', value: '14', color: '#c05050' },
                      { label: 'Total Amount', value: '₹12,700' },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'var(--sage)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>{s.label}</div>
                        <div style={{ fontFamily: 'var(--display-font)', fontSize: '24px', fontWeight: 600, color: s.color || 'var(--charcoal)' }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ border: '1.5px solid rgba(192,57,43,0.2)', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ padding: '12px 20px', background: 'rgba(192,57,43,0.05)', borderBottom: '1px solid rgba(192,57,43,0.15)' }}>
                      <span style={{ fontSize: '12px', color: '#c05050', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>14 Unmapped Rows</span>
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
                        {[1,2,3].map(i => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                            <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--charcoal)' }}>—</td>
                            <td style={{ padding: '12px 20px', fontFamily: 'var(--display-font)', fontSize: '13px' }}>—</td>
                            <td style={{ padding: '12px 20px' }}>
                              <select style={{ padding: '6px 12px', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '12px', fontFamily: 'var(--body-font)', color: 'var(--charcoal)', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                                <option>Select partner...</option>
                                <option>Aakash Shethia</option>
                                <option>Priya Mehta</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--green)', color: 'var(--ivory)', border: 'none', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                    >Confirm & Process</button>
                    <button onClick={() => setUploadState('idle')} style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', color: '#8a9e96', border: '1.5px solid var(--border)', fontSize: '13px', cursor: 'pointer' }}>
                      Upload Different File
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'Processing History' && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
                <span style={sectionHead}>Processing History</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: 'var(--sage)' }}>
                      {['Date', 'AMC', 'Total Rows', 'Mapped', 'Unmapped', 'Amount', 'Status'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: 'left', ...tabLabel, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processingHistory.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td style={{ padding: '13px 20px', fontSize: '13px', color: '#8a9e96' }}>{row.date}</td>
                        <td style={{ padding: '13px 20px', fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)' }}>{row.amc}</td>
                        <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{row.rows}</td>
                        <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--green)' }}>{row.mapped}</td>
                        <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: row.unmapped > 0 ? '#c05050' : '#8a9e96' }}>{row.unmapped}</td>
                        <td style={{ padding: '13px 20px', fontFamily: 'var(--display-font)', fontSize: '14px', color: 'var(--charcoal)' }}>{row.amount}</td>
                        <td style={{ padding: '13px 20px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.1em', ...statusColor[row.status] }}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}