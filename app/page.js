'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useLanguage } from '../components/LanguageProvider'
import ChakraLoader from '../components/ChakraLoader'
import UpdatesBox from '../components/UpdatesBox'

export default function Home() {
  const { t, lang } = useLanguage()
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchJobs() }, [])

  async function fetchJobs() {
    setSearch('')
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .or('category.is.null,category.not.in.(results,admit-cards,answer-keys)')
      .order('created_at', { ascending: false })
      .limit(10)
    setJobs(data || [])
    setLoading(false)
  }

  async function handleSearch() {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .ilike('title', `%${search}%`)
      .eq('is_active', true)
    setJobs(data || [])
    setLoading(false)
  }

  const categories = [
    { name: '🏛️ Govt Jobs', slug: 'government', color: '#1a56db' },
    { name: '🏦 Banking', slug: 'banking', color: '#0891b2' },
    { name: '🏛️ DCC Bank', slug: 'dcc-bank', color: '#0891b2' },
    { name: '🚂 Railway', slug: 'railway', color: '#7c3aed' },
    { name: '💻 IT Jobs', slug: 'it-software', color: '#059669' },
    { name: '🛡️ Defence', slug: 'defence', color: '#dc2626' },
    { name: '📚 Teaching', slug: 'teaching', color: '#d97706' },
    { name: '🏠 WFH Jobs', slug: 'wfh', color: '#6b7280' },
    { name: '📝 Entrance Exams', slug: 'entrance-exams', color: '#9333ea' },
    { name: '🪪 Admit Cards', slug: 'admit-cards', color: '#0d9488' },
    { name: '📊 Results', slug: 'results', color: '#be185d' },
    { name: '🔑 Answer Keys', slug: 'answer-keys', color: '#b45309' },
  ]

  async function filterByCategory(cat) {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('category', cat)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  return (
    <div>
      <div style={{background:'var(--color-ink)', padding:'56px 20px 64px', position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', top:'-60px', right:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(226,166,59,0.12)'}} />
        <div style={{maxWidth:'760px', margin:'0 auto', position:'relative', textAlign:'center'}}>
          <span style={{display:'inline-block', background:'rgba(226,166,59,0.15)', color:'var(--color-amber)', fontSize:'12px', fontWeight:'700', letterSpacing:'0.06em', padding:'6px 16px', borderRadius:'20px', marginBottom:'18px'}}>
            UPDATED DAILY · देशभरातल्या सरकारी नोकऱ्या
          </span>
          <h1 style={{fontFamily:'var(--font-heading)', fontSize:'38px', fontWeight:'700', color:'white', margin:'0 0 12px', lineHeight:'1.2'}}>
            {t('heroTitle')}
          </h1>
          <p style={{fontSize:'16px', color:'#C7CBE8', marginBottom:'28px'}}>
            {t('heroSubtitle')}
          </p>
          <div style={{display:'flex', gap:'8px', maxWidth:'520px', margin:'0 auto'}}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleSearch()}
              placeholder={t('searchPlaceholder')}
              style={{flex:1, padding:'14px 18px', borderRadius:'10px', border:'none', fontSize:'15px', fontFamily:'var(--font-body)'}}
            />
            <button onClick={handleSearch} style={{padding:'14px 26px', background:'var(--color-amber)', color:'var(--color-ink)', border:'none', borderRadius:'10px', fontWeight:'700', cursor:'pointer', fontSize:'15px'}}>
              {t('search')}
            </button>
          </div>
        </div>
      </div>

      <hr className="perforated-divider" />

      <style>{`
        .dw-home{max-width:1280px;margin:0 auto;padding:32px 16px;display:grid;grid-template-columns:minmax(0,1fr);gap:24px}
        .dw-center{order:1;min-width:0}
        .dw-right{order:2}
        .dw-left{order:3}
        @media (min-width:1100px){
          .dw-home{grid-template-columns:280px minmax(0,1fr) 280px;align-items:start}
          .dw-left{order:1;position:sticky;top:16px}
          .dw-center{order:2}
          .dw-right{order:3;position:sticky;top:16px}
        }
      `}</style>

      <div className="dw-home">

        <aside className="dw-left" style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          <UpdatesBox category="results" heading="Result Updates" headingMr="निकाल अपडेट्स" color="#be185d" visibleRows={4} />
          <UpdatesBox category="answer-keys" heading="Answer Key Updates" headingMr="उत्तरतालिका अपडेट्स" color="#b45309" visibleRows={4} />
        </aside>

        <div className="dw-center">

        <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px', justifyContent:'center'}}>
          {categories.map(c => (
            <button key={c.slug} onClick={() => filterByCategory(c.slug)}
              style={{
                padding:'7px 13px', borderRadius:'20px', border:`1.5px solid ${c.color}33`, background:'var(--color-card)',
                color:c.color, cursor:'pointer', fontWeight:'600', fontSize:'12.5px', display:'flex', alignItems:'center', gap:'6px'
              }}>
              {c.name}
            </button>
          ))}
          <button onClick={fetchJobs}
            style={{padding:'7px 13px', borderRadius:'20px', border:'1.5px solid var(--color-border)', background:'var(--color-card)', color:'var(--color-muted)', cursor:'pointer', fontSize:'12.5px', fontWeight:'600'}}>
            {t('showAll')}
          </button>
        </div>

        <h2 style={{fontSize:'20px', fontWeight:'700', marginBottom:'18px', color:'var(--color-ink)', fontFamily:'var(--font-heading)'}}>
          {t('latestJobs')}
        </h2>

        {loading ? (
        <ChakraLoader label={t('loading')} />
        ): jobs.length === 0 ? (
          <p style={{textAlign:'center', color:'var(--color-muted)', padding:'40px'}}>{t('noJobsFound')}</p>
        ) : (
          jobs.map(job => {
            const catColor = categories.find(c => c.slug === job.category)?.color || 'var(--color-ink)'
            return (
              <div key={job.id} className="card-lift" style={{
                position:'relative', overflow:'hidden', background:'var(--color-card)',
                border:'1px solid var(--color-border)', borderLeft:`4px solid ${catColor}`,
                borderRadius:'14px', padding:'20px', marginBottom:'14px'
              }}>
                {job.is_featured && (
                  <div className="featured-ribbon">FEATURED</div>
                )}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'8px'}}>
                  <div>
                    <h3 style={{fontSize:'17px', fontWeight:'700', color:'var(--color-ink)', margin:'0 0 6px', fontFamily:'var(--font-heading)'}}>
                      {lang === 'mr' && job.title_mr ? job.title_mr : job.title}
                    </h3>
                    <p style={{color:'var(--color-muted)', fontSize:'14px', margin:'2px 0'}}>🏢 {job.company}</p>
                    <p style={{color:'var(--color-muted)', fontSize:'13px', margin:'2px 0'}}>📍 {job.location}  |  💰 {job.salary}</p>
                  </div>
                  <span style={{background:`${catColor}15`, color:catColor, fontSize:'12px', padding:'4px 12px', borderRadius:'20px', fontWeight:'600', whiteSpace:'nowrap'}}>
                    {job.category}
                  </span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'16px', flexWrap:'wrap', gap:'8px'}}>
                  {['results','admit-cards','answer-keys'].includes(job.category) ? <span /> : <span style={{fontSize:'12px', color:'var(--color-danger)', fontWeight:'600'}}>⏰ {t('lastDate')}: {job.last_date}</span>}
                  <Link href={`/jobs/${job.id}`} style={{background:'var(--color-ink)', color:'white', padding:'9px 20px', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'600'}}>
                    {t('viewDetails')} →
                  </Link>
                </div>
              </div>
            )
          })
        )}
        </div>

        <aside className="dw-right">
          <UpdatesBox category="admit-cards" heading="Admit Card Updates" headingMr="प्रवेशपत्र अपडेट्स" color="#0d9488" />
        </aside>

      </div>
    </div>
  )
}