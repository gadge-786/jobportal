'use client'
import { useState } from 'react'
import { useLanguage } from './LanguageProvider'
import { EDUCATION, STREAMS, CATEGORIES } from '../lib/eligibility'
import { STATES } from '../lib/states'

export const PROFILE_KEY = 'dw_eligibility_profile'
export const DEFAULT_PROFILE = { edu: '', age: '', cat: 'general', state: 'any', stream: 'any' }

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULT_PROFILE }
}
export function saveProfile(p) { try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)) } catch {} }

const field = { width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-ink)', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }
const label = { display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--color-muted)', margin: '0 0 4px' }

export default function EligibilityForm({ initial, onSubmit, submitLabel, accent = '#0d9488', columns = 1 }) {
  const { t, lang } = useLanguage()
  const mr = lang === 'mr'
  const [p, setP] = useState({ ...DEFAULT_PROFILE, ...(initial || {}) })
  const [err, setErr] = useState('')
  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }))
  const showStream = ['diploma', 'graduate', 'pg'].includes(p.edu)

  function submit(e) {
    e.preventDefault()
    const age = Number(p.age)
    if (!p.edu) return setErr(t('eligErrEdu'))
    if (!age || age < 14 || age > 65) return setErr(t('eligErrAge'))
    setErr('')
    onSubmit({ ...p, age, stream: showStream ? p.stream : 'any' })
  }

  const grid = columns === 2 ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' } : { display: 'grid', gap: '12px' }

  return (
    <form onSubmit={submit} style={grid} noValidate>
      <div>
        <label style={label} htmlFor="el-edu">{t('eligEdu')}</label>
        <select id="el-edu" value={p.edu} onChange={e => set('edu', e.target.value)} style={field}>
          <option value="">{t('eligSelect')}</option>
          {EDUCATION.map(o => <option key={o.id} value={o.id}>{mr ? o.mr : o.en}</option>)}
        </select>
      </div>
      {showStream && (
        <div>
          <label style={label} htmlFor="el-stream">{t('eligStream')}</label>
          <select id="el-stream" value={p.stream} onChange={e => set('stream', e.target.value)} style={field}>
            {STREAMS.map(o => <option key={o.id} value={o.id}>{mr ? o.mr : o.en}</option>)}
          </select>
        </div>
      )}
      <div>
        <label style={label} htmlFor="el-age">{t('eligAge')}</label>
        <input id="el-age" type="number" inputMode="numeric" min="14" max="65" value={p.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 24" style={field} />
      </div>
      <div>
        <label style={label} htmlFor="el-cat">{t('eligCat')}</label>
        <select id="el-cat" value={p.cat} onChange={e => set('cat', e.target.value)} style={field}>
          {CATEGORIES.map(o => <option key={o.id} value={o.id}>{mr ? o.mr : o.en}</option>)}
        </select>
      </div>
      <div>
        <label style={label} htmlFor="el-state">{t('eligState')}</label>
        <select id="el-state" value={p.state} onChange={e => set('state', e.target.value)} style={field}>
          <option value="any">{t('eligStateAny')}</option>
          {STATES.map(s => <option key={s.slug} value={s.slug}>{mr ? s.mr : s.name}</option>)}
        </select>
      </div>
      {err && <p role="alert" style={{margin: 0, color: 'var(--color-danger)', fontSize: '13px', fontWeight: 600}}>{err}</p>}
      <button type="submit" style={{background: accent, color: 'white', border: 'none', borderRadius: '8px', padding: '11px 16px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', gridColumn: '1 / -1'}}>
        {submitLabel || t('eligFind')} →
      </button>
    </form>
  )
}