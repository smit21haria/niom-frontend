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
  { id: 1, name: 'Ramesh Patel', partner: 'Aakash Shethia' },
  { id: 2, name: 'Sunita Mehta', partner: 'Priya Mehta' },
  { id: 3, name: 'Arjun Sharma', partner: 'Aakash Shethia' },
  { id: 4, name: 'Kavya Nair', partner: 'Aakash Shethia' },
  { id: 5, name: 'Vikram Singh', partner: 'Priya Mehta' },
];

const mockFamilies = [
  { id: 1, name: 'Patel Family', head: 'Ramesh Patel' },
  { id: 2, name: 'Mehta Family', head: 'Sunita Mehta' },
  { id: 3, name: 'Nair Family', head: 'Kavya Nair' },
  { id: 4, name: 'Singh Family', head: 'Vikram Singh' },
];

const reports = [
  {
    id: 'portfolio',
    title: 'Portfolio Report',
    description: 'Complete portfolio snapshot with holdings, allocation and performance',
    variants: ['Comprehensive', 'Niom ARN Only', 'External ARN Only'],
    dateRange: false,
    formats: ['PDF'],
  },
  {
    id: 'returns',
    title: 'Returns Report',
    description: 'Trailing and calendar returns across all holdings',
    variants: null,
    dateRange: true,
    formats: ['PDF'],
  },
  {
    id: 'holdings',
    title: 'Holdings Report',
    description: 'Current holdings snapshot with units, NAV and market value',
    variants: null,
    dateRange: false,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'capital_gains',
    title: 'Capital Gains Report',
    description: 'STCG and LTCG breakdown for the selected period',
    variants: null,
    dateRange: true,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'transactions',
    title: 'Transaction History',
    description: 'Complete transaction log including SIP, SWP and STP',
    variants: null,
    dateRange: true,
    formats: ['PDF', 'Excel'],
  },
];

function ReportPreview({ report, subject, subjectType, variant, dateFrom, dateTo, onClose }) {
  const title = variant ? `${report.title} — ${variant}` : report.title;
  const dateStr = report.dateRange ? `${dateFrom || '—'} to ${dateTo || '—'}` : 'As of today';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,43,37,0.6)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
    }}>
      {/* Preview toolbar */}
      <div style={{
        background: 'var(--footer-dark)', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px', padding: '6px 14px', color: '#d6cfc4',
            fontSize: '12px', cursor: 'pointer', letterSpacing: '0.06em',
          }}>✕ Close</button>
          <span style={{ fontFamily: 'var(--display-font)', fontSize: '18px', color: '#d6cfc4' }}>
            {title}
          </span>
          <span style={{ fontSize: '12px', color: '#8a9e96' }}>
            {subject?.name} · {dateStr}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {report.formats.map(fmt => (
            <button key={fmt} style={{
              background: fmt === 'PDF' ? 'var(--green)' : 'transparent',
              border: fmt === 'PDF' ? 'none' : '1px solid rgba(184,150,90,0.5)',
              borderRadius: '8px', padding: '8px 20px',
              color: fmt === 'PDF' ? 'var(--ivory)' : 'var(--gold)',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              letterSpacing: '0.06em',
            }}>
              ↓ Download {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Report content */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#e8e8e4', padding: '40px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%', maxWidth: '860px',
          background: '#fff', borderRadius: '4px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          padding: '64px 72px',
          minHeight: '1100px',
        }}>
          {/* Report header */}
          <div style={{ borderBottom: '2px solid var(--green)', paddingBottom: '32px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontFamily: 'var(--display-font)', fontSize: '32px', fontWeight: 600, color: 'var(--green)', marginBottom: '4px' }}>
                  Niom
                </div>
                <div style={{ fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  Wealth Management
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '4px' }}>
                  {title}
                </div>
                <div style={{ fontSize: '12px', color: '#8a9e96' }}>{dateStr}</div>
              </div>
            </div>
          </div>

          {/* Subject info */}
          <div style={{ background: 'var(--sage)', borderRadius: '10px', padding: '20px 24px', marginBottom: '36px' }}>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '4px' }}>{subjectType === 'investor' ? 'Investor' : 'Family'}</div>
                <div style={{ fontFamily: 'var(--display-font)', fontSize: '20px', fontWeight: 600, color: 'var(--green)' }}>{subject?.name}</div>
              </div>
              {subjectType === 'investor' && subject?.partner && (
                <div>
                  <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '4px' }}>Partner</div>
                  <div style={{ fontSize: '14px', color: 'var(--charcoal)' }}>{subject.partner}</div>
                </div>
              )}
              <div>
                <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '4px' }}>Report Date</div>
                <div style={{ fontSize: '14px', color: 'var(--charcoal)' }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
          </div>

          {/* Placeholder sections */}
          {['Portfolio Summary', 'Holdings', 'Performance', 'Asset Allocation'].map((section, i) => (
            <div key={section} style={{ marginBottom: '36px' }}>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '18px', fontWeight: 600, color: 'var(--green)', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                {section}
              </div>
              <div style={{ height: '80px', background: 'var(--sage)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '13px', color: '#9aaa9e', fontStyle: 'italic' }}>
                  {section} data renders with real backend data
                </span>
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: '#8a9e96' }}>Generated by Niom Wealth Management Platform</div>
            <div style={{ fontSize: '11px', color: '#8a9e96' }}>Confidential · Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientReports() {
  const [subjectType, setSubjectType] = useState('investor');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [dateFrom, setDateFrom] = useState({});
  const [dateTo, setDateTo] = useState({});
  const [preview, setPreview] = useState(null);

  const list = subjectType === 'investor' ? mockInvestors : mockFamilies;
  const filtered = list.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = (report) => {
    if (!selected) return;
    setPreview(report);
  };

  return (
    <div>
      {/* Page title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Client Reports
        </h1>
      </div>

      {/* Step 1 — Select Individual or Family */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '28px', marginBottom: '24px',
      }}>
        <div style={{ ...tabLabel, marginBottom: '20px' }}>Step 1 — Select Investor or Family</div>

        {/* Toggle */}
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <div style={{
            display: 'flex', background: 'var(--sage)',
            borderRadius: '100px', padding: '4px', gap: '2px',
          }}>
            {['investor', 'family'].map(type => (
              <button key={type} onClick={() => { setSubjectType(type); setSelected(null); setSearch(''); }} style={{
                padding: '8px 24px', borderRadius: '100px', fontSize: '13px',
                fontWeight: 500, border: 'none', cursor: 'pointer',
                background: subjectType === type ? 'var(--green)' : 'transparent',
                color: subjectType === type ? 'var(--ivory)' : '#7a8a84',
                textTransform: 'capitalize', transition: 'all 0.2s',
              }}>{type}</button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDropdown(true); setSelected(null); }}
            onFocus={() => setShowDropdown(true)}
            placeholder={`Search ${subjectType === 'investor' ? 'investor' : 'family'} name...`}
            style={{
              width: '100%', padding: '12px 16px 12px 40px',
              border: '1.5px solid var(--border)', borderRadius: '10px',
              fontSize: '14px', fontFamily: 'var(--body-font)',
              color: 'var(--charcoal)', background: '#fff', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; setTimeout(() => setShowDropdown(false), 150); }}
          />
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#8a9e96' }}>⌕</span>

          {/* Dropdown */}
          {showDropdown && filtered.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: '10px', boxShadow: 'var(--shadow)', zIndex: 100,
              overflow: 'hidden',
            }}>
              {filtered.map(item => (
                <div key={item.id}
                  onMouseDown={() => { setSelected(item); setSearch(item.name); setShowDropdown(false); }}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', fontSize: '14px',
                    color: 'var(--charcoal)', borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  {item.partner && <div style={{ fontSize: '12px', color: '#8a9e96' }}>{item.partner}</div>}
                  {item.head && <div style={{ fontSize: '12px', color: '#8a9e96' }}>Head: {item.head}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 500 }}>
              {selected.name} selected
            </span>
          </div>
        )}
      </div>

      {/* Step 2 — Select Report */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '28px',
        opacity: selected ? 1 : 0.5,
        pointerEvents: selected ? 'auto' : 'none',
        transition: 'opacity 0.2s',
      }}>
        <div style={{ ...tabLabel, marginBottom: '20px' }}>Step 2 — Select Report Type</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {reports.map(report => (
            <div key={report.id} style={{
              border: `1.5px solid ${selectedReport === report.id ? 'var(--green)' : 'var(--border)'}`,
              borderRadius: '12px', padding: '20px',
              background: selectedReport === report.id ? 'rgba(44,74,62,0.03)' : '#fff',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}>
              {/* Report title + description */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--display-font)', fontSize: '18px', fontWeight: 600, color: 'var(--green)', marginBottom: '4px' }}>
                    {report.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a9e96', lineHeight: 1.5 }}>{report.description}</div>
                </div>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${selectedReport === report.id ? 'var(--green)' : 'var(--border)'}`,
                  background: selectedReport === report.id ? 'var(--green)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: '12px', marginTop: '2px',
                }}>
                  {selectedReport === report.id && <span style={{ color: '#fff', fontSize: '12px', lineHeight: 1 }}>✓</span>}
                </div>
              </div>

              {/* Variants */}
              {selectedReport === report.id && report.variants && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                  {report.variants.map(v => (
                    <button key={v} onClick={() => setSelectedVariant(prev => ({ ...prev, [report.id]: v }))} style={{
                      padding: '6px 12px', borderRadius: '100px', fontSize: '12px',
                      border: '1.5px solid var(--border)',
                      background: selectedVariant[report.id] === v ? 'var(--green)' : '#fff',
                      color: selectedVariant[report.id] === v ? 'var(--ivory)' : '#7a8a84',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}>{v}</button>
                  ))}
                </div>
              )}

              {/* Date range */}
              {selectedReport === report.id && report.dateRange && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                  <input type="date" value={dateFrom[report.id] || ''}
                    onChange={e => setDateFrom(prev => ({ ...prev, [report.id]: e.target.value }))}
                    style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--body-font)', color: 'var(--charcoal)', background: '#fff', outline: 'none' }} />
                  <span style={{ fontSize: '12px', color: '#8a9e96' }}>to</span>
                  <input type="date" value={dateTo[report.id] || ''}
                    onChange={e => setDateTo(prev => ({ ...prev, [report.id]: e.target.value }))}
                    style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontFamily: 'var(--body-font)', color: 'var(--charcoal)', background: '#fff', outline: 'none' }} />
                </div>
              )}

              {/* Formats + Generate */}
              {selectedReport === report.id && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {report.formats.map(fmt => (
                      <span key={fmt} style={{
                        fontSize: '11px', padding: '3px 10px', borderRadius: '100px',
                        background: 'rgba(44,74,62,0.08)', color: 'var(--green)', fontWeight: 600,
                      }}>{fmt}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleGenerate(report)}
                    style={{
                      background: 'var(--green)', color: 'var(--ivory)',
                      border: 'none', borderRadius: '8px',
                      padding: '10px 24px', fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', letterSpacing: '0.06em',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gold)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
                  >
                    Preview Report
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview overlay */}
      {preview && (
        <ReportPreview
          report={preview}
          subject={selected}
          subjectType={subjectType}
          variant={selectedVariant[preview.id]}
          dateFrom={dateFrom[preview.id]}
          dateTo={dateTo[preview.id]}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  );
}
