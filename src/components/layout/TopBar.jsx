import { useLocation, useNavigate } from 'react-router-dom';
import { clearToken } from '../../lib/api';

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
  const navigate = useNavigate();
  function handleLogout() {
    clearToken();
    navigate('/login', { replace: true });
  }

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
        <button onClick={handleLogout} style={{
          padding: '7px 16px', borderRadius: '7px', fontSize: '12px',
          border: '1.5px solid rgba(255,255,255,0.2)',
          background: 'transparent', color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer', fontFamily: 'var(--body-font)',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
        >Log out</button>
      </div>
    </div>
  );
}
