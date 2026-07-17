import './globals.css'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/next'

export const metadata = {
  title: 'JobsIndia - Latest Government Jobs, Bank Jobs, Railway Jobs 2026',
  description: 'Find latest government job notifications, bank jobs, railway recruitment, defence jobs, teaching jobs and private sector jobs in India. Updated daily with new vacancies.',
  keywords: 'government jobs, sarkari naukri, bank jobs, railway jobs, defence jobs, teaching jobs, private jobs india, latest job notification 2026',
  authors: [{ name: 'JobsIndia' }],
  metadataBase: new URL('https://jobportal-topaz-nine.vercel.app/'),
  openGraph: {
    title: 'JobsIndia - Latest Govt & Private Jobs in India',
    description: 'Find latest government job notifications and private sector jobs. Updated daily.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* NAVBAR */}
        <nav style={{background:'#1a56db', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px'}}>
          <Link href="/" style={{color:'white', fontWeight:'bold', fontSize:'22px', textDecoration:'none'}}>
            💼 JobsIndia
          </Link>
          <div style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
            <Link href="/" style={{color:'white', textDecoration:'none', fontSize:'14px'}}>Home</Link>
            <Link href="/jobs" style={{color:'white', textDecoration:'none', fontSize:'14px'}}>All Jobs</Link>
            <Link href="/jobs?category=government" style={{color:'white', textDecoration:'none', fontSize:'14px'}}>Govt Jobs</Link>
            <Link href="/jobs?category=banking" style={{color:'white', textDecoration:'none', fontSize:'14px'}}>Banking</Link>
            <Link href="/jobs?category=railway" style={{color:'white', textDecoration:'none', fontSize:'14px'}}>Railway</Link>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main style={{minHeight:'80vh', background:'#f9fafb'}}>
          {children}
        </main>

        {/* FOOTER */}
        <footer style={{background:'#111827', color:'#9ca3af', textAlign:'center', padding:'20px', fontSize:'13px'}}>
          © 2025 JobsIndia. All rights reserved. | Latest Govt & Private Jobs
        </footer>
        <Analytics />
      </body>
    </html>
  )
}