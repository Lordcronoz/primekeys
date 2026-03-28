// Server-side price calculation — mirrors frontend pricing
// Never trust `total` from frontend; always recalculate and verify

const PRODUCTS: Record<string, number> = {
  netflix:  149,
  spotify:   99,
  youtube:   89,
  chatgpt:  899,
  disney:   129,
  canva:    199,
  amazon:   149,
  linkedin: 599,
  appletv:   99,
}

const DURATIONS: Record<number, number> = {
  1:  1.0,
  3:  2.7,
  6:  5.2,
  12: 9.5,
}

const CURRENCY_RATES: Record<string, number> = {
  INR: 1,
  USD: 0.012,
  AED: 0.044,
  GBP: 0.0095,
  AUD: 0.018,
  SGD: 0.016,
  CAD: 0.016,
  EUR: 0.011,
  MYR: 0.056,
  QAR: 0.044,
  SAR: 0.045,
  KWD: 0.0037,
}

export function calcServerPrice(
  productId: string,
  durationMonths: number,
  currency: string,
): { expectedTotal: number; currency: string } {
  const baseINR = PRODUCTS[productId] ?? 149
  const mult    = DURATIONS[durationMonths] ?? 1.0
  const rate    = CURRENCY_RATES[currency] ?? 1

  const totalINR = Math.round(baseINR * mult)
  const total    = currency === 'INR' ? totalINR : parseFloat((totalINR * rate).toFixed(2))

  return { expectedTotal: total, currency }
}

export function verifyPrice(
  productId: string,
  durationMonths: number,
  currency: string,
  submittedTotal: number,
  tolerancePercent = 2,
): boolean {
  const { expectedTotal } = calcServerPrice(productId, durationMonths, currency)
  const diff = Math.abs(submittedTotal - expectedTotal) / expectedTotal
  return diff <= tolerancePercent / 100
}
