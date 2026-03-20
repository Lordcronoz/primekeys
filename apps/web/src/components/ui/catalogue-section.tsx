'use client'

import { useState, useEffect } from 'react'
import { Package, AlertTriangle, Check, X, Edit3, Save, Percent, Plus, Trash2 } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { PRODUCTS } from '@primekeys/shared'

// ── Use PRODUCTS from shared as the source of truth ──────
// Firestore only stores OVERRIDES (price, discount, stockOut, plus custom added services)
type Product = {
  id: string; name: string; basePrice: number; category: string; emoji: string
  discount?: number; stockOut?: boolean; customPrice?: number
  isCustom?: boolean // true = added by admin, not in shared package
}

const BASE_PRODUCTS: Product[] = PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  basePrice: p.baseINR,
  category: p.category,
  emoji: categoryEmoji(p.category),
}))

function categoryEmoji(cat: string): string {
  const map: Record<string, string> = { streaming: '🎬', music: '🎵', ai: '🤖', productivity: '💼' }
  return map[cat] || '📦'
}

const CATEGORIES = ['streaming', 'music', 'ai', 'productivity', 'other']

export function CatalogueSection() {
  const [products, setProducts] = useState<Product[]>(BASE_PRODUCTS)
  const [firestoreData, setFirestoreData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Product>>({})
  const [saved, setSaved] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newService, setNewService] = useState({ name: '', basePrice: '', category: 'streaming', emoji: '📦' })
  const [addingSvc, setAddingSvc] = useState(false)

  useEffect(() => {
    const ref = doc(db, 'catalogue', 'config')
    return onSnapshot(ref, snap => {
      if (!snap.exists()) return
      const data = snap.data()
      setFirestoreData(data)
      // Merge base products with overrides + any custom services
      const customServices: Product[] = Object.entries(data)
        .filter(([, v]: any) => v.isCustom)
        .map(([id, v]: any) => ({ id, name: v.name, basePrice: v.basePrice, category: v.category, emoji: v.emoji || '📦', isCustom: true, discount: v.discount, stockOut: v.stockOut, customPrice: v.customPrice }))
      const merged = BASE_PRODUCTS.map(p => ({ ...p, ...(data[p.id] || {}) }))
      setProducts([...merged, ...customServices])
    }, () => {})
  }, [])

  const saveProduct = async (product: Product) => {
    setSaving(product.id)
    try {
      const ref = doc(db, 'catalogue', 'config')
      await setDoc(ref, {
        [product.id]: {
          ...(product.isCustom ? { name: product.name, basePrice: product.basePrice, category: product.category, emoji: product.emoji, isCustom: true } : {}),
          customPrice: product.customPrice ?? null,
          discount:    product.discount ?? 0,
          stockOut:    product.stockOut ?? false,
        }
      }, { merge: true })
      setSaved(product.id)
      setTimeout(() => setSaved(null), 2000)
    } catch (e) { console.error('Failed to save:', e) }
    finally { setSaving(null); setEditing(null) }
  }

  const deleteCustomService = async (id: string) => {
    if (!confirm('Delete this service?')) return
    try {
      const ref = doc(db, 'catalogue', 'config')
      // Remove by setting to null via merge won't work — we need to get existing and rebuild
      const existing = { ...firestoreData }
      delete existing[id]
      await setDoc(ref, existing)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (e) { console.error(e) }
  }

  const addCustomService = async () => {
    if (!newService.name.trim() || !newService.basePrice) return
    setAddingSvc(true)
    try {
      const id = newService.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const product: Product = {
        id, name: newService.name.trim(),
        basePrice: Number(newService.basePrice),
        category: newService.category,
        emoji: newService.emoji || '📦',
        isCustom: true,
      }
      const ref = doc(db, 'catalogue', 'config')
      await setDoc(ref, {
        [id]: { name: product.name, basePrice: product.basePrice, category: product.category, emoji: product.emoji, isCustom: true, discount: 0, stockOut: false, customPrice: null }
      }, { merge: true })
      setNewService({ name: '', basePrice: '', category: 'streaming', emoji: '📦' })
      setShowAddForm(false)
    } catch (e) { console.error(e) }
    finally { setAddingSvc(false) }
  }

  const toggleStock = async (p: Product) => {
    const updated = { ...p, stockOut: !p.stockOut }
    setProducts(prev => prev.map(x => x.id === p.id ? updated : x))
    await saveProduct(updated)
  }

  const effectivePrice = (p: Product) => Math.round((p.customPrice ?? p.basePrice) * (1 - (p.discount || 0) / 100))

  const outOfStock = products.filter(p => p.stockOut).length
  const discounted  = products.filter(p => (p.discount || 0) > 0).length
  const customCount = products.filter(p => p.isCustom).length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f5f5f7', letterSpacing: '-0.02em', marginBottom: 6 }}>Catalogue</h2>
          <p style={{ fontSize: 13, color: '#555' }}>Manage prices, discounts and stock. Changes reflect live on the store.</p>
        </div>
        <button onClick={() => setShowAddForm(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 16px', borderRadius: 10, background: showAddForm ? 'rgba(212,175,55,0.15)' : 'linear-gradient(135deg,#D4AF37,#C49A20)', border: showAddForm ? '1px solid rgba(212,175,55,0.3)' : 'none', color: showAddForm ? '#D4AF37' : '#000', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {showAddForm ? <><X size={14} />Cancel</> : <><Plus size={14} />Add Service</>}
        </button>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <Chip icon={<Package size={11} />} label={`${products.length} Products`} color="#D4AF37" />
        {discounted > 0 && <Chip icon={<Percent size={11} />} label={`${discounted} Discounted`} color="#60a5fa" />}
        {outOfStock > 0 && <Chip icon={<AlertTriangle size={11} />} label={`${outOfStock} Out of Stock`} color="#f87171" />}
        {customCount > 0 && <Chip icon={<Plus size={11} />} label={`${customCount} Custom`} color="#a78bfa" />}
      </div>

      {/* Add Service Form */}
      {showAddForm && (
        <div style={{ marginBottom: 20, padding: '20px', background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#D4AF37', marginBottom: 16 }}>New Service</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 80px', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Service Name</label>
              <input type="text" value={newService.name} onChange={e => setNewService(v => ({ ...v, name: e.target.value }))}
                placeholder="e.g. Duolingo Plus" style={fieldStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
            </div>
            <div>
              <label style={labelStyle}>Base Price (₹/mo)</label>
              <input type="number" min={1} value={newService.basePrice} onChange={e => setNewService(v => ({ ...v, basePrice: e.target.value }))}
                placeholder="e.g. 199" style={fieldStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={newService.category} onChange={e => setNewService(v => ({ ...v, category: e.target.value }))}
                style={{ ...fieldStyle, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Emoji</label>
              <input type="text" value={newService.emoji} onChange={e => setNewService(v => ({ ...v, emoji: e.target.value }))}
                placeholder="📦" style={{ ...fieldStyle, textAlign: 'center', fontSize: 18 }} />
            </div>
          </div>
          <button onClick={addCustomService} disabled={addingSvc || !newService.name.trim() || !newService.basePrice}
            style={{ height: 38, padding: '0 20px', background: addingSvc || !newService.name.trim() ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg,#D4AF37,#C49A20)', color: '#000', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: addingSvc ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            {addingSvc ? <div style={{ width: 13, height: 13, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <><Plus size={13} />Add to Catalogue</>}
          </button>
        </div>
      )}

      {/* Product list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map(p => {
          const isEditing  = editing === p.id
          const isSaving   = saving === p.id
          const wasSaved   = saved === p.id
          const effPrice   = effectivePrice(p)
          const hasDiscount = (p.discount || 0) > 0

          return (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${p.stockOut ? 'rgba(248,113,113,0.2)' : isEditing ? 'rgba(212,175,55,0.25)' : p.isCustom ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px' }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {p.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: p.stockOut ? '#555' : '#f5f5f7' }}>{p.name}</p>
                    {p.isCustom && <Badge label="CUSTOM" color="#a78bfa" bg="rgba(167,139,250,0.1)" />}
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
                    style={{ height: 30, padding: '0 10px', borderRadius: 7, border: `1px solid ${p.stockOut ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.1)'}`, background: p.stockOut ? 'rgba(248,113,113,0.08)' : 'transparent', color: p.stockOut ? '#f87171' : '#6e6e73', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {p.stockOut ? '✓ In Stock' : 'Stock Out'}
                  </button>

                  {p.isCustom && (
                    <button onClick={() => deleteCustomService(p.id)}
                      style={{ height: 30, width: 30, borderRadius: 7, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.06)', color: '#f87171', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={12} />
                    </button>
                  )}

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
  return <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: `${color}12`, border: `1px solid ${color}33`, borderRadius: 980, fontSize: 11, color, fontWeight: 600 }}>{icon}{label}</div>
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: bg, color, fontWeight: 700, letterSpacing: '0.06em' }}>{label}</span>
}

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 5, letterSpacing: '0.05em', textTransform: 'uppercase' }
const fieldStyle: React.CSSProperties = { width: '100%', height: 34, padding: '0 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f5f5f7', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }