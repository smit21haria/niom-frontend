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

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1.5px solid var(--border)', borderRadius: '8px',
  fontSize: '14px', fontFamily: 'var(--body-font)',
  color: 'var(--charcoal)', background: '#fff', outline: 'none',
};

function ResultBox({ label, value }) {
  return (
    <div style={{
      background: 'var(--sage)', borderRadius: '10px',
      padding: '16px 20px', textAlign: 'center',
    }}>
      <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '28px', fontWeight: 600, color: 'var(--green)' }}>{value}</div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ ...tabLabel, fontSize: '10px', marginBottom: '6px' }}>{children}</div>;
}

function SIPCalc() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const months = years * 12;
  const r = rate / 100 / 12;
  const fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  const invested = monthly * months;
  const gains = fv - invested;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div><Label>Monthly SIP (₹)</Label><input type="number" value={monthly} onChange={e => setMonthly(+e.target.value)} style={inputStyle} /></div>
        <div><Label>Expected Return (% p.a.)</Label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} style={inputStyle} /></div>
        <div><Label>Time Period (Years)</Label><input type="number" value={years} onChange={e => setYears(+e.target.value)} style={inputStyle} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <ResultBox label="Total Invested" value={`₹${(invested/100000).toFixed(2)}L`} />
        <ResultBox label="Estimated Returns" value={`₹${(gains/100000).toFixed(2)}L`} />
        <ResultBox label="Total Value" value={`₹${(fv/100000).toFixed(2)}L`} />
      </div>
    </div>
  );
}

function LumpsumCalc() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const fv = principal * Math.pow(1 + rate / 100, years);
  const gains = fv - principal;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div><Label>Investment Amount (₹)</Label><input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} style={inputStyle} /></div>
        <div><Label>Expected Return (% p.a.)</Label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} style={inputStyle} /></div>
        <div><Label>Time Period (Years)</Label><input type="number" value={years} onChange={e => setYears(+e.target.value)} style={inputStyle} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <ResultBox label="Amount Invested" value={`₹${(principal/100000).toFixed(2)}L`} />
        <ResultBox label="Estimated Returns" value={`₹${(gains/100000).toFixed(2)}L`} />
        <ResultBox label="Total Value" value={`₹${(fv/100000).toFixed(2)}L`} />
      </div>
    </div>
  );
}

function SWPCalc() {
  const [corpus, setCorpus] = useState(1000000);
  const [monthly, setMonthly] = useState(8000);
  const [rate, setRate] = useState(10);
  const r = rate / 100 / 12;
  const months = r > 0 ? Math.log(monthly / (monthly - corpus * r)) / Math.log(1 + r) : corpus / monthly;
  const years = months / 12;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div><Label>Total Corpus (₹)</Label><input type="number" value={corpus} onChange={e => setCorpus(+e.target.value)} style={inputStyle} /></div>
        <div><Label>Monthly Withdrawal (₹)</Label><input type="number" value={monthly} onChange={e => setMonthly(+e.target.value)} style={inputStyle} /></div>
        <div><Label>Expected Return (% p.a.)</Label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} style={inputStyle} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <ResultBox label="Corpus Lasts For" value={isFinite(years) && years > 0 ? `${years.toFixed(1)} years` : '∞'} />
        <ResultBox label="Total Withdrawal" value={isFinite(months) ? `₹${(monthly * months / 100000).toFixed(2)}L` : '—'} />
      </div>
    </div>
  );
}

function CompoundingCalc() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [freq, setFreq] = useState(1);
  const fv = principal * Math.pow(1 + rate / 100 / freq, freq * years);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div><Label>Principal (₹)</Label><input type="number" value={principal} onChange={e => setPrincipal(+e.target.value)} style={inputStyle} /></div>
        <div><Label>Rate (% p.a.)</Label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} style={inputStyle} /></div>
        <div><Label>Time (Years)</Label><input type="number" value={years} onChange={e => setYears(+e.target.value)} style={inputStyle} /></div>
        <div>
          <Label>Compounding</Label>
          <select value={freq} onChange={e => setFreq(+e.target.value)} style={{ ...inputStyle }}>
            <option value={1}>Annually</option>
            <option value={2}>Half-yearly</option>
            <option value={4}>Quarterly</option>
            <option value={12}>Monthly</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <ResultBox label="Principal" value={`₹${(principal/100000).toFixed(2)}L`} />
        <ResultBox label="Interest Earned" value={`₹${((fv-principal)/100000).toFixed(2)}L`} />
        <ResultBox label="Maturity Value" value={`₹${(fv/100000).toFixed(2)}L`} />
      </div>
    </div>
  );
}

function GoalCalc() {
  const [target, setTarget] = useState(5000000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const months = years * 12;
  const r = rate / 100 / 12;
  const sip = target * r / ((Math.pow(1 + r, months) - 1) * (1 + r));
  const lumpsum = target / Math.pow(1 + rate / 100, years);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div><Label>Target Amount (₹)</Label><input type="number" value={target} onChange={e => setTarget(+e.target.value)} style={inputStyle} /></div>
        <div><Label>Expected Return (% p.a.)</Label><input type="number" value={rate} onChange={e => setRate(+e.target.value)} style={inputStyle} /></div>
        <div><Label>Time to Goal (Years)</Label><input type="number" value={years} onChange={e => setYears(+e.target.value)} style={inputStyle} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <ResultBox label="Goal Amount" value={`₹${(target/100000).toFixed(2)}L`} />
        <ResultBox label="Monthly SIP Needed" value={`₹${Math.round(sip).toLocaleString()}`} />
        <ResultBox label="Lumpsum Needed Today" value={`₹${(lumpsum/100000).toFixed(2)}L`} />
      </div>
    </div>
  );
}

const calcList = [
  { id: 'sip', label: 'SIP Calculator', component: SIPCalc },
  { id: 'lumpsum', label: 'Lumpsum Calculator', component: LumpsumCalc },
  { id: 'swp', label: 'SWP Calculator', component: SWPCalc },
  { id: 'compounding', label: 'Compounding Calculator', component: CompoundingCalc },
  { id: 'goal', label: 'Goal Planning', component: GoalCalc },
];

export default function ResearchCalculators() {
  const [active, setActive] = useState('sip');
  const ActiveCalc = calcList.find(c => c.id === active)?.component;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '34px', fontWeight: 600, color: 'var(--green)' }}>
          Calculators
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Calculator selector */}
        <div style={{
          width: '200px', flexShrink: 0,
          background: '#fff', borderRadius: '12px',
          border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}>
          {calcList.map(calc => (
            <div key={calc.id}
              onClick={() => setActive(calc.id)}
              style={{
                padding: '14px 16px', cursor: 'pointer', fontSize: '13px',
                fontWeight: active === calc.id ? 600 : 400,
                color: active === calc.id ? 'var(--green)' : '#5a6a64',
                background: active === calc.id ? 'rgba(44,74,62,0.08)' : '#fff',
                borderLeft: active === calc.id ? '3px solid var(--green)' : '3px solid transparent',
                borderBottom: '1px solid var(--border)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (active !== calc.id) { e.currentTarget.style.background = 'var(--sage)'; e.currentTarget.style.color = 'var(--green)'; }}}
              onMouseLeave={e => { if (active !== calc.id) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#5a6a64'; }}}
            >
              {calc.label}
            </div>
          ))}
        </div>

        {/* Active calculator */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
            padding: '28px',
          }}>
            <span style={{ ...sectionHead, display: 'block', marginBottom: '24px' }}>
              {calcList.find(c => c.id === active)?.label}
            </span>
            {ActiveCalc && <ActiveCalc />}
          </div>
        </div>
      </div>
    </div>
  );
}
