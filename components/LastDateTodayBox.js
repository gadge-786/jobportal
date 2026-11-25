'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useLanguage } from './LanguageProvider'
import { todayIST, dateVariants, closingToday } from '../lib/lastDateToday'

const COLOR = '#dc2626'
const ROW_H = 58          // px per row
const VISIBLE = 4         // rows visible at once; scrolls only when there are more

export default function LastDateTodayBox() {
  const { lang } = useLanguage()
  const mr = lang === 'mr'
  const [jobs, setJobs] = useState(null)

  useEffect(() => {
    let alive = true
    async function load() {
      const today = todayIST()
      const filter = dateVariants(today).map((v) => `last_date.eq.${v}`).join(',')
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, category, last_date, is_active')
        .eq('is_active', true)
        .or(filter)
        .limit(100)
      if (!alive) return
      setJobs(error ? [] : closingToday(data, today))
    }
    load()
    return () => { alive = false }
  }, [])

  const list = jobs || []
  const scrolls = list.length > VISIBLE
  const rows = scrolls ? [...list, ...list] : list     // doubled list gives a seamless loop
  const seconds = Math.max(12, list.length * 3)

  return (
    <section style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderTop:`3px solid ${COLOR}`, borderRadius:'12px', overflow:'hidden'}}>
      <style>{`
        @keyframes dwarsing-lastdate-scroll { from { transform: translateY(0) } to { transform: translateY(-50%) } }
        .dwarsing-lastdate-track { animation: dwarsing-lastdate-scroll ${seconds}s linear infinite; }
        .dwarsing-lastdate-view:hover .dwarsing-lastdate-track,
        .dwarsing-lastdate-view:focus-within .dwarsing-lastdate-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .dwarsing-lastdate-track { animation: none; } .dwarsing-lastdate-view { overflow-y: auto !important; } }
      `}</style>
      <div style={{padding:'12px 14px', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px'}}>
        <h2 style={{margin:0, fontSize:'15px', fontWeight:'700', color:'var(--color-ink)', fontFamily:'var(--font-heading)'}}>
          ⏰ {mr ? 'आज अर्जाची शेवटची तारीख' : "Today's Last Date to Apply"}
        </h2>
        {jobs && list.length > 0 && (
          <span style={{background:COLOR, color:'#fff', fontSize:'11px', fontWeight:'700', borderRadius:'999px', padding:'2px 8px'}}>{list.length}</span>
        )}
      </div>

      {jobs === null ? (
        <p style={{margin:0, padding:'14px', fontSize:'13px', color:'var(--color-muted)'}}>{mr ? 'लोड होत आहे…' : 'Loading…'}</p>
      ) : list.length === 0 ? (
        <p style={{margin:0, padding:'14px', fontSize:'13px', color:'var(--color-muted)'}}>
          {mr ? 'आज कोणत्याही भरतीची शेवटची तारीख नाही.' : 'No job closes today.'}
        </p>
      ) : (
        <div className="dwarsing-lastdate-view" style={{height: Math.min(list.length, VISIBLE) * ROW_H, overflow:'hidden'}}>
          <ul className="dwarsing-lastdate-track" style={{listStyle:'none', margin:0, padding:0}}>
            {rows.map((j, i) => (
              <li key={`${j.id}-${i}`} style={{height:ROW_H, boxSizing:'border-box', borderBottom:'1px solid var(--color-border)'}} aria-hidden={i >= list.length || undefined}>
                <Link href={`/jobs/${j.id}`} tabIndex={i >= list.length ? -1 : undefined} style={{display:'flex', flexDirection:'column', justifyContent:'center', height:'100%', padding:'0 14px', textDecoration:'none'}}>
                  <span style={{fontSize:'13px', fontWeight:'600', color:'var(--color-ink)', lineHeight:1.35, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{j.title}</span>
                  <span style={{fontSize:'11.5px', color:COLOR, fontWeight:'600', marginTop:'2px'}}>{mr ? 'आजच शेवटची तारीख' : 'Last date: today'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}