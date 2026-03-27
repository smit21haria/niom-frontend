import { useNavigate } from 'react-router-dom';

export default function KPICard({ label, value, subtitle, to }) {
  const navigate = useNavigate();
  const clickable = !!to;

  return (
    <div
      onClick={() => clickable && navigate(to)}
      style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        padding: '24px 16px',
        flex: 1,
        minWidth: 0,
        minHeight: '160px',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, transform 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
      onMouseEnter={e => {
        if (clickable) {
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(44,74,62,0.14)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top — label */}
      <div style={{
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        color: 'var(--gold)',
        fontWeight: 600,
        lineHeight: 1.4,
        minHeight: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {label}
      </div>

      {/* Mid — value */}
      <div style={{
        fontFamily: 'var(--display-font)',
        fontSize: '36px',
        fontWeight: 600,
        color: 'var(--charcoal)',
        lineHeight: 1,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {value}
      </div>

      {/* Bottom — subtitle or spacer */}
      <div style={{
        fontSize: '13px',
        color: subtitle ? '#9aaa9e' : 'transparent',
        letterSpacing: '0.02em',
        minHeight: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {subtitle || '·'}
      </div>
    </div>
  );
}