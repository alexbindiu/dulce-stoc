/**
 * features.spec.ts — Playwright end-to-end tests
 *
 * Three feature scenarios:
 * 1. Add a new product via the form modal
 * 2. Search & filter products
 * 3. Navigate to a product detail page and edit it
 *
 * Run:  npx playwright test
 */

import { test, expect, Page } from '@playwright/test'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Navigate to the Products page and wait for the table to appear. */
async function goToProducts(page: Page) {
  // 1. Mergem pe pagina de login
  await page.goto('/login')

  // 2. Apăsăm butonul de autentificare (datele demo sunt deja precompletate)
  await page.getByRole('button', { name: /intră în cont/i }).click()

  // 3. Așteptăm să ajungem pe dashboard (/app)
  await expect(page).toHaveURL(/\/app/)

  // 4. Navigăm la pagina de Produse (folosind link-ul din Sidebar)
  await page.getByRole('link', { name: /produse/i }).first().click()

  // 5. Ne asigurăm că am ajuns unde trebuie și că tabelul s-a încărcat
  await expect(page).toHaveURL(/\/app\/products/)
  await expect(page.getByTestId('search-input')).toBeVisible()
}

// ─── Feature 1: Add a new product ───────────────────────────────────────────

test.describe('Feature 1 — Add product', () => {
  test('opens the form, fills every field, and the new product appears in the table', async ({ page }) => {
    await goToProducts(page)

    // Open the "Add" modal
    await page.getByRole('button', { name: /produs nou/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Fill the form
    await page.getByLabel(/nume produs/i).fill('Ecler Caramel')
    await page.getByLabel(/preț/i).fill('14.50')
    await page.getByLabel(/stoc/i).fill('30')
    await page.getByLabel(/descriere/i).fill('Ecler cu cremă de caramel și glazură.')
    
    // Adăugăm ingrediente apăsând Enter
    await page.getByTestId('ingredient-input').fill('Făină, Ouă, Unt, Caramel, Frișcă')
    await page.getByTestId('ingredient-input').press('Enter')
    
    // Pick a category (caută strict în formular)
    await page.getByTestId('product-form').getByLabel(/categorie/i).selectOption('Ecler')
    
    // Mark as active (caută strict în formular)
    const activeCheckbox = page.getByTestId('product-form').getByLabel(/activ/i)
    if (!(await activeCheckbox.isChecked())) {
      await activeCheckbox.check()
    }

    // Submit
    await page.getByRole('button', { name: '+ Adaugă produs' }).click()

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible()

    // Deoarece noul produs ajunge pe pagina 2 (avem deja 6 produse default),
    // folosim bara de căutare pentru a-l afișa.
    await page.getByTestId('search-input').fill('Ecler Caramel')

    // Noul produs trebuie să apară acum în tabel
    await expect(page.getByText('Ecler Caramel')).toBeVisible()
  })

  test('shows validation errors when submitting an empty form', async ({ page }) => {
    await goToProducts(page)

    await page.getByRole('button', { name: /produs nou/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Submit without filling anything
    await page.getByRole('button', { name: '+ Adaugă produs' }).click()

    // At least one validation message should appear (the form stays open)
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // Expect any error text to be present (folosim clasa corectă de text roșu din Tailwind)
    const errors = page.locator('.text-red-600')
    await expect(errors.first()).toBeVisible()
  })
})

// ─── Feature 2: Search & filter ─────────────────────────────────────────────

test.describe('Feature 2 — Search and filter', () => {
  test('searching by name shows only matching products', async ({ page }) => {
    await goToProducts(page)

    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('Croissant')

    // Wait for the table to react
    await expect(page.getByText('Croissant cu unt')).toBeVisible()

    // Products that don't match should not be visible
    await expect(page.getByText('Tort Ștefania')).not.toBeVisible()
    await expect(page.getByText('Ecler ciocolată')).not.toBeVisible()
  })

  test('filtering by category shows only products of that category', async ({ page }) => {
    await goToProducts(page)

    // Pick the "Ecler" category filter
    await page.getByLabel(/categorie/i).selectOption('Ecler')

    await expect(page.getByText('Ecler ciocolată')).toBeVisible()

    // Other categories should disappear
    await expect(page.getByText('Tort Ștefania')).not.toBeVisible()
    await expect(page.getByText('Croissant cu unt')).not.toBeVisible()
  })

  test('clearing the search restores all products', async ({ page }) => {
    await goToProducts(page)

    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('Tartă')
    await expect(page.getByText('Tartă cu fructe')).toBeVisible()

    // Clear via the ✕ button
    await page.getByRole('button', { name: '✕' }).click()
    // Multiple products should reappear
    await expect(page.getByText('Tort Ștefania')).toBeVisible()
    await expect(page.getByText('Croissant cu unt')).toBeVisible()
  })
})

// ─── Feature 3: Product detail page ─────────────────────────────────────────

test.describe('Feature 3 — Product detail & edit', () => {
  test('clicking a product row navigates to the detail page', async ({ page }) => {
    await goToProducts(page)

    // Click on the "Croissant cu unt" row to open its detail
    await page.getByText('Croissant cu unt').click()

    await expect(page).toHaveURL(/\/app\/products\/.+/)
    
    // The detail page should show the product name prominently (folosim first() pentru a evita dublurile de pe header și card)
    await expect(page.getByRole('heading', { name: /croissant cu unt/i }).first()).toBeVisible()
    
    // Price should be visible
    await expect(page.getByText('9.50')).toBeVisible()
  })

  test('editing a product from the detail page updates its data', async ({ page }) => {
    await goToProducts(page)

    await page.getByText('Ecler ciocolată').click()
    await expect(page).toHaveURL(/\/app\/products\/.+/)

    // Open the edit modal
    await page.getByRole('button', { name: /editează/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    // Change the price
    const priceField = page.getByLabel(/preț/i)
    await priceField.clear()
    await priceField.fill('15.00')

    await page.getByRole('button', { name: /salvează/i }).click()

    // Modal closes and updated price is shown on the detail page
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('15.00')).toBeVisible()
  })

  test('back button on detail page returns to the products list', async ({ page }) => {
    await goToProducts(page)

    await page.getByText('Tartă cu fructe').click()
    await expect(page).toHaveURL(/\/app\/products\/.+/)

    await page.getByRole('button', { name: /înapoi/i }).click()

    await expect(page).toHaveURL(/\/app\/products$/)
    await expect(page.getByTestId('search-input')).toBeVisible()
  })
})