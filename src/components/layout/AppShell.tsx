import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const { currentUser } = useAuthStore()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // BLOCAJ RBAC: Dacă e client, îl aruncăm pe platforma de clienți
  if (currentUser.role?.name === 'NORMAL_USER') {
    return <Navigate to="/client" replace />
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[220px] flex flex-col bg-paper min-h-screen">
        <div className="page-enter flex-1 flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  )
}