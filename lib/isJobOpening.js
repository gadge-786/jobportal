const NOT_OPENINGS = [
  'result', 'admit card', 'answer key', 'syllabus',
  'cut off', 'merit list', 'hall ticket', 'interview',
]

export function isJobOpening(title = '') {
  const t = title.toLowerCase()
  return !NOT_OPENINGS.some((word) => t.includes(word))
}