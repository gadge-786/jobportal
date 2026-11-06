import RichText, { Inline } from './RichText'

// Drop-in replacement for DataTable: same props (title, subtitle, accentColor, columns, rows).
// - long text wraps instead of being cut off; very wide tables scroll sideways on small screens
// - links, emails and **bold** inside cells work
// - subtitle supports paragraphs, headings, lists and links
// - "Total" rows are emphasised

const cellText = v => (v === null || v === undefined) ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
const NARROW_HEAD = /^(sr\.?\s*no\.?|s\.?\s*no\.?|no\.?|#|क्र\.?.*|अ\.?\s*क्र.*)$/i
const TOTAL_ROW = /^(total|grand total|एकूण|मोट)/i

export default function InfoTable({ title, subtitle, accentColor, columns = [], rows = [] }) {
  const accent = accentColor || '#1a56db'
  const cols = columns.length ? columns : (rows[0] ? rows[0].map((_, i) => `Column ${i + 1}`) : [])
  const wide = cols.length > 2
  const twoCol = cols.length === 2

  return (
    <section style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderLeft:`4px solid ${accent}`, borderRadius:'14px', overflow:'hidden', margin:'0 0 16px', textAlign:'left'}}>
      <style>{`
        .dw-it-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
        .dw-it tbody tr:hover{background:rgba(0,0,0,.025)}
        @media (max-width:640px){ .dw-it td,.dw-it th{padding:9px 10px !important;font-size:13px !important} }
      `}</style>

      {title && (
        <div style={{padding:'16px 20px 12px'}}>
          <h2 style={{margin:0, fontFamily:'var(--font-heading)', fontSize:'16px', fontWeight:700, color:'var(--color-ink)', lineHeight:1.35}}>{title}</h2>
        </div>
      )}
      {subtitle && (
        <div style={{padding:'0 20px 14px'}}>
          <RichText text={subtitle} accentColor={accent} fontSize={13.5} />
        </div>
      )}

      <div className="dw-it-wrap">
        <table className="dw-it" style={{width:'100%', borderCollapse:'collapse', minWidth: wide ? `${Math.min(cols.length * 150, 640)}px` : 0}}>
          <thead>
            <tr>
              {cols.map((c, i) => (
                <th key={i} style={{
                  textAlign:'left', verticalAlign:'bottom', padding:'10px 16px', fontSize:'11.5px', fontWeight:700,
                  letterSpacing:'.05em', textTransform:'uppercase', color:accent, background:`${accent}12`,
                  borderTop:'1px solid var(--color-border)', borderBottom:'1px solid var(--color-border)',
                  width: NARROW_HEAD.test(String(c).trim()) ? '64px' : (twoCol && i === 0 ? '32%' : undefined),
                }}>{cellText(c)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => {
              const cells = Array.isArray(row) ? row : [row]
              const total = TOTAL_ROW.test(cellText(cells.find(c => cellText(c).trim()) ?? '').trim())
              return (
                <tr key={r} style={{background: total ? `${accent}10` : (r % 2 ? 'rgba(0,0,0,.02)' : 'transparent')}}>
                  {cols.map((_, i) => (
                    <td key={i} style={{
                      textAlign:'left', verticalAlign:'top', padding:'11px 16px', fontSize:'14px', lineHeight:1.6,
                      color: i === 0 ? 'var(--color-ink)' : 'var(--color-muted)',
                      fontWeight: i === 0 || total ? 600 : 400,
                      borderBottom:'1px solid var(--color-border)',
                      borderTop: total ? `2px solid ${accent}55` : undefined,
                      overflowWrap:'anywhere', whiteSpace:'pre-line',
                    }}>
                      <Inline text={cellText(cells[i])} accent={accent} />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}