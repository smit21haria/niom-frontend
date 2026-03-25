export default function KPICard({ title, value, subtitle }) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        border: '1px solid rgba(44,74,62,0.14)',
        boxShadow: '0 4px 24px rgba(44,74,62,0.08)',
        padding: '24px 28px',
      }}
    >
      <p
        style={{
          fontFamily: "'Jost', sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          fontVariant: 'small-caps',
          color: '#B8965A',
          marginBottom: 8,
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 32,
          fontWeight: 600,
          color: '#2E2E2E',
          lineHeight: 1.1,
          marginBottom: subtitle ? 6 : 0,
        }}
      >
        {value}
      </p>
      {subtitle && (
        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 12,
            color: 'rgba(44,74,62,0.55)',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
