export default function DataTable({ title, columns, rows, accentColor, subtitle }) {
  return (
    <div style={{
      background: 'var(--color-card)',
      borderRadius: '14px',
      marginBottom: '16px',
      border: '1px solid var(--color-border)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '18px 22px 14px',
        borderLeft: `4px solid ${accentColor}`,
        background: `linear-gradient(135deg, ${accentColor}0d, transparent)`
      }}>
        <h2 style={{ fontFamily:'var(--font-heading)', fontSize: '16px', fontWeight: '700', color: 'var(--color-ink)', margin: 0 }}>{title}</h2>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px', marginBottom: 0 }}>{subtitle}</p>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: `${accentColor}12` }}>
              {columns.map((col, i) => (
                <th key={i} style={{
                  textAlign: 'left',
                  padding: '10px 22px',
                  color: accentColor,
                  fontWeight: '700',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderBottom: `2px solid ${accentColor}30`,
                  whiteSpace: 'nowrap'
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isTotal = String(row[0]).toLowerCase() === 'total'
              return (
                <tr
                  key={i}
                  style={{
                    background: isTotal ? `${accentColor}0f` : (i % 2 === 0 ? 'var(--color-card)' : '#FAF8F3'),
                    borderBottom: '1px solid var(--color-border)'
                  }}
                >
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '11px 22px',
                      color: j === 0 ? 'var(--color-ink)' : 'var(--color-muted)',
                      fontWeight: (j === 0 || isTotal) ? '600' : '400',
                      whiteSpace: 'nowrap'
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}