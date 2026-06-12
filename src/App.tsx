import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ClientShell } from '@/components/layout/ClientShell'
import { ConnectionBanner } from '@/components/layout/ConnectionBanner'
import { useCookieTracker } from '@/utils/useCookieTracker'
import { useAuthStore } from '@/store/authStore' // <-- Adăugat pentru logout

import LoginPage        from '@/pages/LoginPage'
import RegisterPage     from '@/pages/RegisterPage'
import Landing          from './pages/Landing'
import LandingPage      from '@/pages/LandingPage'
import ProductsPageGql  from '@/pages/ProductsPageGql'
import ProductDetailPage from '@/pages/ProductDetailPage'
import StatisticsPageGql from '@/pages/StatisticsPageGql'
import InventarPage     from '@/pages/InventarPage'
import OrdersPage       from '@/pages/OrdersPage'
import ClientHomePage   from '@/pages/ClientHomePage'
import BusinessDetailPage from '@/pages/BusinessDetailPage'
import AdminInboxPage   from '@/pages/AdminInboxPage'
import SecurityPage     from '@/pages/SecurityPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

function AppTracker() {
  useCookieTracker()
  return null
}

// Hook-ul pentru inactivitate care te deloghează automat
function useInactivityTimeout(timeoutInMinutes: number) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleLogout = () => {
      logout(); // Șterge token-ul și datele din Zustand
      navigate('/login');
      alert('Sesiunea a expirat din cauza inactivității.');
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, timeoutInMinutes * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate, logout, timeoutInMinutes]);
}

export default function App() {
  // Acum funcționează perfect pentru că se află în interiorul <BrowserRouter>
  useInactivityTimeout(15); 

  return (
    <>
      <AppTracker />
      <ConnectionBanner />
      
      {/* <Routes> conține DOAR <Route>, exact așa cum cere React Router */}
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* RUTA PROTEJATĂ PENTRU PATISERII (ADMIN) */}
        <Route path="/app" element={<AppShell />}>
          <Route index                   element={<LandingPage />} />
          <Route path="products"         element={<ProductsPageGql />} />
          <Route path="products/:id"     element={<ProductDetailPage />} />
          <Route path="statistics"       element={<StatisticsPageGql />} />
          <Route path="inventar"         element={<InventarPage />} />
          <Route path="orders"           element={<OrdersPage />} />
          <Route path="inbox"            element={<AdminInboxPage />} />
          <Route path="security"         element={<SecurityPage />} />
        </Route>

        {/* RUTA PROTEJATĂ PENTRU VIZITATORI (NORMAL_USER) */}
        <Route path="/client" element={<ClientShell />}>
          <Route index element={<ClientHomePage />} />
          <Route path="business/:id" element={<BusinessDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}