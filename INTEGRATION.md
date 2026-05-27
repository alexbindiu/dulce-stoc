# Playwright Tests + Cookie Tracker — Integration Guide

## 1. Install Playwright

```bash
npm install -D @playwright/test
npx playwright install chromium   # only Chromium needed
```

---

## 2. Run the tests

Make sure the dev server is **not already running** (Playwright will start it):

```bash
npx playwright test
```

Open the HTML report after the run:

```bash
npx playwright show-report
```

To watch tests execute live (headed mode):

```bash
npx playwright test --headed
```

---

## 3. What the tests cover

| Test file | Feature | Scenarios |
|-----------|---------|-----------|
| `features.spec.ts` | **Add product** | Fills form → product appears in table; empty form shows validation errors |
| `features.spec.ts` | **Search & filter** | Search by name; filter by category; clear search restores list |
| `features.spec.ts` | **Product detail & edit** | Row click → detail page; edit price → updated; back button → list |

---

## 4. Cookie Tracker — how to wire it in

### 4a. Drop the hook in `App.tsx`

```tsx
// src/App.tsx
import { useCookieTracker } from '@/utils/useCookieTracker'

function AppShell({ children }) { … }

export default function App() {
  useCookieTracker()   // ← add this line (must be inside <BrowserRouter>)
  return (
    <BrowserRouter>
      …
    </BrowserRouter>
  )
}
```

> **Important:** `useCookieTracker` uses `useLocation` from React Router,
> so it must be called *inside* `<BrowserRouter>`.  
> Move the hook call one level deeper if needed, e.g. into a component
> that is always rendered inside the router.

### 4b. Save search & category preferences in `ProductTable.tsx`

```tsx
import { saveSearchPreference, saveCategoryPreference } from '@/utils/useCookieTracker'

// Inside the search input onChange:
onChange={(e) => {
  setFilters({ search: e.target.value })
  saveSearchPreference(e.target.value)      // ← add
}}

// Inside the category select onChange:
onChange={(e) => {
  setFilters({ category: e.target.value })
  saveCategoryPreference(e.target.value)    // ← add
}}
```

### 4c. Save the last viewed product in `ProductDetail.tsx`

```tsx
import { saveLastProduct } from '@/utils/useCookieTracker'

// After you fetch the product (inside the component):
useEffect(() => {
  if (product) saveLastProduct(product.id, product.name)
}, [product])
```

### 4d. Read cookies anywhere you need them

```ts
import {
  getVisitCount,
  getLastPage,
  getLastProduct,
  getSearchPreference,
  getCategoryPreference,
  getCookieSummary,
} from '@/utils/useCookieTracker'

console.log(getCookieSummary())
// {
//   visitCount: 3,
//   lastPage: '/products/abc-123',
//   lastProduct: { id: 'abc-123', name: 'Ecler ciocolată' },
//   searchPreference: 'tort',
//   categoryPreference: 'Ecler',
// }
```

---

## 5. Cookies stored

| Cookie name | Content | Expires |
|-------------|---------|---------|
| `ds_visit_count` | Number of app sessions | 30 days |
| `ds_last_page` | Last route pathname | 30 days |
| `ds_last_product` | `{ id, name }` JSON of last opened product | 30 days |
| `ds_search_pref` | Last search term typed | 30 days |
| `ds_category_pref` | Last category filter selected | 30 days |
