// Turns last_date text ("15 November 2026") into an ISO string for JSON-LD validThrough.
// Returns null for placeholders or anything unparseable.
const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']

export function lastDateToISO(text) {
  if (!text) return null
  const m = String(text).match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/)
  if (!m) return null
  const mi = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase())
  if (mi < 0) return null
  const d = new Date(Date.UTC(+m[3], mi, +m[1], 23, 59, 59))
  return isNaN(d) ? null : d.toISOString()
}