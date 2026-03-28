import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#2C4A3E', '#B8965A', '#4a7a6a', '#8fada6', '#c4d4d0', '#1a3a2e', '#d4a96a', '#6a9a8a', '#a0bdb8', '#e8eeec'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: '#fff', border: '1.5px solid var(--green)',
      borderRadius: '10px', padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(44,74,62,0.12)',
    }}>
      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--gold)', fontWeight: 600, marginBottom: '4px' }}>
        {d.name}
      </div>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '18px', fontWeight: 600, color: 'var(--charcoal)' }}>
        {d.payload.display || d.value}
      </div>
      <div style={{ fontSize: '12px', color: '#8a9e96', marginTop: '2px' }}>
        {d.payload.pct !== undefined ? `${parseFloat(d.payload.pct).toFixed(1)}%` : ''}
      </div>
    </div>
  );
};

export default function DonutChart({ data = [], valueKey = 'aum', nameKey = 'name', formatValue, height = 220 }) {
  const isEmpty = !data.length || data.every(d => !d[valueKey] || parseFloat(d[valueKey]) === 0);

  const chartData = isEmpty
    ? [{ name: 'No data', value: 1, display: '—', pct: 0, empty: true }]
    : data.map((d, i) => {
        const total = data.reduce((s, x) => s + (parseFloat(x[valueKey]) || 0), 0);
        const val = parseFloat(d[valueKey]) || 0;
        return {
          name: d[nameKey] || '—',
          value: val,
          display: formatValue ? formatValue(val) : val,
          pct: total > 0 ? (val / total * 100) : 0,
        };
      });

  const largest = isEmpty ? null : [...chartData].sort((a, b) => b.value - a.value)[0];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%" cy="50%"
              innerRadius="58%" outerRadius="78%"
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
              paddingAngle={isEmpty ? 0 : 2}
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={isEmpty ? '#e8eeec' : COLORS[i % COLORS.length]}
                />
              ))}
            </Pie>
            {!isEmpty && <Tooltip content={<CustomTooltip />} />}
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          {isEmpty ? (
            <div style={{ fontSize: '11px', color: '#9aaa9e', fontStyle: 'italic' }}>No data</div>
          ) : (
            <>
              <div style={{ fontFamily: 'var(--display-font)', fontSize: '15px', fontWeight: 600, color: 'var(--charcoal)', lineHeight: 1.1 }}>
                {largest?.name?.split(' ').slice(0, 2).join(' ')}
              </div>
              <div style={{ fontSize: '11px', color: '#8a9e96', marginTop: '2px' }}>
                {largest ? `${parseFloat(largest.pct).toFixed(1)}%` : ''}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      {!isEmpty && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {chartData.slice(0, 5).map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: '11px', color: '#5a6a64', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {d.name}
              </span>
              <span style={{ fontSize: '11px', color: '#9aaa9e', flexShrink: 0 }}>
                {parseFloat(d.pct).toFixed(1)}%
              </span>
            </div>
          ))}
          {chartData.length > 5 && (
            <div style={{ fontSize: '11px', color: '#9aaa9e', paddingLeft: '16px' }}>
              +{chartData.length - 5} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}
