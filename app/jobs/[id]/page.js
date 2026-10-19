import { createClient } from '@supabase/supabase-js'
import JobDetailClient from './JobDetailClient'
import { isJobOpening } from '../../../lib/isJobOpening'
import { lastDateToISO } from '../../../lib/parseLastDate'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function generateMetadata({ params }) {
  const { id } = await params

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (!job) {
    return {
      title: 'Job Not Found | JobsIndia',
      description: 'This job listing could not be found.',
    }
  }

  return {
    title: `${job.title} - Apply Online | JobsIndia`,
    description:
      job.description?.slice(0, 155) ||
      `${job.title} at ${job.company}. Check eligibility, vacancy details and apply online.`,
    keywords: `${job.title}, ${job.company}, ${job.category} jobs, sarkari naukri, government jobs`,
    openGraph: {
      title: `${job.title} | JobsIndia`,
      description: job.description?.slice(0, 155),
      type: 'article',
      publishedTime: job.created_at,
      modifiedTime: job.updated_at,
    },
  }
}

export default async function JobDetailPage({ params }) {
  const { id } = await params

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  // Existing JobPosting structured data
  const jsonLd =
    job && isJobOpening(job.title)
      ? {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: job.description || job.title,
          datePosted: job.created_at,
          validThrough:
            lastDateToISO(job.last_date) ||
            (() => {
              const fallback = new Date(job.created_at)
              fallback.setDate(fallback.getDate() + 60)
              return fallback.toISOString().split('T')[0]
            })(),
          employmentType:
            job.job_type === 'private' ? 'FULL_TIME' : 'OTHER',
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
              addressRegion: 'Maharashtra',
              addressCountry: 'IN',
            },
          },
        }
      : null

  // New WebPage structured data
  const pageLd = job
    ? {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: job.title,
        url: `https://dwarsing.in/jobs/${job.id}`,
        datePublished: job.created_at,
        dateModified: job.updated_at,
      }
    : null

  return (
    <>
      {/* Existing JobPosting JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      )}

      {/* New WebPage JSON-LD */}
      {pageLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(pageLd).replace(/</g, '\\u003c'),
          }}
        />
      )}
         <p style={{fontSize:13, opacity:.75}}>
     Last updated: <time dateTime={job.updated_at}>{new Date(job.updated_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kolkata'})}</time>
     {' · '}अद्यतनित: {new Date(job.updated_at).toLocaleDateString('mr-IN',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kolkata'})}
        </p>
      <JobDetailClient id={id} />
    </>
  )
}