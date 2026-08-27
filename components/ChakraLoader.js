'use client'
export default function ChakraLoader({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div className="chakra-track">
        <svg
          className="chakra-spin"
          width="52"
          height="52"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-amber)" strokeWidth="3" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12
            return (
              <g key={i} transform={`rotate(${angle} 50 50)`}>
                <path d="M50 50 L50 6 L56 18 Z" fill="var(--color-ink)" />
              </g>
            )
          })}
          <circle cx="50" cy="50" r="8" fill="var(--color-amber)" />
        </svg>
      </div>
      {label && (
        <p style={{ marginTop: '14px', color: 'var(--color-muted)', fontSize: '14px', fontWeight: '500' }}>
          {label}
        </p>
      )}

      <style jsx>{`
        .chakra-track {
          width: 100%;
          max-width: 240px;
          height: 60px;
          position: relative;
          margin: 0 auto;
        }
        .chakra-spin {
          position: absolute;
          top: 0;
          left: 0;
          animation:
            chakra-rotate 1.1s linear infinite,
            chakra-sweep 2.4s ease-in-out infinite;
        }
        @keyframes chakra-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes chakra-sweep {
          0% { left: 0; }
          50% { left: calc(100% - 52px); }
          100% { left: 0; }
        }
      `}</style>
    </div>
  )
}