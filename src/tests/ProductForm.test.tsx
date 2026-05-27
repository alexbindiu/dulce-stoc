import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductForm } from '@/components/products/ProductForm'
import { Category } from '@/types/product'
import type { Product } from '@/types/product'

// Minimal product fixture for edit mode
const EXISTING_PRODUCT: Product = {
  id: 'test-id-123',
  name: 'Tort Ștefania',
  category: Category.Tort,
  pricePerUnit: 85,
  stock: 24,
  description: 'Un tort delicios.',
  ingredients: ['Făină', 'Ouă'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
}

// ─────────────────────────────────────────────────
// Render
// ─────────────────────────────────────────────────
describe('ProductForm — render', () => {
  it('renders all required fields in Add mode', () => {
    render(
      <ProductForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByLabelText(/Nume produs/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Categorie/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Preț/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Stoc/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Descriere/i)).toBeInTheDocument()
  })

  it('renders "Adaugă produs" submit button in Add mode', () => {
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText(/Adaugă produs/i)).toBeInTheDocument()
  })

  it('pre-fills fields with initialData in Edit mode', () => {
    render(
      <ProductForm
        initialData={EXISTING_PRODUCT}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByDisplayValue('Tort Ștefania')).toBeInTheDocument()
    expect(screen.getByDisplayValue('85')).toBeInTheDocument()
    expect(screen.getByDisplayValue('24')).toBeInTheDocument()
  })

  it('renders "Salvează modificările" in Edit mode', () => {
    render(
      <ProductForm
        initialData={EXISTING_PRODUCT}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    expect(screen.getByText(/Salvează modificările/i)).toBeInTheDocument()
  })

  it('calls onCancel when Anulează is clicked', async () => {
    const onCancel = vi.fn()
    render(<ProductForm onSubmit={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByText('Anulează'))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})

// ─────────────────────────────────────────────────
// Validation — shows errors on submit
// ─────────────────────────────────────────────────
describe('ProductForm — validation', () => {
  it('shows name error when submitting with empty name', async () => {
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    // Clear name field
    const nameInput = screen.getByLabelText(/Nume produs/i)
    await userEvent.clear(nameInput)

    // Submit
    await userEvent.click(screen.getByText(/Adaugă produs/i))

    await waitFor(() => {
      expect(
        screen.getByText(/Numele produsului este obligatoriu/i)
      ).toBeInTheDocument()
    })
  })

  it('does NOT call onSubmit when form is invalid', async () => {
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    const nameInput = screen.getByLabelText(/Nume produs/i)
    await userEvent.clear(nameInput)
    await userEvent.click(screen.getByText(/Adaugă produs/i))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows price error for negative price', async () => {
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    // Fill name so only price fails
    await userEvent.type(screen.getByLabelText(/Nume produs/i), 'Valid Name')

    const priceInput = screen.getByLabelText(/Preț/i)
    fireEvent.change(priceInput, { target: { value: '-5' } })

    await userEvent.click(screen.getByText(/Adaugă produs/i))

    await waitFor(() => {
      expect(
        screen.getByText(/Prețul nu poate fi negativ/i)
      ).toBeInTheDocument()
    })
  })
})

// ─────────────────────────────────────────────────
// Submission — calls onSubmit with correct data
// ─────────────────────────────────────────────────
describe('ProductForm — submission', () => {
  it('calls onSubmit with form data when all fields are valid', async () => {
    const onSubmit = vi.fn()
    render(<ProductForm onSubmit={onSubmit} onCancel={vi.fn()} />)

    await userEvent.type(screen.getByLabelText(/Nume produs/i), 'Ecler test')
    fireEvent.change(screen.getByLabelText(/Preț/i), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText(/Stoc/i), { target: { value: '20' } })

    await userEvent.click(screen.getByText(/Adaugă produs/i))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
      const [data] = onSubmit.mock.calls[0]
      expect(data.name).toBe('Ecler test')
      expect(data.pricePerUnit).toBe(12)
      expect(data.stock).toBe(20)
    })
  })
})

// ─────────────────────────────────────────────────
// Ingredient tag input
// ─────────────────────────────────────────────────
describe('ProductForm — ingredients', () => {
  it('adds an ingredient when Enter is pressed', async () => {
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    const input = screen.getByTestId('ingredient-input')
    await userEvent.type(input, 'Făină{Enter}')

    expect(screen.getByText('Făină')).toBeInTheDocument()
  })

  it('adds an ingredient via "+ Adaugă" button', async () => {
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    const input = screen.getByTestId('ingredient-input')
    await userEvent.type(input, 'Unt')
    await userEvent.click(screen.getByText('+ Adaugă'))

    expect(screen.getByText('Unt')).toBeInTheDocument()
  })

  it('removes an ingredient when × is clicked', async () => {
    render(
      <ProductForm
        initialData={{ ...EXISTING_PRODUCT, ingredients: ['Făină'] }}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByText('Făină')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('Șterge Făină'))
    expect(screen.queryByText('Făină')).not.toBeInTheDocument()
  })

  it('does not add duplicate ingredients', async () => {
    render(<ProductForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    const input = screen.getByTestId('ingredient-input')
    await userEvent.type(input, 'Zahăr{Enter}')
    await userEvent.type(input, 'Zahăr{Enter}')

    const tags = screen.getAllByText('Zahăr')
    expect(tags.length).toBe(1)
  })
})
