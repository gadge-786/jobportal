// Telegram group per state. Paste each group's invite link between the quotes.
// Leave '' for a state that has no group yet.
//   - Jobs from a state with a link here show that state's group.
//   - Maharashtra and central / all-India jobs fall back to the main channel
//     (NEXT_PUBLIC_TELEGRAM_URL in Vercel) when they have no link of their own.
//   - Other states with no link show no Telegram box.
export const TELEGRAM_GROUPS = {
  'all-india': 'https://t.me/+chCILbemOoc3NDU1',          // central govt jobs (SSC, Railway, Banking ...), optional
  'maharashtra': 'https://t.me/+qETR9ZhfxpxkZjY1',
  'uttar-pradesh': 'https://t.me/+7atB2QTCq1BhZjQ1',
  'bihar': 'https://t.me/+0Ke0xJ-mjNI2NzM1',
  'rajasthan': 'https://t.me/+t1V9P6KDZ0FhNGY1',
  'madhya-pradesh': 'https://t.me/+jGSwsEuXpPhmNWE1',
  'gujarat': 'https://t.me/+HQ3LPhiHCM44ZjY9',
  'karnataka': 'https://t.me/+Qnuky0fx5TdhZWU1',
  'tamil-nadu': 'https://t.me/+3rVNr2iA3z4zYTll',
  'kerala': 'https://t.me/+Nb_7ZY6oBr5hMmNl',
  'andhra-pradesh': 'https://t.me/+SDQEtvn_Xa00MTI1',
  'telangana': 'https://t.me/+ZlLf3x8xFA9lOGU1',
  'odisha': 'https://t.me/+l-7e44rs2GQzZWNl',
  'west-bengal': 'https://t.me/+ErsUHu7QqH04NWE1',
  'assam': 'https://t.me/+Acyf4tMVKANlZWFl',
  'punjab': 'https://t.me/+266LbDE6xpIzNjk1',
  'haryana': 'https://t.me/+sTCVbZhZXLBjMDFl',
  'himachal-pradesh': 'https://t.me/+1a4sfnVMCNplMGZl',
  'uttarakhand': 'https://t.me/+DOZU7ONRuutmYjk9',
  'jharkhand': 'https://t.me/+9tCOXhouAFgzNTRl',
  'chhattisgarh': 'https://t.me/+qVLPfYzRn8s0MzI1',
  'delhi': 'https://t.me/+chCILbemOoc3NDU1',
  'jammu-kashmir': 'https://t.me/+lrqxw7ejHU5iMWY1',
  'ladakh': 'https://t.me/+U9ObIEF8Q144M2Vl',
  'goa': 'https://t.me/+btJT9WcFBRk1OGI1',
  'chandigarh': 'https://t.me/+chCILbemOoc3NDU1',
  'north-east': 'https://t.me/+Acyf4tMVKANlZWFl',
}

const FALLBACK_STATES = ['maharashtra', 'all-india']

const clean = u => (typeof u === 'string' && /^https:\/\/(t\.me|telegram\.me)\//i.test(u.trim()) ? u.trim() : '')

// -> { url, state } | null     state = slug when the group is that state's own group, else null
export function pickTelegramGroup(stateValue, defaultUrl = '', groups = TELEGRAM_GROUPS) {
  const slug = String(stateValue || '').trim().toLowerCase().replace(/\s+/g, '-') || 'all-india'
  const own = clean(groups[slug])
  if (own) return { url: own, state: slug === 'all-india' ? null : slug }
  const fallback = clean(defaultUrl)
  if (fallback && FALLBACK_STATES.includes(slug)) return { url: fallback, state: null }
  return null
}