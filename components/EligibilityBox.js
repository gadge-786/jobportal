'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import EligibilityForm, { loadProfile, saveProfile } from './EligibilityForm'

const COLOR = '#0d9488'

export default function EligibilityBox() {
  const { t } = useLanguage()
  const router = useRouter()
  const [initial, setInitial] = useState(null)
  useEffect(() => { setInitial(loadProfile()) }, [])   // remembered from the last search

  function go(p) {
    saveProfile(p)
    const q = new URLSearchParams({ edu: p.edu, age: String(p.age), cat: p.cat, state: p.state, stream: p.stream })
    router.push(`/eligibility?${q.toString()}`)
  }

  return (
    <section style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderTop:`3px solid ${COLOR}`, borderRadius:'12px', overflow:'hidden'}}>
      <div style={{padding:'12px 14px', borderBottom:'1px solid var(--color-border)'}}>
        <h2 style={{margin:0, fontSize:'15px', fontWeight:'700', color:'var(--color-ink)', fontFamily:'var(--font-heading)'}}>🎯 {t('eligTitle')}</h2>
        <p style={{margin:'4px 0 0', fontSize:'12.5px', color:'var(--color-muted)', lineHeight:1.5}}>{t('eligSub')}</p>
      </div>
      <div style={{padding:'14px'}}>
        {initial && <EligibilityForm key={JSON.stringify(initial)} initial={initial} onSubmit={go} accent={COLOR} />}
      </div>
    </section>
  )
}