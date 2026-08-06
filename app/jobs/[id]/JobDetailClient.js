'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function JobDetailClient({ id }) {
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

     


      <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', textAlign:'center'}}>
        <p style={{color:'#6b7280', fontSize:'14px', marginBottom:'16px'}}>
          Always apply through the official website only. DwarsingJobs does not charge any fee.
        </p>
          {job.details_table && Object.keys(job.details_table).length > 0 && (
          <div style={{textAlign:'left', background:'#f9fafb', borderRadius:'10px', padding:'16px', marginBottom:'20px'}}>
            <h3 style={{fontSize:'15px', fontWeight:'600', color:'#111827', marginBottom:'10px'}}>Job Details</h3>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
              <tbody>
                {Object.entries(job.details_table).map(([label, value]) => (
                  <tr key={label} style={{borderBottom:'1px solid #e5e7eb'}}>
                    <td style={{padding:'8px 8px 8px 0', color:'#6b7280', fontWeight:'500', width:'40%', verticalAlign:'top'}}>{label}</td>
                    <td style={{padding:'8px 0', color:'#111827'}}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          {job.exam_pattern_note && (
  <p style={{color:'#4b5563', lineHeight:'1.8', fontSize:'15px', margin:'0 0 16px'}}>{job.exam_pattern_note}</p>
          )}
          {job.exam_pattern_table && Array.isArray(job.exam_pattern_table) && job.exam_pattern_table.length > 0 && (
  <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', marginBottom:'16px'}}>
    <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'14px'}}>Exam Pattern</h2>
    {job.exam_pattern_table.map((stage, idx) => (
      <div key={idx} style={{marginBottom: idx < job.exam_pattern_table.length - 1 ? '24px' : '0'}}>
        <h3 style={{fontSize:'15px', fontWeight:'600', color:'#111827', marginBottom:'10px'}}>{stage.title}</h3>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
            <thead>
              <tr style={{borderBottom:'2px solid #e5e7eb'}}>
                {stage.columns.map((col) => (
                  <th key={col} style={{textAlign:'left', padding:'8px', color:'#6b7280', fontWeight:'600'}}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stage.rows.map((row, i) => (
                <tr key={i} style={{borderBottom:'1px solid #f3f4f6', background: row[0]==='Total' ? '#f9fafb' : 'transparent'}}>
                  {row.map((cell, j) => (
                    <td key={j} style={{padding:'8px', color: j===0 ? '#111827' : '#4b5563', fontWeight: j===0 ? '500' : '400'}}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
)}
          {job.vacancy_note && (
  <p style={{color:'#4b5563', lineHeight:'1.8', fontSize:'15px', margin:'0 0 16px'}}>{job.vacancy_note}</p>
)}

{job.vacancy_table && job.vacancy_table.rows && job.vacancy_table.rows.length > 0 && (
  <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', marginBottom:'16px'}}>
    <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'14px'}}>Category-wise Vacancy Details</h2>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
        <thead>
          <tr style={{borderBottom:'2px solid #e5e7eb'}}>
            {job.vacancy_table.columns.map((col) => (
              <th key={col} style={{textAlign:'left', padding:'8px', color:'#6b7280', fontWeight:'600'}}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {job.vacancy_table.rows.map((row, i) => (
            <tr key={i} style={{borderBottom:'1px solid #f3f4f6', background: row[0]==='Total' ? '#f9fafb' : 'transparent'}}>
              {row.map((cell, j) => (
                <td key={j} style={{padding:'8px', color: j===0 ? '#111827' : '#4b5563', fontWeight: j===0 ? '500' : '400'}}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

{job.salary_note && (
  <p style={{color:'#4b5563', lineHeight:'1.8', fontSize:'15px', margin:'0 0 16px'}}>{job.salary_note}</p>
)}

{job.salary_table && job.salary_table.rows && job.salary_table.rows.length > 0 && (
  <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', marginBottom:'16px'}}>
    <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'14px'}}>Salary Structure</h2>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%', borderCollapse:'collapse', fontSize:'13px'}}>
        <thead>
          <tr style={{borderBottom:'2px solid #e5e7eb'}}>
            {job.salary_table.columns.map((col) => (
              <th key={col} style={{textAlign:'left', padding:'8px', color:'#6b7280', fontWeight:'600'}}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {job.salary_table.rows.map((row, i) => (
            <tr key={i} style={{borderBottom:'1px solid #f3f4f6'}}>
              {row.map((cell, j) => (
                <td key={j} style={{padding:'8px', color: j===0 ? '#111827' : '#4b5563', fontWeight: j===0 ? '500' : '400'}}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
        <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
          <a href={job.apply_link} target="_blank" rel="noopener noreferrer" style={{display:'inline-block', background:categoryColor, color:'white', padding:'16px 40px', borderRadius:'12px', textDecoration:'none', fontWeight:'bold', fontSize:'16px'}}>
            Apply Now
          </a>
          {job.notification_pdf && (
            <a href={job.notification_pdf} target="_blank" rel="noopener noreferrer" style={{display:'inline-block', background:'white', color:categoryColor, border:'2px solid ' + categoryColor, padding:'14px 38px', borderRadius:'12px', textDecoration:'none', fontWeight:'bold', fontSize:'16px'}}>
              View Notification PDF
            </a>
          )}
        </div>
        <div style={{marginTop:'16px'}}>
          <Link href="/" style={{color:'#6b7280', fontSize:'13px', textDecoration:'none'}}>
            Browse More Jobs
          </Link>
        </div>
      </div>
    </div>
  )
}