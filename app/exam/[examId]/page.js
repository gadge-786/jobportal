'use client'
import { useEffect, useState, use, useCallback } from 'react'
import Link from 'next/link'

export default function ExamPage({ params }) {
  const { examId } = use(params)
  const [stage, setStage] = useState('loading')
  const [examData, setExamData] = useState(null)
  const [candidateName, setCandidateName] = useState('')
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadExam() {
      const res = await fetch(`/api/exam/start?examId=${examId}`)
      const data = await res.json()
      if (data.error) {
        setStage('error')
        return
      }
      setExamData(data)
      setTimeLeft(data.exam.duration_minutes * 60)
      setStage('instructions')
    }
    loadExam()
  }, [examId])

  const submitExam = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0

    const res = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examId,
        candidateName: candidateName || 'Anonymous',
        answers,
        timeTakenSeconds: timeTaken
      })
    })
    const data = await res.json()
    setResult(data.result)
    setStage('result')
    setSubmitting(false)
  }, [examId, candidateName, answers, startTime, submitting])

  useEffect(() => {
    if (stage !== 'testing') return

    const timer = setInterval(() => {
    setTimeLeft(prev => {
  if (prev <= 1) {
    clearInterval(timer)
    submitExam()
    return 0
  }
  return prev - 1
  })
    }, 1000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  function startTest() {
    setStartTime(Date.now())
    setStage('testing')
  }

  function selectAnswer(questionId, option) {
    setAnswers(prev => ({ ...prev, [questionId]: option }))
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (stage === 'loading') {
    return <div style={{textAlign:'center', padding:'80px', color:'#6b7280'}}>Loading exam...</div>
  }

  if (stage === 'error') {
    return (
      <div style={{textAlign:'center', padding:'80px', color:'#6b7280'}}>
        <p>This exam is not available.</p>
        <Link href="/" style={{color:'#1a56db'}}>← Back to Home</Link>
      </div>
    )
  }

  if (stage === 'instructions') {
    return (
      <div style={{maxWidth:'600px', margin:'0 auto', padding:'40px 20px'}}>
        <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'16px', padding:'32px'}}>
          <h1 style={{fontSize:'22px', fontWeight:'bold', color:'#111827', marginBottom:'8px'}}>{examData.exam.title}</h1>
          {examData.exam.instructions && (
            <p style={{color:'#6b7280', fontSize:'14px', marginBottom:'20px'}}>{examData.exam.instructions}</p>
          )}
          <div style={{background:'#f9fafb', borderRadius:'10px', padding:'16px', marginBottom:'20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
            <div>
              <div style={{fontSize:'11px', color:'#6b7280'}}>Duration</div>
              <div style={{fontSize:'15px', fontWeight:'600', color:'#111827'}}>{examData.exam.duration_minutes} minutes</div>
            </div>
            <div>
              <div style={{fontSize:'11px', color:'#6b7280'}}>Questions</div>
              <div style={{fontSize:'15px', fontWeight:'600', color:'#111827'}}>{examData.questions.length}</div>
            </div>
            <div>
              <div style={{fontSize:'11px', color:'#6b7280'}}>Negative Marking</div>
              <div style={{fontSize:'15px', fontWeight:'600', color:'#111827'}}>
                {Number(examData.exam.negative_marking) > 0 ? `-${examData.exam.negative_marking} per wrong answer` : 'None'}
              </div>
            </div>
            <div>
              <div style={{fontSize:'11px', color:'#6b7280'}}>Attempts</div>
              <div style={{fontSize:'15px', fontWeight:'600', color:'#111827'}}>Unlimited</div>
            </div>
          </div>
          <input
            value={candidateName}
            onChange={e => setCandidateName(e.target.value)}
            placeholder="Your name (optional)"
            style={{width:'100%', padding:'12px 14px', borderRadius:'8px', border:'1px solid #e5e7eb', fontSize:'14px', marginBottom:'20px', boxSizing:'border-box', color:'#111827'}}
          />
          <button
            onClick={startTest}
            style={{width:'100%', padding:'14px', background:'#1a56db', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', fontSize:'16px', cursor:'pointer'}}
          >
            Start Test
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'testing') {
    const question = examData.questions[currentIndex]
    const answeredCount = Object.keys(answers).length

    return (
      <div style={{maxWidth:'700px', margin:'0 auto', padding:'20px 16px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', borderRadius:'12px', padding:'14px 20px', marginBottom:'16px', border:'1px solid #e5e7eb', position:'sticky', top:'10px', zIndex:10}}>
          <span style={{fontSize:'13px', color:'#6b7280'}}>Question {currentIndex + 1} of {examData.questions.length}</span>
          <span style={{fontSize:'16px', fontWeight:'bold', color: timeLeft < 60 ? '#ef4444' : '#111827'}}>⏱ {formatTime(timeLeft)}</span>
        </div>

        <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'16px', padding:'24px', marginBottom:'16px'}}>
  <p style={{fontSize:'15px', fontWeight:'600', color:'#111827', marginBottom: question.question_text_mr ? '4px' : '20px', lineHeight:'1.6'}}>
    {question.question_text}
  </p>
  {question.question_text_mr && (
    <p style={{fontSize:'14px', fontWeight:'500', color:'#6b7280', marginBottom:'20px', lineHeight:'1.6'}}>
      {question.question_text_mr}
    </p>
  )}
  {['A', 'B', 'C', 'D'].map(opt => {
    const optionText = question[`option_${opt.toLowerCase()}`]
    const optionTextMr = question[`option_${opt.toLowerCase()}_mr`]
    const isSelected = answers[question.id] === opt
    return (
      <div
        key={opt}
        onClick={() => selectAnswer(question.id, opt)}
        style={{
          display:'flex', alignItems:'flex-start', gap:'12px', padding:'12px 16px', borderRadius:'10px', marginBottom:'10px', cursor:'pointer',
          border: isSelected ? '2px solid #1a56db' : '1px solid #e5e7eb',
          background: isSelected ? '#eff6ff' : 'white'
        }}
      >
        <div style={{
          width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'12px', fontWeight:'bold', flexShrink:0, marginTop:'1px',
          background: isSelected ? '#1a56db' : '#f3f4f6',
          color: isSelected ? 'white' : '#6b7280'
        }}>
          {opt}
        </div>
        <div>
          <div style={{fontSize:'14px', color:'#111827'}}>{optionText}</div>
          {optionTextMr && (
            <div style={{fontSize:'13px', color:'#6b7280', marginTop:'2px'}}>{optionTextMr}</div>
          )}
        </div>
      </div>
    )
  })}
  </div>

        <div style={{display:'flex', gap:'10px', marginBottom:'16px'}}>
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #e5e7eb', background:'white', color:'#374151', fontWeight:'500', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.5 : 1}}
          >
            ← Previous
          </button>
          {currentIndex < examData.questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(i => Math.min(examData.questions.length - 1, i + 1))}
              style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background:'#1a56db', color:'white', fontWeight:'500', cursor:'pointer'}}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => submitExam()}
              disabled={submitting}
              style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background:'#16a34a', color:'white', fontWeight:'500', cursor:'pointer'}}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          )}
        </div>

        <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
          {examData.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width:'32px', height:'32px', borderRadius:'8px', border: idx === currentIndex ? '2px solid #1a56db' : '1px solid #e5e7eb',
                background: answers[q.id] ? '#dcfce7' : 'white',
                color: '#374151', fontSize:'12px', fontWeight:'500', cursor:'pointer'
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <p style={{fontSize:'12px', color:'#6b7280', marginTop:'10px'}}>Answered: {answeredCount} / {examData.questions.length}</p>
      </div>
    )
  }

  if (stage === 'result') {
    return (
      <div style={{maxWidth:'500px', margin:'0 auto', padding:'40px 20px'}}>
        <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'16px', padding:'32px', textAlign:'center'}}>
          <h1 style={{fontSize:'20px', fontWeight:'bold', color:'#111827', marginBottom:'6px'}}>Test Completed</h1>
          <div style={{fontSize:'48px', fontWeight:'bold', color:'#1a56db', margin:'20px 0'}}>{result.score.toFixed(2)}</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px', marginBottom:'24px'}}>
            <div style={{background:'#dcfce7', borderRadius:'10px', padding:'12px'}}>
              <div style={{fontSize:'20px', fontWeight:'bold', color:'#166534'}}>{result.correctCount}</div>
              <div style={{fontSize:'11px', color:'#166534'}}>Correct</div>
            </div>
            <div style={{background:'#fee2e2', borderRadius:'10px', padding:'12px'}}>
              <div style={{fontSize:'20px', fontWeight:'bold', color:'#991b1b'}}>{result.wrongCount}</div>
              <div style={{fontSize:'11px', color:'#991b1b'}}>Wrong</div>
            </div>
            <div style={{background:'#f3f4f6', borderRadius:'10px', padding:'12px'}}>
              <div style={{fontSize:'20px', fontWeight:'bold', color:'#374151'}}>{result.unattemptedCount}</div>
              <div style={{fontSize:'11px', color:'#374151'}}>Skipped</div>
            </div>
          </div>
          <div style={{display:'flex', gap:'10px'}}>
            <button
              onClick={() => window.location.reload()}
              style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background:'#1a56db', color:'white', fontWeight:'600', cursor:'pointer'}}
            >
              Retake Test
            </button>
            <Link href="/" style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #e5e7eb', background:'white', color:'#374151', fontWeight:'600', textDecoration:'none', textAlign:'center'}}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}