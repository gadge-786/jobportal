'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../components/LanguageProvider'
import ChakraLoader from '../components/ChakraLoader'

const categories = [
  { name: '🏛️ Govt Jobs', slug: 'government', color: '#1a56db' },
  { name: '🏦 Banking',   slug: 'banking', color: '#0891b2' },
  { name: '🏛️ DCC Bank', slug: 'dcc-bank', color: '#0891b2' },
  { name: '🚂 Railway',   slug: 'railway', color: '#7c3aed' },
  { name: '💻 IT Jobs',   slug: 'it-software', color: '#059669' },
  { name: '🛡️ Defence',  slug: 'defence', color: '#dc2626' },
  { name: '📚 Teaching',  slug: 'teaching', color: '#d97706' },
  { name: '💼 Private',   slug: 'private', color: '#6b7280' },
  { name: '🏠 WFH Jobs',  slug: 'wfh', color: '#6b7280' },
  { name: '📝 Entrance Exams', slug: 'entrance-exams', color: '#9333ea' },
]

export default function AllJobs({ searchParams }) {
  const { t, lang } = useLanguage()
  const resolvedParams = use(searchParams)
  const categoryFromUrl = resolvedParams?.category || null

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl)

  useEffect(() => {
    fetchJobs(categoryFromUrl)
  }, [categoryFromUrl])

  async function fetchJobs(categoryFilter) {
    setLoading(true)
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (categoryFilter) {
      query = query.eq('category', categoryFilter)
    }

    const { data, error } = await query
    if (error) console.error(error)
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

  return (
    <div>
      <div style={{background:'var(--color-ink)', padding:'40px 20px 48px'}}>
        <div style={{maxWidth:'900px', margin:'0 auto'}}>
          <h1 style={{fontFamily:'var(--font-heading)', fontSize:'26px', fontWeight:'700', color:'white', margin:'0 0 6px'}}>
            {t('allJobs')}
          </h1>
          <p style={{color:'#C7CBE8', fontSize:'14px', marginBottom:'20px'}}>
            {t('heroSubtitle')}
          </p>
          <div style={{display:'flex', gap:'8px'}}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={t('searchPlaceholder')}
              style={{flex:1, padding:'12px 16px', borderRadius:'10px', border:'none', fontSize:'14px', fontFamily:'var(--font-body)'}}
            />
            <button onClick={handleSearch}
              style={{padding:'12px 24px', background:'var(--color-amber)', color:'var(--color-ink)', border:'none', borderRadius:'10px', cursor:'pointer', fontWeight:'700', fontSize:'14px'}}>
              {t('search')}
            </button>
          </div>
        </div>
      </div>

      <hr className="perforated-divider" />

      <div style={{maxWidth:'900px', margin:'0 auto', padding:'28px 16px'}}>

        <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px'}}>
          <button onClick={() => { setActiveCategory(null); fetchJobs(null) }}
            style={{
              padding:'8px 16px', borderRadius:'20px', border: activeCategory===null ? '1.5px solid var(--color-ink)' : '1.5px solid var(--color-border)',
              background: activeCategory===null ? 'var(--color-ink)' : 'var(--color-card)',
              color: activeCategory===null ? 'white' : 'var(--color-muted)',
              cursor:'pointer', fontSize:'13px', fontWeight:'600'
            }}>
            {t('allJobs')}
          </button>
          {categories.map(c => (
            <button key={c.slug} onClick={() => { setActiveCategory(c.slug); fetchJobs(c.slug) }}
              style={{
                padding:'8px 16px', borderRadius:'20px', border: `1.5px solid ${activeCategory===c.slug ? c.color : c.color+'33'}`,
                background: activeCategory===c.slug ? c.color : 'var(--color-card)',
                color: activeCategory===c.slug ? 'white' : c.color,
                cursor:'pointer', fontSize:'13px', fontWeight:'600'
              }}>
              {c.name}
            </button>
          ))}
        </div>

        {!loading && (
          <p style={{fontSize:'13px', color:'var(--color-muted)', marginBottom:'14px'}}>
            {jobs.length} {lang === 'mr' ? 'नोकऱ्या सापडल्या' : 'jobs found'}
          </p>
        )}

        {loading ? (
          <ChakraLoader label={t('loading')} />
        ) : jobs.length === 0 ? (
          <p style={{textAlign:'center', color:'var(--color-muted)', padding:'60px'}}>{t('noJobsFound')}</p>
        ) : (
          jobs.map(job => {
            const catColor = categories.find(c => c.slug === job.category)?.color || 'var(--color-ink)'
            return (
              <div key={job.id} className="card-lift" style={{
                position:'relative', overflow:'hidden', background:'var(--color-card)',
                border:'1px solid var(--color-border)', borderLeft:`4px solid ${catColor}`,
                borderRadius:'14px', padding:'20px', marginBottom:'12px'
              }}>
                {job.is_featured && <div className="featured-ribbon">FEATURED</div>}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'8px'}}>
                  <div>
                    <h3 style={{fontSize:'16px', fontWeight:'700', color:'var(--color-ink)', margin:'0 0 6px', fontFamily:'var(--font-heading)'}}>
                      {lang === 'mr' && job.title_mr ? job.title_mr : job.title}
                    </h3>
                    <p style={{color:'var(--color-muted)', fontSize:'14px', margin:'2px 0'}}>🏢 {job.company}</p>
                    <p style={{color:'var(--color-muted)', fontSize:'13px', margin:'2px 0'}}>📍 {job.location} &nbsp;|&nbsp; 💰 {job.salary}</p>
                  </div>
                  <span style={{background:`${catColor}15`, color:catColor, fontSize:'12px', padding:'4px 12px', borderRadius:'20px', fontWeight:'600', whiteSpace:'nowrap'}}>
                    {job.category}
                  </span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'16px', flexWrap:'wrap', gap:'8px'}}>
                  <span style={{fontSize:'12px', color:'var(--color-danger)', fontWeight:'600'}}>⏰ {t('lastDate')}: {job.last_date}</span>
                  <Link href={`/jobs/${job.id}`}
                    style={{background:'var(--color-ink)', color:'white', padding:'9px 20px', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'600'}}>
                    {t('viewDetails')} →
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}