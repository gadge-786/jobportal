'use client'
import Link from 'next/link'
import { useLanguage } from './LanguageProvider'

export default function Navbar() {
  const { lang, switchLanguage, t } = useLanguage()

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
      </div>
    </nav>
  )
}