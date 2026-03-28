import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#2C4A3E', '#34584f', '#3d6659', '#4a7a6a', '#5a8a7a', '#6a9a8a', '#7aaa9a', '#8fada6', '#a0bdb8', '#c4d4d0'];

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
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--gold)', fontWeight: 600, marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '18px', fontWeight: 600, color: 'var(--charcoal)' }}>
        {formatVal(payload[0]?.value)}
      </div>
    </div>
  );
};

export default function HorizontalBarChart({ data = [], valueKey = 'aum', nameKey = 'name', height = 220 }) {
  const isEmpty = !data.length || data.every(d => !d[valueKey] || parseFloat(d[valueKey]) === 0);

  const chartData = isEmpty
    ? [{ name: 'No data', value: 0 }]
    : data.slice(0, 10).map(d => ({
        name: d[nameKey] || '—',
        value: parseFloat(d[valueKey]) || 0,
      }));

  const axisStyle = {
    fontSize: 11,
    fontFamily: 'var(--body-font)',
    fill: '#9aaa9e',
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        barSize={12}
      >
        <XAxis type="number" tickFormatter={formatVal} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis
          type="category" dataKey="name" width={90}
          tick={{ ...axisStyle, fill: '#5a6a64' }}
          axisLine={false} tickLine={false}
          tickFormatter={v => v.length > 12 ? v.slice(0, 12) + '…' : v}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(44,74,62,0.04)' }} />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={isEmpty ? '#e8eeec' : COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
