// Eligibility matching for the "Check your eligibility" feature. Pure functions, no React.
//
// The jobs table has no structured age/education columns, so this reads the text of
// details_table (keys like "Age Limit", "Qualification") and eligibility_table. It is a
// best-effort filter: results are labelled "likely", never as a guarantee.
import { toDetails, toTable } from './normalizeJob'
import { lastDateToISO } from './parseLastDate'

export const EDUCATION = [
  { id: 'below10', en: '8th pass or below', mr: '८ वी पास किंवा कमी' },
  { id: '10th', en: '10th pass', mr: '१० वी पास' },
  { id: '12th', en: '12th pass', mr: '१२ वी पास' },
  { id: 'iti', en: 'ITI', mr: 'आयटीआय' },
  { id: 'diploma', en: 'Diploma', mr: 'डिप्लोमा' },
  { id: 'graduate', en: 'Graduate (any degree)', mr: 'पदवीधर (कोणतीही पदवी)' },
  { id: 'pg', en: 'Post graduate', mr: 'पदव्युत्तर' },
]
export const STREAMS = [
  { id: 'any', en: 'Any / not sure', mr: 'कोणतीही / माहित नाही' },
  { id: 'eng', en: 'Engineering (B.E./B.Tech)', mr: 'अभियांत्रिकी (B.E./B.Tech)' },
  { id: 'it', en: 'Computer / IT (BCA, MCA)', mr: 'कॉम्प्युटर / IT (BCA, MCA)' },
  { id: 'med', en: 'Medical / Nursing / Pharmacy', mr: 'वैद्यकीय / नर्सिंग / फार्मसी' },
  { id: 'law', en: 'Law (LLB)', mr: 'कायदा (LLB)' },
  { id: 'edu', en: 'Education (B.Ed / D.El.Ed)', mr: 'शिक्षण (B.Ed / D.El.Ed)' },
  { id: 'comm', en: 'Commerce / CA / MBA', mr: 'वाणिज्य / CA / MBA' },
]
export const CATEGORIES = [
  { id: 'general', en: 'General', mr: 'सर्वसाधारण', relax: 0 },
  { id: 'ews', en: 'EWS', mr: 'EWS', relax: 0 },
  { id: 'obc', en: 'OBC', mr: 'OBC', relax: 3 },
  { id: 'sc', en: 'SC', mr: 'SC', relax: 5 },
  { id: 'st', en: 'ST', mr: 'ST', relax: 5 },
]

// which requirement levels a person with a given qualification satisfies
const HOLDS = {
  below10: ['8th'],
  '10th': ['8th', '10th'],
  '12th': ['8th', '10th', '12th'],
  iti: ['8th', '10th', 'iti'],
  diploma: ['8th', '10th', 'diploma'],
  graduate: ['8th', '10th', '12th', 'graduate'],
  pg: ['8th', '10th', '12th', 'graduate', 'pg'],
}

const LEVEL_RE = [
  ['pg', /post[\s-]*graduat|postgraduat|master'?s?\b|\bm\.?\s*(a|sc|com|tech|e|ed|phil|ca)\b\.?|\bmba\b|\bmca\b|\bllm\b|\bpg\b|स्नातकोत्तर|पदव्युत्तर|पोस्ट\s*ग्रेजुएट/i],
  ['graduate', /graduat|bachelor|degree|\bb\.?\s*(a|sc|com|tech|e|ed|ca|ba|pharm|arch)\b\.?|\bbca\b|\bbba\b|\bllb\b|\bmbbs\b|\bbds\b|स्नातक(?!ोत्तर)|पदवी(?!का)|पदवीधर|ग्रेजुएट/i],
  ['diploma', /diploma|polytechnic|डिप्लोमा|पदविका/i],
  ['iti', /\biti\b|industrial training|आईटीआई|आयटीआय|\bncvt\b/i],
  ['12th', /\b12\s*th\b|\bxii\b|class\s*12|10\s*\+\s*2|intermediate|higher secondary|\bhsc\b|\+2|१२\s*वी|बारावी|बारहवीं|12वीं|इंटरमीडिएट/i],
  ['10th', /\b10\s*th\b|\bclass\s*(x|10)\b|matric|\bssc\b|secondary school|high school|१०\s*वी|दहावी|दसवीं|10वीं|मैट्रिक/i],
  ['8th', /\b(8|5)\s*th\b|\beighth\b|middle school|८\s*वी|आठवी|आठवीं|8वीं/i],
]
const STREAM_RE = {
  eng: /\bb\.?\s*e\.?\b|b\.?\s*tech|engineering|अभियांत्रिकी|इंजीनियर/i,
  it: /\bbca\b|\bmca\b|computer science|information technology|\bit\b degree/i,
  med: /mbbs|\bbds\b|\bbams\b|\bbhms\b|nursing|\bgnm\b|\banm\b|pharm|medical officer|paramedical|नर्सिंग|फार्मसी/i,
  law: /\bllb\b|\bllm\b|law degree|bachelor of law|विधी|कानून/i,
  edu: /\bb\.?\s*ed\b|d\.?\s*el\.?\s*ed|\bctet\b|\btet\b|teacher training|बी\.?\s*एड/i,
  comm: /chartered accountant|\bca\b|icwa|cost accountant|\bmba\b|company secretary|\bcfa\b/i,
}
const ANY_STREAM_RE = /any (discipline|stream|subject|branch|faculty)|all (discipline|stream|branch)|कोणत्याही (शाखे|विषय|पदवी)|किसी भी (विषय|शाखा|संकाय)/i

const KEY_AGE = /\bage\b|वय|आयु|उम्र/i
const KEY_QUAL = /qualif|education|eligib|पात्रता|शैक्षणिक|योग्यता|शिक्षा|शिक्षण/i

function flat(v) {
  if (v == null) return ''
  if (typeof v === 'string') return v
  try { return JSON.stringify(v) } catch { return '' }
}

// Collect the text we can judge from. Qualification and age are kept apart.
export function extractText(job) {
  const details = toDetails(job.details_table)
  let qual = '', age = ''
  for (const [k, v] of Object.entries(details)) {
    if (KEY_AGE.test(k)) age += ' ' + v
    else if (KEY_QUAL.test(k)) qual += ' ' + v
  }
  const et = toTable(job.eligibility_table)
  if (et && Array.isArray(et.rows)) {
    const cols = Array.isArray(et.columns) ? et.columns.map(c => String(c ?? '')) : []
    for (const row of et.rows) {
      const cells = Array.isArray(row) ? row : [row]
      cells.forEach((c, i) => {
        const text = String(c ?? '')
        if (!text.trim()) return
        const col = cols[i] || ''
        if (KEY_AGE.test(col) || (!col && /^(age|वय|आयु|उम्र)/i.test(text))) age += ' ' + text
        else qual += ' ' + text
      })
    }
  }
  return { qual: qual.trim(), age: age.trim() }
}

export function detectLevels(text) {
  const out = new Set()
  if (!text) return out
  for (const [lvl, re] of LEVEL_RE) if (re.test(text)) out.add(lvl)
  // "Graduate" also matches the word "degree"; a 10+2 / 12th mention alone must not imply graduate
  return out
}

export function detectStreams(text) {
  const out = new Set()
  for (const [s, re] of Object.entries(STREAM_RE)) if (re.test(text || '')) out.add(s)
  return out
}

export function parseAge(text) {
  if (!text) return null
  let t = String(text)
    .replace(/\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/g, ' ')              // dates
    .replace(/\b(as on|as of|on|dated?)\b[^.;,)]{0,30}\d{4}/gi, ' ')  // "as on 1 Jan 2026"
    .replace(/\b(19|20)\d{2}\b/g, ' ')                               // years
    .replace(/\d+(\.\d+)?\s*%/g, ' ')
  const nums = (t.match(/\b(1[4-9]|[2-5]\d|6[0-5])\b/g) || []).map(Number)
  if (!nums.length) return null
  if (nums.length >= 2) {
    const [a, b] = nums
    return { min: Math.min(a, b), max: Math.max(a, b) }
  }
  const n = nums[0]
  if (/max|up\s*to|upto|below|not exceed|not more|कमाल|जास्तीत|अधिकतम|पेक्षा कमी|तक/i.test(t)) return { min: null, max: n }
  if (/\bmin|at least|least|न्यूनतम|कमीत कमी/i.test(t)) return { min: n, max: null }
  return { min: null, max: n }
}

function lastDateMs(job) {
  const s = job.last_date
  if (!s) return null
  const iso = /^\d{4}-\d{2}-\d{2}/.test(String(s)) ? String(s).slice(0, 10) + 'T23:59:59Z' : lastDateToISO(s)
  const ms = iso ? Date.parse(iso) : NaN
  return Number.isNaN(ms) ? null : ms
}
export const deadlineOf = lastDateMs

const stateKey = x => (String(x || '').trim().toLowerCase().replace(/\s+/g, '-') || 'all-india')

/**
 * profile: { edu, age, cat, state, stream }
 * -> { status: 'match' | 'maybe' | 'no', tags: [...] }
 * tags: edu_ok, edu_mixed, edu_unknown, age_ok, age_relaxed, age_unknown, stream_check
 */
export function matchJob(job, profile, now = Date.now()) {
  const tags = []
  // expired?
  const end = lastDateMs(job)
  if (end !== null && end < now - 86400000) return { status: 'no', tags: ['expired'] }

  // state
  if (profile.state && profile.state !== 'any') {
    const js = stateKey(job.state)
    if (js !== profile.state && js !== 'all-india') return { status: 'no', tags: ['state'] }
  }

  const { qual, age } = extractText(job)
  const holds = HOLDS[profile.edu] || []

  // ---- age
  let ageState = 'unknown'
  const a = parseAge(age)
  const age0 = Number(profile.age)
  if (a && age0) {
    const relax = (CATEGORIES.find(c => c.id === profile.cat) || { relax: 0 }).relax
    if (a.min != null && age0 < a.min) return { status: 'no', tags: ['age'] }
    if (a.max != null) {
      if (age0 <= a.max) ageState = 'ok'
      else if (age0 <= a.max + relax) ageState = 'relaxed'
      else return { status: 'no', tags: ['age'] }
    } else ageState = 'ok'
  }

  // ---- education
  const req = detectLevels(qual)
  let eduState = 'unknown'
  if (req.size) {
    const hit = [...req].filter(l => holds.includes(l))
    if (!hit.length) return { status: 'no', tags: ['edu'] }
    eduState = req.size > 1 ? 'mixed' : 'ok'
    // specialised degree required (B.Tech, MBBS, B.Ed ...) and the person only qualifies through a degree
    const viaDegree = hit.every(l => ['graduate', 'pg', 'diploma'].includes(l))
    if (viaDegree && !ANY_STREAM_RE.test(qual)) {
      const need = detectStreams(qual)
      if (need.size) {
        if (profile.stream === 'any' || !profile.stream) tags.push('stream_check')
        else if (!need.has(profile.stream)) return { status: 'no', tags: ['stream'] }
      }
    }
  }

  if (eduState === 'ok' || eduState === 'mixed') tags.push(eduState === 'ok' ? 'edu_ok' : 'edu_mixed')
  else tags.push('edu_unknown')
  tags.push(ageState === 'ok' ? 'age_ok' : ageState === 'relaxed' ? 'age_relaxed' : 'age_unknown')

  const sure = (eduState === 'ok' || eduState === 'mixed') && !tags.includes('stream_check')
  return { status: sure ? 'match' : 'maybe', tags }
}

export function filterJobs(jobs, profile, now = Date.now()) {
  const match = [], maybe = []
  for (const job of jobs) {
    const r = matchJob(job, profile, now)
    if (r.status === 'match') match.push({ job, ...r })
    else if (r.status === 'maybe') maybe.push({ job, ...r })
  }
  const score = x => {
    const t = x.tags
    return (t.includes('age_ok') ? 0 : t.includes('age_relaxed') ? 1 : 2) + (t.includes('edu_ok') ? 0 : 1)
  }
  const byDeadline = (a, b) => {
    const da = lastDateMs(a.job), db = lastDateMs(b.job)
    if (da === null && db === null) return 0
    if (da === null) return 1
    if (db === null) return -1
    return da - db
  }
  const sorter = (a, b) => score(a) - score(b) || byDeadline(a, b)
  match.sort(sorter); maybe.sort(sorter)
  return { match, maybe }
}