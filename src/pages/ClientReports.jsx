import { useState, useEffect, useRef } from 'react';
import { investors, families, getUserRole } from '../lib/api';

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

const reports = [
  {
    id: 'portfolio',
    title: 'Portfolio Report',
    description: 'Complete portfolio snapshot with holdings, allocation and performance',
    formats: ['PDF'],
    routeType: 'portfolio',
  },
  {
    id: 'returns',
    title: 'Returns Report',
    description: 'Trailing and calendar returns across all holdings',
    formats: ['PDF'],
    routeType: null, // coming soon
  },
  {
    id: 'holdings',
    title: 'Holdings Report',
    description: 'Current holdings snapshot with units, NAV and market value',
    formats: ['PDF', 'Excel'],
    routeType: null,
  },
  {
    id: 'capital_gains',
    title: 'Capital Gains Report',
    description: 'STCG and LTCG breakdown for the selected period',
    formats: ['PDF', 'Excel'],
    routeType: null,
  },
  {
    id: 'transactions',
    title: 'Transaction History',
    description: 'Complete transaction log including SIP, SWP and STP',
    formats: ['PDF', 'Excel'],
    routeType: null,
  },
];

export default function ClientReports() {
  const [subjectType, setSubjectType]   = useState('investor');
  const [searchInput, setSearchInput]   = useState('');
  const [results, setResults]           = useState([]);
  const [selected, setSelected]         = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching]       = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const dropdownRef = useRef(null);
  const isPartner = getUserRole() === 'partner';

  // Debounced search against real API
  useEffect(() => {
    if (!searchInput.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        if (subjectType === 'investor') {
          const r = await investors.list({ search: searchInput, limit: 8 });
          setResults(r.investors || []);
        } else {
          const r = await families.list({ search: searchInput, limit: 8 });
          setResults(r.families || []);
        }
        setShowDropdown(true);
      } catch(e) {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput, subjectType]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (item) => {
    setSelected(item);
    setSearchInput(
      subjectType === 'investor'
        ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
        : item.name
    );
    setShowDropdown(false);
  };

  const handleGenerate = (report) => {
    if (!selected || !report.routeType) return;
    const url = `/report/${report.routeType}/${subjectType}/${selected.id}`;
    window.open(url, '_blank');
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid var(--border)', borderRadius: '8px',
    fontSize: '13px', fontFamily: 'var(--body-font)',
    color: 'var(--charcoal)', background: '#fff', outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Client Reports
        </h1>
        <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '6px' }}>
          Generate and download reports for investors and families
        </p>
      </div>

      {/* Step 1 — Select Investor or Family */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '28px', marginBottom: '24px' }}>
        <div style={{ ...tabLabel, marginBottom: '20px' }}>Step 1 — Select Investor or Family</div>

        {/* Toggle */}
        <div style={{ display: 'flex', marginBottom: '20px' }}>
          <div style={{ display: 'flex', background: 'var(--sage)', borderRadius: '100px', padding: '4px', gap: '2px' }}>
            {['investor', 'family'].map(type => (
              <button
                key={type}
                onClick={() => { setSubjectType(type); setSelected(null); setSearchInput(''); setResults([]); }}
                style={{
                  padding: '8px 24px', borderRadius: '100px', fontSize: '13px',
                  fontWeight: 500, border: 'none', cursor: 'pointer',
                  background: subjectType === type ? 'var(--green)' : 'transparent',
                  color: subjectType === type ? 'var(--ivory)' : '#7a8a84',
                  textTransform: 'capitalize', transition: 'all 0.2s',
                  fontFamily: 'var(--body-font)',
                }}
              >{type}</button>
            ))}
          </div>
        </div>

        {/* Search with dropdown */}
        <div style={{ position: 'relative', maxWidth: '440px' }} ref={dropdownRef}>
          <div style={{ position: 'relative' }}>
            <input
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setSelected(null); setShowDropdown(true); }}
              onFocus={() => { if (results.length) setShowDropdown(true); }}
              placeholder={`Search ${subjectType === 'investor' ? 'investor name or PAN' : 'family name'}...`}
              style={inputStyle}
            />
            {searching && (
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#9aaa9e' }}>
                Searching...
              </div>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && results.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
              background: '#fff', borderRadius: '10px', marginTop: '4px',
              border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(44,74,62,0.12)',
              overflow: 'hidden',
            }}>
              {results.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer',
                    borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '2px' }}>
                    {subjectType === 'investor'
                      ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
                      : item.name
                    }
                  </div>
                  <div style={{ fontSize: '11px', color: '#9aaa9e' }}>
                    {subjectType === 'investor'
                      ? [item.pan, ...(!isPartner && item.partner_name ? [item.partner_name] : [])].filter(Boolean).join(' · ')
                      : [item.head_investor_name, ...(!isPartner && item.partner_name ? [item.partner_name] : [])].filter(Boolean).join(' · ')
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected subject confirmation */}
        {selected && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(44,74,62,0.10)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 600, color: 'var(--green)',
            }}>
              {subjectType === 'investor'
                ? (selected.first_name?.[0] || '') + (selected.last_name?.[0] || '')
                : selected.name?.[0] || 'F'
              }
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--charcoal)' }}>
                {subjectType === 'investor'
                  ? `${selected.first_name || ''} ${selected.last_name || ''}`.trim()
                  : selected.name
                }
              </div>
              <div style={{ fontSize: '11px', color: '#9aaa9e' }}>
                {subjectType === 'investor'
                  ? [selected.pan, ...(!isPartner && selected.partner_name ? [selected.partner_name] : [])].filter(Boolean).join(' · ')
                  : [selected.head_investor_name, `${selected.member_count || 0} members`].filter(Boolean).join(' · ')
                }
              </div>
            </div>
            <button
              onClick={() => { setSelected(null); setSearchInput(''); }}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9aaa9e', fontSize: '18px', padding: '4px' }}
            >×</button>
          </div>
        )}
      </div>

      {/* Step 2 — Select Report */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', padding: '28px' }}>
        <div style={{ ...tabLabel, marginBottom: '20px' }}>Step 2 — Select Report Type</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {reports.map((report, i) => {
            const isAvailable = !!report.routeType;
            const isSelected  = selectedReport?.id === report.id;
            return (
              <div
                key={report.id}
                onClick={() => isAvailable && setSelectedReport(isSelected ? null : report)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '20px',
                  padding: '18px 20px',
                  borderRadius: i === 0 ? '10px 10px 0 0' : i === reports.length - 1 ? '0 0 10px 10px' : '0',
                  border: '1px solid var(--border)',
                  borderTop: i === 0 ? '1px solid var(--border)' : 'none',
                  background: isSelected ? 'rgba(44,74,62,0.04)' : '#fff',
                  cursor: isAvailable ? 'pointer' : 'default',
                  opacity: isAvailable ? 1 : 0.5,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (isAvailable && !isSelected) e.currentTarget.style.background = 'var(--sage)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#fff'; }}
              >
                {/* Radio indicator */}
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${isSelected ? 'var(--green)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--green)' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                </div>

                {/* Report info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--charcoal)', marginBottom: '3px' }}>
                    {report.title}
                    {!isAvailable && (
                      <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', background: 'var(--sage)', color: '#9aaa9e', letterSpacing: '0.06em' }}>
                        COMING SOON
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a9e96' }}>{report.description}</div>
                </div>

                {/* Format badges */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {report.formats.map(f => (
                    <span key={f} style={{
                      fontSize: '10px', fontWeight: 600, padding: '3px 8px',
                      borderRadius: '100px', letterSpacing: '0.06em',
                      background: f === 'PDF' ? 'rgba(184,150,90,0.12)' : 'rgba(44,74,62,0.08)',
                      color: f === 'PDF' ? 'var(--gold)' : 'var(--green)',
                    }}>{f}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Generate button */}
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => selectedReport && selected && handleGenerate(selectedReport)}
            disabled={!selected || !selectedReport || !selectedReport.routeType}
            style={{
              padding: '12px 32px', borderRadius: '8px',
              background: (!selected || !selectedReport || !selectedReport.routeType) ? 'var(--sage)' : 'var(--green)',
              color: (!selected || !selectedReport || !selectedReport.routeType) ? '#9aaa9e' : 'var(--ivory)',
              border: 'none', fontSize: '14px', fontWeight: 500,
              cursor: (!selected || !selectedReport || !selectedReport.routeType) ? 'default' : 'pointer',
              fontFamily: 'var(--body-font)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (selected && selectedReport?.routeType) e.currentTarget.style.background = 'var(--gold)'; }}
            onMouseLeave={e => { if (selected && selectedReport?.routeType) e.currentTarget.style.background = 'var(--green)'; }}
          >
            Generate Report
          </button>

          {(!selected || !selectedReport) && (
            <span style={{ fontSize: '12px', color: '#9aaa9e' }}>
              {!selected ? 'Select an investor or family first' : 'Select a report type'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
