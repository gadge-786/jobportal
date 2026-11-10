import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import JobDetailClient from './JobDetailClient'
import { isJobOpening } from '../../../lib/isJobOpening'
import { lastDateToISO } from '../../../lib/parseLastDate'
import { plainText } from '../../../lib/plainText'
import { STATES } from '../../../lib/states'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function getJob(id) {
  const { data } = await supabase.from('jobs').select('*').eq('id', id).single()
  return data || null
}

function fmtDate(value, locale, month) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(locale, { day: 'numeric', month, year: 'numeric', timeZone: 'Asia/Kolkata' })
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const job = await getJob(id)

  if (!job) {
    return {
      title: 'Job Not Found | DwarSing',
      description: 'This job listing could not be found.',
    }
  }

  const description =
    plainText(job.description, 155) ||
    `${job.title} at ${job.company}. Check eligibility, vacancy details and apply online.`

  return {
    title: `${job.title} - Apply Online | DwarSing`,
    description,
    keywords: `${job.title}, ${job.company}, ${job.category} jobs, sarkari naukri, government jobs`,
    alternates: { canonical: `https://dwarsing.in/jobs/${job.id}` },
    openGraph: {
      title: `${job.title} | DwarSing`,
      description,
      type: 'article',
      publishedTime: job.created_at,
      modifiedTime: job.updated_at,
    },
  }
}

export default async function JobDetailPage({ params }) {
  const { id } = await params
  const job = await getJob(id)
  if (!job) notFound()

  // region from the job's own state (central / all-India jobs get no region)
  const stateRow = STATES.find(s => s.slug === String(job.state || '').trim().toLowerCase())

  const jsonLd = isJobOpening(job.title)
    ? {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: plainText(job.description, 4000) || job.title,
        datePosted: job.created_at,
        validThrough:
          lastDateToISO(job.last_date) ||
          (() => {
            const fallback = new Date(job.created_at)
            fallback.setDate(fallback.getDate() + 60)
            return fallback.toISOString().split('T')[0]
          })(),
        employmentType: job.job_type === 'private' ? 'FULL_TIME' : 'OTHER',
        hiringOrganization: {
          '@type': 'Organization',
          name: job.company,
          sameAs: job.apply_link,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: job.location,
            ...(stateRow ? { addressRegion: stateRow.name } : {}),
            addressCountry: 'IN',
          },
        },
      }
    : null

  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: job.title,
    url: `https://dwarsing.in/jobs/${job.id}`,
    datePublished: job.created_at,
    dateModified: job.updated_at,
  }

  const updatedEn = fmtDate(job.updated_at, 'en-IN', 'short')
  const updatedMr = fmtDate(job.updated_at, 'mr-IN', 'long')

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd).replace(/</g, '\\u003c') }}
      />

      {updatedEn && (
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '14px 16px 0' }}>
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--color-muted)' }}>
            🕒 Last updated: <time dateTime={job.updated_at}>{updatedEn}</time>
            {updatedMr ? ` · अद्यतनित: ${updatedMr}` : ''}
          </p>
        </div>
      )}
      <JobDetailClient id={id} />
    </>
  )
}