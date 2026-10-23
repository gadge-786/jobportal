'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useLanguage } from './LanguageProvider'

const HOURS = 24          // only posts newer than this are shown
const ROW_H = 60          // px - fixed so the loop is seamless
const VISIBLE_ROWS = 4    // rows visible before scrolling starts
const SECONDS_PER_ROW = 3 // scroll speed
const MR = 'mr'

// Total vacancies: details_table first, then a number in the title like "(3,901 Jobs)" or "83 Various Posts"
export function getVacancies(job) {
  const d = job.details_table
  if (d && typeof d === 'object') {
    for (const [k, v] of Object.entries(d)) {
      if (/vacanc|no\.?\s*of\s*posts?|total\s*posts?/i.test(k)) {
        const m = String(v).match(/\d[\d,]*/)
        if (m) return m[0]
      }
    }
  }
  const m = (job.title || '').match(/(\d[\d,]*)\s*(?:various\s*)?(?:jobs|posts|vacanc)/i)
  return m ? m[1] : null
}

function postedText(iso, mr) {
  return new Date(iso).toLocaleString(mr ? 'mr-IN' : 'en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  })
}

function Panel({ heading, color, items, kind, viewAllHref, mr }) {
  const animate = items.length > VISIBLE_ROWS
  const rows = animate ? [...items, ...items] : items
  return (
    <section style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderTop:`3px solid ${color}`, borderRadius:'12px', overflow:'hidden', marginBottom:'16px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--color-border)'}}>
        <h2 style={{margin:0, fontSize:'16px', fontWeight:'700', color:'var(--color-ink)', fontFamily:'var(--font-heading)', display:'flex', alignItems:'center', gap:'8px'}}>
          <span style={{width:'9px', height:'9px', borderRadius:'50%', background:color, display:'inline-block'}} />
          {heading}
          <span style={{fontSize:'12px', fontWeight:'700', color, background:`${color}15`, padding:'2px 9px', borderRadius:'20px'}}>{items.length}</span>
        </h2>
        <Link href={viewAllHref} style={{fontSize:'13px', fontWeight:'600', color, textDecoration:'none'}}>
          {mr ? 'सर्व पहा' : 'View all'} →
        </Link>
      </div>

      {items.length === 0 ? (
        <p style={{margin:0, padding:'22px 16px', fontSize:'13px', color:'var(--color-muted)', textAlign:'center'}}>
          {mr ? `गेल्या ${HOURS} तासांत नवीन पोस्ट नाहीत.` : `No new posts in the last ${HOURS} hours.`}
        </p>
      ) : (
        <div className="dw-ticker" data-animate={animate} style={{height: animate ? ROW_H * VISIBLE_ROWS : 'auto'}}>
          <div className="dw-track" style={animate ? {animationDuration: `${items.length * SECONDS_PER_ROW}s`} : undefined}>
            {rows.map((job, i) => {
              const title = mr && job.title_mr ? job.title_mr : job.title
              const vac = getVacancies(job)
              return (
                <Link key={`${job.id}-${i}`} href={`/jobs/${job.id}`} className="dw-row" style={{height: ROW_H}}>
                  <span className="dw-title">{title}</span>
                  <span className="dw-meta">
                    {kind === 'jobs' && (
                      <>{mr ? 'रिक्त जागा' : 'Vacancies'}: <b>{vac || (mr ? 'अधिसूचना पहा' : 'see notification')}</b>{' · '}</>
                    )}
                    {mr ? 'प्रकाशित' : 'Posted'}: {postedText(job.created_at, mr)}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

export default function UpdatesTicker() {
  const { lang } = useLanguage()
  const mr = lang === MR
  const [items, setItems] = useState(null)

  useEffect(() => {
    async function load() {
      const since = new Date(Date.now() - HOURS * 3600 * 1000).toISOString()
      const { data } = await supabase
        .from('jobs')
        .select('id,title,title_mr,category,created_at,details_table')
        .eq('is_active', true)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(80)
      setItems(data || [])
    }
    load()
  }, [])

  const list = items || []
  const jobs = list.filter(j => j.category !== 'results' && j.category !== 'admit-cards')
  const admit = list.filter(j => j.category === 'admit-cards')
  const results = list.filter(j => j.category === 'results')

  return (
    <div>
      <style>{`
        .dw-ticker{overflow:hidden;position:relative}
        .dw-track{display:flex;flex-direction:column}
        .dw-ticker[data-animate="true"] .dw-track{animation:dw-scroll linear infinite}
        .dw-ticker[data-animate="true"]:hover .dw-track,
        .dw-ticker[data-animate="true"]:focus-within .dw-track{animation-play-state:paused}
        @keyframes dw-scroll{from{transform:translateY(0)}to{transform:translateY(-50%)}}
        .dw-row{display:flex;flex-direction:column;justify-content:center;gap:3px;padding:0 16px;border-bottom:1px solid var(--color-border);text-decoration:none;box-sizing:border-box;overflow:hidden}
        .dw-row:hover{background:rgba(0,0,0,.03)}
        .dw-title{font-size:14px;font-weight:600;color:var(--color-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .dw-meta{font-size:12px;color:var(--color-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .dw-meta b{color:var(--color-ink);font-weight:700}
        @media (prefers-reduced-motion:reduce){
          .dw-ticker[data-animate="true"]{overflow-y:auto}
          .dw-ticker[data-animate="true"] .dw-track{animation:none}
        }
      `}</style>

      {items === null ? (
        <p style={{textAlign:'center', color:'var(--color-muted)', padding:'30px'}}>{mr ? 'लोड होत आहे...' : 'Loading updates...'}</p>
      ) : (
        <>
          <Panel mr={mr} kind="jobs" color="#1a56db" items={jobs} viewAllHref="/jobs"
            heading={mr ? 'ताज्या भरती सूचना' : 'Latest Job Notifications'} />
          <Panel mr={mr} kind="admit" color="#0d9488" items={admit} viewAllHref="/jobs?category=admit-cards"
            heading={mr ? 'प्रवेशपत्र अपडेट्स' : 'Admit Card Updates'} />
          <Panel mr={mr} kind="results" color="#be185d" items={results} viewAllHref="/jobs?category=results"
            heading={mr ? 'निकाल अपडेट्स' : 'Result Updates'} />
        </>
      )}
    </div>
  )
}