import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

function formatMonth(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function formatVal(val) {
  if (!val && val !== 0) return '—';
  const n = parseFloat(val);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1.5px solid var(--green)',
      borderRadius: '10px', padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(44,74,62,0.12)',
    }}>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--gold)', fontWeight: 600, marginBottom: '6px' }}>
        {formatMonth(label)}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: '11px', color: '#5a6a64' }}>{p.name}</span>
          <span style={{ fontFamily: 'var(--display-font)', fontSize: '14px', fontWeight: 600, color: 'var(--charcoal)', marginLeft: 'auto', paddingLeft: '12px' }}>
            {formatVal(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AreaBarChart({ data = [], mode = 'trend', height = 260 }) {
  const isEmpty = !data.length;

  const emptyData = [
    { month: '2025-10-01', aum: 0 },
    { month: '2025-11-01', aum: 0 },
    { month: '2025-12-01', aum: 0 },
    { month: '2026-01-01', aum: 0 },
    { month: '2026-02-01', aum: 0 },
    { month: '2026-03-01', aum: 0 },
  ];

  const chartData = isEmpty ? emptyData : data;

  const axisStyle = {
    fontSize: 11,
    fontFamily: 'var(--body-font)',
    fill: '#9aaa9e',
  };

  if (mode === 'trend') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2C4A3E" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2C4A3E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,74,62,0.06)" vertical={false} />
          <XAxis dataKey="month" tickFormatter={formatMonth} tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatVal} tick={axisStyle} axisLine={false} tickLine={false} width={56} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone" dataKey="aum" name="AUM"
            stroke="#2C4A3E" strokeWidth={2}
            fill="url(#aumGrad)"
            dot={false} activeDot={{ r: 4, fill: '#2C4A3E', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  // Monthly comparison — grouped bars
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barSize={16}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,74,62,0.06)" vertical={false} />
        <XAxis dataKey="month" tickFormatter={formatMonth} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatVal} tick={axisStyle} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="aum" name="AUM" fill="#2C4A3E" radius={[4, 4, 0, 0]} />
        <Bar dataKey="invested" name="Invested" fill="#B8965A" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
