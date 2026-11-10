// Turns plain/markdown-ish job text into blocks. Pure functions, no React.
// Block types: heading {level,text} | p {text} | ul {items[]} | ol {items[]} | hr | table {header[],align[],rows[][]}

const INLINE_RE = new RegExp([
  '(\\*\\*[^*\\n]+?\\*\\*)',                                  // 1 bold
  '(\\[[^\\]\\n]+\\]\\(https?:\\/\\/[^)\\s]+\\))',            // 2 [text](url)
  '(https?:\\/\\/[^\\s<>"\']+)',                              // 3 url
  '(www\\.[^\\s<>"\']+\\.[A-Za-z]{2,}[^\\s<>"\']*)',          // 4 www.url
  '([A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,})', // 5 email
  '(<badge(?:\\s+(green|red|amber|blue|gray))?>([^<\\n]+?)<\\/badge>)',     // 6 <badge>text</badge>  (7 colour, 8 text)
].join('|'), 'gi')

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
    } else if (m[6]) {
      out.push({ t: 'badge', v: m[8].trim(), color: (m[7] || '').toLowerCase() })
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

// "| a | b |" -> ['a','b'] (keeps escaped \\| inside a cell)
export function splitRow(line) {
  let t = line.trim()
  if (t.startsWith('|')) t = t.slice(1)
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1)
  return t.split(/(?<!\\)\|/).map(c => c.replace(/\\\|/g, '|').trim())
}
const isTableLine = l => /^\|.*\|$/.test(l.trim()) && l.trim().length > 2
const isSepRow = cells => cells.length > 0 && cells.every(c => /^:?-{2,}:?$/.test(c))

export function parseBlocks(input) {
  let text = String(input ?? '').replace(/\r\n?/g, '\n').trim()
  if (!text) return []

  const blocks = []
  let para = []
  let list = null // {type,items}

  const flushPara = () => { if (para.length) { blocks.push({ type: 'p', text: para.join(' ') }); para = [] } }
  const flushList = () => { if (list) { blocks.push(list); list = null } }

  const lines = text.split('\n')
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li].trim()
    if (!line) { flushPara(); flushList(); continue }

    // markdown pipe table: a run of |...| lines (separator row optional)
    if (isTableLine(line)) {
      flushPara(); flushList()
      const raw = []
      while (li < lines.length && isTableLine(lines[li])) { raw.push(splitRow(lines[li])); li++ }
      li--
      let header = null, align = [], rows = raw
      if (raw.length > 1 && isSepRow(raw[1])) {
        header = raw[0]
        align = raw[1].map(c => c.endsWith(':') ? (c.startsWith(':') ? 'center' : 'right') : 'left')
        rows = raw.slice(2)
      } else if (raw.length && isSepRow(raw[0])) {
        rows = raw.slice(1)
      }
      const width = Math.max(header ? header.length : 0, ...rows.map(r => r.length), 1)
      const pad = r => Array.from({ length: width }, (_, i) => r[i] ?? '')
      blocks.push({ type: 'table', header: header ? pad(header) : null, align: Array.from({ length: width }, (_, i) => align[i] || 'left'), rows: rows.map(pad) })
      continue
    }

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