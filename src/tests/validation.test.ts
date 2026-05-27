import { describe, it, expect } from 'vitest'
import {
  validateName,
  validateCategory,
  validatePricePerUnit,
  validateStock,
  validateDescription,
  validateIngredients,
  validateProductForm,
  isFormValid,
} from '@/utils/validation'
import { Category, type ProductFormData } from '@/types/product'

// ─────────────────────────────────────────────────
// validateName
// ─────────────────────────────────────────────────
describe('validateName', () => {
  it('returns undefined for a valid name', () => {
    expect(validateName('Tort Ștefania')).toBeUndefined()
  })

  it('returns error for empty string', () => {
    expect(validateName('')).toBeTruthy()
  })

  it('returns error for whitespace-only string', () => {
    expect(validateName('   ')).toBeTruthy()
  })

  it('returns error when name is too short (1 char)', () => {
    expect(validateName('A')).toBeTruthy()
  })

  it('accepts minimum valid length (2 chars)', () => {
    expect(validateName('Ab')).toBeUndefined()
  })

  it('returns error when name exceeds 100 characters', () => {
    expect(validateName('A'.repeat(101))).toBeTruthy()
  })

  it('accepts exactly 100 characters', () => {
    expect(validateName('A'.repeat(100))).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────
// validateCategory
// ─────────────────────────────────────────────────
describe('validateCategory', () => {
  it('returns undefined for each valid Category', () => {
    Object.values(Category).forEach((cat) => {
      expect(validateCategory(cat)).toBeUndefined()
    })
  })

  it('returns error for empty string', () => {
    expect(validateCategory('')).toBeTruthy()
  })

  it('returns error for unknown category value', () => {
    expect(validateCategory('Pizza')).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────
// validatePricePerUnit
// ─────────────────────────────────────────────────
describe('validatePricePerUnit', () => {
  it('returns undefined for a valid price', () => {
    expect(validatePricePerUnit(9.5)).toBeUndefined()
  })

  it('returns undefined for zero price', () => {
    expect(validatePricePerUnit(0)).toBeUndefined()
  })

  it('returns error for negative price', () => {
    expect(validatePricePerUnit(-1)).toBeTruthy()
  })

  it('returns error for price above 100000', () => {
    expect(validatePricePerUnit(100001)).toBeTruthy()
  })

  it('accepts exactly 100000', () => {
    expect(validatePricePerUnit(100000)).toBeUndefined()
  })

  it('returns error for NaN', () => {
    expect(validatePricePerUnit(NaN)).toBeTruthy()
  })

  it('returns error for more than 2 decimal places', () => {
    expect(validatePricePerUnit(9.999)).toBeTruthy()
  })

  it('accepts exactly 2 decimal places', () => {
    expect(validatePricePerUnit(9.99)).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────
// validateStock
// ─────────────────────────────────────────────────
describe('validateStock', () => {
  it('returns undefined for valid integer stock', () => {
    expect(validateStock(24)).toBeUndefined()
  })

  it('returns undefined for zero stock', () => {
    expect(validateStock(0)).toBeUndefined()
  })

  it('returns error for negative stock', () => {
    expect(validateStock(-1)).toBeTruthy()
  })

  it('returns error for non-integer stock', () => {
    expect(validateStock(10.5)).toBeTruthy()
  })

  it('returns error for stock above 100000', () => {
    expect(validateStock(100001)).toBeTruthy()
  })

  it('returns error for NaN', () => {
    expect(validateStock(NaN)).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────
// validateDescription
// ─────────────────────────────────────────────────
describe('validateDescription', () => {
  it('returns undefined for empty description (optional)', () => {
    expect(validateDescription('')).toBeUndefined()
  })

  it('returns undefined for a normal description', () => {
    expect(validateDescription('Un tort delicios.')).toBeUndefined()
  })

  it('returns error when description exceeds 500 characters', () => {
    expect(validateDescription('A'.repeat(501))).toBeTruthy()
  })

  it('accepts exactly 500 characters', () => {
    expect(validateDescription('A'.repeat(500))).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────
// validateIngredients
// ─────────────────────────────────────────────────
describe('validateIngredients', () => {
  it('returns undefined for empty list', () => {
    expect(validateIngredients([])).toBeUndefined()
  })

  it('returns undefined for valid ingredients', () => {
    expect(validateIngredients(['Făină', 'Ouă', 'Unt'])).toBeUndefined()
  })

  it('returns error when an ingredient exceeds 80 characters', () => {
    expect(validateIngredients(['A'.repeat(81)])).toBeTruthy()
  })

  it('accepts ingredient of exactly 80 characters', () => {
    expect(validateIngredients(['A'.repeat(80)])).toBeUndefined()
  })

  it('returns error when more than 50 ingredients provided', () => {
    const tooMany = Array.from({ length: 51 }, (_, i) => `Ingredient ${i}`)
    expect(validateIngredients(tooMany)).toBeTruthy()
  })

  it('accepts exactly 50 ingredients', () => {
    const fifty = Array.from({ length: 50 }, (_, i) => `Ing${i}`)
    expect(validateIngredients(fifty)).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────
// validateProductForm — integration
// ─────────────────────────────────────────────────
describe('validateProductForm', () => {
  const validForm: ProductFormData = {
    name: 'Tort Ștefania',
    category: Category.Tort,
    pricePerUnit: 85,
    stock: 24,
    description: 'Un tort delicios.',
    ingredients: ['Făină', 'Ouă'],
    isActive: true,
  }

  it('returns empty errors for a fully valid form', () => {
    expect(validateProductForm(validForm)).toEqual({})
  })

  it('reports name error when name is empty', () => {
    const errs = validateProductForm({ ...validForm, name: '' })
    expect(errs.name).toBeTruthy()
    expect(errs.category).toBeUndefined()
  })

  it('reports multiple errors simultaneously', () => {
    const errs = validateProductForm({ ...validForm, name: '', pricePerUnit: -5 })
    expect(errs.name).toBeTruthy()
    expect(errs.pricePerUnit).toBeTruthy()
  })

  it('reports stock error for decimal stock', () => {
    const errs = validateProductForm({ ...validForm, stock: 10.5 })
    expect(errs.stock).toBeTruthy()
  })
})

// ─────────────────────────────────────────────────
// isFormValid
// ─────────────────────────────────────────────────
describe('isFormValid', () => {
  it('returns true for empty errors object', () => {
    expect(isFormValid({})).toBe(true)
  })

  it('returns false when errors object has any key', () => {
    expect(isFormValid({ name: 'Required' })).toBe(false)
  })
})
