export default function DataTable({ title, columns, rows, accentColor, subtitle }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      marginBottom: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      border: '1px solid #eef0f3',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '20px 24px 16px',
        borderLeft: `4px solid ${accentColor}`,
        background: `linear-gradient(135deg, ${accentColor}0d, transparent)`
      }}>
        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0 }}>{title}</h2>
        {subtitle && (
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', marginBottom: 0 }}>{subtitle}</p>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: `${accentColor}12` }}>
              {columns.map((col, i) => (
                <th key={i} style={{
                  textAlign: 'left',
                  padding: '10px 24px',
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
                    background: isTotal ? `${accentColor}0f` : (i % 2 === 0 ? 'white' : '#fafbfc'),
                    borderBottom: '1px solid #f1f2f4',
                    transition: 'background 0.15s'
                  }}
                >
                  {row.map((cell, j) => (
                    <td key={j} style={{
                      padding: '11px 24px',
                      color: j === 0 ? '#111827' : '#4b5563',
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