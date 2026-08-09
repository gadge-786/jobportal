import './globals.css'
import { LanguageProvider } from '../components/LanguageProvider'
import Navbar from '../components/Navbar'
import Link from 'next/link'

export const metadata = {
  title: 'DwarSing - Latest Government Jobs, Bank Jobs, Railway Jobs 2026',
  description: 'Find latest government job notifications, bank jobs, railway recruitment, defence jobs, teaching jobs and private sector jobs in India. Updated daily with new vacancies.',
  keywords: 'government jobs, sarkari naukri, bank jobs, railway jobs, defence jobs, teaching jobs, private jobs india, latest job notification 2026',
  authors: [{ name: 'DwarSing' }],
  metadataBase: new URL('https://dwarsing.in'),
  openGraph: {
    title: 'DwarSing - Latest Govt & Private Jobs in India',
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
        <LanguageProvider>
          <Navbar />
          <main style={{minHeight:'80vh', background:'#f9fafb'}}>
            {children}
          </main>
          <footer style={{background:'#111827', color:'#9ca3af', textAlign:'center', padding:'24px 20px', fontSize:'13px'}}>
            <div style={{marginBottom:'10px'}}>
              <Link href="/privacy-policy" style={{color:'#9ca3af', textDecoration:'none', margin:'0 12px'}}>Privacy Policy</Link>
              <Link href="/contact" style={{color:'#9ca3af', textDecoration:'none', margin:'0 12px'}}>Contact Us</Link>
            </div>
            © 2026 DwarSing. All rights reserved. | Latest Govt & Private Jobs
          </footer>
        </LanguageProvider>
      </body>
    </html>
  )
}