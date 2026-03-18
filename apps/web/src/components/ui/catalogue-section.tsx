'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle, Check, X, Edit3, Save, Percent } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'

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
  id: string; name: string; basePrice: number; category: string; emoji: string
  discount?: number; stockOut?: boolean; customPrice?: number
}

export function CatalogueSection() {
  // Start with defaults immediately — no loading state
  const [products, setProducts] = useState<Product[]>(DEFAULT_CATALOGUE)
  const [saving, setSaving] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Product>>({})
  const [saved, setSaved] = useState<string | null>(null)

  // Sync Firestore overrides in background — doesn't block render
  useEffect(() => {
    const ref = doc(db, 'catalogue', 'config')
    return onSnapshot(ref, snap => {
      if (!snap.exists()) return
      const data = snap.data()
      setProducts(DEFAULT_CATALOGUE.map(p => ({ ...p, ...(data[p.id] || {}) })))
    }, () => {}) // silent error — defaults already showing
  }, [])

  const saveProduct = async (product: Product) => {
    setSaving(product.id)
    try {
      const ref = doc(db, 'catalogue', 'config')
      // Use setDoc with merge so we don't overwrite other products
      await setDoc(ref, {
        [product.id]: {
          basePrice:   product.basePrice,
          customPrice: product.customPrice ?? null,
          discount:    product.discount ?? 0,
          stockOut:    product.stockOut ?? false,
        }
      }, { merge: true })
      setSaved(product.id)
      setTimeout(() => setSaved(null), 2000)
    } catch (e) {
      console.error('Failed to save product:', e)
    } finally {
      setSaving(null)
      setEditing(null)
    }
  }

  const toggleStock = async (p: Product) => {
    const updated = { ...p, stockOut: !p.stockOut }
    setProducts(prev => prev.map(x => x.id === p.id ? updated : x))
    await saveProduct(updated)
  }

  const effectivePrice = (p: Product) => {
    const base = p.customPrice ?? p.basePrice
    return Math.round(base * (1 - (p.discount || 0) / 100))
  }

  const outOfStock = products.filter(p => p.stockOut).length
  const discounted  = products.filter(p => (p.discount || 0) > 0).length

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 6 }}>Catalogue</h2>
        <p style={{ fontSize: 13, color: '#555' }}>Manage prices, discounts and stock availability.</p>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <Chip icon={<Package size={11} />} label={`${products.length} Products`} color="#D4AF37" />
        {discounted > 0 && <Chip icon={<Percent size={11} />} label={`${discounted} Discounted`} color="#60a5fa" />}
        {outOfStock > 0 && <Chip icon={<AlertTriangle size={11} />} label={`${outOfStock} Out of Stock`} color="#f87171" />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map(p => {
          const isEditing  = editing === p.id
          const isSaving   = saving === p.id
          const wasSaved   = saved === p.id
          const effPrice   = effectivePrice(p)
          const hasDiscount = (p.discount || 0) > 0

          return (
            <div key={p.id} style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${p.stockOut ? 'rgba(248,113,113,0.2)' : isEditing ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s',
            }}>
              {/* Main row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {p.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: p.stockOut ? '#555' : '#f5f5f7' }}>{p.name}</p>
                    {p.stockOut && <Badge label="STOCK OUT" color="#f87171" bg="rgba(248,113,113,0.1)" />}
                    {hasDiscount && !p.stockOut && <Badge label={`${p.discount}% OFF`} color="#60a5fa" bg="rgba(96,165,250,0.1)" />}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: p.stockOut ? '#444' : '#D4AF37' }}>₹{effPrice}</span>
                    {hasDiscount && <span style={{ fontSize: 11, color: '#555', textDecoration: 'line-through' }}>₹{p.customPrice ?? p.basePrice}</span>}
                    <span style={{ fontSize: 10, color: '#444' }}>/mo</span>
                    <span style={{ fontSize: 10, color: '#333', padding: '1px 6px', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }}>{p.category}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
                  <button onClick={() => toggleStock(p)} disabled={isSaving}
                    style={{ height: 30, padding: '0 10px', borderRadius: 7, border: `1px solid ${p.stockOut ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.1)'}`, background: p.stockOut ? 'rgba(248,113,113,0.08)' : 'transparent', color: p.stockOut ? '#f87171' : '#6e6e73', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {p.stockOut ? '✓ In Stock' : 'Stock Out'}
                  </button>

                  {wasSaved ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 30, padding: '0 10px', borderRadius: 7, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', fontSize: 11, fontWeight: 600 }}>
                      <Check size={11} />Saved
                    </div>
                  ) : (
                    <button onClick={() => { if (isEditing) { setEditing(null) } else { setEditing(p.id); setEditValues({ basePrice: p.basePrice, customPrice: p.customPrice, discount: p.discount || 0, stockOut: p.stockOut || false }) } }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, height: 30, padding: '0 10px', borderRadius: 7, background: isEditing ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isEditing ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.08)'}`, color: isEditing ? '#D4AF37' : '#a1a1a6', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      {isEditing ? <><X size={11} />Cancel</> : <><Edit3 size={11} />Edit</>}
                    </button>
                  )}
                </div>
              </div>

              {/* Edit panel */}
              {isEditing && (
                <div style={{ padding: '14px 18px 18px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(212,175,55,0.02)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Base Price (₹/mo)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#D4AF37', fontWeight: 700 }}>₹</span>
                        <input type="number" min={1} value={editValues.customPrice ?? editValues.basePrice ?? p.basePrice}
                          onChange={e => setEditValues(v => ({ ...v, customPrice: Number(e.target.value) }))}
                          style={{ ...fieldStyle, paddingLeft: 24 }} />
                      </div>
                      <p style={{ fontSize: 10, color: '#444', marginTop: 3 }}>Default: ₹{p.basePrice}</p>
                    </div>
                    <div>
                      <label style={labelStyle}>Discount (%)</label>
                      <div style={{ position: 'relative' }}>
                        <input type="number" min={0} max={90} value={editValues.discount ?? 0}
                          onChange={e => setEditValues(v => ({ ...v, discount: Math.min(90, Math.max(0, Number(e.target.value))) }))}
                          style={{ ...fieldStyle, paddingRight: 24 }} />
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#60a5fa', fontWeight: 700 }}>%</span>
                      </div>
                      {(editValues.discount || 0) > 0 && (
                        <p style={{ fontSize: 10, color: '#60a5fa', marginTop: 3 }}>
                          Final: ₹{Math.round((editValues.customPrice ?? editValues.basePrice ?? p.basePrice) * (1 - (editValues.discount || 0) / 100))}
                        </p>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>Availability</label>
                      <button onClick={() => setEditValues(v => ({ ...v, stockOut: !v.stockOut }))}
                        style={{ width: '100%', height: 34, borderRadius: 8, border: `1px solid ${editValues.stockOut ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'}`, background: editValues.stockOut ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.06)', color: editValues.stockOut ? '#f87171' : '#4ade80', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        {editValues.stockOut ? <><AlertTriangle size={12} />Out of Stock</> : <><Check size={12} />Available</>}
                      </button>
                    </div>
                  </div>
                  <button onClick={() => { const updated = { ...p, ...editValues }; setProducts(prev => prev.map(x => x.id === p.id ? updated : x)); saveProduct(updated) }} disabled={isSaving}
                    style={{ height: 36, padding: '0 20px', background: isSaving ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg,#D4AF37,#C49A20)', color: '#000', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isSaving ? <div style={{ width: 13, height: 13, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <><Save size={12} />Save Changes</>}
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

function Chip({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: `${color}12`, border: `1px solid ${color}33`, borderRadius: 980, fontSize: 11, color, fontWeight: 600 }}>
      {icon}{label}
    </div>
  )
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: bg, color, fontWeight: 700, letterSpacing: '0.06em' }}>{label}</span>
}

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 5, letterSpacing: '0.05em', textTransform: 'uppercase' }
const fieldStyle: React.CSSProperties = { width: '100%', height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }