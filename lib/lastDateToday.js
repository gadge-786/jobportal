// Helpers for the "Today's last date to apply" box. Pure functions, no React.
const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december']

const pad = (n) => String(n).padStart(2, '0')

// Today's date in India (YYYY-MM-DD), whatever the visitor's device timezone is.
export function todayIST(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

// last_date text -> 'YYYY-MM-DD' or null. Handles ISO, '5 November 2026', '5 Nov 2026',
// 'November 5, 2026', '05-11-2026', '05/11/2026'. Placeholder text ('Soon', 'Notify later') -> null.
export function toISO(value) {
  const s = String(value || '').trim()
  if (!s) return null
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
  if (m) return `${m[3]}-${pad(m[2])}-${pad(m[1])}`
  m = s.match(/^(\d{1,2})(?:st|nd|rd|th)?[\s-]+([A-Za-z]+)[\s,.-]+(\d{4})$/)
  if (m) {
    const i = MONTHS.findIndex((x) => x.startsWith(m[2].toLowerCase().slice(0, 3)))
    if (i >= 0) return `${m[3]}-${pad(i + 1)}-${pad(m[1])}`
  }
  m = s.match(/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/)
  if (m) {
    const i = MONTHS.findIndex((x) => x.startsWith(m[1].toLowerCase().slice(0, 3)))
    if (i >= 0) return `${m[3]}-${pad(i + 1)}-${pad(m[2])}`
  }
  return null
}

// Text forms a last_date might be stored in for one ISO day - used to narrow the database query.
export function dateVariants(iso) {
  const [y, mo, d] = iso.split('-')
  const full = MONTHS[Number(mo) - 1]
  const cap = full[0].toUpperCase() + full.slice(1)
  const dn = String(Number(d))
  return [iso, `${dn} ${cap} ${y}`, `${d} ${cap} ${y}`, `${dn} ${cap.slice(0, 3)} ${y}`, `${d}-${mo}-${y}`, `${d}/${mo}/${y}`]
}

const NOT_OPENING_CATEGORIES = ['results', 'admit-cards', 'answer-keys', 'syllabus']
const NOT_OPENING_WORDS = ['result', 'admit card', 'answer key', 'syllabus', 'cut off', 'merit list', 'hall ticket', 'call letter']

// Keep only real openings whose last date is exactly `today`.
export function closingToday(jobs, today) {
  return (jobs || []).filter((j) => {
    if (!j || j.is_active === false) return false
    if (NOT_OPENING_CATEGORIES.includes(j.category)) return false
    const title = String(j.title || '').toLowerCase()
    if (NOT_OPENING_WORDS.some((w) => title.includes(w))) return false
    return toISO(j.last_date) === today
  })
}