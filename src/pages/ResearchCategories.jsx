import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { research } from '../lib/api';

// ── Design tokens ─────────────────────────────────────────────────────────────
const sectionHead = {
  fontFamily: 'var(--display-font)',
  fontSize: '22px',
  fontWeight: 600,
  color: 'var(--green)',
};

const tabLabelStyle = {
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: 'var(--gold)',
  fontWeight: 600,
};

// ── Manual ordering per group ─────────────────────────────────────────────────
// Each entry is a substring to match against VR category names (case-insensitive)
// The position in the array determines the sort order within the group

const GROUP_ORDER = {
  Equity: [
    'large cap',
    'large & mid cap',
    'large and mid cap',
    'mid cap',
    'small cap',
    'multi cap',
    'flexi cap',
    'focused',
    'contra',
    'value',
    'elss',
    'tax',
    'sectoral',
    'thematic',
    'dividend yield',
  ],
  Debt: [
    'overnight',
    'liquid',
    'ultra short',
    'low duration',
    'money market',
    'short duration',
    'medium duration',
    'medium to long',
    'long duration',
    'dynamic bond',
    'corporate bond',
    'credit risk',
    'banking & psu',
    'banking and psu',
    'gilt with 10',
    'gilt',
    'floater',
  ],
  Hybrid: [
    'conservative hybrid',
    'balanced hybrid',
    'aggressive hybrid',
    'dynamic asset',
    'multi asset',
    'arbitrage',
    'equity savings',
  ],
  Others: [
    'index',
    'etf',
    'fund of fund',
    'overseas',
    'international',
    'gold',
    'silver',
    'commodity',
  ],
};

// Keywords that identify which top-level group a category belongs to
const GROUP_KEYWORDS = {
  Equity: ['equity', 'elss', 'tax saving', 'large cap', 'mid cap', 'small cap',
    'flexi cap', 'multi cap', 'focused', 'contra', 'value', 'dividend', 'sectoral', 'thematic'],
  Debt: ['debt', 'bond', 'duration', 'liquid', 'overnight', 'money market',
    'credit', 'gilt', 'floater', 'banking', 'psu', 'corporate'],
  Hybrid: ['hybrid', 'balanced', 'arbitrage', 'dynamic asset', 'multi asset', 'equity savings'],
};

function classifyGroup(categoryName) {
  const lower = categoryName.toLowerCase();
  for (const [group, keywords] of Object.entries(GROUP_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return group;
  }
  return 'Others';
}

function getOrderIndex(categoryName, group) {
  const lower = categoryName.toLowerCase();
  const order = GROUP_ORDER[group] || [];
  // Find the first keyword that matches
  for (let i = 0; i < order.length; i++) {
    if (lower.includes(order[i])) return i;
  }
  return order.length; // unmatched goes to end
}

function riskLabel(avgRiskRating) {
  if (avgRiskRating == null) return '—';
  const v = parseFloat(avgRiskRating);
  if (v < 2)   return 'Low';
  if (v < 3)   return 'Moderate';
  if (v < 4)   return 'High';
  return 'Very High';
}

const riskColor = {
  'Low':       { color: '#4caf82',     bg: 'rgba(76,175,130,0.10)' },
  'Moderate':  { color: '#e6a817',     bg: 'rgba(230,168,23,0.10)' },
  'High':      { color: '#e8874a',     bg: 'rgba(232,135,74,0.10)' },
  'Very High': { color: '#c05050',     bg: 'rgba(192,80,80,0.10)'  },
};

function SkeletonRows({ count = 6 }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i}>
      {[200, 60, 80, 80, 80, 80].map((w, j) => (
        <td key={j} style={{ padding: '14px 20px' }}>
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
  ));
}

function CategoryTable({ categories, navigate }) {
  if (!categories.length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#9aaa9e', fontSize: '13px' }}>
        No categories available
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--sage)' }}>
            {['Category', '# Funds', 'Risk', '1Y Avg Return', '3Y Avg Return', '5Y Avg Return'].map(h => (
              <th key={h} style={{
                padding: '11px 20px',
                textAlign: h === 'Category' ? 'left' : 'right',
                ...tabLabelStyle,
                fontFamily: 'var(--body-font)',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, i) => {
            const risk  = riskLabel(cat.avg_risk_rating);
            const riskC = riskColor[risk] || {};
            const fmtR  = v => v != null ? `${parseFloat(v).toFixed(1)}%` : '—';

            return (
              <tr
                key={cat.category_id}
                style={{
                  borderTop: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  background: i % 2 === 0 ? '#fff' : 'rgba(239,242,238,0.3)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sage)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : 'rgba(239,242,238,0.3)'}
                onClick={() => navigate(`/research/funds?category_id=${cat.category_id}`)}
              >
                {/* Category Name */}
                <td style={{
                  padding: '14px 20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--green)',
                  textDecoration: 'none',
                }}>
                  {cat.category_name}
                </td>

                {/* Fund Count */}
                <td style={{
                  padding: '14px 20px',
                  textAlign: 'right',
                  fontFamily: 'var(--display-font)',
                  fontSize: '14px',
                  color: 'var(--charcoal)',
                }}>
                  {cat.fund_count || '—'}
                </td>

                {/* Risk Label */}
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  {risk !== '—' ? (
                    <span style={{
                      fontSize: '11px', fontWeight: 600,
                      padding: '3px 10px', borderRadius: '100px',
                      background: riskC.bg, color: riskC.color,
                      letterSpacing: '0.04em',
                    }}>{risk}</span>
                  ) : <span style={{ color: '#ccc', fontSize: '13px' }}>—</span>}
                </td>

                {/* Returns */}
                {[cat.avg_ret_1yr, cat.avg_ret_3yr, cat.avg_ret_5yr].map((ret, ri) => (
                  <td key={ri} style={{
                    padding: '14px 20px',
                    textAlign: 'right',
                    fontFamily: 'var(--display-font)',
                    fontSize: '14px',
                    color: 'var(--charcoal)',
                    whiteSpace: 'nowrap',
                  }}>
                    {fmtR(ret)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ResearchCategories() {
  const navigate            = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await research.categories();
        setCategories(Array.isArray(data) ? data : []);
      } catch(e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Group and sort categories
  const grouped = { Equity: [], Debt: [], Hybrid: [], Others: [] };

  if (!loading && !error) {
    categories.forEach(cat => {
      const group = classifyGroup(cat.category_name);
      grouped[group].push(cat);
    });
    // Sort within each group by manual order
    Object.keys(grouped).forEach(group => {
      grouped[group].sort((a, b) => {
        const ai = getOrderIndex(a.category_name, group);
        const bi = getOrderIndex(b.category_name, group);
        return ai - bi;
      });
    });
  }

  const GROUP_LABELS = {
    Equity:  { label: 'Equity',  subtitle: 'Growth-oriented funds investing primarily in stocks' },
    Debt:    { label: 'Debt',    subtitle: 'Income-oriented funds investing in fixed income instruments' },
    Hybrid:  { label: 'Hybrid',  subtitle: 'Funds that invest across both equity and debt' },
    Others:  { label: 'Others',  subtitle: 'Index funds, ETFs, international and alternative funds' },
  };

  return (
    <div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Category Analysis
        </h1>
        <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '6px' }}>
          Browse mutual fund categories — click any category to explore funds within it
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', padding: '40px',
          textAlign: 'center', color: '#c05050', fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* Grouped sections */}
      {Object.entries(GROUP_LABELS).map(([group, { label, subtitle }]) => (
        <div key={group} style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
          marginBottom: '20px',
        }}>
          {/* Section header */}
          <div style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'baseline',
            gap: '12px',
          }}>
            <span style={sectionHead}>{label}</span>
            <span style={{ fontSize: '12px', color: '#9aaa9e' }}>{subtitle}</span>
            {!loading && (
              <span style={{
                marginLeft: 'auto',
                fontSize: '12px', color: '#9aaa9e',
              }}>
                {grouped[group].length} categories
              </span>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--sage)' }}>
                    {['Category', '# Funds', 'Risk', '1Y Avg Return', '3Y Avg Return', '5Y Avg Return'].map(h => (
                      <th key={h} style={{ padding: '11px 20px', textAlign: h === 'Category' ? 'left' : 'right', ...tabLabelStyle, fontFamily: 'var(--body-font)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <SkeletonRows count={group === 'Equity' ? 8 : group === 'Debt' ? 8 : 4} />
                </tbody>
              </table>
            </div>
          ) : (
            <CategoryTable
              categories={grouped[group]}
              navigate={navigate}
            />
          )}
        </div>
      ))}
    </div>
  );
}
