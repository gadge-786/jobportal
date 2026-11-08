'use client'
import { useLanguage } from './LanguageProvider'

// Set NEXT_PUBLIC_TELEGRAM_URL in Vercel (e.g. https://t.me/yourchannel). Renders nothing until it is set.
const TELEGRAM_URL = process.env.NEXT_PUBLIC_TELEGRAM_URL

export default function TelegramJoin({ jobId }) {
  const { t } = useLanguage()
  if (!TELEGRAM_URL) return null

  function track() {
    try { if (typeof window !== 'undefined' && window.gtag) window.gtag('event', 'join_telegram', { source: 'job_page', job_id: jobId }) } catch {}
  }

  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'14px', flexWrap:'wrap',
      background:'linear-gradient(135deg, #e0f2fe, #f0f9ff)', border:'1px solid #bae6fd', borderRadius:'14px', padding:'18px 20px', marginBottom:'16px'}}>
      <div style={{display:'flex', alignItems:'center', gap:'12px', minWidth:0, flex:'1 1 240px'}}>
        <span aria-hidden="true" style={{width:'42px', height:'42px', borderRadius:'50%', background:'#229ED9', color:'white', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0}}>✈</span>
        <div>
          <div style={{fontWeight:'700', color:'#0c4a6e', fontSize:'15px', fontFamily:'var(--font-heading)'}}>{t('telegramTitle')}</div>
          <div style={{color:'#075985', fontSize:'13px', lineHeight:1.5, marginTop:'2px'}}>{t('telegramSub')}</div>
        </div>
      </div>
      <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={track}
        style={{background:'#229ED9', color:'white', padding:'10px 22px', borderRadius:'10px', textDecoration:'none', fontWeight:'700', fontSize:'14px', whiteSpace:'nowrap'}}>
        {t('telegramJoin')} →
      </a>
    </div>
  )
}