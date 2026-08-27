import { createClient } from '@supabase/supabase-js'
import JobDetailClient from './JobDetailClient'

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
    description: job.description?.slice(0, 155) || `${job.title} at ${job.company}. Check eligibility, vacancy details and apply online.`,
    keywords: `${job.title}, ${job.company}, ${job.category} jobs, sarkari naukri, government jobs`,
    openGraph: {
      title: `${job.title} | JobsIndia`,
      description: job.description?.slice(0, 155),
      type: 'article',
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

  const jsonLd = job ? {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || job.title,
    datePosted: job.created_at,
    validThrough: job.last_date && job.last_date !== 'Check official notification' ? job.last_date : undefined,
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
        addressRegion: 'Maharashtra',
        addressCountry: 'IN',
      },
    },
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <JobDetailClient id={id} />
    </>
  )
}