'use client'
import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import { useSavedJobs } from './SavedJobsProvider'
import { useAuth } from './AuthProvider'

export default function Navbar() {
  const { lang, switchLanguage, t } = useLanguage()
  const { count } = useSavedJobs()
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || ''
  const avatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  return (
    <nav style={{
      background: 'var(--color-ink)',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      borderBottom: '3px solid var(--color-amber)'
    }}>
      <Link href="/" style={{display:'flex', alignItems:'center', gap:'10px', color:'white', fontWeight:'700', fontSize:'22px', textDecoration:'none', fontFamily:'var(--font-heading)'}}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="DwarSing Logo" width={34} height={34} style={{borderRadius:'8px'}} />
        DwarSing
      </Link>
      <div style={{display:'flex', alignItems:'center', gap:'20px', flexWrap:'wrap'}}>
        <Link href="/" style={{color:'#C7CBE8', textDecoration:'none', fontSize:'14px', fontWeight:'500'}}>{t('home')}</Link>
        <Link href="/jobs" style={{color:'#C7CBE8', textDecoration:'none', fontSize:'14px', fontWeight:'500'}}>{t('allJobs')}</Link>
        <Link href="/jobs?category=government" style={{color:'#C7CBE8', textDecoration:'none', fontSize:'14px', fontWeight:'500'}}>{t('govtJobs')}</Link>
        <Link href="/jobs?category=banking" style={{color:'#C7CBE8', textDecoration:'none', fontSize:'14px', fontWeight:'500'}}>{t('banking')}</Link>
        <Link href="/jobs?category=railway" style={{color:'#C7CBE8', textDecoration:'none', fontSize:'14px', fontWeight:'500'}}>{t('railway')}</Link>
        <Link href="/saved" style={{color:'#C7CBE8', textDecoration:'none', fontSize:'14px', fontWeight:'500', display:'inline-flex', alignItems:'center', gap:'6px'}}>
          <span style={{color:'#fda4af'}}>♥</span>{t('savedJobsNav')}
          {count > 0 && <span style={{background:'var(--color-amber)', color:'var(--color-ink)', borderRadius:'10px', padding:'1px 7px', fontSize:'11px', fontWeight:'700'}}>{count}</span>}
        </Link>

        <div style={{display:'flex', background:'rgba(255,255,255,0.1)', borderRadius:'20px', padding:'3px'}}>
          <button
            onClick={() => switchLanguage('en')}
            style={{
              padding:'5px 12px', borderRadius:'16px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:'600',
              background: lang === 'en' ? 'var(--color-amber)' : 'transparent',
              color: lang === 'en' ? 'var(--color-ink)' : '#C7CBE8'
            }}
          >
            EN
          </button>
          <button
            onClick={() => switchLanguage('mr')}
            style={{
              padding:'5px 12px', borderRadius:'16px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:'600',
              fontFamily: 'var(--font-marathi)',
              background: lang === 'mr' ? 'var(--color-amber)' : 'transparent',
              color: lang === 'mr' ? 'var(--color-ink)' : '#C7CBE8'
            }}
          >
            मराठी
          </button>
        </div>

        {!loading && (user ? (
          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            {avatar
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatar} alt="" width={28} height={28} referrerPolicy="no-referrer" style={{borderRadius:'50%', border:'2px solid var(--color-amber)'}} />
              : <span style={{width:'28px', height:'28px', borderRadius:'50%', background:'var(--color-amber)', color:'var(--color-ink)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700'}}>{(name[0] || '?').toUpperCase()}</span>}
            <span title={name} style={{color:'#C7CBE8', fontSize:'13px', maxWidth:'110px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{name.split(' ')[0]}</span>
            <button onClick={signOut} style={{background:'transparent', color:'#C7CBE8', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'16px', padding:'5px 12px', fontSize:'12px', fontWeight:'600', cursor:'pointer'}}>{t('signOut')}</button>
          </div>
        ) : (
          <button onClick={signInWithGoogle} style={{background:'var(--color-amber)', color:'var(--color-ink)', border:'none', borderRadius:'16px', padding:'6px 16px', fontSize:'13px', fontWeight:'700', cursor:'pointer'}}>{t('signIn')}</button>
        ))}
      </div>
    </nav>
  )
}