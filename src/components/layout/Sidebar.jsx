import { NavLink } from 'react-router-dom';

const sections = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Client Dashboard', icon: '▦' },
      { to: '/partners', label: 'Partner Dashboard', icon: '◈' },
    ]
  },
  {
    label: 'Clients',
    items: [
      { to: '/investors', label: 'Investors', icon: '◉' },
      { to: '/families', label: 'Families', icon: '⊕' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { to: '/commission', label: 'Commission', icon: '◎' },
      { to: '/client-reports', label: 'Client Reports', icon: '▤' },
    ]
  },
  {
    label: 'Tools',
    items: [
      { to: '/research', label: 'Research', icon: '◐' },
      { to: '/admin-controls', label: 'Admin Controls', icon: '◧' },
    ]
  },
];

const activeStyle = {
  background: 'rgba(44,74,62,0.08)',
  color: 'var(--green)',
  fontWeight: 500,
};

const itemStyle = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '10px 12px', borderRadius: '8px',
  fontSize: '13px', fontWeight: 400, color: '#5a6a64',
  cursor: 'pointer', transition: 'background 0.2s, color 0.2s',
  marginBottom: '2px', textDecoration: 'none',
};

export default function Sidebar() {
  return (
    <aside style={{
      width: '220px', background: '#fff',
      borderRight: '1px solid var(--border)',
      position: 'fixed', top: 0, left: 0, bottom: 0,
      display: 'flex', flexDirection: 'column',
      zIndex: 200,
    }}>
      {/* Logo */}
      <div style={{
        height: '60px', display: 'flex', alignItems: 'center',
        padding: '0 24px', borderBottom: '1px solid var(--border)',
        gap: '10px', flexShrink: 0,
      }}>
        <span style={{ fontFamily: 'var(--display-font)', fontSize: '22px', color: 'var(--charcoal)' }}>
          Niom
        </span>
        <span style={{
          fontFamily: 'var(--body-font)', fontSize: '10px',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--gold)', padding: '3px 8px',
          border: '1px solid rgba(184,150,90,0.4)', borderRadius: '100px',
        }}>Admin</span>
      </div>

      {/* Nav sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0' }}>
        {sections.map(section => (
          <div key={section.label} style={{ padding: '0 20px 24px' }}>
            <div style={{
              fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '0.2em', color: 'var(--gold)',
              fontWeight: 600, marginBottom: '10px', padding: '0 12px',
            }}>
              {section.label}
            </div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  ...itemStyle,
                  ...(isActive ? activeStyle : {}),
                })}
                onMouseEnter={e => {
                  if (!e.currentTarget.getAttribute('aria-current')) {
                    e.currentTarget.style.background = 'var(--sage)';
                    e.currentTarget.style.color = 'var(--green)';
                  }
                }}
                onMouseLeave={e => {
                  if (!e.currentTarget.getAttribute('aria-current')) {
                    e.currentTarget.style.background = '';
                    e.currentTarget.style.color = '#5a6a64';
                  }
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
