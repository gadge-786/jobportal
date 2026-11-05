import { parseBlocks, parseInline } from '../lib/richTextParse'

// Readable job text: paragraph gaps, headings, bullet/numbered lists,
// highlighted **bold**, and clickable links / emails. No HTML is injected.

function Inline({ text, accent }) {
  return parseInline(text).map((n, i) => {
    if (n.t === 'bold') {
      return (
        <strong key={i} style={{fontWeight:700, color:'var(--color-ink)', background:`${accent}1f`, padding:'0 4px', borderRadius:'4px'}}>
          <Inline text={n.v} accent={accent} />
        </strong>
      )
    }
    if (n.t === 'link') {
      return (
        <a key={i} href={n.href} target="_blank" rel="noopener noreferrer"
           style={{color:'#1a56db', textDecoration:'underline', textUnderlineOffset:'2px', wordBreak:'break-word'}}>
          {n.v}
        </a>
      )
    }
    return <span key={i}>{n.v}</span>
  })
}

// "Last date: 15 November" -> label in bold accent colour, rest normal
function ListItem({ text, accent }) {
  const m = text.match(/^([^:*\n]{2,45}):\s+(.*)$/)
  if (m && !/https?$/i.test(m[1])) {
    return (
      <li>
        <span style={{fontWeight:700, color:'var(--color-ink)'}}>{m[1]}:</span>{' '}
        <Inline text={m[2]} accent={accent} />
      </li>
    )
  }
  return <li><Inline text={text} accent={accent} /></li>
}

export default function RichText({ text, accentColor, fontSize = 14.5, style }) {
  const accent = accentColor || '#1a56db'
  const blocks = parseBlocks(text)
  if (!blocks.length) return null

  return (
    <>
      <style>{`
        .dw-rt > :first-child{margin-top:0 !important}
        .dw-rt > :last-child{margin-bottom:0 !important}
        .dw-rt ul,.dw-rt ol{margin:0 0 14px;padding-left:22px}
        .dw-rt li{margin:5px 0;padding-left:2px}
        .dw-rt ul li::marker,.dw-rt ol li::marker{color:var(--rt-accent);font-weight:700}
        .dw-rt a:hover{opacity:.8}
      `}</style>
      <div className="dw-rt" style={{color:'var(--color-muted)', lineHeight:1.8, fontSize:`${fontSize}px`, overflowWrap:'anywhere', '--rt-accent': accent, ...style}}>
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          const big = b.level === 1
          return (
            <h3 key={i} style={{
              fontFamily:'var(--font-heading)', fontWeight:700, lineHeight:1.35,
              fontSize: big ? '17px' : b.level === 2 ? '16px' : '15px',
              color: b.level === 3 ? 'var(--color-ink)' : accent,
              margin: big ? '0 0 12px' : '22px 0 8px',
              paddingLeft: b.level === 2 ? '10px' : 0,
              borderLeft: b.level === 2 ? `3px solid ${accent}` : 'none',
            }}><Inline text={b.text} accent={accent} /></h3>
          )
        }
        if (b.type === 'hr') return <hr key={i} style={{border:'none', borderTop:'1px solid var(--color-border)', margin:'16px 0'}} />
        if (b.type === 'ul') return <ul key={i}>{b.items.map((it, j) => <ListItem key={j} text={it} accent={accent} />)}</ul>
        if (b.type === 'ol') return <ol key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} accent={accent} /></li>)}</ol>
        return <p key={i} style={{margin:'0 0 14px'}}><Inline text={b.text} accent={accent} /></p>
      })}
      </div>
    </>
  )
}