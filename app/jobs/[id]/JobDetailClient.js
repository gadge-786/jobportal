'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import DataTable from '../../../components/DataTable'
import { useLanguage } from '../../../components/LanguageProvider'
import JobQA from '../../../components/JobQA'

export default function JobDetailClient({ id }) {
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()
  const [examTests, setExamTests] = useState([])
  

  useEffect(() => {
    if (!id) return
    async function fetchJob() {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()
      setJob(data)
      if (data) {
    const { data: examData } = await supabase
  .from('exam_tests')
  .select('id, title')
  .eq('job_id', data.id)
  .eq('is_active', true)
  .order('created_at', { ascending: true })
setExamTest(examData && examData.length > 0 ? examData : null)
}
      setLoading(false)
    }
    fetchJob()
  }, [id])

  if (loading) return (
    <div style={{textAlign:'center', padding:'80px', color:'#6b7280'}}>
      <p>{t('loading')}</p>
    </div>
  )

  if (!job) return (
    <div style={{textAlign:'center', padding:'80px', color:'#6b7280'}}>
      <p>{t('noJobsFound')}</p>
      <Link href="/" style={{color:'#1a56db'}}>{t('backToJobs')}</Link>
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
        ← {t('backToJobs')}
      </Link>

      {examTests && examTests.length > 0 && (
  <div style={{background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}cc)`, borderRadius:'16px', padding:'24px', marginBottom:'16px', color:'white', textAlign:'center'}}>
    <h2 style={{fontSize:'18px', fontWeight:'bold', margin:'0 0 16px'}}>📝 Practice Mock Tests Available</h2>
    <div style={{display:'flex', flexDirection:'column', gap:'10px', alignItems:'center'}}>
      {examTests.map((exam) => (
        <Link
          key={exam.id}
          href={`/exam/${exam.id}`}
          style={{display:'inline-block', background:'white', color:categoryColor, padding:'12px 32px', borderRadius:'10px', textDecoration:'none', fontWeight:'bold', fontSize:'15px', width:'100%', maxWidth:'320px'}}
        >
          {exam.title} →
        </Link>
      ))}
    </div>
  </div>
)}

      <div style={{background:categoryColor, borderRadius:'16px', padding:'28px', marginTop:'16px', color:'white'}}>
        <h1 style={{fontSize:'24px', fontWeight:'bold', margin:'8px 0 6px'}}>{job.title}</h1>
        <p style={{fontSize:'16px', opacity:0.9, margin:'0'}}>{t('company')}:{job.company}</p>
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
        <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'14px'}}>{t('aboutJob')}</h2>
        <p style={{color:'#4b5563', lineHeight:'1.8', fontSize:'15px'}}>{job.description}</p>
      </div>

      {job.timeline && Array.isArray(job.timeline) && job.timeline.length > 0 && (
        <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', marginBottom:'16px'}}>
          <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'20px'}}>{t('applicationTracker')}</h2>
          <div style={{position:'relative', paddingLeft:'8px'}}>
            {job.timeline.map((stage, idx) => {
              const isCompleted = stage.status === 'completed'
              const isLast = idx === job.timeline.length - 1
              return (
                <div key={idx} style={{display:'flex', gap:'16px', position:'relative'}}>
                  <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <div style={{
                      width:'16px', height:'16px', borderRadius:'50%',
                      background: isCompleted ? categoryColor : 'white',
                      border: `3px solid ${isCompleted ? categoryColor : '#d1d5db'}`,
                      flexShrink:0, zIndex:1
                    }} />
                    {!isLast && (
                      <div style={{
                        width:'2px', flex:1, minHeight:'40px',
                        background: isCompleted ? categoryColor : '#e5e7eb'
                      }} />
                    )}
                  </div>
                  <div style={{paddingBottom: isLast ? '0' : '24px'}}>
                    <div style={{fontSize:'14px', fontWeight:'600', color: isCompleted ? '#111827' : '#9ca3af'}}>
                      {stage.title}
                    </div>
                    <div style={{fontSize:'12px', color:'#6b7280', marginTop:'2px'}}>
                      {new Date(stage.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    {isCompleted && (
                      <span style={{fontSize:'11px', color:categoryColor, fontWeight:'500', marginTop:'2px', display:'inline-block'}}>
                        ✓ {t('completed')}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {job.details_table && Object.keys(job.details_table).length > 0 && (
        <DataTable
          title={t('jobDetails')}
          accentColor={categoryColor}
          columns={['Field', 'Details']}
          rows={Object.entries(job.details_table)}
        />
      )}

      {job.vacancy_table && job.vacancy_table.rows && job.vacancy_table.rows.length > 0 && (
        <DataTable
          title={t('vacancyDetails')}
          subtitle={job.vacancy_note}
          accentColor={categoryColor}
          columns={job.vacancy_table.columns}
          rows={job.vacancy_table.rows}
        />
      )}

      {job.salary_table && job.salary_table.rows && job.salary_table.rows.length > 0 && (
        <DataTable
          title={t('salaryStructure')}
          subtitle={job.salary_note}
          accentColor={categoryColor}
          columns={job.salary_table.columns}
          rows={job.salary_table.rows}
        />
      )}

      {job.exam_pattern_table && Array.isArray(job.exam_pattern_table) && job.exam_pattern_table.length > 0 && (
        <div style={{marginBottom:'16px'}}>
          {job.exam_pattern_note && (
            <p style={{color:'#4b5563', lineHeight:'1.8', fontSize:'14px', margin:'0 0 14px'}}>{job.exam_pattern_note}</p>
          )}
          {job.exam_pattern_table.map((stage, idx) => (
            <DataTable
              key={idx}
              title={stage.title}
              accentColor={categoryColor}
              columns={stage.columns}
              rows={stage.rows}
            />
          ))}
        </div>
      )}

      <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'24px', textAlign:'center', marginBottom:'16px'}}>
        <p style={{color:'#6b7280', fontSize:'14px', marginBottom:'16px'}}>
          {t('applyWarning')}
        </p>
        <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
          <a href={job.apply_link} target="_blank" rel="noopener noreferrer" style={{display:'inline-block', background:categoryColor, color:'white', padding:'16px 40px', borderRadius:'12px', textDecoration:'none', fontWeight:'bold', fontSize:'16px'}}>
            {t('applyNow')}
          </a>
          {job.notification_pdf && (
            <a href={job.notification_pdf} target="_blank" rel="noopener noreferrer" style={{display:'inline-block', background:'white', color:categoryColor, border:'2px solid ' + categoryColor, padding:'14px 38px', borderRadius:'12px', textDecoration:'none', fontWeight:'bold', fontSize:'16px'}}>
              {t('viewNotification')}
            </a>
          )}
          {job.admit_card_link && (
            <a href={job.admit_card_link} target="_blank" rel="noopener noreferrer" style={{display:'inline-block', background:'white', color:'#059669', border:'2px solid #059669', padding:'14px 38px', borderRadius:'12px', textDecoration:'none', fontWeight:'bold', fontSize:'16px'}}>
              {t('downloadAdmitCard')}
            </a>
          )}
        </div>
        <div style={{marginTop:'16px'}}>
          <Link href="/" style={{color:'#6b7280', fontSize:'13px', textDecoration:'none'}}>
            {t('browseMoreJobs')}
          </Link>
        </div>
      </div>

      <JobQA jobId={job.id} />

    </div>
  )
}