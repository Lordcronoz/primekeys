'use client'

import React, { MouseEvent, useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type CardTier =
  | 'legendary'
  | 'founder'
  | 'team'
  | 'elite-gold'
  | 'gold'
  | 'silver'
  | 'bronze'

export interface IdentityCardProps {
  name: string
  title: string
  tier: CardTier
  refCount?: number
  accentColor?: string
}

export function getClientTier(refCount: number): CardTier {
  if (refCount >= 15) return 'elite-gold'
  if (refCount >= 10) return 'gold'
  if (refCount >= 5)  return 'silver'
  return 'bronze'
}

// ─── Tier configs ─────────────────────────────────────────────────────────────
const TIER_META: Record<CardTier, {
  label: string
  overlayColors: string[]
  textColor: string
  subtextColor: string
  borderColor: string
  glowColor: string
}> = {
  legendary: {
    label: '✦ LEGENDARY  ·  1 OF 1',
    overlayColors: ['hsl(300,100%,62%)', 'hsl(260,100%,66%)', 'hsl(200,100%,62%)', 'hsl(155,100%,56%)', 'hsl(50,100%,62%)', 'hsl(20,100%,62%)', 'hsl(340,100%,62%)', 'white', 'hsl(280,90%,56%)', 'hsl(180,100%,56%)'],
    textColor: '#f5f5f7',
    subtextColor: '#D4AF37',
    borderColor: 'rgba(212,175,55,0.9)',
    glowColor: '212,175,55',
  },
  founder: {
    label: '◈ FOUNDER  ·  PRIMEKEYS',
    overlayColors: ['hsl(271,85%,58%)', 'hsl(285,80%,62%)', 'hsl(250,90%,62%)', 'hsl(230,85%,58%)', 'hsl(300,70%,52%)', 'transparent', 'hsl(260,80%,66%)', 'white', 'transparent', 'hsl(275,85%,58%)'],
    textColor: '#f0e8ff',
    subtextColor: '#a78bfa',
    borderColor: 'rgba(139,92,246,0.6)',
    glowColor: '139,92,246',
  },
  team: {
    label: '▲ TEAM  ·  PRIMEKEYS',
    overlayColors: ['hsl(200,100%,58%)', 'hsl(190,100%,62%)', 'hsl(210,90%,58%)', 'hsl(230,85%,52%)', 'hsl(180,100%,52%)', 'transparent', 'hsl(200,80%,62%)', 'white', 'transparent', 'hsl(195,100%,58%)'],
    textColor: '#e0f2fe',
    subtextColor: '#38bdf8',
    borderColor: 'rgba(56,189,248,0.5)',
    glowColor: '56,189,248',
  },
  'elite-gold': {
    label: '◈ ELITE GOLD  ·  15+ REFS',
    overlayColors: ['hsl(45,100%,62%)', 'hsl(38,100%,58%)', 'hsl(50,100%,66%)', 'hsl(35,100%,52%)', 'hsl(55,90%,62%)', 'hsl(30,100%,58%)', 'hsl(48,100%,60%)', 'white', 'hsl(42,95%,64%)', 'hsl(52,100%,62%)'],
    textColor: '#fef3c7',
    subtextColor: '#fbbf24',
    borderColor: 'rgba(251,191,36,0.7)',
    glowColor: '251,191,36',
  },
  gold: {
    label: '■ GOLD  ·  10+ REFS',
    overlayColors: ['hsl(45,100%,58%)', 'hsl(38,95%,52%)', 'hsl(50,100%,62%)', 'hsl(35,90%,50%)', 'transparent', 'hsl(48,100%,58%)', 'transparent', 'white', 'hsl(42,90%,60%)', 'hsl(50,95%,58%)'],
    textColor: '#fef3c7',
    subtextColor: '#f5d060',
    borderColor: 'rgba(212,175,55,0.5)',
    glowColor: '212,175,55',
  },
  silver: {
    label: '■ SILVER  ·  5+ REFS',
    overlayColors: ['hsl(220,20%,78%)', 'hsl(210,25%,82%)', 'hsl(230,20%,72%)', 'hsl(200,22%,80%)', 'transparent', 'hsl(215,18%,74%)', 'transparent', 'white', 'hsl(225,20%,78%)', 'hsl(205,22%,82%)'],
    textColor: '#e2e8f0',
    subtextColor: '#94a3b8',
    borderColor: 'rgba(148,163,184,0.45)',
    glowColor: '148,163,184',
  },
  bronze: {
    label: '■ BRONZE  ·  MEMBER',
    overlayColors: ['hsl(25,70%,50%)', 'hsl(30,75%,54%)', 'hsl(20,65%,46%)', 'hsl(35,72%,52%)', 'transparent', 'hsl(27,68%,50%)', 'transparent', 'white', 'hsl(23,70%,48%)', 'hsl(32,73%,52%)'],
    textColor: '#fde68a',
    subtextColor: '#d97706',
    borderColor: 'rgba(180,83,9,0.45)',
    glowColor: '180,83,9',
  },
}

// ─── BG per tier ──────────────────────────────────────────────────────────────
const TIER_BG: Record<CardTier, [string, string]> = {
  legendary:    ['#0a0318', '#1e0b38'],
  founder:      ['#0d0520', '#1e0845'],
  team:         ['#050e1a', '#0b1f35'],
  'elite-gold': ['#1a0f00', '#2d1a00'],
  gold:         ['#110a00', '#1f1200'],
  silver:       ['#0c0c10', '#18181f'],
  bronze:       ['#0f0a07', '#1e1208'],
}

// ─── Avatar gradient stops ────────────────────────────────────────────────────
const AVATAR_STOPS: Record<CardTier, [string, string]> = {
  legendary:    ['#D4AF37', '#ffd700'],
  founder:      ['#7c3aed', '#a78bfa'],
  team:         ['#0284c7', '#38bdf8'],
  'elite-gold': ['#92400e', '#ffd700'],
  gold:         ['#b45309', '#D4AF37'],
  silver:       ['#475569', '#94a3b8'],
  bronze:       ['#78350f', '#b45309'],
}

// ─── 3D matrix math ───────────────────────────────────────────────────────────
const IDENTITY = '1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1'
const MXR = 0.25, MNR = -0.25, MXS = 1, MNS = 0.97

function calcMatrix(el: HTMLDivElement, cx: number, cy: number) {
  const { left: l, right: r, top: t, bottom: b } = el.getBoundingClientRect()
  const xC = (l + r) / 2, yC = (t + b) / 2
  const s = [
    MXS - (MXS - MNS) * Math.abs(xC - cx) / (xC - l),
    MXS - (MXS - MNS) * Math.abs(yC - cy) / (yC - t),
    MXS - (MXS - MNS) * (Math.abs(xC - cx) + Math.abs(yC - cy)) / (xC - l + yC - t),
  ]
  const x1 = 0.25 * ((yC - cy) / yC - (xC - cx) / xC)
  const x2 = MXR - (MXR - MNR) * Math.abs(r - cx) / (r - l)
  const y2 = MXR - (MXR - MNR) * (t - cy) / (t - b)
  const z0 = -(MXR - (MXR - MNR) * Math.abs(r - cx) / (r - l))
  const z1 = 0.2 - (0.2 + 0.6) * (t - cy) / (t - b)
  return `${s[0]}, 0, ${z0}, 0, ${x1}, ${s[1]}, ${z1}, 0, ${x2}, ${y2}, ${s[2]}, 0, 0, 0, 0, 1`
}

function oppMatrix(m: string, el: HTMLDivElement, cy: number, enter?: boolean) {
  const { top: t, bottom: b } = el.getBoundingClientRect()
  const oy = b - cy + t, weak = enter ? 0.7 : 4, mul = enter ? -1 : 1
  return m.split(', ').map((v, i) => {
    if ([2, 4, 8].includes(i))  return -parseFloat(v) * mul / weak
    if ([0, 5, 10].includes(i)) return '1'
    if (i === 6) return  mul * (MXR - (MXR - MNR) * (t - oy) / (t - b)) / weak
    if (i === 9) return       (MXR - (MXR - MNR) * (t - oy) / (t - b)) / weak
    return v
  }).join(', ')
}

const KF = [...Array(10)].map((_, i) => `
  @keyframes idO${i+1}{0%{transform:rotate(${i*10}deg)}50%{transform:rotate(${(i+1)*10}deg)}100%{transform:rotate(${i*10}deg)}}
`).join('')

// ─── Component ────────────────────────────────────────────────────────────────
export function IdentityCard({ name, title, tier, refCount, accentColor }: IdentityCardProps) {
  const ref    = useRef<HTMLDivElement>(null)
  const toRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lt1    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lt2    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lt3    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [ov,  setOv]   = useState(0)
  const [mx,  setMx]   = useState(IDENTITY)
  const [cmx, setCmx]  = useState(IDENTITY)
  const [noIO, setNoIO] = useState(true)
  const [noOA, setNoOA] = useState(false)
  const [rdy,  setRdy]  = useState(false)

  const meta = TIER_META[tier]
  const [bg0, bg1] = TIER_BG[tier]
  const [av0, av1] = AVATAR_STOPS[tier]
  const avColor    = accentColor && tier === 'team' ? accentColor : undefined
  const isLeg    = tier === 'legendary'
  const isTeam   = tier === 'team'
  const hasWings = ['elite-gold', 'gold', 'silver'].includes(tier)
  const init     = name.charAt(0).toUpperCase()

  const onEnter = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    ;[lt1, lt2, lt3].forEach(r => r.current && clearTimeout(r.current))
    setNoOA(true)
    const { left: l, right: r2, top: t, bottom: b2 } = ref.current.getBoundingClientRect()
    const xC = (l + r2) / 2, yC = (t + b2) / 2
    setNoIO(false)
    toRef.current = setTimeout(() => setNoIO(true), 350)
    requestAnimationFrame(() => requestAnimationFrame(() =>
      setOv((Math.abs(xC - e.clientX) + Math.abs(yC - e.clientY)) / 1.5)
    ))
    const m = calcMatrix(ref.current, e.clientX, e.clientY)
    setMx(oppMatrix(m, ref.current, e.clientY, true))
    setRdy(false)
    setTimeout(() => setRdy(true), 200)
  }

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const { left: l, right: r2, top: t, bottom: b2 } = ref.current.getBoundingClientRect()
    const xC = (l + r2) / 2, yC = (t + b2) / 2
    setTimeout(() => setOv((Math.abs(xC - e.clientX) + Math.abs(yC - e.clientY)) / 1.5), 150)
    if (rdy) setCmx(calcMatrix(ref.current, e.clientX, e.clientY))
  }

  const onLeave = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    if (toRef.current) clearTimeout(toRef.current)
    const opp = oppMatrix(mx, ref.current, e.clientY)
    setCmx(opp)
    setTimeout(() => setCmx(IDENTITY), 200)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setNoIO(false)
      lt1.current = setTimeout(() => setOv(v => -v / 4), 150)
      lt2.current = setTimeout(() => setOv(0), 300)
      lt3.current = setTimeout(() => { setNoOA(false); setNoIO(true) }, 500)
    }))
  }

  useEffect(() => { if (rdy) setMx(cmx) }, [cmx, rdy])

  // SVG dimensions — full sidebar width
  const W = 300, H = 110

  return (
    <div
      ref={ref}
      className="cursor-pointer select-none w-full"
      onMouseEnter={onEnter}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ position: 'relative' }}
    >
      <style>{KF}{`
        @keyframes idGlow {
          0%,100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        @keyframes idScan {
          0%   { transform: translateY(-100%); opacity: 0; }
          30%  { opacity: 0.6; }
          70%  { opacity: 0.6; }
          100% { transform: translateY(${H * 2}px); opacity: 0; }
        }
      `}</style>

      {/* Glow halo behind the card */}
      <div style={{
        position: 'absolute', inset: -6, borderRadius: 18, zIndex: 0,
        background: `radial-gradient(ellipse at center, rgba(${meta.glowColor},0.35), transparent 70%)`,
        animation: isLeg ? 'idGlow 2.5s ease-in-out infinite' : undefined,
        pointerEvents: 'none',
      }} />

      <div
        style={{
          position: 'relative', zIndex: 1,
          transform: `perspective(700px) matrix3d(${mx})`,
          transformOrigin: 'center center',
          transition: 'transform 200ms ease-out',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <defs>
            <filter id="idBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
            <filter id="idGlowF" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <mask id="idMask">
              <rect width={W} height={H} rx="14" fill="white" />
            </mask>
            <linearGradient id="idBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor={bg0} />
              <stop offset="100%" stopColor={bg1} />
            </linearGradient>
            <linearGradient id="idAv" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor={avColor ?? av0} />
              <stop offset="100%" stopColor={avColor ?? av1} />
            </linearGradient>
            {/* Legendary only: second radial for depth */}
            {isLeg && (
              <radialGradient id="idLegDepth" cx="30%" cy="30%" r="70%">
                <stop offset="0%"   stopColor="#2d0a5e" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            )}
          </defs>

          {/* Base card */}
          <rect width={W} height={H} rx="14" fill="url(#idBg)" />
          {isLeg && <rect width={W} height={H} rx="14" fill="url(#idLegDepth)" />}

          {/* Dot grid texture */}
          <pattern id="idGrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.7" fill="rgba(255,255,255,0.035)" />
          </pattern>
          <rect width={W} height={H} rx="14" fill="url(#idGrid)" mask="url(#idMask)" />

          {/* Border */}
          <rect x="1.5" y="1.5" width={W - 3} height={H - 3} rx="13"
            fill="transparent" stroke={meta.borderColor} strokeWidth={isLeg ? 2 : 1.5} />

          {/* Inner fine border (legendary only for depth) */}
          {isLeg && (
            <rect x="4" y="4" width={W - 8} height={H - 8} rx="11"
              fill="transparent" stroke="rgba(212,175,55,0.25)" strokeWidth="0.75" />
          )}

          {/* Scan line (legendary / elite-gold) */}
          {(isLeg || tier === 'elite-gold') && (
            <rect x="0" y="0" width={W} height="2" rx="1"
              fill={`rgba(${meta.glowColor},0.7)`} mask="url(#idMask)"
              style={{ animation: 'idScan 3.5s ease-in-out infinite' }} />
          )}

          {/* ── TOP ROW ── */}
          {/* Tier pill */}
          <rect x="10" y="11" width={isLeg ? 152 : 120} height="17" rx="8.5" fill="rgba(0,0,0,0.6)" />
          <text x="18" y="23" fontFamily="system-ui,-apple-system,sans-serif"
            fontSize={isLeg ? 8 : 8} fontWeight="800" fill={meta.subtextColor} letterSpacing="0.6">
            {meta.label}
          </text>

          {/* Top-right decoration */}
          {isLeg && (
            <>
              {/* Crown — large, centered top right */}
              <text x={W - 20} y="36" fontFamily="serif" fontSize="22"
                fill="#D4AF37" textAnchor="middle" filter="url(#idGlowF)" opacity="0.92">
                ♛
              </text>
            </>
          )}
          {tier === 'founder' && (
            <polygon points={`${W-20},12 ${W-13},23 ${W-20},34 ${W-27},23`}
              fill={meta.subtextColor} opacity="0.85" filter="url(#idBlur)" />
          )}
          {(tier === 'elite-gold' || tier === 'gold') && (
            <text x={W - 20} y="34" fontFamily="serif" fontSize="18"
              fill="#D4AF37" textAnchor="middle" opacity="0.82">♛</text>
          )}
          {tier === 'silver' && (
            <path d={`M${W-20},12 L${W-13},19 L${W-13},27 L${W-20},34 L${W-27},27 L${W-27},19 Z`}
              fill={meta.subtextColor} opacity="0.65" />
          )}
          {tier === 'bronze' && (
            <path d={`M${W-20},13 L${W-13},20 L${W-13},28 L${W-20},35 L${W-27},28 L${W-27},20 Z`}
              fill={meta.subtextColor} opacity="0.5" />
          )}
          {isTeam && (
            <text x={W-20} y="33" fontFamily="sans-serif" fontSize="16"
              fill={accentColor ?? meta.subtextColor} textAnchor="middle" opacity="0.78">✦</text>
          )}

          {/* ── MIDDLE ── Wings */}
          {hasWings && (
            <g opacity={tier === 'elite-gold' ? 0.42 : tier === 'gold' ? 0.3 : 0.2}
              transform={`translate(${W / 2}, ${H / 2 + 4})`}>
              <path d="M0,0 C-14,-10 -30,-11 -44,-5 C-28,-6 -16,-3 0,0Z" fill={meta.subtextColor} />
              <path d="M0,2 C-12,9 -26,9 -40,5 C-26,6 -14,4 0,2Z" fill={meta.subtextColor} />
              <path d="M0,0 C14,-10 30,-11 44,-5 C28,-6 16,-3 0,0Z" fill={meta.subtextColor} />
              <path d="M0,2 C12,9 26,9 40,5 C26,6 14,4 0,2Z" fill={meta.subtextColor} />
            </g>
          )}

          {/* Legendary ambient sparkles */}
          {isLeg && (
            <>
              {[[20, 55, 1.6], [W - 38, 48, 1.2], [W * 0.45, 75, 1.4], [60, 80, 1.0]].map(([sx, sy, sz], i) => (
                <circle key={i}
                  cx={sx} cy={sy} r={sz}
                  fill="#D4AF37"
                  filter="url(#idGlowF)"
                  style={{ animation: `idGlow ${1.8 + i * 0.4}s ${i * 0.3}s ease-in-out infinite` }}
                />
              ))}
            </>
          )}

          {/* ── BOTTOM ROW ── */}
          {/* Name */}
          <text x="12" y={H - 26}
            fontFamily="system-ui,-apple-system,sans-serif"
            fontSize={isLeg ? 16 : 14} fontWeight="900"
            fill={meta.textColor} letterSpacing="-0.4">
            {name.length > 20 ? name.split(' ').slice(0, 2).join(' ') : name}
          </text>

          {/* Title */}
          <text x="12" y={H - 10}
            fontFamily="system-ui,sans-serif"
            fontSize="8.5" fontWeight="600"
            fill={meta.subtextColor} letterSpacing="0.7" opacity="0.85">
            {title.toUpperCase()}
          </text>

          {/* Avatar - Rounded Square */}
          <rect x={W - 45} y={H - 45} width="38" height="38" rx="10" fill="url(#idAv)"
            style={{ filter: `drop-shadow(0 0 8px rgba(${meta.glowColor},0.5))` }} />
          <text x={W - 26} y={H - 20} textAnchor="middle"
            fontFamily="system-ui,sans-serif" fontSize="15" fontWeight="900" fill="white">
            {init}
          </text>

          {/* Watermark */}
          <text x={W / 2} y={H - 1} textAnchor="middle"
            fontFamily="system-ui,sans-serif" fontSize="5.5" fontWeight="700"
            fill="rgba(255,255,255,0.055)" letterSpacing="2">
            PRIMEKEYS · MEMBER CARD
          </text>

          {/* ── Holographic overlay (10 bands, same as AwardBadge) ── */}
          <g style={{ mixBlendMode: 'overlay' }} mask="url(#idMask)">
            {meta.overlayColors.map((color, i) => (
              <g key={i} style={{
                transform: `rotate(${ov + i * 10}deg)`,
                transformOrigin: 'center center',
                transition: !noIO ? 'transform 200ms ease-out' : 'none',
                animation: noOA ? 'none' : `idO${i + 1} 5s infinite`,
                willChange: 'transform',
              }}>
                <polygon points={`0,0 ${W},${H} ${W},0 0,${H}`}
                  fill={color} filter="url(#idBlur)" opacity="0.55" />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}

// ─── Tier progress bar ─────────────────────────────────────────────────────────
export function TierProgressBar({ refCount }: { refCount: number }) {
  const tiers = [
    { label: 'Bronze', min: 0,  color: '#b45309' },
    { label: 'Silver', min: 5,  color: '#94a3b8' },
    { label: 'Gold',   min: 10, color: '#D4AF37' },
    { label: 'Elite',  min: 15, color: '#ffd700' },
  ]
  const idx  = refCount >= 15 ? 3 : refCount >= 10 ? 2 : refCount >= 5 ? 1 : 0
  const curr = tiers[idx]
  const next = tiers[Math.min(idx + 1, 3)]
  const pct  = idx >= 3 ? 100 : Math.min(100, ((refCount - curr.min) / (next.min - curr.min)) * 100)

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
        {tiers.map((t, i) => (
          <div key={t.label} style={{ textAlign: 'center', opacity: i <= idx ? 1 : 0.28 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', margin: '0 auto 3px',
              background: i <= idx ? t.color : 'rgba(255,255,255,0.08)',
              boxShadow: i === idx ? `0 0 8px ${t.color}` : 'none',
            }} />
            <p style={{ fontSize: 9, color: i <= idx ? t.color : '#444', fontWeight: 700, letterSpacing: '0.04em' }}>
              {t.label}
            </p>
          </div>
        ))}
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: `linear-gradient(to right, ${curr.color}, ${next?.color ?? curr.color})`,
          width: `${pct}%`, transition: 'width 0.8s ease',
          boxShadow: `0 0 6px ${curr.color}`,
        }} />
      </div>
      <p style={{ fontSize: 10, color: '#444', marginTop: 5, textAlign: 'center' }}>
        {refCount} referrals
        {idx < 3 ? ` · ${next.min - refCount} more to reach ${next.label}` : ' · Maximum tier reached!'}
      </p>
    </div>
  )
}
