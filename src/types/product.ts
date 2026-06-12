export enum Category {
  Tort      = 'Tort',
  Ecler     = 'Ecler',
  Croissant = 'Croissant',
  Prajitura = 'Prăjitură',
  Tarta     = 'Tartă',
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  [Category.Tort]: '🎂', [Category.Ecler]: '🍫',
  [Category.Croissant]: '🥐', [Category.Prajitura]: '🍰', [Category.Tarta]: '🥧',
}

export interface Product {
  id: string
  name: string
  category: Category
  pricePerUnit: number
  stock: number
  description: string
  ingredients: string[]
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export interface ProductFilters {
  search: string
  category: Category | ''
  activeOnly: boolean
}
