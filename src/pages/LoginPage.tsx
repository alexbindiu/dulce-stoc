import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { validateLoginForm, isFormValid, type FieldErrors } from '@/utils/validation'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Tragem TOT ce avem nevoie din Zustand, inclusiv elementele pentru OTP
  const { 
    login, verifyOtp, forgotPassword, currentUser, error, clearError, 
    requiresOTP, pendingEmail, resetOtpState 
  } = useAuthStore()

  // 1. Redirecționare în funcție de ROL
  useEffect(() => { 
    if (currentUser) {
      const isClient = currentUser.role?.name === 'NORMAL_USER';
      const defaultRoute = isClient ? '/client' : '/app';
      const intendedRoute = (location.state as { from?: Location })?.from?.pathname;
      navigate(intendedRoute && intendedRoute !== '/' ? intendedRoute : defaultRoute, { replace: true }) 
    } 
  }, [currentUser, navigate, location.state])

  // Contul implicit pus pe admin
  const [form, setForm]       = useState({ email: 'admin@patiserie.ro', password: 'parola123' })
  const [errors, setErrors]   = useState<FieldErrors>({})
  const [submitted, setSub]   = useState(false)
  
  // Stare separată pentru codul OTP
  const [otp, setOtp]         = useState('')

  useEffect(() => { if (submitted && !requiresOTP) setErrors(validateLoginForm(form)) }, [form, submitted, requiresOTP])
  useEffect(() => { clearError() }, [])

  // Handler Login (Pasul 1)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSub(true)
    const errs = validateLoginForm(form)
    setErrors(errs)
    if (!isFormValid(errs)) return
    
    // Store-ul va seta requiresOTP pe true dacă backend-ul cere asta
    await login(form)
  }

  // Handler OTP (Pasul 2)
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    if (!pendingEmail) return
    await verifyOtp(pendingEmail, otp)
  }

  // Handler Resetare Parolă
  async function handleForgot() {
    if (!form.email) {
      alert("Te rugăm să introduci adresa de email în câmpul 'Email' pentru a reseta parola.")
      return
    }
    const success = await forgotPassword(form.email)
    if (success) alert("Un link de resetare a fost trimis pe adresa ta de email!")
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Partea stângă cu branding-ul original */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-brown px-16 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #C9A84C 0%, transparent 60%)' }} />
        <div className="relative z-10 text-center">
          <div className="font-display text-5xl font-semibold text-white mb-3">
            Dulce <span className="text-gold">Stoc</span>
          </div>
          <p className="font-display italic text-lg text-white/40 mb-10">— evidența ta, simplă</p>
          
          <div className="mt-10 flex gap-4 text-left justify-center">
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => setForm({ email: 'admin@patiserie.ro', password: 'parola123' })}>
              <p className="text-xs text-white/40 mb-1">Cont Admin (Patiserie)</p>
              <p className="text-xs text-gold font-mono">admin@patiserie.ro</p>
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10" onClick={() => setForm({ email: 'client@vizitator.ro', password: 'parola123' })}>
              <p className="text-xs text-white/40 mb-1">Cont User (Client)</p>
              <p className="text-xs text-gold font-mono">client@vizitator.ro</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formularul din dreapta actualizat pentru a suporta și OTP */}
      <div className="flex flex-col items-center justify-center px-8 py-16 bg-surface animate-fadeIn">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-caramel mb-2">Bun venit înapoi</p>
            <h1 className="font-display text-3xl font-semibold text-brown">
              {!requiresOTP ? 'Intră în cont' : 'Verificare Securitate'}
            </h1>
          </div>
          
          {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
          
          {!requiresOTP ? (
            // PASUL 1: FORMULARUL ORIGINAL DE LOGIN
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} error={errors.email} />
              
              <div className="relative">
                <Input label="Parolă" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} error={errors.password} />
                <div className="flex justify-end mt-1">
                  <button type="button" onClick={handleForgot} className="text-xs text-caramel hover:text-brown-mid transition-colors">Ai uitat parola?</button>
                </div>
              </div>

              <Button type="submit" className="w-full justify-center py-3">Intră în cont</Button>
            </form>
          ) : (
            // PASUL 2: FORMULARUL DE OTP CÂND ESTE NECESAR
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <p className="text-sm text-muted mb-4">
                Am trimis un cod de verificare pe adresa <span className="font-semibold text-brown">{pendingEmail}</span>.
              </p>
              
              <Input 
                label="Cod OTP (6 cifre)" 
                type="text" 
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                error={''} 
                maxLength={6}
              />
              
              <Button type="submit" className="w-full justify-center py-3">Verifică Codul</Button>

              <div className="text-center mt-4">
                <button type="button" onClick={resetOtpState} className="text-xs font-semibold text-caramel hover:text-brown-mid transition-colors">
                  ← Înapoi la Autentificare
                </button>
              </div>
            </form>
          )}

          {!requiresOTP && (
            <p className="text-center text-sm text-muted mt-6">
              Nu ai cont? <Link to="/register" className="text-caramel font-semibold hover:text-brown-mid">Înregistrează-te →</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}