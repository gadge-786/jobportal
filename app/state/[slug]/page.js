import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { STATES, stateLabel } from '../../../lib/states'
import { getVacancies } from '../../../lib/vacancies'

export const revalidate = 3600        // rebuild at most once an hour
export const dynamicParams = false    // unknown slugs -> 404

const BASE = 'https://dwarsing.in'
const NON_OPENINGS = ['results', 'admit-cards', 'answer-keys']

export function generateStaticParams() {
  return [...STATES.map(s => ({ slug: s.slug })), { slug: 'all-india' }]
}

const nameOf = (slug) => slug === 'all-india' ? 'Central Government' : stateLabel(slug, false)
const nameMr = (slug) => slug === 'all-india' ? 'केंद्र सरकार' : stateLabel(slug, true)

const getData = cache(async (slug) => {
  let q = supabase
    .from('jobs')
    .select('id,title,category,last_date,created_at,updated_at,details_table')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1000)
  q = slug === 'all-india' ? q.is('state', null) : q.eq('state', slug)
  const { data } = await q
  const all = data || []
  return {
    openings: all.filter(j => !NON_OPENINGS.includes(j.category)),
    admit: all.filter(j => j.category === 'admit-cards').slice(0, 8),
    results: all.filter(j => j.category === 'results').slice(0, 8),
    keys: all.filter(j => j.category === 'answer-keys').slice(0, 8),
    updated: all.reduce((m, j) => (j.updated_at > m ? j.updated_at : m), ''),
  }
})

const getCounts = cache(async () => {
  const { data } = await supabase.from('jobs').select('state,category').eq('is_active', true).limit(5000)
  const c = {}
  for (const j of data || []) {
    if (NON_OPENINGS.includes(j.category)) continue
    const k = j.state || 'all-india'
    c[k] = (c[k] || 0) + 1
  }
  return c
})

export async function generateMetadata({ params }) {
  const { slug } = await params
  if (slug !== 'all-india' && !STATES.some(s => s.slug === slug)) return {}
  const { openings } = await getData(slug)
  const year = new Date().getFullYear()
  const name = nameOf(slug)
  const title = slug === 'all-india'
    ? `Central Government Jobs ${year} – All India Vacancies | DwarSing`
    : `${name} Government Jobs ${year} – Latest Vacancies & Notifications | DwarSing`
  const description = `${openings.length} latest ${name} job notifications ${year}: vacancies, last dates, eligibility, admit cards, results and answer keys. Updated daily on DwarSing.`
  const url = `${BASE}/state/${slug}`
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', locale: 'en_IN' },
    robots: openings.length === 0 ? { index: false, follow: true } : undefined, // never index an empty page
  }
}

const fmt = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })

function JobRow({ job, showVac }) {
  const vac = showVac ? getVacancies(job) : null
  const hasDeadline = showVac && job.last_date && job.last_date !== 'Check official notification'
  return (
    <Link href={`/jobs/${job.id}`} className="dw-srow">
      <span className="dw-stitle">{job.title}</span>
      <span className="dw-smeta">
        {vac && <>Vacancies: <b>{vac}</b> · </>}
        {hasDeadline && <>Last date: <b>{job.last_date}</b> · </>}
        Posted: {fmt(job.created_at)}
      </span>
    </Link>
  )
}

function MiniList({ heading, color, items }) {
  if (!items.length) return null
  return (
    <section style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderTop:`3px solid ${color}`, borderRadius:'12px', overflow:'hidden'}}>
      <h3 style={{margin:0, padding:'12px 14px', fontSize:'15px', fontWeight:'700', color:'var(--color-ink)', fontFamily:'var(--font-heading)', borderBottom:'1px solid var(--color-border)'}}>{heading}</h3>
      {items.map(j => <JobRow key={j.id} job={j} />)}
    </section>
  )
}

export default async function StatePage({ params }) {
  const { slug } = await params
  if (slug !== 'all-india' && !STATES.some(s => s.slug === slug)) notFound()

  const [{ openings, admit, results, keys, updated }, counts] = await Promise.all([getData(slug), getCounts()])
  const year = new Date().getFullYear()
  const name = nameOf(slug)
  const heading = slug === 'all-india' ? `Central Government Jobs ${year}` : `${name} Government Jobs ${year}`
  const others = Object.entries(counts).filter(([s]) => s !== slug).sort((a, b) => b[1] - a[1])

  const ld = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Jobs by State', item: `${BASE}/jobs` },
        { '@type': 'ListItem', position: 3, name, item: `${BASE}/state/${slug}` },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: heading,
      itemListElement: openings.slice(0, 20).map((j, i) => ({
        '@type': 'ListItem', position: i + 1, url: `${BASE}/jobs/${j.id}`, name: j.title,
      })),
    },
  ]

  return (
    <div>
      <style>{`
        .dw-srow{display:flex;flex-direction:column;gap:3px;padding:12px 16px;border-bottom:1px solid var(--color-border);text-decoration:none}
        .dw-srow:hover{background:rgba(0,0,0,.03)}
        .dw-stitle{font-size:15px;font-weight:600;color:var(--color-ink);line-height:1.35}
        .dw-smeta{font-size:12.5px;color:var(--color-muted)}
        .dw-smeta b{color:var(--color-ink)}
        .dw-schip{display:inline-flex;gap:6px;align-items:center;padding:6px 12px;border-radius:20px;border:1.5px solid var(--color-border);background:var(--color-card);color:var(--color-ink);text-decoration:none;font-size:13px;font-weight:600}
        .dw-schip:hover{border-color:var(--color-ink)}
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />

      <div style={{background:'var(--color-ink)', padding:'36px 20px 40px'}}>
        <div style={{maxWidth:'900px', margin:'0 auto'}}>
          <nav aria-label="Breadcrumb" style={{fontSize:'13px', color:'#C7CBE8', marginBottom:'12px'}}>
            <Link href="/" style={{color:'#C7CBE8'}}>Home</Link> / <Link href="/jobs" style={{color:'#C7CBE8'}}>All Jobs</Link> / <span style={{color:'white'}}>{name}</span>
          </nav>
          <h1 style={{fontFamily:'var(--font-heading)', fontSize:'28px', fontWeight:'700', color:'white', margin:'0 0 6px'}}>{heading}</h1>
          <p style={{fontFamily:'var(--font-marathi)', fontSize:'16px', color:'var(--color-amber)', margin:'0 0 12px'}}>{nameMr(slug)} सरकारी नोकऱ्या {year}</p>
          <p style={{fontSize:'14.5px', lineHeight:1.7, color:'#C7CBE8', margin:0, maxWidth:'720px'}}>
            {openings.length > 0
              ? `DwarSing lists ${openings.length} active ${name} recruitment notifications, with vacancies, last dates, eligibility, admit cards, results and answer keys.${openings[0] ? ` Newest: ${openings[0].title}.` : ''}`
              : `There are no active ${name} job notifications right now. New ones are added daily.`}
          </p>
          {updated && <p style={{fontSize:'12.5px', color:'#9aa0c8', margin:'10px 0 0'}}>Last updated: <time dateTime={updated}>{fmt(updated)}</time></p>}
        </div>
      </div>

      <div style={{maxWidth:'900px', margin:'0 auto', padding:'28px 16px'}}>
        <section style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderTop:'3px solid #1a56db', borderRadius:'12px', overflow:'hidden', marginBottom:'24px'}}>
          <h2 style={{margin:0, padding:'14px 16px', fontSize:'18px', fontWeight:'700', color:'var(--color-ink)', fontFamily:'var(--font-heading)', borderBottom:'1px solid var(--color-border)'}}>
            Latest {name} job notifications ({openings.length})
          </h2>
          {openings.length === 0
            ? <p style={{padding:'24px 16px', margin:0, color:'var(--color-muted)', fontSize:'14px'}}>Nothing here yet. <Link href="/jobs">Browse all jobs</Link>.</p>
            : openings.slice(0, 100).map(j => <JobRow key={j.id} job={j} showVac />)}
        </section>

        {(admit.length > 0 || results.length > 0 || keys.length > 0) && (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'16px', marginBottom:'24px'}}>
            <MiniList heading={`${name} admit cards`} color="#0d9488" items={admit} />
            <MiniList heading={`${name} results`} color="#be185d" items={results} />
            <MiniList heading={`${name} answer keys`} color="#b45309" items={keys} />
          </div>
        )}

        {others.length > 0 && (
          <section>
            <h2 style={{fontSize:'16px', fontWeight:'700', color:'var(--color-ink)', fontFamily:'var(--font-heading)', margin:'0 0 12px'}}>Jobs in other states</h2>
            <div style={{display:'flex', flexWrap:'wrap', gap:'8px'}}>
              {others.map(([s, n]) => (
                <Link key={s} href={`/state/${s}`} className="dw-schip">{nameOf(s)} <span style={{color:'var(--color-muted)', fontWeight:700}}>{n}</span></Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}