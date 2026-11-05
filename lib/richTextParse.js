// Turns plain/markdown-ish job text into blocks. Pure functions, no React.
// Block types: heading {level,text} | p {text} | ul {items[]} | ol {items[]} | hr

const INLINE_RE = new RegExp([
  '(\\*\\*[^*\\n]+?\\*\\*)',                                  // 1 bold
  '(\\[[^\\]\\n]+\\]\\(https?:\\/\\/[^)\\s]+\\))',            // 2 [text](url)
  '(https?:\\/\\/[^\\s<>"\']+)',                              // 3 url
  '(www\\.[^\\s<>"\']+\\.[A-Za-z]{2,}[^\\s<>"\']*)',          // 4 www.url
  '([A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,})', // 5 email
].join('|'), 'g')

const TRAIL = /[.,;:!?)\]}'"]+$/

// -> [{t:'text',v} | {t:'bold',v} | {t:'link',v,href}]
export function parseInline(text) {
  const out = []
  let last = 0, m
  INLINE_RE.lastIndex = 0
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) })
    let [raw] = m
    if (m[1]) {
      out.push({ t: 'bold', v: raw.slice(2, -2) })
    } else if (m[2]) {
      const mm = raw.match(/^\[([^\]]+)\]\((.+)\)$/)
      out.push({ t: 'link', v: mm[1], href: mm[2] })
    } else {
      // peel trailing punctuation off urls/emails so "visit x.com." stays clean
      const tail = (raw.match(TRAIL) || [''])[0]
      if (tail) raw = raw.slice(0, -tail.length)
      const href = m[5] ? `mailto:${raw}` : /^www\./i.test(raw) ? `https://${raw}` : raw
      out.push({ t: 'link', v: raw, href })
      if (tail) { out.push({ t: 'text', v: tail }) }
    }
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) })
  return out
}

export function parseBlocks(input) {
  let text = String(input ?? '').replace(/\r\n?/g, '\n').trim()
  if (!text) return []

  const blocks = []
  let para = []
  let list = null // {type,items}

  const flushPara = () => { if (para.length) { blocks.push({ type: 'p', text: para.join(' ') }); para = [] } }
  const flushList = () => { if (list) { blocks.push(list); list = null } }

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) { flushPara(); flushList(); continue }

    let m
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      flushPara(); flushList()
      blocks.push({ type: 'heading', level: m[1].length, text: m[2].replace(/\s*#+\s*$/, '') })
    } else if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushPara(); flushList(); blocks.push({ type: 'hr' })
    } else if ((m = line.match(/^[-*•]\s+(.*)$/))) {
      flushPara()
      if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] } }
      list.items.push(m[1])
    } else if ((m = line.match(/^\d{1,2}[.)]\s+(.*)$/))) {
      flushPara()
      if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] } }
      list.items.push(m[1])
    } else {
      flushList()
      para.push(line)
    }
  }
  flushPara(); flushList()
  return blocks
}