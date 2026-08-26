'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLanguage } from './LanguageProvider'

export default function JobQA({ jobId }) {
  const { t } = useLanguage()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true)
      const { data } = await supabase
        .from('job_questions')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
      setQuestions(data || [])
      setLoading(false)
    }
    fetchQuestions()
  }, [jobId])

  async function handleSubmit() {
    if (!question.trim()) return
    setSubmitting(true)
    const { data, error } = await supabase
      .from('job_questions')
      .insert({
        job_id: jobId,
        asker_name: name.trim() || 'Anonymous',
        question: question.trim()
      })
      .select()
      .single()

    if (!error && data) {
      setSubmitted(true)
      setQuestion('')
      setName('')
      setQuestions(prev => [data, ...prev])
      setTimeout(() => setSubmitted(false), 4000)
    }
    setSubmitting(false)
  }

  return (
    <div style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderRadius:'16px', padding:'24px', marginBottom:'16px'}}>
      <h2 style={{fontFamily:'var(--font-heading)', fontSize:'16px', fontWeight:'700', color:'var(--color-ink)', marginBottom:'4px'}}>💬 {t('askQuestion')}</h2>
      <p style={{fontSize:'13px', color:'var(--color-muted)', marginBottom:'18px'}}>{t('askSubtitle')}</p>

      <div style={{background:'var(--color-paper)', border:'1px dashed var(--color-border)', borderRadius:'12px', padding:'16px', marginBottom:'20px'}}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('yourName')}
          style={{width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid var(--color-border)', fontSize:'14px', marginBottom:'10px', boxSizing:'border-box', color:'var(--color-ink)', background:'white', fontFamily:'var(--font-body)'}}
        />
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder={t('yourQuestion')}
          rows={3}
          style={{width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid var(--color-border)', fontSize:'14px', marginBottom:'10px', boxSizing:'border-box', fontFamily:'var(--font-body)', resize:'vertical', color:'var(--color-ink)', background:'white'}}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !question.trim()}
          style={{
            padding:'10px 24px', borderRadius:'8px', border:'none',
            background: submitting || !question.trim() ? '#d1d5db' : 'var(--color-amber)',
            color: submitting || !question.trim() ? 'white' : 'var(--color-ink)', fontWeight:'700', fontSize:'14px',
            cursor: submitting || !question.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? t('submitting') : t('submitQuestion')}
        </button>
        {submitted && (
          <p style={{color:'var(--color-success)', fontSize:'13px', marginTop:'10px', marginBottom:0}}>✓ {t('questionSubmitted')}</p>
        )}
      </div>

      {loading ? null : questions.length === 0 ? (
        <p style={{color:'var(--color-muted)', fontSize:'13px', textAlign:'center', padding:'12px 0'}}>{t('noQuestionsYet')}</p>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
          {questions.map((q) => (
            <div key={q.id} style={{borderLeft:'3px solid var(--color-amber)', paddingLeft:'14px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'8px'}}>
                <p style={{fontSize:'14px', color:'var(--color-ink)', fontWeight:'600', margin:0}}>
                  {q.asker_name}: {q.question}
                </p>
                <span style={{
                  fontSize:'11px', fontWeight:'700', padding:'2px 10px', borderRadius:'20px', whiteSpace:'nowrap', flexShrink:0,
                  background: q.answer ? '#dcfce7' : '#fef3c7',
                  color: q.answer ? 'var(--color-success)' : '#92400e'
                }}>
                  {q.answer ? t('answered') : t('awaitingAnswer')}
                </span>
              </div>
              {q.answer && (
                <p style={{fontSize:'13px', color:'var(--color-muted)', marginTop:'6px', marginBottom:0, background:'var(--color-paper)', padding:'10px 12px', borderRadius:'8px'}}>
                  {q.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}