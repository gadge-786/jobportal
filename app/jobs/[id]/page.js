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
      <div style={{fontSize:'32px', marginBottom:'12px'}}>⏳</div>
      <p>Loading job details...</p>
    </div>
  )

  if (!job) return (
    <div style={{textAlign:'center', padding:'80px', color:'#6b7280'}}>
      <div style={{fontSize:'32px', marginBottom:'12px'}}>😕</div>
      <p>Job not found.</p>
      <Link href="/" style={{color:'#1a56db'}}>← Back to Jobs</Link>
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
      <Link href="/" style={{color:'#1a56db', fontSize:'14px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'4px'}}>
        ← Back to Jobs
      </Link>

      {/* HEADER CARD */}
      <div style={{background:`linear-gradient(135deg, ${categoryColor}, ${categoryColor}cc)`, borderRadius:'16px', padding:'28px', marginTop:'16px', color:'white'}}>
        {job.is_featured && (
          <span style={{background:'#fef3c7', color:'#92400e', fontSize:'12px', padding:'3px 10px', borderRadius:'20px', fontWeight:'500', marginBottom:'10px', display:'inline-block'}}>⭐ Featured Job</span>
        )}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px'}}>
          <div>
            <h1 style={{fontSize:'24px', fontWeight:'bold', margin:'8px 0 6px', lineHeight:'1.3'}}>{job.title}</h1>
            <p style={{fontSize:'16px', opacity:0.9, margin:'0'}}>🏢 {job.company}</p>
          </div>
          <span style={{background:'rgba(255,255,255,0.2)', fontSize:'13px', padding:'6px 14px', borderRadius:'20px', fontWeight:'500', whiteSpace:'nowrap'}}>
            {job.category?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* KEY DETAILS GRID */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:'12px', margin:'16px 0'}}>
        {[
          {icon:'📍', label:'Location', value: job.location},
          {icon:'💰', label:'Salary / Pay Scale', value: job.salary},
          {icon:'📁', label:'Job Type', value: job.job_type?.charAt(0).toUpperCase() + job.job_type?.slice(1)},
          {icon:'⏰', label:'Last Date to Apply', value: job.last_date},
        ].map(({icon, label, value}) => (
          <div key={label} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
            <div style={{fontSize:'20px', marginBottom:'6px'}}>{icon}</div>
            <div style={{fontSize:'11px', color:'#6b7280', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.05em'}}>{label}</div>
            <div style={{fontSize:'15px', fontWeight:'600', color:'#111827'}}>{value || 'Check notification'}</div>
          </div>
        ))}
      </div>

      {/* ABOUT THIS JOB */}
      <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', marginBottom:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
        <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'14px', paddingBottom:'10px', borderBottom:'2px solid #f3f4f6'}}>
          📋 About This Job
        </h2>
        <p style={{color:'#4b5563', lineHeight:'1.8', fontSize:'15px', margin:'0 0 16px'}}>{job.description}</p>

        <div style={{background:'#f9fafb', borderRadius:'10px', padding:'16px'}}>
          <h3 style={{fontSize:'15px', fontWeight:'600', color:'#111827', marginBottom:'10px'}}>📌 Important Information</h3>
          <ul style={{margin:'0', padding:'0 0 0 18px', color:'#4b5563', lineHeight:'2', fontSize:'14px'}}>
            <li>Read the official notification carefully before applying</li>
            <li>Check eligibility criteria — age limit, education qualification</li>
            <li>Keep all required documents ready before filling the form</li>
            <li>Pay application fee (if applicable) before last date</li>
            <li>Take printout of application form after successful submission</li>
            <li>Last date: <strong style={{color:'#ef4444'}}>{job.last_date}</strong></li>
          </ul>
        </div>
      </div>

      {/* HOW TO APPLY */}
      <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', marginBottom:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
        <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'14px', paddingBottom:'10px', borderBottom:'2px solid #f3f4f6'}}>
          📝 How to Apply
        </h2>
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          {[
            'Visit the official website by clicking Apply Now button below',
            'Find the recruitment notification and read it completely',
            'Click on the online application link',
            'Fill in your personal details, education qualification and experience',
            'Upload required documents — photo, signature, certificates',
            'Pay application fee if required',
            'Submit the form and save the confirmation number',
          ].map((step, i) => (
            <div key={i} style={{display:'flex', gap:'12px', alignItems:'flex-start'}}>
              <div style={{width:'26px', height:'26px', borderRadius:'50%', background:categoryColor, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'bold', flexShrink:0, marginTop:'1px'}}>
                {i+1}
              </div>
              <p style={{margin:'0', color:'#4b5563', fontSize:'14px', lineHeight:'1.6', paddingTop:'3px'}}>{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* APPLY BUTTON */}
      <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', textAlign:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
        <p style={{color:'#6b7280', fontSize:'14px', marginBottom:'16px'}}>
          ⚠️ Always apply through the official website only. JobsIndia does not charge any fee.
        </p>
        
          href={job.apply_link}
          target="_blank"
          rel="noopener noreferrer"
          style={{display:'inline-block', background:categoryColor, color:'white', padding:'16px 48px', borderRadius:'12px', textDecoration:'none', fontWeight:'bold', fontSize:'17px', boxShadow:`0 4px 14px ${categoryColor}66`}}>
          Apply Now → Official Website
        </a>
        <div style={{marginTop:'16px'}}>
          <Link href="/" style={{color:'#6b7280', fontSize:'13px', textDecoration:'none'}}>
            ← Browse More Jobs
          </Link>
        </div>
      </div>
    </div>
  )
}