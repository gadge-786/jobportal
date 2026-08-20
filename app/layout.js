import './globals.css'
import { Poppins, Work_Sans, Mukta } from 'next/font/google'
import { AuthProvider } from '../components/AuthProvider'
import { LanguageProvider } from '../components/LanguageProvider'
import Navbar from '../components/Navbar'
import Link from 'next/link'

const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-heading' })
const workSans = Work_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' })
const mukta = Mukta({ subsets: ['devanagari'], weight: ['500', '600', '700'], variable: '--font-marathi' })

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
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${workSans.variable} ${mukta.variable}`}>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <Navbar />
            <main style={{minHeight:'80vh', background:'var(--color-paper)'}}>
              {children}
            </main>
            <footer style={{background:'var(--color-ink)', color:'#B8BCD9', textAlign:'center', padding:'28px 20px', fontSize:'13px'}}>
              <div style={{marginBottom:'12px'}}>
                <Link href="/privacy-policy" style={{color:'#B8BCD9', textDecoration:'none', margin:'0 12px'}}>Privacy Policy</Link>
                <Link href="/contact" style={{color:'#B8BCD9', textDecoration:'none', margin:'0 12px'}}>Contact Us</Link>
              </div>
              © 2026 DwarSing. All rights reserved. | Latest Govt & Private Jobs
            </footer>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}