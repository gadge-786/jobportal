'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from './LanguageProvider'

export default function PreviousPapers({ jobId }) {
  const { t } = useLanguage()
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPapers() {
      const { data } = await supabase
        .from('job_papers')
        .select('*')
        .eq('job_id', jobId)
        .order('exam_year', { ascending: false })
      setPapers(data || [])
      setLoading(false)
    }
    fetchPapers()
  }, [jobId])

  if (loading || papers.length === 0) return null

  return (
    <div style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderRadius:'16px', padding:'24px', marginBottom:'16px'}}>
      <h2 style={{fontFamily:'var(--font-heading)', fontSize:'16px', fontWeight:'700', color:'var(--color-ink)', marginBottom:'16px'}}>
        📄 {t('previousPapers') || 'Previous Year Question Papers'}
      </h2>
      <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
        {papers.map((paper) => (
          <a
            key={paper.id}
            href={paper.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px',
              padding:'14px 16px', borderRadius:'10px', border:'1px solid var(--color-border)',
              background:'var(--color-paper)', textDecoration:'none'
            }}
          >
            <div>
              <div style={{fontSize:'14px', fontWeight:'600', color:'var(--color-ink)'}}>{paper.title}</div>
              <div style={{fontSize:'12px', color:'var(--color-muted)', marginTop:'2px'}}>
                {paper.exam_year} {paper.paper_type ? `· ${paper.paper_type}` : ''} {paper.language ? `· ${paper.language}` : ''}
              </div>
            </div>
            <span style={{fontSize:'13px', fontWeight:'700', color:'var(--color-amber-dark)', whiteSpace:'nowrap'}}>
              View PDF →
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}