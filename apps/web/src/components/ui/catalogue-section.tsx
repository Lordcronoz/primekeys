'use client'

import { useState, useEffect, useRef } from 'react'
import { Package, AlertTriangle, Check, X, Edit3, Save, Percent, Plus, Trash2, Zap, Star, Upload, ImageIcon } from 'lucide-react'
import { db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { PRODUCTS } from '@primekeys/shared'

const enc = (s: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`

const DEFAULT_LOGOS: Record<string, string> = {
  netflix:  enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#E50914" d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 24c-.538.086-2.953.408-4.32.6L9.386 13.098v10.821L5.398 24V0z"/></svg>`),
  spotify:  enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#1DB954" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`),
  youtube:  enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`),
  chatgpt:  enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#10a37f" d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073z"/></svg>`),
  disney:   enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#113CCF" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.188 5.52c.738 0 1.29.204 1.656.612.366.408.549.936.549 1.584s-.183 1.176-.549 1.584c-.366.408-.918.612-1.656.612-.744 0-1.302-.204-1.674-.612-.372-.408-.558-.936-.558-1.584s.186-1.176.558-1.584c.372-.408.93-.612 1.674-.612z"/></svg>`),
  canva:    enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#00C4CC" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.097 15.515c-.437.631-1.19 1.069-1.934 1.069-1.178 0-1.769-.85-2.284-1.638-.363-.563-.671-1.028-1.026-1.028-.354 0-.662.47-1.024 1.033-.53.822-1.124 1.638-2.284 1.638-.742 0-1.497-.436-1.933-1.067-.392-.563-.57-1.281-.57-2.113 0-1.688.69-3.127 1.944-3.127 1.089 0 1.611 1.251 2.126 2.478.263.63.528 1.264.787 1.264.264 0 .528-.641.794-1.277.515-1.223 1.035-2.465 2.126-2.465 1.254 0 1.944 1.439 1.944 3.127-.001.833-.179 1.551-.666 2.106z"/></svg>`),
  amazon:   enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FF9900" d="M13.958 10.09c0 1.232.029 2.256-.591 3.351-.502.891-1.301 1.438-2.186 1.438-1.214 0-1.922-.924-1.922-2.292 0-2.692 2.415-3.182 4.7-3.182v.685zm3.186 7.705c-.209.189-.512.201-.745.074-1.047-.872-1.234-1.276-1.814-2.106-1.734 1.768-2.962 2.297-5.209 2.297-2.66 0-4.731-1.641-4.731-4.925 0-2.565 1.391-4.309 3.37-5.164 1.715-.754 4.11-.891 5.942-1.099v-.41c0-.753.06-1.642-.384-2.294-.385-.579-1.124-.82-1.775-.82-1.205 0-2.277.618-2.54 1.897-.054.285-.261.567-.549.582l-3.061-.333c-.259-.056-.548-.266-.472-.66C5.977 2.469 9.068 1.5 11.846 1.5c1.44 0 3.32.384 4.454 1.476 1.439 1.342 1.301 3.134 1.301 5.086v4.607c0 1.385.576 1.993 1.117 2.741.19.267.232.587-.01.784-.604.505-1.678 1.443-2.269 1.973l-.295-.362zM24 18.558c-2.9 2.045-7.111 3.134-10.729 3.134-5.077 0-9.643-1.876-13.099-4.997-.272-.245-.029-.578.298-.388 3.732 2.17 8.344 3.476 13.1 3.476 3.212 0 6.748-.665 9.998-2.044.49-.208.9.326.432.819z"/></svg>`),
  linkedin: enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`),
  appletv:  enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#f5f5f7" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`),
}

type Product = {
  id: string; name: string; basePrice: number; category: string; emoji: string
  discount?: number; stockOut?: boolean; customPrice?: number; isCustom?: boolean
  featured?: boolean; flashSaleEnd?: string; bulkDiscount?: number; bulkMinMonths?: number
  customLogo?: string // base64 uploaded logo
}

const BASE_PRODUCTS: Product[] = PRODUCTS.map(p => ({
  id: p.id, name: p.name, basePrice: p.baseINR, category: p.category,
  emoji: ({ streaming:'🎬', music:'🎵', ai:'🤖', productivity:'💼' } as any)[p.category] || '📦',
}))

const CATEGORIES = ['streaming', 'music', 'ai', 'productivity', 'other']

function FlashCountdown({ endTime }: { endTime: string }) {
  const [t, setT] = useState('')
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now()
      if (diff <= 0) { setT('Ended'); return }
      const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000)
      setT(`${h}h ${m}m ${s}s`)
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [endTime])
  return <span style={{ fontSize: 10, color: '#f97316', fontWeight: 700 }}>⚡ {t} left</span>
}

// ── Logo upload button ────────────────────────────────────
function LogoUpload({ currentLogo, defaultLogo, onUpload, onReset }: {
  currentLogo?: string; defaultLogo?: string
  onUpload: (base64: string) => void; onReset: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const displayLogo = currentLogo || defaultLogo

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) { setError('Max 500KB'); return }
    setUploading(true)
    setError('')
    const reader = new FileReader()
    reader.onload = () => { onUpload(reader.result as string); setUploading(false) }
    reader.onerror = () => { setError('Upload failed'); setUploading(false) }
    reader.readAsDataURL(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div>
      <label style={lbl}>Logo</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Preview */}
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {displayLogo
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={displayLogo} alt="logo" width={26} height={26} style={{ objectFit: 'contain' }} />
            : <ImageIcon size={16} color="#555" />
          }
        </div>
        {/* Upload btn */}
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 12px', borderRadius: 8, background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          <Upload size={11} />{uploading ? 'Uploading...' : 'Upload'}
        </button>
        {/* Reset to default */}
        {currentLogo && (
          <button type="button" onClick={onReset}
            style={{ display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 10px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#555', fontSize: 11, cursor: 'pointer' }}>
            <X size={10} />Reset
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFile} style={{ display: 'none' }} />
      </div>
      {error && <p style={{ fontSize: 10, color: '#f87171', marginTop: 4 }}>{error}</p>}
      <p style={{ fontSize: 10, color: '#444', marginTop: 4 }}>PNG, JPG, WebP or SVG · Max 500KB</p>
    </div>
  )
}

export function CatalogueSection() {
  const [products, setProducts] = useState<Product[]>(BASE_PRODUCTS)
  const [firestoreData, setFirestoreData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Product> & { flashSaleHours?: number }>({})
  const [saved, setSaved] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newSvc, setNewSvc] = useState({ name: '', basePrice: '', category: 'streaming', emoji: '📦' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    return onSnapshot(doc(db, 'catalogue', 'config'), snap => {
      if (!snap.exists()) return
      const data = snap.data(); setFirestoreData(data)
      const custom: Product[] = Object.entries(data).filter(([,v]:any) => v.isCustom)
        .map(([id,v]:any) => ({ id, name:v.name, basePrice:v.basePrice, category:v.category, emoji:v.emoji||'📦', isCustom:true, ...v }))
      setProducts([...BASE_PRODUCTS.map(p => ({ ...p, ...(data[p.id]||{}) })), ...custom])
    }, () => {})
  }, [])

  const save = async (p: Product) => {
    setSaving(p.id)
    try {
      await setDoc(doc(db,'catalogue','config'), {
        [p.id]: {
          ...(p.isCustom ? { name:p.name, basePrice:p.basePrice, category:p.category, emoji:p.emoji, isCustom:true } : {}),
          customPrice:   p.customPrice ?? null,
          discount:      p.discount ?? 0,
          stockOut:      p.stockOut ?? false,
          featured:      p.featured ?? false,
          flashSaleEnd:  p.flashSaleEnd ?? null,
          bulkDiscount:  p.bulkDiscount ?? 0,
          bulkMinMonths: p.bulkMinMonths ?? 3,
          customLogo:    p.customLogo ?? null,
        }
      }, { merge: true })
      setSaved(p.id); setTimeout(() => setSaved(null), 2000)
    } catch(e) { console.error(e) }
    finally { setSaving(null); setEditing(null) }
  }

  const delCustom = async (id: string) => {
    if (!confirm('Delete this service?')) return
    const d = { ...firestoreData }; delete d[id]
    await setDoc(doc(db,'catalogue','config'), d)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const addSvc = async () => {
    if (!newSvc.name.trim() || !newSvc.basePrice) return
    setAdding(true)
    const id = newSvc.name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
    try {
      await setDoc(doc(db,'catalogue','config'), {
        [id]: { name:newSvc.name.trim(), basePrice:Number(newSvc.basePrice), category:newSvc.category, emoji:newSvc.emoji||'📦', isCustom:true, discount:0, stockOut:false, customPrice:null, featured:false, flashSaleEnd:null, bulkDiscount:0, bulkMinMonths:3, customLogo:null }
      }, { merge: true })
      setNewSvc({ name:'', basePrice:'', category:'streaming', emoji:'📦' }); setShowAdd(false)
    } catch(e) { console.error(e) } finally { setAdding(false) }
  }

  const eff = (p: Product) => Math.round((p.customPrice ?? p.basePrice) * (1-(p.discount||0)/100))

  const getLogo = (p: Product) => p.customLogo || DEFAULT_LOGOS[p.id]

  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:700, color:'#f5f5f7', letterSpacing:'-0.02em', marginBottom:6 }}>Catalogue</h2>
          <p style={{ fontSize:13, color:'#555' }}>Changes reflect live on the store instantly.</p>
        </div>
        <button onClick={() => setShowAdd(v=>!v)} style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 16px', borderRadius:10, background:showAdd?'rgba(212,175,55,0.1)':'linear-gradient(135deg,#D4AF37,#C49A20)', border:showAdd?'1px solid rgba(212,175,55,0.3)':'none', color:showAdd?'#D4AF37':'#000', fontSize:13, fontWeight:700, cursor:'pointer' }}>
          {showAdd ? <><X size={14}/>Cancel</> : <><Plus size={14}/>Add Service</>}
        </button>
      </div>

      {/* Summary chips */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <Chip icon={<Package size={11}/>} label={`${products.length} Products`} color="#D4AF37"/>
        {products.filter(p=>(p.discount||0)>0).length>0 && <Chip icon={<Percent size={11}/>} label={`${products.filter(p=>(p.discount||0)>0).length} Discounted`} color="#60a5fa"/>}
        {products.filter(p=>p.stockOut).length>0 && <Chip icon={<AlertTriangle size={11}/>} label={`${products.filter(p=>p.stockOut).length} Out of Stock`} color="#f87171"/>}
        {products.filter(p=>p.featured).length>0 && <Chip icon={<Star size={11}/>} label={`${products.filter(p=>p.featured).length} Featured`} color="#fbbf24"/>}
        {products.filter(p=>p.customLogo).length>0 && <Chip icon={<ImageIcon size={11}/>} label={`${products.filter(p=>p.customLogo).length} Custom Logo`} color="#a78bfa"/>}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ marginBottom:20, padding:20, background:'rgba(212,175,55,0.04)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:16 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'#D4AF37', marginBottom:16 }}>New Service</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 80px', gap:12, marginBottom:14 }}>
            <div><label style={lbl}>Name</label><input type="text" value={newSvc.name} onChange={e=>setNewSvc(v=>({...v,name:e.target.value}))} placeholder="e.g. Duolingo Plus" style={fld} onFocus={e=>(e.currentTarget.style.borderColor='rgba(212,175,55,0.5)')} onBlur={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.1)')}/></div>
            <div><label style={lbl}>Price (₹/mo)</label><input type="number" min={1} value={newSvc.basePrice} onChange={e=>setNewSvc(v=>({...v,basePrice:e.target.value}))} placeholder="199" style={fld} onFocus={e=>(e.currentTarget.style.borderColor='rgba(212,175,55,0.5)')} onBlur={e=>(e.currentTarget.style.borderColor='rgba(255,255,255,0.1)')}/></div>
            <div><label style={lbl}>Category</label><select value={newSvc.category} onChange={e=>setNewSvc(v=>({...v,category:e.target.value}))} style={{...fld,cursor:'pointer'}}>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><label style={lbl}>Emoji</label><input type="text" value={newSvc.emoji} onChange={e=>setNewSvc(v=>({...v,emoji:e.target.value}))} style={{...fld,textAlign:'center',fontSize:18}}/></div>
          </div>
          <button onClick={addSvc} disabled={adding||!newSvc.name.trim()||!newSvc.basePrice} style={{ height:38, padding:'0 20px', background:!newSvc.name.trim()?'rgba(212,175,55,0.3)':'linear-gradient(135deg,#D4AF37,#C49A20)', color:'#000', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            {adding ? <Spin/> : <><Plus size={13}/>Add to Catalogue</>}
          </button>
        </div>
      )}

      {/* Product list */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {products.map(p => {
          const isEdit=editing===p.id, isSav=saving===p.id, wasSav=saved===p.id
          const effP=eff(p), hasDis=(p.discount||0)>0
          const hasFlash=p.flashSaleEnd&&new Date(p.flashSaleEnd).getTime()>Date.now()
          const hasBulk=(p.bulkDiscount||0)>0
          const logo=getLogo(p)

          return (
            <div key={p.id} style={{ background:'rgba(255,255,255,0.02)', border:`1px solid ${p.stockOut?'rgba(248,113,113,0.2)':isEdit?'rgba(212,175,55,0.3)':p.featured?'rgba(251,191,36,0.2)':p.isCustom?'rgba(167,139,250,0.15)':'rgba(255,255,255,0.07)'}`, borderRadius:16, overflow:'hidden', transition:'border-color 0.2s' }}>

              <div style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px' }}>
                <div style={{ width:42, height:42, borderRadius:11, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden', position:'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {logo ? <img src={logo} alt={p.name} width={28} height={28} style={{objectFit:'contain'}}/> : <span style={{fontSize:18}}>{p.emoji}</span>}
                  {p.customLogo && <div style={{ position:'absolute', bottom:2, right:2, width:10, height:10, borderRadius:'50%', background:'#a78bfa', border:'1px solid #000' }} title="Custom logo" />}
                </div>

                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3, flexWrap:'wrap' }}>
                    <p style={{ fontSize:14, fontWeight:700, color:p.stockOut?'#555':'#f5f5f7' }}>{p.name}</p>
                    {p.featured && <Badge label="★ FEATURED" color="#fbbf24" bg="rgba(251,191,36,0.1)"/>}
                    {hasFlash && <Badge label="⚡ FLASH" color="#f97316" bg="rgba(249,115,22,0.1)"/>}
                    {p.isCustom && <Badge label="CUSTOM" color="#a78bfa" bg="rgba(167,139,250,0.1)"/>}
                    {p.stockOut && <Badge label="STOCK OUT" color="#f87171" bg="rgba(248,113,113,0.1)"/>}
                    {hasDis && !p.stockOut && <Badge label={`${p.discount}% OFF`} color="#60a5fa" bg="rgba(96,165,250,0.1)"/>}
                    {hasBulk && <Badge label={`${p.bulkDiscount}% bulk`} color="#4ade80" bg="rgba(74,222,128,0.1)"/>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                    <span style={{ fontSize:17, fontWeight:800, color:p.stockOut?'#444':'#D4AF37' }}>₹{effP}</span>
                    {hasDis && <span style={{ fontSize:11, color:'#555', textDecoration:'line-through' }}>₹{p.customPrice??p.basePrice}</span>}
                    <span style={{ fontSize:10, color:'#444' }}>/mo</span>
                    <span style={{ fontSize:10, color:'#333', padding:'1px 6px', background:'rgba(255,255,255,0.03)', borderRadius:4 }}>{p.category}</span>
                    {hasFlash && <FlashCountdown endTime={p.flashSaleEnd!}/>}
                  </div>
                </div>

                <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0, flexWrap:'wrap', justifyContent:'flex-end' }}>
                  <button onClick={async()=>{const u={...p,featured:!p.featured};setProducts(prev=>prev.map(x=>x.id===p.id?u:x));await save(u)}} title={p.featured?'Unfeature':'Feature'}
                    style={{ height:30, width:30, borderRadius:7, border:`1px solid ${p.featured?'rgba(251,191,36,0.4)':'rgba(255,255,255,0.08)'}`, background:p.featured?'rgba(251,191,36,0.1)':'transparent', color:p.featured?'#fbbf24':'#555', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Star size={13}/>
                  </button>

                  <button onClick={async()=>{const u={...p,stockOut:!p.stockOut};setProducts(prev=>prev.map(x=>x.id===p.id?u:x));await save(u)}} disabled={isSav}
                    style={{ height:30, padding:'0 10px', borderRadius:7, border:`1px solid ${p.stockOut?'rgba(248,113,113,0.3)':'rgba(255,255,255,0.1)'}`, background:p.stockOut?'rgba(248,113,113,0.08)':'transparent', color:p.stockOut?'#f87171':'#6e6e73', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                    {p.stockOut?'✓ In Stock':'Stock Out'}
                  </button>

                  {p.isCustom && (
                    <button onClick={()=>delCustom(p.id)} style={{ height:30, width:30, borderRadius:7, border:'1px solid rgba(248,113,113,0.2)', background:'rgba(248,113,113,0.06)', color:'#f87171', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Trash2 size={12}/>
                    </button>
                  )}

                  {wasSav ? (
                    <div style={{ display:'flex', alignItems:'center', gap:4, height:30, padding:'0 10px', borderRadius:7, background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', color:'#4ade80', fontSize:11, fontWeight:600 }}>
                      <Check size={11}/>Saved
                    </div>
                  ) : (
                    <button onClick={()=>{ if(isEdit){setEditing(null)}else{setEditing(p.id);setEditValues({basePrice:p.basePrice,customPrice:p.customPrice,discount:p.discount||0,stockOut:p.stockOut||false,featured:p.featured||false,flashSaleHours:0,bulkDiscount:p.bulkDiscount||0,bulkMinMonths:p.bulkMinMonths||3,customLogo:p.customLogo})} }}
                      style={{ display:'flex', alignItems:'center', gap:4, height:30, padding:'0 10px', borderRadius:7, background:isEdit?'rgba(212,175,55,0.12)':'rgba(255,255,255,0.04)', border:`1px solid ${isEdit?'rgba(212,175,55,0.3)':'rgba(255,255,255,0.08)'}`, color:isEdit?'#D4AF37':'#a1a1a6', fontSize:11, fontWeight:600, cursor:'pointer' }}>
                      {isEdit?<><X size={11}/>Cancel</>:<><Edit3 size={11}/>Edit</>}
                    </button>
                  )}
                </div>
              </div>

              {isEdit && (
                <div style={{ padding:'16px 18px 18px', borderTop:'1px solid rgba(255,255,255,0.05)', background:'rgba(212,175,55,0.02)' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:14 }}>
                    <div>
                      <label style={lbl}>Price Override (₹)</label>
                      <div style={{position:'relative'}}>
                        <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',fontSize:12,color:'#D4AF37',fontWeight:700}}>₹</span>
                        <input type="number" min={1} value={editValues.customPrice??editValues.basePrice??p.basePrice} onChange={e=>setEditValues(v=>({...v,customPrice:Number(e.target.value)}))} style={{...fld,paddingLeft:24}}/>
                      </div>
                      <p style={{fontSize:10,color:'#444',marginTop:3}}>Default: ₹{p.basePrice}</p>
                    </div>
                    <div>
                      <label style={lbl}>Discount %</label>
                      <div style={{position:'relative'}}>
                        <input type="number" min={0} max={90} value={editValues.discount??0} onChange={e=>setEditValues(v=>({...v,discount:Math.min(90,Math.max(0,Number(e.target.value)))}))} style={{...fld,paddingRight:24}}/>
                        <span style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontSize:12,color:'#60a5fa',fontWeight:700}}>%</span>
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>Bulk Discount %</label>
                      <input type="number" min={0} max={50} value={editValues.bulkDiscount??0} onChange={e=>setEditValues(v=>({...v,bulkDiscount:Number(e.target.value)}))} style={fld} placeholder="e.g. 5"/>
                      <label style={{...lbl,marginTop:6}}>Min Months</label>
                      <input type="number" min={2} max={12} value={editValues.bulkMinMonths??3} onChange={e=>setEditValues(v=>({...v,bulkMinMonths:Number(e.target.value)}))} style={fld}/>
                    </div>
                    <div>
                      <label style={lbl}>Flash Sale (hours)</label>
                      <input type="number" min={0} max={72} value={editValues.flashSaleHours??0} onChange={e=>setEditValues(v=>({...v,flashSaleHours:Number(e.target.value)}))} style={fld} placeholder="e.g. 24"/>
                      <p style={{fontSize:10,color:'#444',marginTop:3}}>0 = off</p>
                    </div>
                    <div>
                      <label style={lbl}>Availability</label>
                      <button onClick={()=>setEditValues(v=>({...v,stockOut:!v.stockOut}))}
                        style={{ width:'100%', height:34, borderRadius:8, border:`1px solid ${editValues.stockOut?'rgba(248,113,113,0.3)':'rgba(74,222,128,0.3)'}`, background:editValues.stockOut?'rgba(248,113,113,0.08)':'rgba(74,222,128,0.06)', color:editValues.stockOut?'#f87171':'#4ade80', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                        {editValues.stockOut?<><AlertTriangle size={12}/>Out of Stock</>:<><Check size={12}/>Available</>}
                      </button>
                    </div>
                    {/* Logo upload */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <LogoUpload
                        currentLogo={editValues.customLogo}
                        defaultLogo={DEFAULT_LOGOS[p.id]}
                        onUpload={base64 => setEditValues(v => ({ ...v, customLogo: base64 }))}
                        onReset={() => setEditValues(v => ({ ...v, customLogo: undefined }))}
                      />
                    </div>
                  </div>
                  <button onClick={()=>{
                    const flashEnd=(editValues.flashSaleHours||0)>0?new Date(Date.now()+(editValues.flashSaleHours||0)*3600000).toISOString():null
                    const u={...p,...editValues,flashSaleEnd:flashEnd||p.flashSaleEnd}
                    setProducts(prev=>prev.map(x=>x.id===p.id?u:x)); save(u)
                  }} disabled={isSav} style={{ height:36, padding:'0 20px', background:isSav?'rgba(212,175,55,0.3)':'linear-gradient(135deg,#D4AF37,#C49A20)', color:'#000', border:'none', borderRadius:9, fontSize:13, fontWeight:700, cursor:isSav?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:6 }}>
                    {isSav?<Spin/>:<><Save size={12}/>Save Changes</>}
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

const Spin = () => <div style={{width:13,height:13,border:'2px solid rgba(0,0,0,0.2)',borderTopColor:'#000',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>
const Chip = ({icon,label,color}:{icon:React.ReactNode;label:string;color:string}) => <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',background:`${color}12`,border:`1px solid ${color}33`,borderRadius:980,fontSize:11,color,fontWeight:600}}>{icon}{label}</div>
const Badge = ({label,color,bg}:{label:string;color:string;bg:string}) => <span style={{fontSize:9,padding:'2px 6px',borderRadius:4,background:bg,color,fontWeight:700,letterSpacing:'0.06em'}}>{label}</span>
const lbl: React.CSSProperties = {fontSize:11,fontWeight:600,color:'#6e6e73',display:'block',marginBottom:5,letterSpacing:'0.05em',textTransform:'uppercase'}
const fld: React.CSSProperties = {width:'100%',height:34,padding:'0 10px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#f5f5f7',fontSize:13,outline:'none',boxSizing:'border-box',fontFamily:'inherit'}