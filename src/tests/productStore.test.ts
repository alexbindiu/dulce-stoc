import { describe, it, expect, beforeEach } from 'vitest'
import { useProductStore } from '@/store/productStore'
import { Category, type ProductFormData } from '@/types/product'

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

const SAMPLE_FORM: ProductFormData = {
  name: 'Test Ecler',
  category: Category.Ecler,
  pricePerUnit: 12,
  stock: 30,
  description: 'Un ecler de test.',
  ingredients: ['Făină', 'Ouă'],
  isActive: true,
}

/** Reset Zustand store between tests using setState */
function resetStore() {
  useProductStore.setState({
    products: [],
    filters: { search: '', category: '', activeOnly: false },
    currentPage: 1,
    pageSize: 6,
  })
}

// ─────────────────────────────────────────────────
// addProduct
// ─────────────────────────────────────────────────
describe('addProduct', () => {
  beforeEach(resetStore)

  it('adds a product and returns it with an id', () => {
    const product = useProductStore.getState().addProduct(SAMPLE_FORM)
    expect(product.id).toBeTruthy()
    expect(product.name).toBe('Test Ecler')
  })

  it('increments the product list length', () => {
    const before = useProductStore.getState().products.length
    useProductStore.getState().addProduct(SAMPLE_FORM)
    expect(useProductStore.getState().products.length).toBe(before + 1)
  })

  it('sets createdAt and updatedAt to valid ISO strings', () => {
    const product = useProductStore.getState().addProduct(SAMPLE_FORM)
    expect(() => new Date(product.createdAt)).not.toThrow()
    expect(() => new Date(product.updatedAt)).not.toThrow()
  })

  it('stores all form fields on the product', () => {
    const product = useProductStore.getState().addProduct(SAMPLE_FORM)
    expect(product.category).toBe(Category.Ecler)
    expect(product.pricePerUnit).toBe(12)
    expect(product.stock).toBe(30)
    expect(product.ingredients).toEqual(['Făină', 'Ouă'])
  })
})

// ─────────────────────────────────────────────────
// updateProduct
// ─────────────────────────────────────────────────
describe('updateProduct', () => {
  beforeEach(resetStore)

  it('updates the product fields', () => {
    const product = useProductStore.getState().addProduct(SAMPLE_FORM)
    useProductStore
      .getState()
      .updateProduct(product.id, { ...SAMPLE_FORM, name: 'Ecler Updatat', stock: 99 })

    const updated = useProductStore.getState().getProductById(product.id)
    expect(updated?.name).toBe('Ecler Updatat')
    expect(updated?.stock).toBe(99)
  })

  it('updates updatedAt timestamp', () => {
    const product = useProductStore.getState().addProduct(SAMPLE_FORM)
    const before = product.updatedAt
    useProductStore.getState().updateProduct(product.id, { ...SAMPLE_FORM, name: 'New' })
    const updated = useProductStore.getState().getProductById(product.id)
    // updatedAt should be same or newer
    expect(new Date(updated!.updatedAt) >= new Date(before)).toBe(true)
  })

  it('does not affect other products', () => {
    const p1 = useProductStore.getState().addProduct(SAMPLE_FORM)
    const p2 = useProductStore
      .getState()
      .addProduct({ ...SAMPLE_FORM, name: 'Produs B' })

    useProductStore
      .getState()
      .updateProduct(p1.id, { ...SAMPLE_FORM, name: 'Updated A' })

    const unchanged = useProductStore.getState().getProductById(p2.id)
    expect(unchanged?.name).toBe('Produs B')
  })
})

// ─────────────────────────────────────────────────
// deleteProduct
// ─────────────────────────────────────────────────
describe('deleteProduct', () => {
  beforeEach(resetStore)

  it('removes the product from the list', () => {
    const product = useProductStore.getState().addProduct(SAMPLE_FORM)
    useProductStore.getState().deleteProduct(product.id)
    expect(useProductStore.getState().getProductById(product.id)).toBeUndefined()
  })

  it('decrements the product list length', () => {
    const product = useProductStore.getState().addProduct(SAMPLE_FORM)
    const before = useProductStore.getState().products.length
    useProductStore.getState().deleteProduct(product.id)
    expect(useProductStore.getState().products.length).toBe(before - 1)
  })

  it('does not affect other products when deleting one', () => {
    const p1 = useProductStore.getState().addProduct(SAMPLE_FORM)
    const p2 = useProductStore
      .getState()
      .addProduct({ ...SAMPLE_FORM, name: 'Produs B' })

    useProductStore.getState().deleteProduct(p1.id)
    expect(useProductStore.getState().getProductById(p2.id)).toBeDefined()
  })

  it('deleting unknown id is a no-op', () => {
    const before = useProductStore.getState().products.length
    useProductStore.getState().deleteProduct('nonexistent-id')
    expect(useProductStore.getState().products.length).toBe(before)
  })
})

// ─────────────────────────────────────────────────
// getProductById
// ─────────────────────────────────────────────────
describe('getProductById', () => {
  beforeEach(resetStore)

  it('returns the correct product', () => {
    const product = useProductStore.getState().addProduct(SAMPLE_FORM)
    const found   = useProductStore.getState().getProductById(product.id)
    expect(found?.id).toBe(product.id)
  })

  it('returns undefined for unknown id', () => {
    expect(useProductStore.getState().getProductById('unknown')).toBeUndefined()
  })
})

// ─────────────────────────────────────────────────
// getFilteredProducts — search
// ─────────────────────────────────────────────────
describe('getFilteredProducts — search', () => {
  beforeEach(() => {
    resetStore()
    useProductStore.getState().addProduct({ ...SAMPLE_FORM, name: 'Tort Ștefania' })
    useProductStore
      .getState()
      .addProduct({ ...SAMPLE_FORM, name: 'Croissant Simplu', category: Category.Croissant })
  })

  it('returns all products when search is empty', () => {
    useProductStore.getState().setFilters({ search: '' })
    expect(useProductStore.getState().getFilteredProducts().length).toBe(2)
  })

  it('filters by partial name match (case-insensitive)', () => {
    useProductStore.getState().setFilters({ search: 'tort' })
    const results = useProductStore.getState().getFilteredProducts()
    expect(results.length).toBe(1)
    expect(results[0].name).toBe('Tort Ștefania')
  })

  it('returns empty when no name matches search', () => {
    useProductStore.getState().setFilters({ search: 'zzznomatch' })
    expect(useProductStore.getState().getFilteredProducts().length).toBe(0)
  })
})

// ─────────────────────────────────────────────────
// getFilteredProducts — category filter
// ─────────────────────────────────────────────────
describe('getFilteredProducts — category filter', () => {
  beforeEach(() => {
    resetStore()
    useProductStore.getState().addProduct({ ...SAMPLE_FORM, category: Category.Tort })
    useProductStore
      .getState()
      .addProduct({ ...SAMPLE_FORM, name: 'Ecler test', category: Category.Ecler })
  })

  it('filters to only the selected category', () => {
    useProductStore.getState().setFilters({ category: Category.Tort })
    const results = useProductStore.getState().getFilteredProducts()
    expect(results.every((p) => p.category === Category.Tort)).toBe(true)
  })

  it('returns all products when category filter is empty', () => {
    useProductStore.getState().setFilters({ category: '' })
    expect(useProductStore.getState().getFilteredProducts().length).toBe(2)
  })
})

// ─────────────────────────────────────────────────
// getFilteredProducts — activeOnly filter
// ─────────────────────────────────────────────────
describe('getFilteredProducts — activeOnly filter', () => {
  beforeEach(() => {
    resetStore()
    useProductStore.getState().addProduct({ ...SAMPLE_FORM, isActive: true })
    useProductStore
      .getState()
      .addProduct({ ...SAMPLE_FORM, name: 'Inactiv', isActive: false })
  })

  it('hides inactive products when activeOnly is true', () => {
    useProductStore.getState().setFilters({ activeOnly: true })
    const results = useProductStore.getState().getFilteredProducts()
    expect(results.every((p) => p.isActive)).toBe(true)
  })

  it('shows all products when activeOnly is false', () => {
    useProductStore.getState().setFilters({ activeOnly: false })
    expect(useProductStore.getState().getFilteredProducts().length).toBe(2)
  })
})

// ─────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────
describe('pagination', () => {
  beforeEach(() => {
    resetStore()
    // Add 10 products
    for (let i = 0; i < 10; i++) {
      useProductStore
        .getState()
        .addProduct({ ...SAMPLE_FORM, name: `Produs ${i}` })
    }
  })

  it('getTotalPages returns correct value with default pageSize 6', () => {
    expect(useProductStore.getState().getTotalPages()).toBe(2) // ceil(10/6)
  })

  it('setPage updates currentPage', () => {
    useProductStore.getState().setPage(2)
    expect(useProductStore.getState().currentPage).toBe(2)
  })

  it('setFilters resets currentPage to 1', () => {
    useProductStore.getState().setPage(2)
    useProductStore.getState().setFilters({ search: 'a' })
    expect(useProductStore.getState().currentPage).toBe(1)
  })

  it('resetFilters resets page to 1', () => {
    useProductStore.getState().setPage(2)
    useProductStore.getState().resetFilters()
    expect(useProductStore.getState().currentPage).toBe(1)
  })

  it('setPageSize updates pageSize and resets to page 1', () => {
    useProductStore.getState().setPage(2)
    useProductStore.getState().setPageSize(10)
    expect(useProductStore.getState().pageSize).toBe(10)
    expect(useProductStore.getState().currentPage).toBe(1)
  })
})
