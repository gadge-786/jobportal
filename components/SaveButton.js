'use client'
import { useState } from 'react'
import { useSavedJobs } from './SavedJobsProvider'
import { useLanguage } from './LanguageProvider'

// Heart toggle. variant "icon" = small round button for cards, "pill" = labelled button on dark/gradient headers.
export default function SaveButton({ jobId, variant = 'icon' }) {
  const { isSaved, toggle } = useSavedJobs()
  const { t } = useLanguage()
  const [err, setErr] = useState(false)
  const saved = isSaved(jobId)
  const label = saved ? t('savedJob') : t('saveJob')

  async function onClick(e) {
    e.preventDefault(); e.stopPropagation()
    const r = await toggle(jobId)
    setErr(!!r?.error)
    if (r?.error) setTimeout(() => setErr(false), 2500)
  }

  if (variant === 'pill') {
    return (
      <button type="button" onClick={onClick} aria-pressed={saved} title={err ? t('saveFailed') : label}
        style={{display:'inline-flex', alignItems:'center', gap:'6px', cursor:'pointer', position:'relative',
          background: saved ? 'white' : 'rgba(255,255,255,0.18)', color: saved ? '#be123c' : 'white',
          border:'1px solid rgba(255,255,255,0.5)', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:'600'}}>
        <span style={{fontSize:'15px', lineHeight:1}}>{saved ? '♥' : '♡'}</span>{err ? t('saveFailed') : label}
      </button>
    )
  }
  return (
    <button type="button" onClick={onClick} aria-pressed={saved} aria-label={label} title={err ? t('saveFailed') : label}
      style={{width:'34px', height:'34px', borderRadius:'50%', cursor:'pointer', flexShrink:0, display:'inline-flex', alignItems:'center', justifyContent:'center',
        fontSize:'18px', lineHeight:1, background: saved ? '#fff1f2' : 'var(--color-card)',
        border:`1px solid ${saved ? '#fda4af' : 'var(--color-border)'}`, color: saved ? '#be123c' : 'var(--color-muted)'}}>
      {saved ? '♥' : '♡'}
    </button>
  )
}