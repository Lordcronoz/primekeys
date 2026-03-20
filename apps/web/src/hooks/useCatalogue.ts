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
}

// Singleton cache so all components share one Firestore listener
let cachedProducts: CatalogueProduct[] | null = null
let listeners: Array<(p: CatalogueProduct[]) => void> = []
let unsubscribe: (() => void) | null = null

function merge(firestoreData: Record<string, any>): CatalogueProduct[] {
  return PRODUCTS.map(p => {
    const override = firestoreData[p.id] || {}
    const base = override.customPrice ?? p.baseINR
    const discount = override.discount ?? 0
    const effectiveINR = Math.round(base * (1 - discount / 100))
    return { ...p, ...override, effectiveINR }
  })
}

function startListener() {
  if (unsubscribe) return
  const ref = doc(db, 'catalogue', 'config')
  unsubscribe = onSnapshot(ref, snap => {
    const data = snap.exists() ? snap.data() : {}
    cachedProducts = merge(data)
    listeners.forEach(fn => fn(cachedProducts!))
  }, () => {
    // On error, use defaults
    if (!cachedProducts) {
      cachedProducts = merge({})
      listeners.forEach(fn => fn(cachedProducts!))
    }
  })
}

export function useCatalogue() {
  const [products, setProducts] = useState<CatalogueProduct[]>(
    cachedProducts ?? merge({}) // instant render with defaults
  )

  useEffect(() => {
    listeners.push(setProducts)
    startListener()
    // If we already have data, update immediately
    if (cachedProducts) setProducts(cachedProducts)
    return () => {
      listeners = listeners.filter(fn => fn !== setProducts)
    }
  }, [])

  return products
}