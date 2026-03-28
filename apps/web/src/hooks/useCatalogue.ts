'use client'

import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PRODUCTS } from '@primekeys/shared'

export type CatalogueProduct = typeof PRODUCTS[0] & {
  discount?: number
  stockOut?: boolean
  customPrice?: number
  effectiveINR: number
  featured?: boolean
  flashSaleEnd?: string
  bulkDiscount?: number
  bulkMinMonths?: number
  isCustom?: boolean
  customPrices?: Record<string, number>   // per-currency admin overrides
  customLogo?: string                       // base64 or URL admin-uploaded logo
  stockOutDurations?: string[]              // e.g. ['1 Month', '3 Months']
}

let cachedProducts: CatalogueProduct[] | null = null
let listeners: Array<(p: CatalogueProduct[]) => void> = []
let unsubscribe: (() => void) | null = null

function merge(data: Record<string, any>): CatalogueProduct[] {
  // Base products from shared package
  const base: CatalogueProduct[] = PRODUCTS.map(p => {
    const override     = data[p.id] || {}
    const basePrice    = override.customPrice ?? p.baseINR
    const discount     = override.discount ?? 0
    const effectiveINR = Math.round(basePrice * (1 - discount / 100))
    return {
      ...p,
      ...override,
      effectiveINR,
      customPrices:      override.customPrices      ?? undefined,
      customLogo:        override.customLogo        ?? undefined,
      stockOutDurations: override.stockOutDurations ?? undefined,
    }
  })

  // Custom products added via admin
  const custom: CatalogueProduct[] = Object.entries(data)
    .filter(([, v]: any) => v.isCustom)
    .map(([id, v]: any) => ({
      id, name: v.name, category: v.category, baseINR: v.basePrice,
      badge: null, description: v.name, tags: [], features: [], color: '#D4AF37',
      isCustom: true,
      discount:          v.discount          ?? 0,
      stockOut:          v.stockOut          ?? false,
      customPrice:       v.customPrice       ?? null,
      featured:          v.featured          ?? false,
      flashSaleEnd:      v.flashSaleEnd      ?? null,
      bulkDiscount:      v.bulkDiscount      ?? 0,
      bulkMinMonths:     v.bulkMinMonths     ?? 3,
      customPrices:      v.customPrices      ?? undefined,
      customLogo:        v.customLogo        ?? undefined,
      stockOutDurations: v.stockOutDurations ?? undefined,
      effectiveINR: Math.round((v.customPrice ?? v.basePrice) * (1 - (v.discount ?? 0) / 100)),
    }))

  return [...base, ...custom]
}

function startListener() {
  if (unsubscribe) return
  const ref = doc(db, 'catalogue', 'config')
  unsubscribe = onSnapshot(ref, snap => {
    const data     = snap.exists() ? snap.data() : {}
    cachedProducts = merge(data)
    listeners.forEach(fn => fn(cachedProducts!))
  }, () => {
    if (!cachedProducts) {
      cachedProducts = merge({})
      listeners.forEach(fn => fn(cachedProducts!))
    }
  })
}

export function useCatalogue() {
  const [products, setProducts] = useState<CatalogueProduct[]>(
    cachedProducts ?? merge({})
  )

  useEffect(() => {
    listeners.push(setProducts)
    startListener()
    if (cachedProducts) setProducts(cachedProducts)
    return () => { listeners = listeners.filter(fn => fn !== setProducts) }
  }, [])

  return products
}