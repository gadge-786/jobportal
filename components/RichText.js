import { parseBlocks, parseInline } from '../lib/richTextParse'

// Readable job text: paragraph gaps, headings, bullet/numbered lists,
// highlighted **bold**, and clickable links / emails. No HTML is injected.

export function Inline({ text, accent }) {
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

const TOTAL = /^(\*\*)?(total|grand total|एकूण|मोट|कुल)(\*\*)?$/i

function MdTable({ b, accent }) {
  const cell = { padding:'9px 12px', borderBottom:'1px solid var(--color-border)', verticalAlign:'top', lineHeight:1.55 }
  return (
    <div className="dw-rt-table" style={{overflowX:'auto', margin:'4px 0 18px', border:'1px solid var(--color-border)', borderRadius:'10px'}}>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.93em', minWidth: b.header && b.header.length > 3 ? '460px' : undefined}}>
        {b.header && (
          <thead>
            <tr>{b.header.map((h, i) => (
              <th key={i} style={{...cell, textAlign:b.align[i], background:`${accent}14`, color:'var(--color-ink)', fontWeight:700, borderBottom:`2px solid ${accent}55`, whiteSpace:'normal'}}>
                <Inline text={h} accent={accent} />
              </th>))}
            </tr>
          </thead>
        )}
        <tbody>
          {b.rows.map((r, ri) => {
            const first = (r.find(c => c.trim()) || '').trim()
            const total = TOTAL.test(first)
            return (
              <tr key={ri} style={{background: total ? `${accent}10` : (ri % 2 ? 'rgba(0,0,0,.02)' : 'transparent')}}>
                {r.map((c, ci) => (
                  <td key={ci} style={{...cell, textAlign:b.align[ci], fontWeight: total || ci === 0 ? 600 : 400, color: ci === 0 || total ? 'var(--color-ink)' : undefined, borderTop: total ? `2px solid ${accent}55` : undefined, wordBreak:'break-word'}}>
                    <Inline text={c} accent={accent} />
                  </td>))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
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
        if (b.type === 'table') return <MdTable key={i} b={b} accent={accent} />
        if (b.type === 'hr') return <hr key={i} style={{border:'none', borderTop:'1px solid var(--color-border)', margin:'16px 0'}} />
        if (b.type === 'ul') return <ul key={i}>{b.items.map((it, j) => <ListItem key={j} text={it} accent={accent} />)}</ul>
        if (b.type === 'ol') return <ol key={i}>{b.items.map((it, j) => <li key={j}><Inline text={it} accent={accent} /></li>)}</ol>
        return <p key={i} style={{margin:'0 0 14px'}}><Inline text={b.text} accent={accent} /></p>
      })}
      </div>
    </>
  )
}