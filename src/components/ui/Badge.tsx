import React from 'react'
import { Category } from '@/types/product'

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-600' : 'bg-red-500'}`} />
      {active ? 'Activ' : 'Inactiv'}
    </span>
  )
}

const CAT_COLOURS: Record<Category, string> = {
  [Category.Tort]:      'bg-amber-100 text-amber-800',
  [Category.Ecler]:     'bg-stone-100 text-stone-700',
  [Category.Croissant]: 'bg-yellow-100 text-yellow-800',
  [Category.Prajitura]: 'bg-orange-100 text-orange-700',
  [Category.Tarta]:     'bg-lime-100 text-lime-700',
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${CAT_COLOURS[category]}`}>
      {category}
    </span>
  )
}
