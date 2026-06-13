import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '../ui/Button'

export function ClientShell() {
  const { currentUser, logout } = useAuthStore()
  const location = useLocation()

  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />
  if (currentUser.role?.name === 'ADMIN') return <Navigate to="/app" replace />

  return (
    <div className="flex flex-col min-h-screen bg-paper relative"> {/* <--- 2. Am adăugat 'relative' */}
      <header className="bg-brown px-8 py-4 flex items-center justify-between shadow-md">
        <div className="font-display text-2xl font-semibold text-white">
          Dulce <span className="text-gold">Stoc</span> <span className="text-xs text-white/50 ml-2 font-sans tracking-widest uppercase">Director Patiserii</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70">Salut, {currentUser.firstName}!</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-white border-white/20 hover:bg-white/10">Deconectare</Button>
        </div>
      </header>
      
      <main key={location.pathname} className="flex-1 max-w-6xl w-full mx-auto p-8 page-enter">
        <Outlet />
      </main>
    </div>
  )
}