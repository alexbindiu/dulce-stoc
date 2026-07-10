// Logica ofertelor „Dulce Rescue":
// - produs cu discountPercent > 0 = ofertă (preț redus)
// - în ultimele 24h înainte de expirare = GRATIS

export const FREE_WINDOW_MS = 24 * 60 * 60 * 1000

export interface DealStatus {
  free: boolean
  discounted: boolean
  finalPrice: number
  target: number | null
  remainingMs: number | null
}

export function expiryTarget(expiryDate?: string | null): number | null {
  if (!expiryDate) return null
  const t = new Date(`${expiryDate}T23:59:59`).getTime()
  return isNaN(t) ? null : t
}

export function dealStatus(
  price: number,
  discountPercent?: number | null,
  expiryDate?: string | null,
  now: number = Date.now(),
): DealStatus {
  const dp = discountPercent ?? 0
  if (dp <= 0) return { free: false, discounted: false, finalPrice: price, target: null, remainingMs: null }
  const target = expiryTarget(expiryDate)
  const remainingMs = target !== null ? target - now : null
  const free = remainingMs !== null && remainingMs <= FREE_WINDOW_MS
  const finalPrice = free ? 0 : Math.round(price * (1 - dp / 100) * 100) / 100
  return { free, discounted: !free, finalPrice, target, remainingMs }
}

export function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return 'expiră acum'
  const days = Math.floor(diffMs / 86400000)
  const h = Math.floor(diffMs / 3600000) % 24
  const m = Math.floor(diffMs / 60000) % 60
  const s = Math.floor(diffMs / 1000) % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (days > 0) return `${days}z ${pad(h)}h ${pad(m)}m ${pad(s)}s`
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`
}
