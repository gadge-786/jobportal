// Turns the markdown-ish job description into clean plain text for meta description / JSON-LD.
export function plainText(md, max = 155) {
  let t = String(md ?? '').replace(/\r\n?/g, '\n')
  t = t
    .split('\n')
    .filter(l => !/^\s*\|/.test(l))                 // table rows
    .filter(l => !/^\s*#{1,3}\s/.test(l))           // headings (title is already in <title>)
    .filter(l => !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l))
    .join('\n')
  t = t
    .replace(/<badge(?:\s+\w+)?>([^<\n]*)<\/badge>/gi, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1')
    .replace(/\*\*([^*\n]+?)\*\*/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^\s*\d{1,2}[.)]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (t.length <= max) return t
  // cut on a word boundary and add an ellipsis
  const cut = t.slice(0, max - 1)
  const sp = cut.lastIndexOf(' ')
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trimEnd() + '…'
}