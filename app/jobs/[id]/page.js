'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function JobDetail({ params }) {
  const { id } = use(params)
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchJob() {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()
      setJob(data)
      setLoading(false)
    }
    fetchJob()
  }, [id])

  if (loading) return (
    <div style={{textAlign:'center', padding:'80px', color:'#6b7280'}}>
      <p>Loading job details...</p>
    </div>
  )

  if (!job) return (
    <div style={{textAlign:'center', padding:'80px', color:'#6b7280'}}>
      <p>Job not found.</p>
      <Link href="/" style={{color:'#1a56db'}}>Back to Jobs</Link>
    </div>
  )

  const categoryColors = {
    'government': '#1a56db',
    'banking': '#0891b2',
    'railway': '#7c3aed',
    'defence': '#dc2626',
    'teaching': '#d97706',
    'it-software': '#059669',
    'private': '#6b7280',
  }

  const categoryColor = categoryColors[job.category] || '#1a56db'

  return (
    <div style={{maxWidth:'860px', margin:'0 auto', padding:'24px 16px'}}>
      <Link href="/" style={{color:'#1a56db', fontSize:'14px', textDecoration:'none'}}>
        Back to Jobs
      </Link>

      <div style={{background:categoryColor, borderRadius:'16px', padding:'28px', marginTop:'16px', color:'white'}}>
        <h1 style={{fontSize:'24px', fontWeight:'bold', margin:'8px 0 6px'}}>{job.title}</h1>
        <p style={{fontSize:'16px', opacity:0.9, margin:'0'}}>Company: {job.company}</p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'12px', margin:'16px 0'}}>
        {[
          {label:'Location', value: job.location},
          {label:'Salary / Pay Scale', value: job.salary},
          {label:'Job Type', value: job.job_type},
          {label:'Last Date to Apply', value: job.last_date},
        ].map(({label, value}) => (
          <div key={label} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px'}}>
            <div style={{fontSize:'11px', color:'#6b7280', marginBottom:'4px'}}>{label}</div>
            <div style={{fontSize:'15px', fontWeight:'600', color:'#111827'}}>{value || 'Check notification'}</div>
          </div>
        ))}
      </div>

      <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', marginBottom:'16px'}}>
        <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'14px'}}>About This Job</h2>
        <p style={{color:'#4b5563', lineHeight:'1.8', fontSize:'15px'}}>{job.description}</p>
      </div>

      <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', marginBottom:'16px'}}>
        <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'14px'}}>Important Information</h2>
        <ul style={{margin:'0', padding:'0 0 0 18px', color:'#4b5563', lineHeight:'2', fontSize:'14px', listStyleType:'disc'}}>
          <li>Read the official notification carefully before applying</li>
          <li>Check eligibility criteria — age limit, education qualification</li>
          <li>Keep all required documents ready before filling the form</li>
          <li>Pay application fee if applicable before last date</li>
          <li>Take printout of application form after successful submission</li>
          <li>Last date to apply: {job.last_date}</li>
        </ul>
      </div>

      <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', marginBottom:'16px'}}>
        <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'14px'}}>How to Apply</h2>
        <ol style={{margin:'0', padding:'0 0 0 18px', color:'#4b5563', lineHeight:'2.2', fontSize:'14px', listStyleType:'decimal'}}>
          <li>Click the Apply Now button below to visit the official website</li>
          <li>Find the recruitment notification and read it completely</li>
          <li>Click on the online application link</li>
          <li>Fill in your personal details and education qualification</li>
          <li>Upload required documents — photo, signature, certificates</li>
          <li>Pay application fee if required</li>
          <li>Submit the form and save the confirmation number</li>
        </ol>
      </div>

      <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', textAlign:'center'}}>
        <p style={{color:'#6b7280', fontSize:'14px', marginBottom:'16px'}}>
          Always apply through the official website only. JobsIndia does not charge any fee.
        </p>
         <a href={job.apply_link} target="_blank" rel="noopener noreferrer" style={{display:'inline-block', background:categoryColor, color:'white', padding:'16px 48px', borderRadius:'12px', textDecoration:'none', fontWeight:'bold', fontSize:'17px'}}>
          Apply Now - Official Website
        </a>
        <div style={{marginTop:'16px'}}>
          <Link href="/" style={{color:'#6b7280', fontSize:'13px', textDecoration:'none'}}>
            Browse More Jobs
          </Link>
        </div>
      </div>
    </div>
  )
}