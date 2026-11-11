export const metadata = {
  title: 'Privacy Policy | DwarSing',
  description: 'Privacy Policy for DwarSing (dwarsing.in): what information we collect, how we use it, and your choices.',
  alternates: { canonical: 'https://dwarsing.in/privacy-policy' },
}

const h2 = { fontSize: '18px', fontWeight: '600', color: '#111827', marginTop: '28px', marginBottom: '10px' }
const ul = { paddingLeft: '20px', marginTop: '8px' }
const link = { color: '#1a56db' }

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', color: '#374151', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '32px' }}>Last updated: November 2026</p>

      <h2 style={h2}>1. Introduction</h2>
      <p>Welcome to DwarSing (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), available at dwarsing.in. We publish government and private job notifications, results, admit cards and exam preparation tools. This Privacy Policy explains what information we collect when you use the website, how we use it, and the choices you have.</p>

      <h2 style={h2}>2. Information We Collect</h2>
      <p>You can browse most of DwarSing without giving us any personal information. Depending on what you use, we may collect:</p>
      <ul style={ul}>
        <li><strong>Account information.</strong> If you sign in with Google, we receive your name, email address and profile picture from Google. Sign-in is handled by our authentication provider, Supabase.</li>
        <li><strong>Saved jobs.</strong> If you save a job, we store which jobs you saved, linked to your account, so you can see them on any device.</li>
        <li><strong>Questions you post.</strong> If you ask a question on a job page, we store the name you type (or &quot;Anonymous&quot;) and your question. Questions and their answers are visible to other visitors.</li>
        <li><strong>Exam activity.</strong> If you take a mock test while signed in, we store your answers and scores so we can show results and leaderboards.</li>
        <li><strong>Eligibility Checker details.</strong> The education, age, category and state you enter are used in your browser to filter jobs. They are kept in your browser&apos;s local storage and may appear in the page address (URL). They are not stored in our database.</li>
        <li><strong>Usage data.</strong> Through Google Analytics we collect information such as pages visited, time spent, device and browser type, and approximate location.</li>
        <li><strong>Preferences.</strong> Your language choice (English or Marathi) is saved in your browser.</li>
      </ul>

      <h2 style={h2}>3. How We Use Your Information</h2>
      <ul style={ul}>
        <li>To provide features you ask for: sign-in, saved jobs, questions and answers, mock tests and leaderboards</li>
        <li>To understand which pages are useful and improve the website</li>
        <li>To keep the website secure and prevent spam or misuse</li>
        <li>To display advertisements, if and when we use services such as Google AdSense</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2 style={h2}>4. Google Analytics</h2>
      <p>We use Google Analytics (GA4) to measure traffic. Google Analytics uses cookies and similar technologies to collect usage data. You can learn how Google uses this data at <a href="https://policies.google.com/technologies/partner-sites" style={link}>policies.google.com/technologies/partner-sites</a> and opt out with the <a href="https://tools.google.com/dlpage/gaoptout" style={link}>Google Analytics opt-out browser add-on</a>.</p>

      <h2 style={h2}>5. Third-Party Advertising</h2>
      <p>We may display advertisements through Google AdSense. Google may use cookies to serve ads based on your prior visits to our website or other websites. You can opt out of personalized advertising at <a href="https://adssettings.google.com" style={link}>adssettings.google.com</a>.</p>

      <h2 style={h2}>6. Cookies and Local Storage</h2>
      <p>We and our partners (such as Google) use cookies and your browser&apos;s local storage to keep you signed in, remember your language and Eligibility Checker choices, and measure traffic. You can block or delete cookies and site data in your browser settings, though some features (such as staying signed in) may stop working.</p>

      <h2 style={h2}>7. Third-Party Links and Telegram</h2>
      <p>Our pages link to official government and company websites for applications and notifications, and may link to our Telegram channel. We are not responsible for the privacy practices of these external sites and services. Always apply through the official website; DwarSing does not charge any fee for applications.</p>

      <h2 style={h2}>8. Data Retention and Your Choices</h2>
      <p>We keep account information, saved jobs and posted questions until you ask us to delete them. You can remove a saved job at any time using the heart button. To delete your account data or a question you posted, or to ask what we hold about you, email us at <a href="mailto:dwarsing.contact@gmail.com" style={link}>dwarsing.contact@gmail.com</a> and we will respond within a reasonable time.</p>

      <h2 style={h2}>9. Data Security</h2>
      <p>We use reasonable security measures, including access controls so that you can only see your own saved jobs. However, no method of transmission over the internet or electronic storage is 100% secure.</p>

      <h2 style={h2}>10. Children&apos;s Privacy</h2>
      <p>Our website is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has given us personal information, please contact us and we will delete it.</p>

      <h2 style={h2}>11. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>

      <h2 style={h2}>12. Contact Us</h2>
      <p>If you have questions about this Privacy Policy, please contact us through our <a href="/contact" style={link}>Contact page</a> or at <a href="mailto:dwarsing.contact@gmail.com" style={link}>dwarsing.contact@gmail.com</a>.</p>
    </div>
  )
}