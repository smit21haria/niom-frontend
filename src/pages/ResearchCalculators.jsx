import { useState, useCallback } from 'react';
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
function formatINRDisplay(v) {
  if (!v && v !== 0) return '—';
  const n = Math.abs(v);
  if (n >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(v / 100000).toFixed(2)} L`;
  if (n >= 1000)     return `₹${(v / 1000).toFixed(1)} K`;
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

function formatInputValue(v) {
  if (!v && v !== 0) return '';
  return Math.round(v).toLocaleString('en-IN');
}

// ── Shared UI components ──────────────────────────────────────────────────────

function ResultBox({ label, value, highlight = false }) {
  return (
    <div style={{
      background: highlight ? 'var(--green)' : 'var(--sage)',
      borderRadius: '12px',
      padding: '16px 20px',
    }}>
      <div style={{ ...tabLabelStyle, fontSize: '10px', marginBottom: '6px', color: highlight ? 'rgba(255,255,255,0.7)' : 'var(--gold)' }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--display-font)',
        fontSize: '20px',
        fontWeight: 700,
        color: highlight ? '#fff' : 'var(--charcoal)',
        lineHeight: 1.1,
      }}>
        {value}
      </div>
    </div>
  );
}

// Slider + number input combo
function SliderInput({ label, value, onChange, min, max, step, suffix = '', prefix = '' }) {
  const handleSlider = (e) => {
    onChange(parseFloat(e.target.value));
  };

  const handleText = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    if (raw === '') { onChange(0); return; }
    const num = parseFloat(raw);
    if (!isNaN(num)) onChange(num);
  };

  const sliderPct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Label + value display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <label style={{ fontSize: '13px', color: '#5a6a64', fontWeight: 500 }}>{label}</label>
        {/* Editable number field */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2px',
          border: '1.5px solid var(--border)', borderRadius: '8px',
          background: '#fff', padding: '5px 10px',
          minWidth: '120px', justifyContent: 'flex-end',
        }}>
          {prefix && <span style={{ fontSize: '13px', color: '#8a9e96', marginRight: '2px' }}>{prefix}</span>}
          <input
            type="text"
            value={formatInputValue(value)}
            onChange={handleText}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: '14px', fontFamily: 'var(--display-font)',
              fontWeight: 600, color: 'var(--charcoal)',
              textAlign: 'right', width: '90px',
            }}
          />
          {suffix && <span style={{ fontSize: '13px', color: '#8a9e96', marginLeft: '2px' }}>{suffix}</span>}
        </div>
      </div>

      {/* Slider */}
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '4px',
          borderRadius: '2px', background: 'var(--border)',
        }}>
          <div style={{
            position: 'absolute', left: 0, width: `${sliderPct}%`,
            height: '100%', borderRadius: '2px', background: 'var(--green)',
          }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(max, Math.max(min, value))}
          onChange={handleSlider}
          style={{
            position: 'absolute', left: 0, right: 0,
            width: '100%', height: '4px',
            appearance: 'none', background: 'transparent',
            cursor: 'pointer', margin: 0,
            // Thumb styling via CSS custom property
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontSize: '10px', color: '#9aaa9e' }}>{prefix}{min.toLocaleString('en-IN')}{suffix}</span>
        <span style={{ fontSize: '10px', color: '#9aaa9e' }}>{prefix}{max.toLocaleString('en-IN')}{suffix}</span>
      </div>
    </div>
  );
}

// Donut chart for SIP / Lumpsum
function InvestedVsReturnsDonut({ invested, returns }) {
  const data = [
    { name: 'Amount Invested', value: Math.max(0, invested) },
    { name: 'Est. Returns',    value: Math.max(0, returns)  },
  ];
  const total = invested + returns;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 200, height: 200, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [formatINRDisplay(v)]}
              contentStyle={{ fontSize: '12px', fontFamily: 'var(--body-font)', border: '1px solid var(--border)', borderRadius: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '10px', color: '#9aaa9e', marginBottom: '2px' }}>Total Value</div>
          <div style={{ fontFamily: 'var(--display-font)', fontSize: '16px', fontWeight: 700, color: 'var(--green)' }}>
            {formatINRDisplay(total)}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: DONUT_COLORS[i], flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#5a6a64' }}>{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SIP Calculator ────────────────────────────────────────────────────────────
function SIPCalc() {
  const [sip, setSip]     = useState(10000);
  const [rate, setRate]   = useState(12);
  const [years, setYears] = useState(10);

  const months   = years * 12;
  const r        = rate / 100 / 12;
  const fv       = r > 0
    ? sip * ((Math.pow(1 + r, months) - 1) / r) * (1 + r)
    : sip * months;
  const invested = sip * months;
  const gains    = fv - invested;
  const cagr     = invested > 0 && years > 0
    ? (Math.pow(fv / invested, 1 / years) - 1) * 100
    : 0;
  const wealthPct = invested > 0 ? (gains / invested) * 100 : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
      {/* Inputs */}
      <div>
        <SliderInput label="Monthly SIP Amount" value={sip} onChange={setSip}
          min={500} max={100000} step={500} prefix="₹" />
        <SliderInput label="Expected Annual Return" value={rate} onChange={setRate}
          min={1} max={30} step={0.5} suffix="%" />
        <SliderInput label="Time Period" value={years} onChange={setYears}
          min={1} max={40} step={1} suffix=" yr" />

        {/* Result boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
          <ResultBox label="Total Invested"     value={formatINRDisplay(invested)} />
          <ResultBox label="Est. Returns"       value={formatINRDisplay(gains)} />
          <ResultBox label="Total Value"        value={formatINRDisplay(fv)} highlight />
          <ResultBox label="CAGR"               value={`${cagr.toFixed(1)}%`} />
          <ResultBox label="Wealth Gained"      value={`${wealthPct.toFixed(1)}%`} />
        </div>
      </div>

      {/* Donut chart */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '16px' }}>
        <InvestedVsReturnsDonut invested={invested} returns={gains} />
      </div>
    </div>
  );
}

// ── Lumpsum Calculator ────────────────────────────────────────────────────────
function LumpsumCalc() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate]           = useState(12);
  const [years, setYears]         = useState(10);

  const fv       = principal * Math.pow(1 + rate / 100, years);
  const gains    = fv - principal;
  const cagr     = rate; // for lumpsum, CAGR = input rate
  const wealthPct = principal > 0 ? (gains / principal) * 100 : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
      {/* Inputs */}
      <div>
        <SliderInput label="Investment Amount" value={principal} onChange={setPrincipal}
          min={10000} max={10000000} step={10000} prefix="₹" />
        <SliderInput label="Expected Annual Return" value={rate} onChange={setRate}
          min={1} max={30} step={0.5} suffix="%" />
        <SliderInput label="Time Period" value={years} onChange={setYears}
          min={1} max={40} step={1} suffix=" yr" />

        {/* Result boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
          <ResultBox label="Amount Invested"   value={formatINRDisplay(principal)} />
          <ResultBox label="Est. Returns"      value={formatINRDisplay(gains)} />
          <ResultBox label="Total Value"       value={formatINRDisplay(fv)} highlight />
          <ResultBox label="CAGR"              value={`${cagr.toFixed(1)}%`} />
          <ResultBox label="Wealth Gained"     value={`${wealthPct.toFixed(1)}%`} />
        </div>
      </div>

      {/* Donut chart */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '16px' }}>
        <InvestedVsReturnsDonut invested={principal} returns={gains} />
      </div>
    </div>
  );
}

// ── SWP Calculator ────────────────────────────────────────────────────────────
function SWPCalc() {
  const [corpus,  setCorpus]  = useState(5000000);
  const [monthly, setMonthly] = useState(30000);
  const [rate,    setRate]    = useState(8);

  const r = rate / 100 / 12;
  // Months until corpus is exhausted
  const months = (r > 0 && monthly > corpus * r)
    ? Math.log(monthly / (monthly - corpus * r)) / Math.log(1 + r)
    : (r === 0 ? corpus / monthly : Infinity);

  const yrs       = months / 12;
  const totalOut  = isFinite(months) ? monthly * months : null;
  const durYrs    = isFinite(yrs) ? Math.floor(yrs) : null;
  const durMths   = isFinite(yrs) ? Math.round((yrs - Math.floor(yrs)) * 12) : null;

  const durStr = durYrs != null
    ? `${durYrs}y ${durMths}m`
    : 'Indefinite';

  return (
    <div style={{ maxWidth: '520px' }}>
      <SliderInput label="Total Corpus" value={corpus} onChange={setCorpus}
        min={100000} max={100000000} step={100000} prefix="₹" />
      <SliderInput label="Monthly Withdrawal" value={monthly} onChange={setMonthly}
        min={1000} max={500000} step={1000} prefix="₹" />
      <SliderInput label="Expected Annual Return" value={rate} onChange={setRate}
        min={1} max={20} step={0.5} suffix="%" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
        <ResultBox label="Corpus Lasts For"    value={durStr} highlight />
        <ResultBox label="Total Amount Withdrawn" value={totalOut ? formatINRDisplay(totalOut) : '—'} />
      </div>
    </div>
  );
}

// ── Goal Planning Calculator ──────────────────────────────────────────────────
function GoalCalc() {
  const [target, setTarget] = useState(10000000);
  const [rate,   setRate]   = useState(12);
  const [years,  setYears]  = useState(15);

  const months  = years * 12;
  const r       = rate / 100 / 12;
  // SIP needed (annuity due)
  const sipNeeded = r > 0
    ? target * r / ((Math.pow(1 + r, months) - 1) * (1 + r))
    : target / months;
  // Lumpsum needed
  const lumpsumNeeded = target / Math.pow(1 + rate / 100, years);
  // Total SIP invested
  const totalSIPInvested = sipNeeded * months;

  return (
    <div style={{ maxWidth: '520px' }}>
      <SliderInput label="Target Goal Amount" value={target} onChange={setTarget}
        min={100000} max={100000000} step={100000} prefix="₹" />
      <SliderInput label="Expected Annual Return" value={rate} onChange={setRate}
        min={1} max={30} step={0.5} suffix="%" />
      <SliderInput label="Time to Goal" value={years} onChange={setYears}
        min={1} max={40} step={1} suffix=" yr" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
        <ResultBox label="Goal Amount"         value={formatINRDisplay(target)} highlight />
        <ResultBox label="Monthly SIP Needed"  value={formatINRDisplay(sipNeeded)} />
        <ResultBox label="Total SIP Investment" value={formatINRDisplay(totalSIPInvested)} />
        <ResultBox label="Lumpsum Needed Today" value={formatINRDisplay(lumpsumNeeded)} />
      </div>
    </div>
  );
}

// ── Calculator list ───────────────────────────────────────────────────────────
const calcList = [
  { id: 'sip',     label: 'SIP Calculator',     component: SIPCalc,     desc: 'Calculate returns on a monthly SIP' },
  { id: 'lumpsum', label: 'Lumpsum Calculator',  component: LumpsumCalc, desc: 'Calculate returns on a one-time investment' },
  { id: 'swp',     label: 'SWP Calculator',      component: SWPCalc,     desc: 'Plan systematic withdrawals from a corpus' },
  { id: 'goal',    label: 'Goal Planning',        component: GoalCalc,    desc: 'Find out how much to invest for a goal' },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function ResearchCalculators() {
  const [active, setActive] = useState('sip');
  const activeCalc = calcList.find(c => c.id === active);
  const ActiveComponent = activeCalc?.component;

  return (
    <div>
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
        {/* Sidebar nav */}
        <div style={{
          width: '220px', flexShrink: 0,
          background: '#fff', borderRadius: '16px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}>
          {calcList.map((calc, i) => {
            const isActive = active === calc.id;
            return (
              <div
                key={calc.id}
                onClick={() => setActive(calc.id)}
                style={{
                  padding: '16px 18px',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${isActive ? 'var(--green)' : 'transparent'}`,
                  borderBottom: i < calcList.length - 1 ? '1px solid var(--border)' : 'none',
                  background: isActive ? 'rgba(44,74,62,0.06)' : '#fff',
                  transition: 'all 0.15s',
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
          {/* Panel header */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)' }}>
            <div style={sectionHead}>{activeCalc?.label}</div>
          </div>

          {/* Calculator content */}
          <div style={{ padding: '28px' }}>
            {/* Slider thumb CSS */}
            <style>{`
              input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 18px; height: 18px;
                border-radius: 50%;
                background: #fff;
                border: 2.5px solid var(--green);
                box-shadow: 0 1px 4px rgba(44,74,62,0.25);
                cursor: pointer;
                margin-top: -7px;
              }
              input[type='range']::-moz-range-thumb {
                width: 18px; height: 18px;
                border-radius: 50%;
                background: #fff;
                border: 2.5px solid var(--green);
                cursor: pointer;
              }
              input[type='range']::-webkit-slider-runnable-track {
                height: 4px;
                border-radius: 2px;
              }
            `}</style>

            {ActiveComponent && <ActiveComponent key={active} />}
          </div>
        </div>
      </div>
    </div>
  );
}
