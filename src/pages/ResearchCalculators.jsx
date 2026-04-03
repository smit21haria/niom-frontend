import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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

const DONUT_COLORS = ['#2C4A3E', '#B8965A'];

// ── Formatting helpers ────────────────────────────────────────────────────────
function fmt(v) {
  if (!v && v !== 0) return '—';
  const n = Math.abs(v);
  if (n >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(v / 100000).toFixed(2)} L`;
  if (n >= 1000)     return `₹${(v / 1000).toFixed(1)} K`;
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

function fmtInput(v) {
  if (!v && v !== 0) return '';
  return Math.round(v).toLocaleString('en-IN');
}

// ── Shared UI components ──────────────────────────────────────────────────────

function ResultBox({ label, value, highlight = false }) {
  return (
    <div style={{
      background: highlight ? 'var(--green)' : 'var(--sage)',
      borderRadius: '12px',
      padding: '20px 24px',
    }}>
      <div style={{
        ...tabLabelStyle,
        fontSize: '10px',
        marginBottom: '8px',
        color: highlight ? 'rgba(255,255,255,0.7)' : 'var(--gold)',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--display-font)',
        fontSize: '26px',
        fontWeight: 700,
        color: highlight ? '#fff' : 'var(--charcoal)',
        lineHeight: 1.1,
      }}>
        {value}
      </div>
    </div>
  );
}

// Slider + editable number field
function SliderInput({ label, value, onChange, min, max, step, suffix = '', prefix = '' }) {
  const handleSlider = (e) => onChange(parseFloat(e.target.value));

  const handleText = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    if (raw === '') { onChange(0); return; }
    const num = parseFloat(raw);
    if (!isNaN(num)) onChange(num);
  };

  const sliderPct = Math.min(100, Math.max(0, ((Math.min(value, max) - min) / (max - min)) * 100));

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Label row + value field */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <label style={{ fontSize: '14px', color: '#5a6a64', fontWeight: 500 }}>{label}</label>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          border: '1.5px solid var(--border)', borderRadius: '8px',
          background: '#fff', padding: '7px 12px',
        }}>
          {prefix && <span style={{ fontSize: '14px', color: '#8a9e96' }}>{prefix}</span>}
          <input
            type="text"
            value={fmtInput(value)}
            onChange={handleText}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '15px', fontFamily: 'var(--display-font)',
              fontWeight: 600, color: 'var(--charcoal)',
              textAlign: 'right', width: '110px',
            }}
          />
          {suffix && <span style={{ fontSize: '14px', color: '#8a9e96', marginLeft: '2px' }}>{suffix}</span>}
        </div>
      </div>

      {/* Track + thumb */}
      <div style={{ position: 'relative', height: '22px', display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '5px',
          borderRadius: '3px', background: '#e0e8e4',
        }}>
          <div style={{
            position: 'absolute', left: 0, width: `${sliderPct}%`,
            height: '100%', borderRadius: '3px', background: 'var(--green)',
          }} />
        </div>
        <input
          type="range"
          min={min} max={max} step={step}
          value={Math.min(max, Math.max(min, value))}
          onChange={handleSlider}
          style={{
            position: 'absolute', left: 0, right: 0,
            width: '100%', height: '5px',
            appearance: 'none', background: 'transparent',
            cursor: 'pointer', margin: 0,
          }}
        />
      </div>

      {/* Min / Max labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
        <span style={{ fontSize: '11px', color: '#9aaa9e' }}>
          {prefix}{min.toLocaleString('en-IN')}{suffix}
        </span>
        <span style={{ fontSize: '11px', color: '#9aaa9e' }}>
          {prefix}{max.toLocaleString('en-IN')}{suffix}
        </span>
      </div>
    </div>
  );
}

// Donut chart (Invested vs Returns)
function InvestedVsReturnsDonut({ invested, returns }) {
  const data = [
    { name: 'Amount Invested', value: Math.max(0, invested) },
    { name: 'Est. Returns',    value: Math.max(0, returns)  },
  ];
  const total = Math.max(0, invested) + Math.max(0, returns);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 220, height: 220, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={70} outerRadius={98}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
            </Pie>
            <Tooltip
              formatter={(v) => [fmt(v)]}
              contentStyle={{ fontSize: '13px', fontFamily: 'var(--body-font)', border: '1px solid var(--border)', borderRadius: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '11px', color: '#9aaa9e', marginBottom: '3px' }}>Total Value</div>
          <div style={{ fontFamily: 'var(--display-font)', fontSize: '18px', fontWeight: 700, color: 'var(--green)' }}>
            {fmt(total)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '12px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <div style={{ width: '11px', height: '11px', borderRadius: '2px', background: DONUT_COLORS[i], flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#5a6a64' }}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SIP Calculator ────────────────────────────────────────────────────────────
function SIPCalc() {
  const [sip,   setSip]   = useState(10000);
  const [rate,  setRate]  = useState(12);
  const [years, setYears] = useState(10);

  const months    = years * 12;
  const r         = rate / 100 / 12;
  const fv        = r > 0
    ? sip * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
    : sip * months;
  const invested  = sip * months;
  const gains     = fv - invested;
  const wealthPct = invested > 0 ? (gains / invested) * 100 : 0;

  return (
    <div>
      {/* Sliders — full width */}
      <div style={{ marginBottom: '8px' }}>
        <SliderInput label="Monthly SIP Amount"    value={sip}   onChange={setSip}   min={500}   max={100000} step={500}  prefix="₹" />
        <SliderInput label="Expected Annual Return" value={rate}  onChange={setRate}  min={1}     max={30}     step={0.5}  suffix="%" />
        <SliderInput label="Time Period"            value={years} onChange={setYears} min={1}     max={40}     step={1}    suffix=" yr" />
      </div>

      {/* Results + Donut — side by side */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px', display: 'flex', gap: '48px', alignItems: 'center' }}>
        {/* Result boxes */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <ResultBox label="Total Invested"  value={fmt(invested)} />
          <ResultBox label="Est. Returns"    value={fmt(gains)} />
          <ResultBox label="Total Value"     value={fmt(fv)} highlight />
          <ResultBox label="Wealth Gained"   value={`${wealthPct.toFixed(1)}%`} />
        </div>

        {/* Donut */}
        <div style={{ flexShrink: 0 }}>
          <InvestedVsReturnsDonut invested={invested} returns={gains} />
        </div>
      </div>
    </div>
  );
}

// ── Lumpsum Calculator ────────────────────────────────────────────────────────
function LumpsumCalc() {
  const [principal, setPrincipal] = useState(100000);
  const [rate,      setRate]      = useState(12);
  const [years,     setYears]     = useState(10);

  const fv        = principal * Math.pow(1 + rate / 100, years);
  const gains     = fv - principal;
  const wealthPct = principal > 0 ? (gains / principal) * 100 : 0;

  return (
    <div>
      {/* Sliders */}
      <div style={{ marginBottom: '8px' }}>
        <SliderInput label="Investment Amount"     value={principal} onChange={setPrincipal} min={10000} max={10000000} step={10000} prefix="₹" />
        <SliderInput label="Expected Annual Return" value={rate}      onChange={setRate}      min={1}     max={30}       step={0.5}  suffix="%" />
        <SliderInput label="Time Period"            value={years}     onChange={setYears}     min={1}     max={40}       step={1}    suffix=" yr" />
      </div>

      {/* Results + Donut */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px', display: 'flex', gap: '48px', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <ResultBox label="Amount Invested" value={fmt(principal)} />
          <ResultBox label="Est. Returns"    value={fmt(gains)} />
          <ResultBox label="Total Value"     value={fmt(fv)} highlight />
          <ResultBox label="Wealth Gained"   value={`${wealthPct.toFixed(1)}%`} />
        </div>
        <div style={{ flexShrink: 0 }}>
          <InvestedVsReturnsDonut invested={principal} returns={gains} />
        </div>
      </div>
    </div>
  );
}

// ── SWP Calculator ────────────────────────────────────────────────────────────
function SWPCalc() {
  const [corpus,  setCorpus]  = useState(5000000);
  const [monthly, setMonthly] = useState(30000);
  const [rate,    setRate]    = useState(8);

  const r      = rate / 100 / 12;
  const months = (r > 0 && monthly > corpus * r)
    ? Math.log(monthly / (monthly - corpus * r)) / Math.log(1 + r)
    : r === 0 ? corpus / monthly : Infinity;

  const yrs      = months / 12;
  const totalOut = isFinite(months) ? monthly * months : null;
  const durYrs   = isFinite(yrs) ? Math.floor(yrs) : null;
  const durMths  = isFinite(yrs) ? Math.round((yrs % 1) * 12) : null;
  const durStr   = durYrs != null ? `${durYrs}y ${durMths}m` : 'Indefinite';

  return (
    <div>
      <SliderInput label="Total Corpus"          value={corpus}  onChange={setCorpus}  min={100000} max={100000000} step={100000} prefix="₹" />
      <SliderInput label="Monthly Withdrawal"    value={monthly} onChange={setMonthly} min={1000}   max={500000}    step={1000}   prefix="₹" />
      <SliderInput label="Expected Annual Return" value={rate}    onChange={setRate}    min={1}      max={20}        step={0.5}    suffix="%" />

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <ResultBox label="Corpus Lasts For"       value={durStr} highlight />
        <ResultBox label="Total Amount Withdrawn" value={totalOut ? fmt(totalOut) : '—'} />
      </div>
    </div>
  );
}

// ── Goal Planning Calculator ──────────────────────────────────────────────────
function GoalCalc() {
  const [target, setTarget] = useState(10000000);
  const [rate,   setRate]   = useState(12);
  const [years,  setYears]  = useState(15);

  const months         = years * 12;
  const r              = rate / 100 / 12;
  const sipNeeded      = r > 0
    ? target * r / ((Math.pow(1 + r, months) - 1) * (1 + r))
    : target / months;
  const lumpsumNeeded  = target / Math.pow(1 + rate / 100, years);
  const totalSIPInvest = sipNeeded * months;

  return (
    <div>
      <SliderInput label="Target Goal Amount"    value={target} onChange={setTarget} min={100000} max={100000000} step={100000} prefix="₹" />
      <SliderInput label="Expected Annual Return" value={rate}   onChange={setRate}  min={1}      max={30}        step={0.5}   suffix="%" />
      <SliderInput label="Time to Goal"          value={years}  onChange={setYears} min={1}      max={40}        step={1}     suffix=" yr" />

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <ResultBox label="Goal Amount"          value={fmt(target)} highlight />
        <ResultBox label="Monthly SIP Needed"   value={fmt(sipNeeded)} />
        <ResultBox label="Total SIP Investment" value={fmt(totalSIPInvest)} />
        <ResultBox label="Lumpsum Needed Today" value={fmt(lumpsumNeeded)} />
      </div>
    </div>
  );
}

// ── Calculator list ───────────────────────────────────────────────────────────
const calcList = [
  { id: 'sip',     label: 'SIP Calculator',    component: SIPCalc,     desc: 'Calculate returns on a monthly SIP' },
  { id: 'lumpsum', label: 'Lumpsum Calculator', component: LumpsumCalc, desc: 'Calculate returns on a one-time investment' },
  { id: 'swp',     label: 'SWP Calculator',     component: SWPCalc,     desc: 'Plan systematic withdrawals from a corpus' },
  { id: 'goal',    label: 'Goal Planning',       component: GoalCalc,    desc: 'Find out how much to invest for a goal' },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function ResearchCalculators() {
  const [active, setActive] = useState('sip');
  const activeCalc      = calcList.find(c => c.id === active);
  const ActiveComponent = activeCalc?.component;

  return (
    <div>
      {/* Slider CSS */}
      <style>{`
        input[type='range'] { -webkit-appearance: none; appearance: none; }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #fff; border: 2.5px solid #2C4A3E;
          box-shadow: 0 1px 5px rgba(44,74,62,0.2);
          cursor: pointer; margin-top: -7.5px;
        }
        input[type='range']::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%;
          background: #fff; border: 2.5px solid #2C4A3E;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-runnable-track { height: 5px; border-radius: 3px; }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Calculators
        </h1>
        <p style={{ fontSize: '13px', color: '#8a9e96', marginTop: '6px' }}>
          Financial planning tools for client conversations
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={{
          width: '220px', flexShrink: 0,
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          overflow: 'hidden', position: 'sticky', top: '20px',
        }}>
          {calcList.map((calc, i) => {
            const isActive = active === calc.id;
            return (
              <div
                key={calc.id}
                onClick={() => setActive(calc.id)}
                style={{
                  padding: '16px 18px', cursor: 'pointer',
                  borderLeft: `3px solid ${isActive ? 'var(--green)' : 'transparent'}`,
                  borderBottom: i < calcList.length - 1 ? '1px solid var(--border)' : 'none',
                  background: isActive ? 'rgba(44,74,62,0.06)' : '#fff',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--sage)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#fff'; }}
              >
                <div style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--green)' : 'var(--charcoal)', marginBottom: '3px' }}>
                  {calc.label}
                </div>
                <div style={{ fontSize: '11px', color: '#9aaa9e', lineHeight: 1.4 }}>
                  {calc.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calculator panel */}
        <div style={{
          flex: 1,
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border)' }}>
            <span style={sectionHead}>{activeCalc?.label}</span>
          </div>
          <div style={{ padding: '32px' }}>
            {ActiveComponent && <ActiveComponent key={active} />}
          </div>
        </div>
      </div>
    </div>
  );
}
