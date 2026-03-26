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
        minHeight: '160px',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s, transform 0.2s',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        justifyContent: 'space-between',
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
        fontSize: '12px', textTransform: 'uppercase',
        letterSpacing: '0.18em', color: 'var(--gold)',
        fontWeight: 600,
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--display-font)', fontSize: '34px',
        fontWeight: 600, color: 'var(--charcoal)', lineHeight: 1,
      }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#9aaa9e', letterSpacing: '0.04em', minHeight: '14px' }}>
        {subtitle || ''}
      </div>
    </div>
  );
}
