'use client'
import { useLanguage } from './LanguageProvider'

const MR = 'mr' // value your LanguageProvider uses for Marathi - change if different


const URL_RE = /(https?:\/\/[^\s)]+)/g

// Makes full http(s) links inside a cell clickable
function linkify(text) {
  return String(text).split(URL_RE).map((part, i) =>
    /^https?:\/\//.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{color:'#1a56db', wordBreak:'break-all'}}>{part}</a>
      : part
  )
}

function ApplyTable({ title, subtitle, accentColor, columns, rows }) {
  const accent = accentColor || '#1a56db'
  return (
    <section style={{background:'white', border:'1px solid #e5e7eb', borderLeft:`4px solid ${accent}`, borderRadius:'16px', padding:'24px', margin:'0 0 20px', textAlign:'left'}}>
      <h2 style={{fontSize:'22px', fontWeight:'bold', color:'#111827', margin:'0 0 4px'}}>{title}</h2>
      {subtitle && <p style={{fontSize:'14px', color:'#6b7280', margin:'0 0 16px'}}>{subtitle}</p>}
      <table style={{width:'100%', borderCollapse:'collapse', tableLayout:'fixed', marginTop: subtitle ? 0 : '12px'}}>
        <colgroup>
          <col style={{width: columns.length > 1 ? '32%' : '100%'}} />
          {columns.slice(1).map((_, i) => <col key={i} />)}
        </colgroup>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} style={{textAlign:'left', padding:'10px 12px', fontSize:'13px', fontWeight:'700', color:accent, background:'#f3f6fd', borderBottom:'1px solid #e5e7eb'}}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} style={{background: r % 2 ? '#f9fafb' : 'white'}}>
              {columns.map((_, i) => (
                <td key={i} style={{
                  textAlign:'left', verticalAlign:'top', padding:'14px 12px',
                  fontSize:'16px', lineHeight:'1.6', color: i === 0 ? '#111827' : '#374151',
                  fontWeight: i === 0 ? '600' : '400', borderBottom:'1px solid #eef0f3',
                  overflowWrap:'anywhere'
                }}>{linkify(row[i] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

const PLACEHOLDER = 'Check official notification'

export default function HowToApply({ job, accentColor }) {
  const { lang } = useLanguage()
  const mr = lang === MR

  // 1) Per-job custom steps win: jobs.how_to_apply_table = {"columns":[..],"rows":[[..],[..]]}
  const custom = job.how_to_apply_table
  if (custom && Array.isArray(custom.rows) && custom.rows.length > 0) {
    return (
      <ApplyTable
        title={mr ? 'अर्ज कसा करायचा' : 'How to Apply'}
        accentColor={accentColor}
        columns={custom.columns || (mr ? ['पायरी', 'काय करायचे'] : ['Step', 'What to do'])}
        rows={custom.rows}
      />
    )
  }

  // 2) Generic steps built from this job's own data
  const hasDeadline = job.last_date && job.last_date !== PLACEHOLDER
  const rows = mr
    ? [
        ['पायरी १ - अधिसूचना वाचा', 'अधिकृत अधिसूचना PDF डाउनलोड करून पात्रता, रिक्त जागा आणि महत्त्वाच्या तारखा तपासा.'],
        ['पायरी २ - पात्रता तपासा', 'शैक्षणिक पात्रता, वयोमर्यादा आणि इतर अटी तुम्ही पूर्ण करता का ते पाहा.'],
        ['पायरी ३ - अधिकृत वेबसाइट उघडा', 'खालील "अर्ज करा" बटणावर क्लिक करून अधिकृत संकेतस्थळावर जा.'],
        ['पायरी ४ - नोंदणी करा', 'नवीन नोंदणी करा किंवा आधीच खाते असल्यास लॉगिन करा.'],
        ['पायरी ५ - अर्ज भरा', 'वैयक्तिक व शैक्षणिक माहिती भरा. फोटो, सही आणि आवश्यक कागदपत्रे अपलोड करा.'],
        ['पायरी ६ - शुल्क भरा', 'लागू असल्यास ऑनलाइन परीक्षा शुल्क भरा.'],
        ['पायरी ७ - सबमिट करा', 'अर्ज तपासून सबमिट करा. अर्ज क्रमांक नोंदवा आणि प्रिंट काढून ठेवा.'],
      ]
    : [
        ['Step 1 - Read the notification', 'Download the official notification PDF and check eligibility, vacancies and important dates.'],
        ['Step 2 - Check eligibility', 'Confirm you meet the education, age limit and any other conditions.'],
        ['Step 3 - Open the official website', 'Click the Apply button below to go to the official site.'],
        ['Step 4 - Register', 'Create a new registration, or log in if you already have an account.'],
        ['Step 5 - Fill the form', 'Enter personal and education details. Upload your photo, signature and required documents.'],
        ['Step 6 - Pay the fee', 'Pay the application fee online, if one applies.'],
        ['Step 7 - Submit', 'Review and submit. Note your application number and keep a printout.'],
      ]

  if (hasDeadline) {
    rows.push([
      mr ? 'अंतिम तारीख' : 'Last date',
      mr ? `${job.last_date} पर्यंत अर्ज पूर्ण करा.` : `Complete your application by ${job.last_date}.`,
    ])
  }

  return (
    <ApplyTable
      title={mr ? 'अर्ज कसा करायचा' : 'How to Apply'}
      subtitle={mr ? 'अचूक माहितीसाठी अधिकृत अधिसूचना पाहा.' : 'Always confirm details in the official notification.'}
      accentColor={accentColor}
      columns={mr ? ['पायरी', 'काय करायचे'] : ['Step', 'What to do']}
      rows={rows}
    />
  )
}