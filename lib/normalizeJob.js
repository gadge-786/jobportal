// Makes job table columns safe to render, whatever shape they were saved in.
// Accepted shapes (all of them work, nothing crashes):
//   details_table      {"Label":"Value", ...}   OR   [{"label":"..","value":".."}, ...]
//   *_table (vacancy, salary, eligibility, how_to_apply)
//                      {"columns":[..],"rows":[[..],[..]]}   OR   [{"label":"..","value":".."}, ...]
//   exam_pattern_table [{"title","columns","rows"}, ...]     OR   [{"label":"..","value":".."}, ...]

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v)
const isPairList = v => Array.isArray(v) && v.length > 0 && v.every(x => isObj(x) && ('label' in x || 'value' in x))

// Anything that is not text/number becomes text, so React never receives an object
export function cell(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (isObj(v) && ('label' in v || 'value' in v)) return [v.label, v.value].filter(Boolean).join(': ')
  try { return JSON.stringify(v) } catch { return '' }
}

export function toDetails(v) {
  if (isPairList(v)) return Object.fromEntries(v.map(x => [cell(x.label), cell(x.value)]))
  if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, cell(val)]))
  return {}
}

export function toTable(v, columns) {
  if (isPairList(v)) return { columns, rows: v.map(x => [cell(x.label), cell(x.value)]) }
  if (isObj(v) && Array.isArray(v.rows)) {
    return { ...v, rows: v.rows.map(r => (Array.isArray(r) ? r : [r]).map(cell)) }
  }
  return null
}

export function toExamStages(v, columns) {
  if (isPairList(v)) return [{ title: null, columns, rows: v.map(x => [cell(x.label), cell(x.value)]) }]
  if (Array.isArray(v)) {
    return v.filter(s => isObj(s) && Array.isArray(s.rows)).map(s => ({
      ...s,
      columns: Array.isArray(s.columns) ? s.columns : columns,
      rows: s.rows.map(r => (Array.isArray(r) ? r : [r]).map(cell)),
    }))
  }
  return []
}

export function normalizeJob(job) {
  if (!job) return job
  const F = ['Field', 'Details']
  return {
    ...job,
    details_table: toDetails(job.details_table),
    eligibility_table: toTable(job.eligibility_table, ['Post / Cadre', 'Educational Qualification & Requirements']),
    vacancy_table: toTable(job.vacancy_table, F),
    salary_table: toTable(job.salary_table, F),
    how_to_apply_table: toTable(job.how_to_apply_table, ['Step', 'What to do']),
    exam_pattern_table: toExamStages(job.exam_pattern_table, F),
  }
}