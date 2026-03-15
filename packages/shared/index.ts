// ─── Products ────────────────────────────────────────────
export const PRODUCTS = [
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'streaming',
    baseINR: 149,
    badge: 'Popular',
    description: 'Full 4K Ultra HD. All content. Shared profile on a premium account.',
    tags: ['4K UHD', 'All Devices', 'Shared'],
    features: ['4K Ultra HD on all screens', 'Access to full content library', 'Shared premium profile', 'Works on any device'],
    color: '#E50914',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'music',
    baseINR: 99,
    badge: null,
    description: 'Ad-free music. Offline downloads. High quality audio on all devices.',
    tags: ['Ad-Free', 'Offline', 'HQ Audio'],
    features: ['Ad-free listening', 'Download for offline use', 'High quality audio', 'All devices'],
    color: '#1DB954',
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    category: 'streaming',
    baseINR: 89,
    badge: null,
    description: 'No ads. Background playback. YouTube Music included for free.',
    tags: ['No Ads', 'Background Play', 'YT Music'],
    features: ['No ads on any video', 'Background playback', 'YouTube Music included', 'Download videos'],
    color: '#FF0000',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Plus',
    category: 'ai',
    baseINR: 899,
    badge: 'AI',
    description: 'GPT-4o. DALL-E image generation. Priority speed. All advanced tools.',
    tags: ['GPT-4o', 'DALL-E', 'Priority'],
    features: ['GPT-4o access', 'DALL-E image generation', 'Priority response speed', 'All advanced tools'],
    color: '#10a37f',
  },
  {
    id: 'disney',
    name: 'Disney+ Hotstar',
    category: 'streaming',
    baseINR: 129,
    badge: null,
    description: 'Marvel. Star Wars. National Geographic. Live IPL. All in one place.',
    tags: ['Marvel', 'Live Sports', 'Star Wars'],
    features: ['Full Marvel & DC library', 'Live sports (IPL, cricket)', 'Star Wars & National Geo', 'Disney originals'],
    color: '#113CCF',
  },
  {
    id: 'canva',
    name: 'Canva Pro',
    category: 'productivity',
    baseINR: 199,
    badge: null,
    description: 'Premium templates. Background remover. Magic AI tools. Brand kits.',
    tags: ['AI Tools', 'Templates', 'Brand Kit'],
    features: ['Premium template library', 'Background remover AI', 'Brand kit management', 'Magic AI design tools'],
    color: '#00C4CC',
  },
  {
    id: 'amazon',
    name: 'Amazon Prime',
    category: 'streaming',
    baseINR: 149,
    badge: null,
    description: 'Prime Video. Free fast delivery. Prime Music. Exclusive deals.',
    tags: ['Prime Video', 'Free Delivery', 'Music'],
    features: ['Prime Video streaming', 'Prime Music included', 'Fast delivery on Amazon', 'Exclusive member deals'],
    color: '#FF9900',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Premium',
    category: 'productivity',
    baseINR: 599,
    badge: null,
    description: 'Profile viewers. InMail credits. Career insights. Job seeker tools.',
    tags: ['InMail', 'Career Insights', 'Who Viewed'],
    features: ['See who viewed your profile', 'InMail credits', 'Career insights & benchmarks', 'Job applicant insights'],
    color: '#0A66C2',
  },
  {
    id: 'appletv',
    name: 'Apple TV+',
    category: 'streaming',
    baseINR: 99,
    badge: null,
    description: 'Severance. Ted Lasso. The Morning Show. Award-winning originals.',
    tags: ['Originals', '4K HDR', 'Dolby Atmos'],
    features: ['Award-winning originals', '4K HDR Dolby Vision', 'Dolby Atmos audio', 'Family sharing'],
    color: '#1c1c1e',
  },
]

// ─── Durations ────────────────────────────────────────────
export const DURATIONS = [
  { months: 1,  label: '1 Month',  mult: 1.0, saveLabel: ''         },
  { months: 3,  label: '3 Months', mult: 2.7, saveLabel: 'Save 10%' },
  { months: 6,  label: '6 Months', mult: 5.2, saveLabel: 'Save 13%' },
  { months: 12, label: '1 Year',   mult: 9.5, saveLabel: 'Save 21%' },
]

// ─── Currencies ───────────────────────────────────────────
export const CURRENCIES: Record<string, {
  symbol: string
  rate: number
  flag: string
  pay: 'upi' | 'wise'
}> = {
  INR: { symbol: '₹',    rate: 1,      flag: '🇮🇳', pay: 'upi'  },
  USD: { symbol: '$',    rate: 0.012,  flag: '🇺🇸', pay: 'wise' },
  AED: { symbol: 'AED ', rate: 0.044,  flag: '🇦🇪', pay: 'wise' },
  GBP: { symbol: '£',    rate: 0.0095, flag: '🇬🇧', pay: 'wise' },
  AUD: { symbol: 'A$',   rate: 0.018,  flag: '🇦🇺', pay: 'wise' },
  SGD: { symbol: 'S$',   rate: 0.016,  flag: '🇸🇬', pay: 'wise' },
  CAD: { symbol: 'C$',   rate: 0.016,  flag: '🇨🇦', pay: 'wise' },
  EUR: { symbol: '€',    rate: 0.011,  flag: '🇪🇺', pay: 'wise' },
  MYR: { symbol: 'RM ',  rate: 0.056,  flag: '🇲🇾', pay: 'wise' },
  QAR: { symbol: 'QAR ', rate: 0.044,  flag: '🇶🇦', pay: 'wise' },
  SAR: { symbol: 'SAR ', rate: 0.045,  flag: '🇸🇦', pay: 'wise' },
  KWD: { symbol: 'KWD ', rate: 0.0037, flag: '🇰🇼', pay: 'wise' },
}

export const REGION_TO_CURRENCY: Record<string, string> = {
  IN: 'INR', AE: 'AED', US: 'USD', GB: 'GBP',
  AU: 'AUD', SG: 'SGD', CA: 'CAD', DE: 'EUR',
  FR: 'EUR', MY: 'MYR', QA: 'QAR', SA: 'SAR',
  KW: 'KWD', NZ: 'AUD', IE: 'EUR', NL: 'EUR',
}

export const REGION_TO_DIALCODE: Record<string, string> = {
  IN: '+91', AE: '+971', US: '+1',  GB: '+44',
  AU: '+61', SG: '+65',  CA: '+1',  DE: '+49',
  FR: '+33', MY: '+60',  QA: '+974',SA: '+966',
  KW: '+965',NZ: '+64',  IE: '+353',NL: '+31',
}

export const REGIONS = [
  { code: 'IN', name: 'India'          },
  { code: 'AE', name: 'UAE'            },
  { code: 'US', name: 'United States'  },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia'      },
  { code: 'SG', name: 'Singapore'      },
  { code: 'CA', name: 'Canada'         },
  { code: 'DE', name: 'Germany'        },
  { code: 'FR', name: 'France'         },
  { code: 'MY', name: 'Malaysia'       },
  { code: 'QA', name: 'Qatar'          },
  { code: 'SA', name: 'Saudi Arabia'   },
  { code: 'KW', name: 'Kuwait'         },
  { code: 'NZ', name: 'New Zealand'    },
  { code: 'IE', name: 'Ireland'        },
  { code: 'NL', name: 'Netherlands'    },
]

export const CATEGORIES = [
  { id: 'all',          label: 'All'          },
  { id: 'streaming',    label: 'Streaming'    },
  { id: 'music',        label: 'Music'        },
  { id: 'ai',           label: 'AI Tools'     },
  { id: 'productivity', label: 'Productivity' },
]

// ─── Pricing helpers ──────────────────────────────────────
export function calcPrice(baseINR: number, months: number, currencyCode: string) {
  const dur     = DURATIONS.find(d => d.months === months) || DURATIONS[0]
  const curr    = CURRENCIES[currencyCode] || CURRENCIES.INR
  const totalINR    = Math.round(baseINR * dur.mult)
  const perMonthINR = Math.round(totalINR / months)
  const total    = currencyCode === 'INR' ? totalINR    : parseFloat((totalINR    * curr.rate).toFixed(2))
  const perMonth = currencyCode === 'INR' ? perMonthINR : parseFloat((perMonthINR * curr.rate).toFixed(2))
  return { total, perMonth, symbol: curr.symbol, saveLabel: dur.saveLabel }
}

export function formatPrice(amount: number, currencyCode: string): string {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.INR
  if (currencyCode === 'INR') return `${curr.symbol}${Math.round(amount)}`
  return `${curr.symbol}${parseFloat(amount.toFixed(2))}`
}

// ─── Team roles ───────────────────────────────────────────
export const TEAM_ROLES: Record<string, {
  name: string
  role: 'Founder & CEO' | 'Partner' | 'Co-Founder & Managing Director' | 'Head Of Client Relations' | 'Head Of Social Media & Marketing'
  title: string
}> = {
  'aaronjthomas.cj@gmail.com':         { name: 'Aaron Joy Thomas',          role: 'Founder & CEO',   title: 'Founder & CEO'    },
  'nicholsonvargheese81939@gmail.com': { name: 'Nicholson Samuel Varghese', role: 'Co-Founder & Managing Director', title: 'Co-Founder & Managing Director'  },
  'devikaprasannan089@gmail.com':      { name: 'Devika Prasannan',          role: 'Partner',      title: 'Head Of Client Relations' },
  'shayanika7@gmail.com':              { name: 'Shayanika Bhattacharjee',   role: 'Partner', title: 'Head Of Social Media & Marketing'},
}

// ─── Constants ────────────────────────────────────────────
export const WA_NUMBER  = '918111956481'
export const UPI_ID     = 'paytm.slfsmng@pty'
export const WISE_LINK  = 'https://wise.com/pay/business/aaronjoythomas?utm_source=quick_pay'
export const INSTAGRAM  = 'https://instagram.com/primekeys_offical'
export const SITE_URL   = 'https://primekeys.in'