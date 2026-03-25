import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/partners', label: 'Partners' },
  { to: '/investors', label: 'Investors' },
  { to: '/families', label: 'Families' },
  { to: '/commission', label: 'Commission' },
  { to: '/research', label: 'Research' },
  { to: '/admin', label: 'Admin Controls' },
  { to: '/reports', label: 'Client Reports' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-forest text-ivory flex flex-col p-6">
      <div className="mb-10">
        <h1 className="font-display text-2xl text-gold">Niom</h1>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `px-4 py-2 rounded text-sm font-body transition-colors ${
                isActive
                  ? 'bg-forest-dark text-gold'
                  : 'text-ivory/70 hover:text-ivory hover:bg-forest-dark'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
