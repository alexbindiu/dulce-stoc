import { Category, type ProductFormData } from '@/types/product'
import type { RegisterData, LoginData } from '../types/auth'

export type FieldErrors = Partial<Record<string, string>>

// ── Product validators ─────────────────────────────

export function validateName(v: string): string | undefined {
  if (!v.trim()) return 'Numele produsului este obligatoriu.'
  if (v.trim().length < 2) return 'Minim 2 caractere.'
  if (v.trim().length > 100) return 'Maxim 100 de caractere.'
}

export function validateCategory(v: string): string | undefined {
  if (!v) return 'Selectează o categorie.'
  if (!Object.values(Category).includes(v as Category)) return 'Categorie invalidă.'
}

export function validatePricePerUnit(v: number): string | undefined {
  if (isNaN(v)) return 'Prețul este obligatoriu.'
  if (v < 0) return 'Prețul nu poate fi negativ.'
  if (v > 100_000) return 'Maxim 100.000 lei.'
  if (Math.round(v * 100) !== v * 100) return 'Maxim 2 zecimale.'
}

export function validateStock(v: number): string | undefined {
  if (isNaN(v)) return 'Stocul este obligatoriu.'
  if (!Number.isInteger(v)) return 'Stocul trebuie să fie întreg.'
  if (v < 0) return 'Stocul nu poate fi negativ.'
  if (v > 100_000) return 'Maxim 100.000 bucăți.'
}

export function validateDescription(v: string): string | undefined {
  if (v.length > 500) return 'Maxim 500 de caractere.'
}

export function validateIngredients(v: string[]): string | undefined {
  if (v.some(i => i.trim().length > 80)) return 'Fiecare ingredient max 80 caractere.'
  if (v.length > 50) return 'Maxim 50 de ingrediente.'
}

export function validateProductForm(data: ProductFormData): FieldErrors {
  const e: FieldErrors = {}
  const name = validateName(data.name); if (name) e.name = name
  const cat  = validateCategory(data.category); if (cat) e.category = cat
  const price = validatePricePerUnit(data.pricePerUnit); if (price) e.pricePerUnit = price
  const stock = validateStock(data.stock); if (stock) e.stock = stock
  const desc  = validateDescription(data.description); if (desc) e.description = desc
  const ing   = validateIngredients(data.ingredients); if (ing) e.ingredients = ing
  return e
}

// ── Auth validators ────────────────────────────────

export function validateEmail(v: string): string | undefined {
  if (!v.trim()) return 'Email-ul este obligatoriu.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Email invalid.'
}

export function validatePassword(v: string): string | undefined {
  if (!v) return 'Parola este obligatorie.'
  if (v.length < 8) return 'Minim 8 caractere.'
}

export function validatePasswordConfirm(pass: string, confirm: string): string | undefined {
  if (!confirm) return 'Confirmă parola.'
  if (pass !== confirm) return 'Parolele nu coincid.'
}

export function validateFirstName(v: string): string | undefined {
  if (!v.trim()) return 'Prenumele este obligatoriu.'
  if (v.trim().length < 2) return 'Minim 2 caractere.'
}

export function validateLastName(v: string): string | undefined {
  if (!v.trim()) return 'Numele este obligatoriu.'
  if (v.trim().length < 2) return 'Minim 2 caractere.'
}

export function validateBusinessName(v: string): string | undefined {
  if (!v.trim()) return 'Numele afacerii este obligatoriu.'
}

export function validateRegisterForm(data: RegisterData & { passwordConfirm: string }): FieldErrors {
  const e: FieldErrors = {}
  const fn = validateFirstName(data.firstName); if (fn) e.firstName = fn
  const ln = validateLastName(data.lastName); if (ln) e.lastName = ln
  const em = validateEmail(data.email); if (em) e.email = em
  const pw = validatePassword(data.password); if (pw) e.password = pw
  const pc = validatePasswordConfirm(data.password, data.passwordConfirm); if (pc) e.passwordConfirm = pc
  const bn = validateBusinessName(data.businessName); if (bn) e.businessName = bn
  return e
}

export function validateLoginForm(data: LoginData): FieldErrors {
  const e: FieldErrors = {}
  const em = validateEmail(data.email); if (em) e.email = em
  const pw = validatePassword(data.password); if (pw) e.password = pw
  return e
}

export function isFormValid(errors: FieldErrors): boolean {
  return Object.keys(errors).length === 0
}
