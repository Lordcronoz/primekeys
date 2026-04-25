'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { CatalogueProduct } from '@/hooks/useCatalogue'

export interface CartItem {
  product: CatalogueProduct
  months: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: CatalogueProduct, months?: number) => void
  removeFromCart: (productId: string) => void
  updateMonths: (productId: string, months: number) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType>({} as CartContextType)

const STORAGE_KEY = 'pk_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {}
    setHydrated(true)
  }, [])

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  const addToCart = useCallback((product: CatalogueProduct, months = 1) => {
    setItems(prev => {
      const exists = prev.find(i => i.product.id === product.id)
      if (exists) return prev // already in cart — just open drawer
      return [...prev, { product, months }]
    })
    setIsOpen(true)
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const updateMonths = useCallback((productId: string, months: number) => {
    setItems(prev => prev.map(i =>
      i.product.id === productId ? { ...i, months } : i
    ))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setIsOpen(false)
  }, [])

  const openCart  = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen(o => !o), [])

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateMonths,
      clearCart,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      totalItems: items.length,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
