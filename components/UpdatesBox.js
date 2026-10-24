'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useLanguage } from './LanguageProvider'

const COUNT = 10           // latest posts shown per box
const ROW_H = 74           // px - fixed so the loop is seamless
const DEFAULT_VISIBLE_ROWS = 6  // rows visible before scrolling starts
const SECONDS_PER_ROW = 3  // scroll speed
const MR = 'mr'

function postedText(iso, mr) {
  return new Date(iso).toLocaleString(mr ? 'mr-IN' : 'en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  })
}

// category: 'results' | 'admit-cards'
export default function UpdatesBox({ category, heading, headingMr, color, visibleRows = DEFAULT_VISIBLE_ROWS }) {
  const { lang } = useLanguage()
  const mr = lang === MR
  const [items, setItems] = useState(null)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(COUNT)
      if (error) console.error('UpdatesBox', category, error)
      setItems(data || [])
    }
    load()
  }, [category])

  const list = items || []
  const animate = list.length > visibleRows
  const rows = animate ? [...list, ...list] : list

  return (
    <section style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderTop:`3px solid ${color}`, borderRadius:'12px', overflow:'hidden'}}>
      <style>{`
        .dw-ticker{overflow:hidden;position:relative}
        .dw-track{display:flex;flex-direction:column}
        .dw-ticker[data-animate="true"] .dw-track{animation:dw-scroll linear infinite}
        .dw-ticker[data-animate="true"]:hover .dw-track,
        .dw-ticker[data-animate="true"]:focus-within .dw-track{animation-play-state:paused}
        @keyframes dw-scroll{from{transform:translateY(0)}to{transform:translateY(-50%)}}
        .dw-row{display:flex;flex-direction:column;justify-content:center;gap:4px;padding:0 14px;border-bottom:1px solid var(--color-border);text-decoration:none;box-sizing:border-box;overflow:hidden}
        .dw-row:hover{background:rgba(0,0,0,.03)}
        .dw-title{font-size:13.5px;font-weight:600;line-height:1.3;color:var(--color-ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .dw-meta{font-size:12px;color:var(--color-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        @media (prefers-reduced-motion:reduce){
          .dw-ticker[data-animate="true"]{overflow-y:auto}
          .dw-ticker[data-animate="true"] .dw-track{animation:none}
        }
      `}</style>

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', borderBottom:'1px solid var(--color-border)', gap:'8px'}}>
        <h2 style={{margin:0, fontSize:'15px', fontWeight:'700', color:'var(--color-ink)', fontFamily:'var(--font-heading)', display:'flex', alignItems:'center', gap:'8px'}}>
          <span style={{width:'9px', height:'9px', borderRadius:'50%', background:color, display:'inline-block', flexShrink:0}} />
          {mr ? headingMr : heading}
        </h2>
        <Link href={`/jobs?category=${category}`} style={{fontSize:'12.5px', fontWeight:'600', color, textDecoration:'none', whiteSpace:'nowrap'}}>
          {mr ? 'सर्व पहा' : 'View all'} →
        </Link>
      </div>

      {items === null ? (
        <p style={{margin:0, padding:'22px 14px', fontSize:'13px', color:'var(--color-muted)', textAlign:'center'}}>{mr ? 'लोड होत आहे...' : 'Loading...'}</p>
      ) : list.length === 0 ? (
        <p style={{margin:0, padding:'22px 14px', fontSize:'13px', color:'var(--color-muted)', textAlign:'center'}}>
          {mr ? 'अजून काहीही नाही.' : 'Nothing here yet.'}
        </p>
      ) : (
        <div className="dw-ticker" data-animate={animate} style={{height: animate ? ROW_H * visibleRows : 'auto'}}>
          <div className="dw-track" style={animate ? {animationDuration: `${list.length * SECONDS_PER_ROW}s`} : undefined}>
            {rows.map((job, i) => (
              <Link key={`${job.id}-${i}`} href={`/jobs/${job.id}`} className="dw-row" style={{height: ROW_H}}>
                <span className="dw-title">{mr && job.title_mr ? job.title_mr : job.title}</span>
                <span className="dw-meta">{mr ? 'प्रकाशित' : 'Posted'}: {postedText(job.created_at, mr)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}