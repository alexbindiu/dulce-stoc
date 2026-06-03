import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const NAV = [
  { to: '/app',            label: 'Acasă',      icon: '🏠', end: true },
  { to: '/app/products',   label: 'Produse',    icon: '🥐' },
  { to: '/app/orders',     label: 'Comenzi',    icon: '📋' },
  { to: '/app/inventar',   label: 'Inventar',   icon: '⚡' },
  { to: '/app/statistics', label: 'Statistici', icon: '📊' },
  { to: '/app/security', label: 'Securitate', icon: '🛡️' },
]

export function Sidebar() {
  const { currentUser, logout } = useAuthStore()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-56 bg-brown flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="font-display text-xl font-semibold text-white">
          Dulce <span className="text-gold">Stoc</span>
        </div>
        <p className="font-display italic text-xs text-white/30 mt-0.5">— evidența ta, simplă</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      {currentUser && (
        <div className="px-4 py-4 border-t border-white/10">
          <div className="text-xs text-white/40 mb-1 truncate">{currentUser.email}</div>
          <button
            onClick={logout}
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Deconectare
          </button>
        </div>
      )}
    </aside>
  )
}
