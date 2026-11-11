// Basic spam guard for the public Q&A box. Pure functions, no React.
export const QA_MAX_NAME = 60
export const QA_MAX_QUESTION = 500
export const QA_COOLDOWN_MS = 30000

const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|in|net|org|xyz|ru|cn|co|info|biz|top|click|shop|site|online)\b|t\.me\/|bit\.ly)/i

// -> { ok: true } | { ok: false, reason: 'empty' | 'long' | 'links' }
export function checkQuestion(name, question) {
  const q = String(question ?? '').trim()
  const n = String(name ?? '').trim()
  if (!q) return { ok: false, reason: 'empty' }
  if (q.length > QA_MAX_QUESTION || n.length > QA_MAX_NAME) return { ok: false, reason: 'long' }
  if (LINK_RE.test(q) || LINK_RE.test(n)) return { ok: false, reason: 'links' }
  return { ok: true }
}

// last = timestamp (ms) of the previous post from this browser, or null
export function waitSeconds(last, now = Date.now()) {
  if (!last) return 0
  const left = QA_COOLDOWN_MS - (now - Number(last))
  return left > 0 ? Math.ceil(left / 1000) : 0
}