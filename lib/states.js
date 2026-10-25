// Generated from scraper/states.py - do not edit by hand
export const STATES = [
  {
    "slug": "maharashtra",
    "name": "Maharashtra",
    "mr": "महाराष्ट्र"
  },
  {
    "slug": "uttar-pradesh",
    "name": "Uttar Pradesh",
    "mr": "उत्तर प्रदेश"
  },
  {
    "slug": "bihar",
    "name": "Bihar",
    "mr": "बिहार"
  },
  {
    "slug": "rajasthan",
    "name": "Rajasthan",
    "mr": "राजस्थान"
  },
  {
    "slug": "madhya-pradesh",
    "name": "Madhya Pradesh",
    "mr": "मध्य प्रदेश"
  },
  {
    "slug": "gujarat",
    "name": "Gujarat",
    "mr": "गुजरात"
  },
  {
    "slug": "karnataka",
    "name": "Karnataka",
    "mr": "कर्नाटक"
  },
  {
    "slug": "tamil-nadu",
    "name": "Tamil Nadu",
    "mr": "तमिळनाडू"
  },
  {
    "slug": "kerala",
    "name": "Kerala",
    "mr": "केरळ"
  },
  {
    "slug": "andhra-pradesh",
    "name": "Andhra Pradesh",
    "mr": "आंध्र प्रदेश"
  },
  {
    "slug": "telangana",
    "name": "Telangana",
    "mr": "तेलंगणा"
  },
  {
    "slug": "odisha",
    "name": "Odisha",
    "mr": "ओडिशा"
  },
  {
    "slug": "west-bengal",
    "name": "West Bengal",
    "mr": "पश्चिम बंगाल"
  },
  {
    "slug": "assam",
    "name": "Assam",
    "mr": "आसाम"
  },
  {
    "slug": "punjab",
    "name": "Punjab",
    "mr": "पंजाब"
  },
  {
    "slug": "haryana",
    "name": "Haryana",
    "mr": "हरियाणा"
  },
  {
    "slug": "himachal-pradesh",
    "name": "Himachal Pradesh",
    "mr": "हिमाचल प्रदेश"
  },
  {
    "slug": "uttarakhand",
    "name": "Uttarakhand",
    "mr": "उत्तराखंड"
  },
  {
    "slug": "jharkhand",
    "name": "Jharkhand",
    "mr": "झारखंड"
  },
  {
    "slug": "chhattisgarh",
    "name": "Chhattisgarh",
    "mr": "छत्तीसगड"
  },
  {
    "slug": "delhi",
    "name": "Delhi",
    "mr": "दिल्ली"
  },
  {
    "slug": "jammu-kashmir",
    "name": "Jammu & Kashmir",
    "mr": "जम्मू आणि काश्मीर"
  },
  {
    "slug": "ladakh",
    "name": "Ladakh",
    "mr": "लडाख"
  },
  {
    "slug": "goa",
    "name": "Goa",
    "mr": "गोवा"
  },
  {
    "slug": "chandigarh",
    "name": "Chandigarh",
    "mr": "चंदीगड"
  },
  {
    "slug": "north-east",
    "name": "North East",
    "mr": "ईशान्य भारत"
  }
]

export function stateLabel(slug, mr) {
  if (slug === 'all-india') return mr ? 'केंद्र सरकार / संपूर्ण भारत' : 'Central / All India'
  const s = STATES.find(x => x.slug === slug)
  return s ? (mr ? s.mr : s.name) : slug
}