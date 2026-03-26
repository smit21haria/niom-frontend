import { useNavigate } from 'react-router-dom';

export default function KPICard({ label, value, subtitle, to }) {
  const navigate = useNavigate();
  const clickable = !!to;

  return (
    <div
      onClick={() => clickable && navigate(to)}
      style={{
        background: '#fff', borderRadius: '16px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
        padding: '28px 20px', flex: 1, minWidth: 0,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, transform 0.2s',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center', gap: '10px',
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
      <div style={{
        fontSize: '11px', textTransform: 'uppercase',
        letterSpacing: '0.18em', color: 'var(--gold)',
        fontWeight: 600,
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--display-font)', fontSize: '34px',
        fontWeight: 600, color: 'var(--charcoal)', lineHeight: 1,
      }}>{value}</div>
      {subtitle && (
        <div style={{ fontSize: '10px', color: '#9aaa9e', letterSpacing: '0.04em' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
