// ─── Colors ───────────────────────────────────────────────
export const colors = {
  black:     '#000000',
  bg:        '#060606',
  s1:        '#0c0c0c',
  s2:        '#141414',
  s3:        '#1c1c1c',
  gold:      '#D4AF37',
  gold2:     '#F0CC55',
  goldDim:   'rgba(212,175,55,0.1)',
  goldBorder:'rgba(212,175,55,0.18)',
  text:      '#f0f0f0',
  text2:     '#999999',
  text3:     '#555555',
  green:     '#2dcc6e',
  red:       '#ff4444',
  border:    'rgba(255,255,255,0.07)',
} as const

// ─── Typography ───────────────────────────────────────────
export const fonts = {
  // Web + Android
  sans:    'Inter, system-ui, sans-serif',
  // iOS/macOS uses SF Pro automatically via system-ui
  system:  'system-ui, -apple-system, sans-serif',
} as const

// ─── Spacing ──────────────────────────────────────────────
export const spacing = {
  navH:  52,
  r:     16,   // border radius cards
  rFull: 9999, // border radius pills
} as const

// ─── Animation ────────────────────────────────────────────
export const ease = 'cubic-bezier(0.22, 1, 0.36, 1)'

// ─── Tailwind CSS variables (for globals.css) ─────────────
export const cssVars = `
  --black: ${colors.black};
  --bg: ${colors.bg};
  --s1: ${colors.s1};
  --s2: ${colors.s2};
  --s3: ${colors.s3};
  --gold: ${colors.gold};
  --gold2: ${colors.gold2};
  --gold-dim: ${colors.goldDim};
  --gold-border: ${colors.goldBorder};
  --text: ${colors.text};
  --text2: ${colors.text2};
  --text3: ${colors.text3};
  --green: ${colors.green};
  --red: ${colors.red};
  --border: ${colors.border};
  --nav-h: ${spacing.navH}px;
  --ease: ${ease};
`