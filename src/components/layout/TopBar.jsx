import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard': 'Client Dashboard',
  '/partners': 'Partner Dashboard',
  '/investors': 'Investors',
  '/families': 'Families',
  '/commission': 'Commission',
  '/research': 'Research',
  '/admin-controls': 'Admin Controls',
  '/client-reports': 'Client Reports',
};

export default function TopBar() {
  const { pathname } = useLocation();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '60px',
      background: 'var(--footer-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', zIndex: 100,
      boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
    }}>
      <div style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: '#d6cfc4', display: 'flex', alignItems: 'center', gap: '10px' }}>
        Niom
        <span style={{
          fontFamily: 'var(--body-font)', fontSize: '11px',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--gold)', padding: '3px 10px',
          border: '1px solid rgba(184,150,90,0.4)', borderRadius: '100px',
        }}>Admin</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '13px', color: '#8a9e96', letterSpacing: '0.04em' }}>niom@admin</span>
        <button
          style={{
            fontSize: '12px', color: '#8a9e96', letterSpacing: '0.1em',
            textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--gold)'}
          onMouseLeave={e => e.target.style.color = '#8a9e96'}
        >Log out</button>
      </div>
    </div>
  );
}
