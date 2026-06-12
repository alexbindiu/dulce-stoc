import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { validateRegisterForm, isFormValid, type FieldErrors } from '@/utils/validation'
import type { RegisterData } from '@/types/auth'

type FormState = RegisterData & { passwordConfirm: string }
type AccountType = 'PATISERIE' | 'CLIENT'

const EMPTY: FormState = {
  firstName: '', lastName: '', email: '', password: '', passwordConfirm: '',
  businessName: '', businessType: 'Patiserie', county: '', phone: '', description: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, currentUser, error, clearError } = useAuthStore()
  
  // Starea care controlează tipul de cont ales de utilizator
  const [accountType, setAccountType] = useState<AccountType>('PATISERIE')

  // Redirecționare dinamică în funcție de rol
  useEffect(() => { 
    if (currentUser) {
      const isClient = currentUser.role?.name === 'NORMAL_USER'
      navigate(isClient ? '/client' : '/app', { replace: true })
    }
  }, [currentUser, navigate])

  useEffect(() => { clearError() }, [])

  const [form, setForm]     = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSub] = useState(false)

  useEffect(() => { 
    if (submitted) {
      setErrors(validateRegisterForm(getFormDataToValidate()))
    }
  }, [form, submitted, accountType])

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  // Funcție ajutătoare: Dacă e client, ascundem detaliile de afacere folosind 'N/A'
  function getFormDataToValidate() {
    if (accountType === 'CLIENT') {
      return { ...form, businessName: 'N/A', businessType: 'Altele' as const, county: 'N/A' }
    }
    return form;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSub(true)
    
    const dataToValidate = getFormDataToValidate()
    const errs = validateRegisterForm(dataToValidate)
    setErrors(errs)
    
    if (!isFormValid(errs)) return
    
    const { passwordConfirm: _, ...data } = dataToValidate
    
    // Trimitem datele la backend
    await register(data)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-brown px-16 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #C9A84C 0%, transparent 60%)' }} />
        <div className="relative z-10 text-center">
          <div className="font-display text-5xl font-semibold text-white mb-3">
            Dulce <span className="text-gold">Stoc</span>
          </div>
          <p className="font-display italic text-lg text-white/40 mb-10">— evidența ta, simplă</p>
          <div className="space-y-5 text-left max-w-xs">
            {[
              { n: '1', t: 'Alege tipul contului', d: 'Patiserie sau Vizitator.' },
              { n: '2', t: 'Completează datele', d: 'Durează doar câteva secunde.' },
              { n: '3', t: 'Bucură-te de platformă', d: 'Gestionează sau descoperă produse.' },
            ].map(s => (
              <div key={s.n} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-xs font-semibold text-gold flex-shrink-0 mt-0.5">
                  {s.n}
                </div>
                <div>
                  <div className="text-sm font-medium text-white/60">{s.t}</div>
                  <div className="text-xs text-white/30">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-center justify-center px-8 py-10 bg-surface overflow-y-auto animate-fadeIn">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-caramel mb-2">Cont nou</p>
            <h1 className="font-display text-3xl font-semibold text-brown">Înregistrează-te</h1>
          </div>

          {/* TOGGLE PATISERIE VS CLIENT */}
          <div className="flex gap-2 p-1 bg-paper border border-border rounded-lg mb-6">
            <button
              type="button"
              onClick={() => setAccountType('PATISERIE')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-md transition-all ${accountType === 'PATISERIE' ? 'bg-caramel text-white shadow-sm' : 'text-muted hover:bg-surface'}`}
            >
              🏪 Sunt Patiserie
            </button>
            <button
              type="button"
              onClick={() => setAccountType('CLIENT')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-md transition-all ${accountType === 'CLIENT' ? 'bg-caramel text-white shadow-sm' : 'text-muted hover:bg-surface'}`}
            >
              👤 Sunt Client
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-caramel border-t border-border pt-3">
              Date personale
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Prenume" value={form.firstName} onChange={set('firstName')} placeholder="Ana" error={errors.firstName} />
              <Input label="Nume" value={form.lastName} onChange={set('lastName')} placeholder="Ionescu" error={errors.lastName} />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="adresa@email.ro" error={errors.email} />

            <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-caramel border-t border-border pt-3">
              Parolă
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Parolă" type="password" value={form.password} onChange={set('password')} placeholder="Minim 8 caractere" error={errors.password} />
              <Input label="Confirmă" type="password" value={form.passwordConfirm} onChange={set('passwordConfirm')} placeholder="Repetă parola" error={errors.passwordConfirm} />
            </div>

            {/* SE AFIȘEAZĂ DOAR PENTRU PATISERII */}
            {accountType === 'PATISERIE' && (
              <div className="animate-fadeIn">
                <div className="text-[10px] font-semibold tracking-[0.18em] uppercase text-caramel border-t border-border pt-3 mt-4">
                  Afacerea ta
                </div>
                <div className="space-y-4 mt-3">
                  <Input label="Numele afacerii" value={form.businessName} onChange={set('businessName')} placeholder="Patiseria Mea" error={errors.businessName} />
                  <div className="grid grid-cols-2 gap-3">
                    <Select label="Tip afacere" value={form.businessType} onChange={set('businessType')}>
                      {['Patiserie', 'Cofetărie', 'Brutărie', 'Altele'].map(t => <option key={t}>{t}</option>)}
                    </Select>
                    <Input label="Oraș / Județ" value={form.county} onChange={set('county')} placeholder="Cluj" />
                  </div>
                  <Input label="Telefon (opțional)" value={form.phone ?? ''} onChange={set('phone')} placeholder="07xx xxx xxx" />
                  <div>
                    <label className="block text-xs font-medium text-brown-soft mb-1.5">Descriere (opțional)</label>
                    <textarea
                      value={form.description ?? ''}
                      onChange={set('description')}
                      rows={3}
                      placeholder="Spune clienților ce te face special…"
                      className="w-full bg-paper border border-border rounded-md px-3 py-2 text-sm text-brown outline-none focus:border-caramel resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full justify-center py-3 mt-4">
              Creează cont
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            Ai deja cont?{' '}
            <Link to="/login" className="text-caramel font-semibold hover:text-brown-mid">Intră în cont →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}