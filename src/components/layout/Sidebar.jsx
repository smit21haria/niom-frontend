import { NavLink } from 'react-router-dom'

const nav = [
  {
    group: 'PARTNERS',
    items: [
      { to: '/', label: 'Dashboard', icon: '▦' },
      { to: '/partners', label: 'Partners', icon: '◈' },
      { to: '/investors', label: 'Investors', icon: '◎' },
      { to: '/families', label: 'Families', icon: '⬡' },
    ],
  },
  {
    group: 'DATA',
    items: [
      { to: '/commission', label: 'Commission', icon: '◇' },
      { to: '/research', label: 'Research', icon: '◉' },
      { to: '/reports', label: 'Client Reports', icon: '▤' },
    ],
  },
  {
    group: 'ADMIN',
    items: [
      { to: '/admin', label: 'Admin Controls', icon: '⚙' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside
      style={{ width: 220, backgroundColor: '#2C4A3E' }}
      className="fixed left-0 top-0 h-screen flex flex-col overflow-y-auto z-40"
    >
      {/* Logo */}
      <div className="px-6 pt-8 pb-6 flex items-center gap-2">
        <span
          style={{ fontFamily: "'Cormorant Garamond', serif", color: '#FAF8F4' }}
          className="text-2xl font-semibold tracking-wide"
        >
          Niom
        </span>
        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: 9,
            letterSpacing: '0.12em',
            color: '#B8965A',
            border: '1px solid #B8965A',
            borderRadius: 3,
            padding: '1px 5px',
            fontWeight: 600,
            lineHeight: '16px',
          }}
        >
          ADMIN
        </span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-4 pb-8 flex flex-col gap-6">
        {nav.map(({ group, items }) => (
          <div key={group}>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 10,
                letterSpacing: '0.18em',
                color: '#B8965A',
                fontWeight: 600,
                fontVariant: 'small-caps',
                marginBottom: 6,
                paddingLeft: 10,
              }}
            >
              {group}
            </p>
            <div className="flex flex-col gap-0.5">
              {items.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 7,
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: '#FAF8F4',
                    backgroundColor: isActive
                      ? 'rgba(250,248,244,0.10)'
                      : 'transparent',
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                    opacity: isActive ? 1 : 0.75,
                  })}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.dataset.active) {
                      e.currentTarget.style.backgroundColor = 'rgba(250,248,244,0.07)'
                      e.currentTarget.style.opacity = '1'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.dataset.active) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.opacity = '0.75'
                    }
                  }}
                >
                  <span style={{ fontSize: 14, opacity: 0.85 }}>{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
