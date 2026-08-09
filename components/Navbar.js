'use client'
import Link from 'next/link'
import { useLanguage } from '../components/LanguageProvider'

export default function Navbar() {
  const { lang, switchLanguage, t } = useLanguage()

  return (
    <nav style={{background:'#1a56db', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px'}}>
      <Link href="/" style={{display:'flex', alignItems:'center', gap:'8px', color:'white', fontWeight:'bold', fontSize:'22px', textDecoration:'none'}}>
        <img src="/logo.png" alt="DwarSing Logo" width={32} height={32} style={{borderRadius:'6px'}} />
        DwarSing
      </Link>
      <div style={{display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap'}}>
        <Link href="/" style={{color:'white', textDecoration:'none', fontSize:'14px'}}>{t('home')}</Link>
        <Link href="/jobs" style={{color:'white', textDecoration:'none', fontSize:'14px'}}>{t('allJobs')}</Link>
        <Link href="/jobs?category=government" style={{color:'white', textDecoration:'none', fontSize:'14px'}}>{t('govtJobs')}</Link>
        <Link href="/jobs?category=banking" style={{color:'white', textDecoration:'none', fontSize:'14px'}}>{t('banking')}</Link>
        <Link href="/jobs?category=railway" style={{color:'white', textDecoration:'none', fontSize:'14px'}}>{t('railway')}</Link>

        <div style={{display:'flex', background:'rgba(255,255,255,0.15)', borderRadius:'20px', padding:'3px'}}>
          <button
            onClick={() => switchLanguage('en')}
            style={{
              padding:'5px 12px', borderRadius:'16px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:'600',
              background: lang === 'en' ? 'white' : 'transparent',
              color: lang === 'en' ? '#1a56db' : 'white'
            }}
          >
            EN
          </button>
          <button
            onClick={() => switchLanguage('mr')}
            style={{
              padding:'5px 12px', borderRadius:'16px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:'600',
              background: lang === 'mr' ? 'white' : 'transparent',
              color: lang === 'mr' ? '#1a56db' : 'white'
            }}
          >
            मराठी
          </button>
        </div>
      </div>
    </nav>
  )
}