import { createClient } from '@supabase/supabase-js'
import { STATES } from '../lib/states'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const NON_OPENINGS = ['results', 'admit-cards', 'answer-keys']

// Supabase returns at most 1000 rows per request, so read in pages
async function fetchAllActiveJobs() {
  const rows = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, updated_at, state, category')
      .eq('is_active', true)
      .order('id')
      .range(from, from + pageSize - 1)
    if (error || !data) break
    rows.push(...data)
    if (data.length < pageSize) break
  }
  return rows
}

export default async function sitemap() {
  const baseUrl = 'https://dwarsing.in'

  const jobs = await fetchAllActiveJobs()

  const jobUrls = jobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.id}`,
    lastModified: new Date(job.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // Newest update per state, counting real openings only (central jobs have no state)
  const latest = {}
  for (const job of jobs) {
    if (NON_OPENINGS.includes(job.category)) continue
    const key = job.state || 'all-india'
    if (!latest[key] || job.updated_at > latest[key]) latest[key] = job.updated_at
  }

  // Only states that have at least one job get a page in the sitemap
  const stateUrls = [...STATES.map((s) => s.slug), 'all-india']
    .filter((slug) => latest[slug])
    .map((slug) => ({
      url: `${baseUrl}/state/${slug}`,
      lastModified: new Date(latest[slug]),
      changeFrequency: 'daily',
      priority: 0.8,
    }))

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  return [...staticUrls, ...stateUrls, ...jobUrls]
}