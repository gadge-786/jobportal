'use client'
import DataTable from './DataTable'
import { useLanguage } from './LanguageProvider'

const MR = 'mr' // value your LanguageProvider uses for Marathi - change if different

const PLACEHOLDER = 'Check official notification'

export default function HowToApply({ job, accentColor }) {
  const { lang } = useLanguage()
  const mr = lang === MR

  // 1) Per-job custom steps win: jobs.how_to_apply_table = {"columns":[..],"rows":[[..],[..]]}
  const custom = job.how_to_apply_table
  if (custom && Array.isArray(custom.rows) && custom.rows.length > 0) {
    return (
      <DataTable
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
    <DataTable
      title={mr ? 'अर्ज कसा करायचा' : 'How to Apply'}
      subtitle={mr ? 'अचूक माहितीसाठी अधिकृत अधिसूचना पाहा.' : 'Always confirm details in the official notification.'}
      accentColor={accentColor}
      columns={mr ? ['पायरी', 'काय करायचे'] : ['Step', 'What to do']}
      rows={rows}
    />
  )
}