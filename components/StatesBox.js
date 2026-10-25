'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useLanguage } from './LanguageProvider'
import { stateLabel } from '../lib/states'

const MR = 'mr'
const COLOR = '#1a56db'
const NON_OPENINGS = ['results', 'admit-cards', 'answer-keys']
const PINNED = 'maharashtra' // always listed first

export default function StatesBox() {
  const { lang } = useLanguage()
  const mr = lang === MR
  const [rows, setRows] = useState(null) // [{slug, count}]

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('jobs')
        .select('state, category')
        .eq('is_active', true)
        .limit(5000)
      if (error) console.error('StatesBox', error)
      const counts = {}
      for (const j of data || []) {
        if (NON_OPENINGS.includes(j.category)) continue // count real openings only
        const key = j.state || 'all-india'
        counts[key] = (counts[key] || 0) + 1
      }
      const list = Object.entries(counts).map(([slug, count]) => ({ slug, count }))
      list.sort((a, b) =>
        (b.slug === PINNED) - (a.slug === PINNED) ||
        (a.slug === 'all-india') - (b.slug === 'all-india') ||
        b.count - a.count)
      setRows(list)
    }
    load()
  }, [])

  return (
    <section style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderTop:`3px solid ${COLOR}`, borderRadius:'12px', overflow:'hidden'}}>
      <style>{`
        .dw-state{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 14px;border-bottom:1px solid var(--color-border);text-decoration:none;font-size:13.5px;font-weight:600;color:var(--color-ink)}
        .dw-state:hover{background:rgba(0,0,0,.03)}
        .dw-state-count{font-size:12px;font-weight:700;color:${COLOR};background:${COLOR}15;padding:2px 9px;border-radius:20px;flex-shrink:0}
      `}</style>
      <div style={{padding:'12px 14px', borderBottom:'1px solid var(--color-border)'}}>
        <h2 style={{margin:0, fontSize:'15px', fontWeight:'700', color:'var(--color-ink)', fontFamily:'var(--font-heading)', display:'flex', alignItems:'center', gap:'8px'}}>
          <span style={{width:'9px', height:'9px', borderRadius:'50%', background:COLOR, display:'inline-block'}} />
          {mr ? 'राज्यानुसार नोकऱ्या' : 'Jobs by State'}
        </h2>
      </div>
      {rows === null ? (
        <p style={{margin:0, padding:'22px 14px', fontSize:'13px', color:'var(--color-muted)', textAlign:'center'}}>{mr ? 'लोड होत आहे...' : 'Loading...'}</p>
      ) : rows.length === 0 ? (
        <p style={{margin:0, padding:'22px 14px', fontSize:'13px', color:'var(--color-muted)', textAlign:'center'}}>{mr ? 'अजून काहीही नाही.' : 'Nothing here yet.'}</p>
      ) : (
        <div style={{maxHeight:'340px', overflowY:'auto'}}>
          {rows.map(r => (
            <Link key={r.slug} href={`/jobs?state=${r.slug}`} className="dw-state">
              <span>{stateLabel(r.slug, mr)}</span>
              <span className="dw-state-count">{r.count}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}