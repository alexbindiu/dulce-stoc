import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { validateLoginForm, isFormValid, type FieldErrors } from '@/utils/validation'
import { REST_BASE } from '@/services/config'

type DemoAccount = {
  email: string; firstName: string; lastName: string
  kind: 'BUSINESS' | 'CLIENT'
  businessName: string | null; businessType: string; county: string
}

// Folosite până se încarcă lista de pe server (sau dacă backend-ul nu e încă actualizat)
const FALLBACK: DemoAccount[] = [
  { email: 'admin@patiserie.ro', firstName: 'Ana', lastName: 'Proprietar', kind: 'BUSINESS', businessName: 'Patiseria Anei', businessType: 'Patiserie', county: 'Cluj-Napoca' },
  { email: 'client@vizitator.ro', firstName: 'Ion', lastName: 'Client', kind: 'CLIENT', businessName: null, businessType: 'Altele', county: 'Cluj-Napoca' },
]

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

  // Lista de conturi demo (de pe server)
  const [accounts, setAccounts] = useState<DemoAccount[]>([])
  useEffect(() => {
    fetch(`${REST_BASE}/auth/demo-accounts`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => { if (Array.isArray(d) && d.length) setAccounts(d) })
      .catch(() => {})
  }, [])

  useEffect(() => { if (submitted && !requiresOTP) setErrors(validateLoginForm(form)) }, [form, submitted, requiresOTP])
  useEffect(() => { clearError() }, [])

  const list = accounts.length ? accounts : FALLBACK
  const businesses = list.filter((a) => a.kind === 'BUSINESS')
  const clients    = list.filter((a) => a.kind === 'CLIENT')

  function fill(email: string) { setForm({ email, password: 'parola123' }) }

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

  const AccountCard = ({ a }: { a: DemoAccount }) => (
    <button
      type="button"
      onClick={() => fill(a.email)}
      className={`w-full text-left p-2.5 rounded-lg border transition-all hover:-translate-y-0.5 ${
        form.email === a.email
          ? 'bg-gold/15 border-gold/50'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-gold/40'
      }`}
    >
      <p className="text-xs font-medium text-white/85 truncate">{a.businessName ?? `${a.firstName} ${a.lastName}`}</p>
      <p className="text-[10px] text-gold/80 font-mono truncate">{a.email}</p>
      <p className="text-[10px] text-white/30 truncate">{a.businessType !== 'Altele' ? `${a.businessType} · ` : ''}{a.county}</p>
    </button>
  )

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
      {/* Partea stângă: branding + conturi demo (scrollabilă) */}
      <div className="hidden lg:flex flex-col bg-brown px-12 py-10 relative overflow-hidden h-screen">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #C9A84C 0%, transparent 60%)' }} />
        <div className="relative z-10 flex flex-col h-full min-h-0 w-full max-w-md mx-auto">
          <div className="text-center mb-6 flex-shrink-0">
            <div className="font-display text-4xl font-semibold text-white">
              Dulce <span className="text-gradient">Stoc</span>
            </div>
            <p className="font-display italic text-sm text-white/40 mt-1">— evidența ta, simplă</p>
          </div>

          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-gold">Conturi demo</p>
            <span className="text-[11px] text-white/40">click pentru autentificare</span>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
            <div className="flex flex-col min-h-0">
              <p className="text-[11px] text-white/40 mb-1.5 flex-shrink-0">🏪 Patiserii ({businesses.length})</p>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pr-1 stagger-children">
                {businesses.map((a) => <AccountCard key={a.email} a={a} />)}
              </div>
            </div>
            <div className="flex flex-col min-h-0">
              <p className="text-[11px] text-white/40 mb-1.5 flex-shrink-0">👤 Clienți ({clients.length})</p>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pr-1 stagger-children">
                {clients.map((a) => <AccountCard key={a.email} a={a} />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formularul din dreapta — fix, centrat, fără scroll */}
      <div className="flex flex-col items-center justify-center px-8 bg-surface h-screen overflow-hidden animate-fadeIn">
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
