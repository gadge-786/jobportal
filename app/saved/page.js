'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { useSavedJobs } from '../../components/SavedJobsProvider'
import { useLanguage } from '../../components/LanguageProvider'
import SaveButton from '../../components/SaveButton'

const NO_DEADLINE = ['results', 'admit-cards', 'answer-keys', 'syllabus']

function deadline(job) {
  if (NO_DEADLINE.includes(job.category) || !job.last_date) return null
  const m = String(job.last_date).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return { text: job.last_date, tone: 'normal' }
  const end = new Date(+m[1], +m[2] - 1, +m[3], 23, 59, 59)
  const days = Math.ceil((end - new Date()) / 86400000)
  return { text: job.last_date, days, tone: days < 0 ? 'expired' : days <= 5 ? 'soon' : 'normal' }
}

export default function SavedPage() {
  const { user, loading, signInWithGoogle } = useAuth()
  const { savedIds, ready } = useSavedJobs()
  const { t, lang } = useLanguage()
  const [rows, setRows] = useState(null)

  // Refetch when the saved set changes (so un-saving removes the card).
  useEffect(() => {
    if (!user) { setRows(null); return }
    let cancelled = false
    async function load() {
      // two plain queries instead of a joined select (does not depend on PostgREST relationship cache)
      const { data: saved, error: e1 } = await supabase.from('saved_jobs')
        .select('job_id, created_at').eq('user_id', user.id).order('created_at', { ascending: false })
      if (e1) { console.error('[saved page] saved_jobs query failed:', e1); if (!cancelled) setRows([]); return }
      const ids = (saved || []).map(r => r.job_id)
      if (!ids.length) { if (!cancelled) setRows([]); return }
      const { data: jobs, error: e2 } = await supabase.from('jobs')
        .select('*').in('id', ids)
      if (e2) console.error('[saved page] jobs query failed:', e2.code, e2.message, e2.details, e2.hint)
      const byId = new Map((jobs || []).map(j => [j.id, j]))
      if (!cancelled) setRows(ids.map(id => ({ job_id: id, jobs: byId.get(id) || null })))
    }
    load()
    return () => { cancelled = true }
  }, [user, savedIds])

  const wrap = { maxWidth:'820px', margin:'0 auto', padding:'28px 16px 48px' }
  const h1 = { fontFamily:'var(--font-heading)', fontSize:'26px', color:'var(--color-ink)', margin:'0 0 6px' }

  if (loading) return <div style={wrap}><p style={{color:'var(--color-muted)'}}>…</p></div>

  if (!user) return (
    <div style={wrap}>
      <h1 style={h1}>♥ {t('savedJobsTitle')}</h1>
      <div style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderRadius:'14px', padding:'28px', marginTop:'16px', textAlign:'center'}}>
        <p style={{color:'var(--color-muted)', margin:'0 0 16px', lineHeight:1.6}}>{t('signInToSave')}</p>
        <button onClick={signInWithGoogle} style={{background:'var(--color-ink)', color:'white', border:'none', borderRadius:'8px', padding:'11px 24px', fontSize:'14px', fontWeight:'600', cursor:'pointer'}}>
          {t('signInGoogle')}
        </button>
      </div>
    </div>
  )

  return (
    <div style={wrap}>
      <h1 style={h1}>♥ {t('savedJobsTitle')}</h1>
      <p style={{color:'var(--color-muted)', fontSize:'14px', margin:'0 0 18px'}}>{t('savedJobsSub')}</p>

      {(rows === null || !ready) ? <p style={{color:'var(--color-muted)'}}>…</p> :
       rows.length === 0 ? (
        <div style={{background:'var(--color-card)', border:'1px dashed var(--color-border)', borderRadius:'14px', padding:'28px', textAlign:'center'}}>
          <p style={{color:'var(--color-muted)', margin:'0 0 14px'}}>{t('noSavedJobs')}</p>
          <Link href="/jobs" style={{background:'var(--color-ink)', color:'white', padding:'9px 20px', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'600'}}>{t('browseJobs')} →</Link>
        </div>
       ) : rows.map(r => {
        const job = r.jobs
        if (!job || job.is_active === false) return (
          <div key={r.job_id} style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', background:'var(--color-card)', border:'1px solid var(--color-border)', borderRadius:'14px', padding:'16px 20px', marginBottom:'12px', opacity:.75}}>
            <span style={{color:'var(--color-muted)', fontSize:'14px'}}>{job?.title || t('jobUnavailable')}</span>
            <SaveButton jobId={r.job_id} />
          </div>
        )
        const d = deadline(job)
        const badge = d && d.tone === 'expired' ? { txt:t('expired'), bg:'#fee2e2', fg:'#b91c1c' }
                    : d && d.tone === 'soon' ? { txt:`${t('closingSoon')} · ${d.days <= 0 ? t('today') : `${d.days} ${t('daysLeft')}`}`, bg:'#fef3c7', fg:'#b45309' } : null
        return (
          <div key={r.job_id} style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderLeft:'4px solid var(--color-ink)', borderRadius:'14px', padding:'18px 20px', marginBottom:'12px'}}>
            <div style={{display:'flex', justifyContent:'space-between', gap:'12px', alignItems:'flex-start'}}>
              <div style={{minWidth:0}}>
                <h3 style={{fontSize:'16px', fontWeight:'700', color:'var(--color-ink)', margin:'0 0 6px', fontFamily:'var(--font-heading)'}}>
                  {lang === 'mr' && job.title_mr ? job.title_mr : job.title}
                </h3>
                <p style={{color:'var(--color-muted)', fontSize:'14px', margin:'2px 0'}}>🏢 {job.company}</p>
                {job.location && <p style={{color:'var(--color-muted)', fontSize:'13px', margin:'2px 0'}}>📍 {job.location}</p>}
              </div>
              <SaveButton jobId={job.id} />
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'14px', flexWrap:'wrap', gap:'8px'}}>
              <span style={{display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap'}}>
                {d && <span style={{fontSize:'12px', color:'var(--color-danger)', fontWeight:'600'}}>⏰ {t('lastDate')}: {d.text}</span>}
                {badge && <span style={{fontSize:'11.5px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', background:badge.bg, color:badge.fg}}>{badge.txt}</span>}
              </span>
              <Link href={`/jobs/${job.id}`} style={{background:'var(--color-ink)', color:'white', padding:'9px 20px', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'600'}}>{t('viewDetails')} →</Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}