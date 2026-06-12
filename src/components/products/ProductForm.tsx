import React, { useState, useEffect } from 'react'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Category, type Product, type ProductFormData } from '@/types/product'
import { validateProductForm, isFormValid, type FieldErrors } from '@/utils/validation'

interface Props {
  initialData?: Product
  onSubmit: (data: ProductFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

const EMPTY: ProductFormData = {
  name: '', category: Category.Tort, pricePerUnit: 0,
  stock: 0, description: '', ingredients: [], isActive: true,
  manufactureDate: '', expiryDate: '',
}

function toForm(p: Product): ProductFormData {
  return { name: p.name, category: p.category, pricePerUnit: p.pricePerUnit,
    stock: p.stock, description: p.description, ingredients: p.ingredients, isActive: p.isActive,
    manufactureDate: p.manufactureDate ?? '', expiryDate: p.expiryDate ?? '' }
}

export function ProductForm({ initialData, onSubmit, onCancel, isSubmitting = false }: Props) {
  const [form, setForm] = useState<ProductFormData>(initialData ? toForm(initialData) : EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [ingInput, setIngInput] = useState('')

  useEffect(() => {
    setForm(initialData ? toForm(initialData) : EMPTY)
    setErrors({}); setSubmitted(false); setIngInput('')
  }, [initialData])

  useEffect(() => { if (submitted) setErrors(validateProductForm(form)) }, [form, submitted])

  const set = <K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  function addIng() {
    const t = ingInput.trim()
    if (!t || form.ingredients.includes(t)) return
    set('ingredients', [...form.ingredients, t]); setIngInput('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSubmitted(true)
    const errs = validateProductForm(form)
    setErrors(errs)
    if (!isFormValid(errs)) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="product-form">
      <div className="grid gap-4">
        <Input label="Nume produs" value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="ex: Ecler cu ciocolată" error={errors.name} required />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Categorie" value={form.category}
            onChange={e => set('category', e.target.value as Category)} error={errors.category}>
            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Preț / bucată (lei)" type="number" min={0} step={0.01}
            value={form.pricePerUnit}
            onChange={e => set('pricePerUnit', parseFloat(e.target.value) || 0)}
            error={errors.pricePerUnit} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Stoc (bucăți)" type="number" min={0} step={1}
            value={form.stock}
            onChange={e => set('stock', parseInt(e.target.value, 10) || 0)}
            error={errors.stock} required />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-brown-soft">Status</label>
            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input type="checkbox" checked={form.isActive}
                onChange={e => set('isActive', e.target.checked)}
                className="accent-caramel w-4 h-4" />
              <span className="text-sm text-brown">Activ</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Data fabricație (opțional)" type="date" value={form.manufactureDate ?? ''}
            onChange={e => set('manufactureDate', e.target.value)} />
          <Input label="Data expirare (opțional)" type="date" value={form.expiryDate ?? ''}
            onChange={e => set('expiryDate', e.target.value)} />
        </div>

        <Textarea label="Descriere" value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Descrie produsul…" error={errors.description} />

        {/* Ingredients */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-brown-soft">Ingrediente</label>
          {form.ingredients.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1">
              {form.ingredients.map(ing => (
                <span key={ing} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-border rounded-full text-xs text-brown-mid">
                  {ing}
                  <button type="button" onClick={() => set('ingredients', form.ingredients.filter(i => i !== ing))}
                    aria-label={`Șterge ${ing}`} className="text-muted hover:text-red-600 leading-none">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input value={ingInput} onChange={e => setIngInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIng() } }}
              placeholder="Adaugă ingredient și apasă Enter…"
              data-testid="ingredient-input"
              className="flex-1 px-3 py-2 bg-paper border border-border rounded-md text-sm text-brown outline-none focus:border-caramel placeholder:text-muted placeholder:opacity-60" />
            <Button type="button" variant="ghost" size="sm" onClick={addIng}>+ Adaugă</Button>
          </div>
          {errors.ingredients && <p className="text-xs text-red-600">{errors.ingredients}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel}>Anulează</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Se salvează…' : initialData ? '💾 Salvează' : '+ Adaugă produs'}
        </Button>
      </div>
    </form>
  )
}
