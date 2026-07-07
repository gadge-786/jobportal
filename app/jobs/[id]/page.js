'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function JobDetail({ params }) {
  const [job, setJob] = useState(null)

  useEffect(() => {
    async function fetchJob() {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', params.id)
        .single()
      setJob(data)
    }
    fetchJob()
  }, [params.id])

  if (!job) return <p style={{textAlign:'center', padding:'60px', color:'#6b7280'}}>Loading...</p>

  return (
    <div style={{maxWidth:'800px', margin:'0 auto', padding:'24px 16px'}}>
      <Link href="/" style={{color:'#1a56db', fontSize:'14px', textDecoration:'none'}}>← Back to Jobs</Link>

      <div style={{background:'white', borderRadius:'16px', padding:'28px', marginTop:'16px', border:'1px solid #e5e7eb', boxShadow:'0 2px 8px rgba(0,0,0,0.07)'}}>
        {job.is_featured && <span style={{background:'#fef3c7', color:'#92400e', fontSize:'12px', padding:'3px 10px', borderRadius:'20px', fontWeight:'500'}}>⭐ Featured Job</span>}
        <h1 style={{fontSize:'26px', fontWeight:'bold', color:'#111827', margin:'12px 0 6px'}}>{job.title}</h1>
        <p style={{fontSize:'17px', color:'#374151', marginBottom:'20px'}}>🏢 {job.company}</p>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'24px'}}>
          {[
            ['📍 Location', job.location],
            ['💰 Salary', job.salary],
            ['📁 Category', job.category],
            ['⏰ Last Date', job.last_date],
          ].map(([label, val]) => (
            <div key={label} style={{background:'#f9fafb', borderRadius:'10px', padding:'14px'}}>
              <div style={{fontSize:'12px', color:'#6b7280', marginBottom:'4px'}}>{label}</div>
              <div style={{fontSize:'15px', fontWeight:'600', color:'#111827'}}>{val || 'N/A'}</div>
            </div>
          ))}
        </div>

        <h2 style={{fontSize:'18px', fontWeight:'bold', marginBottom:'10px', color:'#111827'}}>Job Description</h2>
        <p style={{color:'#4b5563', lineHeight:'1.7', marginBottom:'24px'}}>{job.description}</p>

        {/* External link — correctly uses normal <a> tag */}
        <a href={job.apply_link} target="_blank" rel="noopener noreferrer"
          style={{display:'inline-block', background:'#1a56db', color:'white', padding:'14px 32px', borderRadius:'10px', textDecoration:'none', fontWeight:'bold', fontSize:'16px'}}>
          Apply Now →
        </a>
      </div>
    </div>
  )
}