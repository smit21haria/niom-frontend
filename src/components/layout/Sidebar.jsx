import { NavLink, useLocation } from 'react-router-dom';

const sections = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Client Dashboard' },
      { to: '/partners', label: 'Partner Dashboard' },
    ]
  },
  {
    label: 'Clients',
    items: [
      { to: '/investors', label: 'Investors' },
      { to: '/families', label: 'Families' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { to: '/commission', label: 'Commission' },
      { to: '/client-reports', label: 'Client Reports' },
    ]
  },
  {
    label: 'Tools',
    items: [
      { to: '/research', label: 'Research' },
      { to: '/admin-controls', label: 'Admin Controls' },
    ]
  },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside style={{
      width: '220px', background: '#fff',
      borderRight: '1px solid var(--border)',
      position: 'fixed', top: '60px', left: 0, bottom: 0,
      padding: '32px 0', overflowY: 'auto', zIndex: 90,
    }}>
      {sections.map(section => (
        <div key={section.label} style={{ padding: '0 20px 24px' }}>
          <div style={{
            fontSize: '10px', textTransform: 'uppercase',
            letterSpacing: '0.2em', color: 'var(--gold)',
            fontWeight: 600, marginBottom: '10px', padding: '0 12px',
          }}>
            {section.label}
          </div>
          {section.items.map(item => {
            const isActive = pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--green)' : '#5a6a64',
                  background: isActive ? 'rgba(44,74,62,0.08)' : 'transparent',
                  cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
                  marginBottom: '2px', textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--sage)';
                    e.currentTarget.style.color = 'var(--green)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#5a6a64';
                  }
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
