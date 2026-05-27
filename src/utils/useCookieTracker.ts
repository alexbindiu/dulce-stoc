/**
 * useCookieTracker.ts
 *
 * Tracks user activity and preferences in the browser using cookies.
 *
 * Cookies stored:
 *  - ds_visit_count      — how many times the user has opened the app
 *  - ds_last_page        — the last route the user visited
 *  - ds_last_product     — id + name of the last product detail the user opened
 *  - ds_search_pref      — the last search term the user typed
 *  - ds_category_pref    — the last category filter the user selected
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// ─── Low-level cookie helpers ─────────────────────────────────────────────────

const EXPIRES_DAYS = 30

function setCookie(name: string, value: string, days = EXPIRES_DAYS) {
  const expires = new Date()
  expires.setDate(expires.getDate() + days)
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(name + '='))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const CookieKeys = {
  VISIT_COUNT:   'ds_visit_count',
  LAST_PAGE:     'ds_last_page',
  LAST_PRODUCT:  'ds_last_product',
  SEARCH_PREF:   'ds_search_pref',
  CATEGORY_PREF: 'ds_category_pref',
} as const

/** Read the current visit count (0 if never visited). */
export function getVisitCount(): number {
  return parseInt(getCookie(CookieKeys.VISIT_COUNT) ?? '0', 10)
}

/** Read the last page path the user visited. */
export function getLastPage(): string | null {
  return getCookie(CookieKeys.LAST_PAGE)
}

/** Read the last product the user opened: { id, name } or null. */
export function getLastProduct(): { id: string; name: string } | null {
  const raw = getCookie(CookieKeys.LAST_PRODUCT)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Read the last search term the user used. */
export function getSearchPreference(): string {
  return getCookie(CookieKeys.SEARCH_PREF) ?? ''
}

/** Read the last category filter the user selected. */
export function getCategoryPreference(): string {
  return getCookie(CookieKeys.CATEGORY_PREF) ?? ''
}

/** Save the search term the user is using. */
export function saveSearchPreference(term: string) {
  setCookie(CookieKeys.SEARCH_PREF, term)
}

/** Save the category filter the user selected. */
export function saveCategoryPreference(category: string) {
  setCookie(CookieKeys.CATEGORY_PREF, category)
}

/** Record that the user opened a product detail page. */
export function saveLastProduct(id: string, name: string) {
  setCookie(CookieKeys.LAST_PRODUCT, JSON.stringify({ id, name }))
}

/** Clear all tracking cookies (e.g. for a "clear preferences" button). */
export function clearAllCookies() {
  Object.values(CookieKeys).forEach(deleteCookie)
}

/** Return a human-readable summary of everything stored (useful for debugging). */
export function getCookieSummary() {
  return {
    visitCount:        getVisitCount(),
    lastPage:          getLastPage(),
    lastProduct:       getLastProduct(),
    searchPreference:  getSearchPreference(),
    categoryPreference: getCategoryPreference(),
  }
}

// ─── React hook ───────────────────────────────────────────────────────────────

/**
 * Drop this hook once inside `<App>` (or any always-mounted component).
 * It automatically:
 *   - increments the visit counter on first render
 *   - records the current page every time the route changes
 */
export function useCookieTracker() {
  const location = useLocation()

  // Increment visit count once per app load
  useEffect(() => {
    const count = getVisitCount()
    setCookie(CookieKeys.VISIT_COUNT, String(count + 1))
  }, []) // runs only on mount

  // Track current page on every route change
  useEffect(() => {
    setCookie(CookieKeys.LAST_PAGE, location.pathname)
  }, [location.pathname])
}
