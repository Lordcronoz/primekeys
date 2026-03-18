'use client'

import { useState, useEffect } from 'react'
import { Package, Tag, AlertTriangle, Check, X, Edit3, Save, ToggleLeft, ToggleRight, Percent } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'

// ── Default catalogue (fallback if Firestore empty) ─────────────────────────
const DEFAULT_CATALOGUE = [
  { id: 'netflix',          name: 'Netflix',          basePrice: 149, category: 'streaming',    emoji: '🎬' },
  { id: 'spotify',          name: 'Spotify',          basePrice: 99,  category: 'music',        emoji: '🎵' },
  { id: 'youtube-premium',  name: 'YouTube Premium',  basePrice: 89,  category: 'streaming',    emoji: '▶️' },
  { id: 'chatgpt-plus',     name: 'ChatGPT Plus',     basePrice: 899, category: 'ai',           emoji: '🤖' },
  { id: 'disney-hotstar',   name: 'Disney+ Hotstar',  basePrice: 129, category: 'streaming',    emoji: '🏰' },
  { id: 'canva-pro',        name: 'Canva Pro',        basePrice: 199, category: 'productivity', emoji: '🎨' },
  { id: 'amazon-prime',     name: 'Amazon Prime',     basePrice: 149, category: 'streaming',    emoji: '📦' },
  { id: 'linkedin-premium', name: 'LinkedIn Premium', basePrice: 599, category: 'productivity', emoji: '💼' },
  { id: 'apple-tv',         name: 'Apple TV+',        basePrice: 99,  category: 'streaming',    emoji: '🍎' },
]

type Product = {
  id: string
  name: string
  basePrice: number
  category: string
  emoji: string
  discount?: number       // percentage 0-100
  stockOut?: boolean
  customPrice?: number    // override base price
}

export function CatalogueSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Product>>({})
  const [saved, setSaved] = useState<string | null>(null)

  // Load from Firestore (catalogue/config doc)
  useEffect(() => {
    const ref = doc(db, 'catalogue', 'config')
    return onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = snap.data()
        // Merge Firestore overrides with defaults
        const merged = DEFAULT_CATALOGUE.map(p => ({
          ...p,
          ...(data[p.id] || {}),
        }))
        setProducts(merged)
      } else {
        setProducts(DEFAULT_CATALOGUE)
      }
      setLoading(false)
    })
  }, [])

  const saveProduct = async (product: Product) => {
    setSaving(product.id)
    try {
      const ref = doc(db, 'catalogue', 'config')
      const snap = await getDoc(ref)
      const existing = snap.exists() ? snap.data() : {}
      await setDoc(ref, {
        ...existing,
        [product.id]: {
          basePrice:   product.basePrice,
          customPrice: product.customPrice ?? null,
          discount:    product.discount ?? 0,
          stockOut:    product.stockOut ?? false,
        }
      })
      setSaved(product.id)
      setTimeout(() => setSaved(null), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(null)
      setEditing(null)
    }
  }

  const startEdit = (p: Product) => {
    setEditing(p.id)
    setEditValues({ basePrice: p.basePrice, customPrice: p.customPrice, discount: p.discount || 0, stockOut: p.stockOut || false })
  }

  const toggleStock = async (p: Product) => {
    const updated = { ...p, stockOut: !p.stockOut }
    setProducts(prev => prev.map(x => x.id === p.id ? updated : x))
    await saveProduct(updated)
  }

  const effectivePrice = (p: Product) => {
    const base = p.customPrice ?? p.basePrice
    const disc = p.discount || 0
    return Math.round(base * (1 - disc / 100))
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ fontSize: 13 }}>Loading catalogue...</p>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const outOfStock = products.filter(p => p.stockOut).length
  const discounted  = products.filter(p => (p.discount || 0) > 0).length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 6 }}>Catalogue</h2>
        <p style={{ fontSize: 13, color: '#555' }}>Manage prices, discounts and stock availability for all products.</p>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 980, fontSize: 12, color: '#D4AF37', fontWeight: 600 }}>
          <Package size={12} />{products.length} Products
        </div>
        {discounted > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 980, fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>
            <Percent size={12} />{discounted} Discounted
          </div>
        )}
        {outOfStock > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 980, fontSize: 12, color: '#f87171', fontWeight: 600 }}>
            <AlertTriangle size={12} />{outOfStock} Out of Stock
          </div>
        )}
      </div>

      {/* Product cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map(p => {
          const isEditing = editing === p.id
          const isSaving  = saving === p.id
          const wasSaved  = saved === p.id
          const effPrice  = effectivePrice(p)
          const hasDiscount = (p.discount || 0) > 0

          return (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${p.stockOut ? 'rgba(248,113,113,0.2)' : isEditing ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              {/* Main row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                {/* Emoji */}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {p.emoji}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: p.stockOut ? '#555' : '#f5f5f7' }}>{p.name}</p>
                    {p.stockOut && (
                      <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: 'rgba(248,113,113,0.1)', color: '#f87171', fontWeight: 700, letterSpacing: '0.08em' }}>STOCK OUT</span>
                    )}
                    {hasDiscount && !p.stockOut && (
                      <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: 'rgba(96,165,250,0.1)', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.08em' }}>{p.discount}% OFF</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: p.stockOut ? '#444' : '#D4AF37' }}>₹{effPrice}</span>
                    {hasDiscount && (
                      <span style={{ fontSize: 12, color: '#555', textDecoration: 'line-through' }}>₹{p.customPrice ?? p.basePrice}</span>
                    )}
                    <span style={{ fontSize: 11, color: '#444' }}>/mo</span>
                    <span style={{ fontSize: 10, color: '#333', padding: '2px 6px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>{p.category}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                  {/* Stock toggle */}
                  <button onClick={() => toggleStock(p)} disabled={isSaving}
                    title={p.stockOut ? 'Mark as Available' : 'Mark as Out of Stock'}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 8, border: `1px solid ${p.stockOut ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.1)'}`, background: p.stockOut ? 'rgba(248,113,113,0.08)' : 'transparent', color: p.stockOut ? '#f87171' : '#6e6e73', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {p.stockOut ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                    {p.stockOut ? 'In Stock' : 'Stock Out'}
                  </button>

                  {/* Edit */}
                  {wasSaved ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 8, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: 11, fontWeight: 600 }}>
                      <Check size={12} />Saved
                    </div>
                  ) : (
                    <button onClick={() => isEditing ? setEditing(null) : startEdit(p)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 8, background: isEditing ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isEditing ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)'}`, color: isEditing ? '#D4AF37' : '#a1a1a6', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      {isEditing ? <X size={12} /> : <Edit3 size={12} />}
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  )}
                </div>
              </div>

              {/* Edit panel */}
              {isEditing && (
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(212,175,55,0.02)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
                    {/* Base price */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Base Price (₹/mo)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#D4AF37', fontWeight: 700 }}>₹</span>
                        <input
                          type="number" min={1}
                          value={editValues.customPrice ?? editValues.basePrice ?? p.basePrice}
                          onChange={e => setEditValues(v => ({ ...v, customPrice: Number(e.target.value) }))}
                          style={{ ...fieldStyle, paddingLeft: 26 }}
                        />
                      </div>
                      <p style={{ fontSize: 10, color: '#444', marginTop: 4 }}>Default: ₹{p.basePrice}</p>
                    </div>

                    {/* Discount */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Discount (%)</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="number" min={0} max={90}
                          value={editValues.discount ?? 0}
                          onChange={e => setEditValues(v => ({ ...v, discount: Math.min(90, Math.max(0, Number(e.target.value))) }))}
                          style={{ ...fieldStyle, paddingRight: 28 }}
                        />
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#60a5fa', fontWeight: 700 }}>%</span>
                      </div>
                      {(editValues.discount || 0) > 0 && (
                        <p style={{ fontSize: 10, color: '#60a5fa', marginTop: 4 }}>
                          Final: ₹{Math.round((editValues.customPrice ?? editValues.basePrice ?? p.basePrice) * (1 - (editValues.discount || 0) / 100))}
                        </p>
                      )}
                    </div>

                    {/* Stock status */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Availability</label>
                      <button
                        onClick={() => setEditValues(v => ({ ...v, stockOut: !v.stockOut }))}
                        style={{ width: '100%', height: 36, borderRadius: 8, border: `1px solid ${editValues.stockOut ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'}`, background: editValues.stockOut ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.06)', color: editValues.stockOut ? '#f87171' : '#4ade80', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        {editValues.stockOut ? <><AlertTriangle size={13} />Out of Stock</> : <><Check size={13} />Available</>}
                      </button>
                    </div>
                  </div>

                  {/* Save */}
                  <button
                    onClick={() => {
                      const updated = { ...p, ...editValues }
                      setProducts(prev => prev.map(x => x.id === p.id ? updated : x))
                      saveProduct(updated)
                    }}
                    disabled={isSaving}
                    style={{ height: 38, padding: '0 24px', background: isSaving ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg,#D4AF37,#C49A20)', color: '#000', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
                  >
                    {isSaving ? (
                      <div style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    ) : (
                      <><Save size={13} />Save Changes</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

const fieldStyle: React.CSSProperties = {
  width: '100%', height: 36, padding: '0 12px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: '#f5f5f7', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit',
}