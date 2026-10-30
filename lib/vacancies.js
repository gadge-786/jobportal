// Total vacancies: details_table first, then a number in the title like "(3,901 Jobs)" or "83 Various Posts"
export function getVacancies(job) {
  const d = job.details_table
  if (d && typeof d === 'object') {
    for (const [k, v] of Object.entries(d)) {
      if (/vacanc|no\.?\s*of\s*posts?|total\s*posts?/i.test(k)) {
        const m = String(v).match(/\d[\d,]*/)
        if (m) return m[0]
      }
    }
  }
  const m = (job.title || '').match(/(\d[\d,]*)\s*(?:various\s*)?(?:jobs|posts|vacanc)/i)
  return m ? m[1] : null
}