'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useLanguage } from '../../components/LanguageProvider'
import SaveButton from '../../components/SaveButton'
import EligibilityForm, { saveProfile } from '../../components/EligibilityForm'
import { filterJobs, EDUCATION, CATEGORIES } from '../../lib/eligibility'
import { stateLabel } from '../../lib/states'

const COLOR = '#0d9488'
const PAGE = 500
let cache = null   // jobs are fetched once per visit

async function loadJobs() {
  if (cache) return cache
  const base = 'id, title, company, category, state, last_date, is_active, details_table, eligibility_table'
  const out = []
  async function run(cols) {
    out.length = 0
    let start = 0
    for (;;) {
      const { data, error } = await supabase.from('jobs').select(cols)
        .eq('is_active', true)
        .or('category.is.null,category.not.in.(results,admit-cards,answer-keys,syllabus)')
        .order('id').range(start, start + PAGE - 1)
      if (error) return error
      if (!data || !data.length) return null
      out.push(...data); start += data.length
    }
  }
  let err = await run(base + ', title_mr')
  if (err) err = await run(base)          // table without title_mr
  if (err) throw err
  cache = [...out]
  return cache
}

const TAG_KEYS = { edu_ok: 'eligBadgeEdu', edu_mixed: 'eligBadgeMixed', edu_unknown: 'eligBadgeEduUnknown', age_ok: 'eligBadgeAge', age_relaxed: 'eligBadgeRelaxed', age_unknown: 'eligBadgeAgeUnknown', stream_check: 'eligBadgeStream' }
const TAG_TONE = { edu_ok: 'good', age_ok: 'good', age_relaxed: 'good', edu_mixed: 'warn', edu_unknown: 'warn', age_unknown: 'warn', stream_check: 'warn' }

function Badge({ tag, t }) {
  const good = TAG_TONE[tag] === 'good'
  return <span style={{fontSize:'11.5px', fontWeight:600, padding:'3px 9px', borderRadius:'20px', background: good ? '#dcfce7' : '#fef3c7', color: good ? '#166534' : '#92400e'}}>{good ? '✓ ' : '! '}{t(TAG_KEYS[tag])}</span>
}

function JobCard({ row, t, lang }) {
  const { job, tags } = row
  const title = lang === 'mr' && job.title_mr ? job.title_mr : job.title
  return (
    <div style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderLeft:`4px solid ${COLOR}`, borderRadius:'14px', padding:'16px 18px', marginBottom:'12px'}}>
      <div style={{display:'flex', justifyContent:'space-between', gap:'10px', alignItems:'flex-start'}}>
        <div style={{minWidth:0}}>
          <h3 style={{fontSize:'16px', fontWeight:700, color:'var(--color-ink)', margin:'0 0 5px', fontFamily:'var(--font-heading)'}}>{title}</h3>
          <p style={{color:'var(--color-muted)', fontSize:'13.5px', margin:'2px 0'}}>🏢 {job.company}{job.state ? ` · 📍 ${stateLabel(job.state, lang === 'mr')}` : ''}</p>
        </div>
        <SaveButton jobId={job.id} />
      </div>
      <div style={{display:'flex', gap:'6px', flexWrap:'wrap', margin:'10px 0 0'}}>{tags.filter(x => TAG_KEYS[x]).map(x => <Badge key={x} tag={x} t={t} />)}</div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'12px', flexWrap:'wrap', gap:'8px'}}>
        <span style={{fontSize:'12px', color:'var(--color-danger)', fontWeight:600}}>{job.last_date ? `⏰ ${t('lastDate')}: ${job.last_date}` : ''}</span>
        <Link href={`/jobs/${job.id}`} style={{background:'var(--color-ink)', color:'white', padding:'8px 18px', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:600}}>{t('viewDetails')} →</Link>
      </div>
    </div>
  )
}

function Results() {
  const { t, lang } = useLanguage()
  const sp = useSearchParams()
  const router = useRouter()
  const profile = useMemo(() => ({
    edu: sp.get('edu') || '', age: Number(sp.get('age')) || '', cat: sp.get('cat') || 'general',
    state: sp.get('state') || 'any', stream: sp.get('stream') || 'any',
  }), [sp])
  const valid = profile.edu && profile.age
  const [jobs, setJobs] = useState(null)
  const [failed, setFailed] = useState(false)
  const [showMaybe, setShowMaybe] = useState(false)
  const [limit, setLimit] = useState(30)
  const [editing, setEditing] = useState(!valid)

  useEffect(() => {
    if (!valid) return
    let dead = false
    setJobs(null); setFailed(false)
    loadJobs().then(j => { if (!dead) setJobs(j) }).catch(e => { console.error('[eligibility] load failed', e); if (!dead) setFailed(true) })
    return () => { dead = true }
  }, [valid])

  const result = useMemo(() => (jobs && valid ? filterJobs(jobs, profile) : null), [jobs, valid, profile])

  function onSubmit(p) {
    saveProfile(p)
    setLimit(30); setEditing(false)
    router.replace(`/eligibility?${new URLSearchParams({ edu: p.edu, age: String(p.age), cat: p.cat, state: p.state, stream: p.stream }).toString()}`)
  }

  const eduLabel = (EDUCATION.find(e => e.id === profile.edu) || {})[lang === 'mr' ? 'mr' : 'en']
  const catLabel = (CATEGORIES.find(c => c.id === profile.cat) || {})[lang === 'mr' ? 'mr' : 'en']
  const wrap = { maxWidth: '860px', margin: '0 auto', padding: '28px 16px 48px' }

  return (
    <div style={wrap}>
      <h1 style={{fontFamily:'var(--font-heading)', fontSize:'26px', color:'var(--color-ink)', margin:'0 0 6px'}}>🎯 {t('eligResultsTitle')}</h1>
      {valid && !editing && (
        <p style={{color:'var(--color-muted)', fontSize:'14px', margin:'0 0 14px'}}>
          {eduLabel} · {profile.age} {t('eligYears')} · {catLabel} · {profile.state === 'any' ? t('eligStateAny') : stateLabel(profile.state, lang === 'mr')}{' '}
          <button onClick={() => setEditing(true)} style={{background:'none', border:'none', color:'#1a56db', cursor:'pointer', fontSize:'14px', textDecoration:'underline', padding:0}}>{t('eligEdit')}</button>
        </p>
      )}
      {editing && (
        <div style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderRadius:'14px', padding:'18px', margin:'0 0 18px'}}>
          <EligibilityForm initial={profile} onSubmit={onSubmit} accent={COLOR} columns={2} />
        </div>
      )}
      <p style={{background:'#fffbeb', border:'1px solid #fde68a', color:'#92400e', borderRadius:'10px', padding:'10px 14px', fontSize:'13px', lineHeight:1.6, margin:'0 0 18px'}}>ℹ️ {t('eligDisclaimer')}</p>

      {!valid ? null : failed ? <p style={{color:'var(--color-danger)'}}>{t('eligLoadFailed')}</p> : !result ? <p style={{color:'var(--color-muted)'}}>…</p> : (
        <>
          <h2 style={{fontSize:'17px', fontFamily:'var(--font-heading)', color:'var(--color-ink)', margin:'0 0 12px'}}>✓ {t('eligLikely')} ({result.match.length})</h2>
          {result.match.length === 0 && <p style={{color:'var(--color-muted)', fontSize:'14px'}}>{t('eligNone')}</p>}
          {result.match.slice(0, limit).map(r => <JobCard key={r.job.id} row={r} t={t} lang={lang} />)}
          {result.match.length > limit && (
            <button onClick={() => setLimit(l => l + 30)} style={{width:'100%', padding:'11px', borderRadius:'10px', border:'1px solid var(--color-border)', background:'var(--color-card)', color:'var(--color-ink)', fontWeight:600, cursor:'pointer', marginBottom:'18px'}}>
              {t('eligShowMore')} ({result.match.length - limit})
            </button>
          )}

          {result.maybe.length > 0 && (
            <div style={{marginTop:'22px'}}>
              <button onClick={() => setShowMaybe(v => !v)} style={{width:'100%', textAlign:'left', padding:'12px 14px', borderRadius:'10px', border:'1px solid #fde68a', background:'#fffbeb', color:'#92400e', fontWeight:700, cursor:'pointer', fontSize:'14px'}}>
                {showMaybe ? '▾' : '▸'} {t('eligCheck')} ({result.maybe.length})
              </button>
              {showMaybe && <div style={{marginTop:'12px'}}>{result.maybe.slice(0, 60).map(r => <JobCard key={r.job.id} row={r} t={t} lang={lang} />)}</div>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function EligibilityPage() {
  return <Suspense fallback={<div style={{padding:'28px 16px'}}>…</div>}><Results /></Suspense>
}