// Pages that are NOT a job opening (no JobPosting markup, not sent to the Google Indexing API).
// Keep in step with determine_category() in scraper/scraper.py.
const NOT_OPENINGS = [
  'result', 'admit card', 'answer key', 'syllabus',
  'cut off', 'merit list', 'hall ticket', 'interview',
  'call letter', 'exam city', 'city intimation', 'scorecard', 'score card',
]

export function isJobOpening(title = '') {
  const t = String(title || '').toLowerCase()
  return !NOT_OPENINGS.some((word) => t.includes(word))
}