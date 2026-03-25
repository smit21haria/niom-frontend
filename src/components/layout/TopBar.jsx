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
  const title = titles[pathname] || 'Niom';

  return (
    <div style={{
      position: 'fixed', top: 0, left: '220px', right: 0, height: '60px',
      background: '#fff', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', zIndex: 100,
    }}>
      <h1 style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--charcoal)', fontWeight: 600 }}>
        {title}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '13px', color: '#8a9e96', letterSpacing: '0.04em' }}>niom@admin</span>
        <button style={{
          fontSize: '12px', color: '#8a9e96', letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none',
        }}>Log out</button>
      </div>
    </div>
  );
}
