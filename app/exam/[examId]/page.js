'use client'
import { useEffect, useState, use, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../components/AuthProvider'
import Leaderboard from '../../../components/LeaderBoard'

export default function ExamPage({ params }) {
  const { examId } = use(params)
  const { user, signInWithGoogle } = useAuth()
  const [stage, setStage] = useState('loading')
  const [examData, setExamData] = useState(null)
  const [candidateName, setCandidateName] = useState('')
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [result, setResult] = useState(null)
  const [review, setReview] = useState([])
  const [attemptId, setAttemptId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showLeaderboardPreview, setShowLeaderboardPreview] = useState(false)
  const [showReview, setShowReview] = useState(false)

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
        candidateName: user?.user_metadata?.full_name || candidateName || 'Anonymous',
        userId: user?.id || null,
        userEmail: user?.email || null,
        userPhoto: user?.user_metadata?.avatar_url || null,
        answers,
        timeTakenSeconds: timeTaken
      })
    })
    const data = await res.json()
    setResult(data.result)
    setReview(data.review || [])
    setAttemptId(data.attemptId)
    setStage('result')
    setSubmitting(false)
  }, [examId, candidateName, answers, startTime, submitting, user])

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
  return <div style={{textAlign:'center', padding:'80px', color:'var(--color-muted)'}}>Loading exam...</div>
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
      <div style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderRadius:'18px', padding:'32px'}}>
        <span style={{display:'inline-block', background:'#fdf6ea', color:'var(--color-amber-dark)', fontSize:'11px', fontWeight:'700', letterSpacing:'0.05em', padding:'4px 12px', borderRadius:'20px', marginBottom:'12px'}}>MOCK TEST</span>
        <h1 style={{fontFamily:'var(--font-heading)', fontSize:'21px', fontWeight:'700', color:'var(--color-ink)', marginBottom:'8px'}}>{examData.exam.title}</h1>
        {examData.exam.instructions && (
        <p style={{color:'var(--color-muted)', fontSize:'14px', marginBottom:'20px'}}>{examData.exam.instructions}</p>
        )}
        <div style={{background:'var(--color-paper)', borderRadius:'12px', padding:'16px', marginBottom:'20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
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

          {user ? (
            <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'10px', padding:'12px 16px', marginBottom:'20px'}}>
              {user.user_metadata?.avatar_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.user_metadata.avatar_url} alt="" style={{width:'32px', height:'32px', borderRadius:'50%'}} />
              )}
              <div>
                <div style={{fontSize:'13px', fontWeight:'600', color:'#166534'}}>{user.user_metadata?.full_name || user.email}</div>
                <div style={{fontSize:'11px', color:'#16a34a'}}>✓ Signed in — this attempt will appear on the leaderboard</div>
              </div>
            </div>
          ) : (
            <div style={{background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'10px', padding:'14px 16px', marginBottom:'20px'}}>
              <p style={{fontSize:'13px', color:'#6b7280', marginBottom:'10px'}}>Sign in to appear on the leaderboard (optional)</p>
              <button
                onClick={signInWithGoogle}
                style={{width:'100%', padding:'10px', background:'white', border:'1px solid #d1d5db', borderRadius:'8px', fontSize:'13px', fontWeight:'500', color:'#374151', cursor:'pointer'}}
              >
                Sign in with Google
              </button>
              <input
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                placeholder="Or just enter your name to continue as guest"
                style={{width:'100%', padding:'10px 14px', borderRadius:'8px', border:'1px solid #e5e7eb', fontSize:'13px', marginTop:'10px', boxSizing:'border-box', color:'#111827'}}
              />
            </div>
          )}

        <button
        onClick={startTest}
        style={{width:'100%', padding:'14px', background:'var(--color-amber)', color:'var(--color-ink)', border:'none', borderRadius:'10px', fontWeight:'700', fontSize:'16px', cursor:'pointer', marginBottom:'12px'}}
        >
        Start Test
        </button>

        <button
        onClick={() => setShowLeaderboardPreview(prev => !prev)}
        style={{width:'100%', padding:'10px', background:'white', color:'var(--color-ink)', border:'1px solid var(--color-ink)', borderRadius:'10px', fontWeight:'600', fontSize:'13px', cursor:'pointer'}}
        >
            {showLeaderboardPreview ? 'Hide Leaderboard' : '🏆 View Leaderboard'}
          </button>

          {showLeaderboardPreview && (
            <div style={{marginTop:'16px'}}>
              <Leaderboard examId={examId} />
            </div>
          )}
        </div>
      </div>
    )
  }

  if (stage === 'testing') {
    const question = examData.questions[currentIndex]
    const answeredCount = Object.keys(answers).length

    return (
      <div style={{maxWidth:'700px', margin:'0 auto', padding:'20px 16px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--color-ink)', borderRadius:'12px', padding:'14px 20px', marginBottom:'16px', position:'sticky', top:'10px', zIndex:10}}>
  <span style={{fontSize:'13px', color:'#C7CBE8'}}>Question {currentIndex + 1} of {examData.questions.length}</span>
  <span style={{fontSize:'16px', fontWeight:'bold', color: timeLeft < 60 ? '#ff8a80' : 'var(--color-amber)'}}>⏱ {formatTime(timeLeft)}</span>
</div>

        <div style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderRadius:'16px', padding:'24px', marginBottom:'16px'}}>
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
                  border: isSelected ? '2px solid var(--color-ink)' : '1px solid var(--color-border)',
                  background: isSelected ? '#f0f1f8' : 'white'
                }}
              >
                <div style={{
                  width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'12px', fontWeight:'bold', flexShrink:0, marginTop:'1px',
                  background: isSelected ? 'var(--color-ink)' : '#f3f4f6',
                  color: isSelected ? 'white' : 'var(--color-muted)'
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
  style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid var(--color-border)', background:'white', color:'var(--color-ink)', fontWeight:'600', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.5 : 1}}
>
  ← Previous
</button>
{currentIndex < examData.questions.length - 1 ? (
  <button
    onClick={() => setCurrentIndex(i => Math.min(examData.questions.length - 1, i + 1))}
    style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background:'var(--color-ink)', color:'white', fontWeight:'600', cursor:'pointer'}}
  >
    Next →
  </button>
) : (
  <button
    onClick={() => submitExam()}
    disabled={submitting}
    style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background:'var(--color-success)', color:'white', fontWeight:'600', cursor:'pointer'}}
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
              width:'32px', height:'32px', borderRadius:'8px', border: idx === currentIndex ? '2px solid var(--color-ink)' : '1px solid var(--color-border)',
              background: answers[q.id] ? '#dcfce7' : 'white',
              color: 'var(--color-ink)', fontSize:'12px', fontWeight:'600', cursor:'pointer'
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
      <div style={{maxWidth:'700px', margin:'0 auto', padding:'40px 16px'}}>
        <div style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderRadius:'18px', padding:'32px', textAlign:'center', marginBottom:'20px'}}>
         <h1 style={{fontFamily:'var(--font-heading)', fontSize:'19px', fontWeight:'700', color:'var(--color-ink)', marginBottom:'6px'}}>Test Completed</h1>
         <div style={{fontFamily:'var(--font-heading)', fontSize:'48px', fontWeight:'700', color:'var(--color-amber-dark)', margin:'20px 0'}}>{result.score.toFixed(2)}</div>
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
            style={{flex:1, padding:'12px', borderRadius:'10px', border:'none', background:'var(--color-ink)', color:'white', fontWeight:'600', cursor:'pointer'}}
            >
           Retake Test
          </button>
          <Link href="/" style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid var(--color-border)', background:'white', color:'var(--color-ink)', fontWeight:'600', textDecoration:'none', textAlign:'center'}}>
          Back to Home
          </Link>
          </div>
        </div>

        <div style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderRadius:'18px', padding:'24px', marginBottom:'20px'}}>
        <h2 style={{fontFamily:'var(--font-heading)', fontSize:'16px', fontWeight:'700', color:'var(--color-ink)', marginBottom:'16px'}}>🏆 Leaderboard</h2>
          <Leaderboard examId={examId} highlightAttemptId={attemptId} currentScore={result.score} currentTime={null} />
        </div>

         <div style={{background:'var(--color-card)', border:'1px solid var(--color-border)', borderRadius:'18px', padding:'24px'}}>
          <button
            onClick={() => setShowReview(prev => !prev)}
            style={{width:'100%', padding:'12px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'10px', fontWeight:'600', fontSize:'14px', color:'#111827', cursor:'pointer'}}
          >
            {showReview ? 'Hide Answer Review' : '📋 Review Your Answers'}
          </button>

          {showReview && (
            <div style={{marginTop:'20px', display:'flex', flexDirection:'column', gap:'16px'}}>
              {review.map((q, idx) => (
                <div key={q.id} style={{borderLeft: `4px solid ${q.status === 'correct' ? '#16a34a' : q.status === 'wrong' ? '#ef4444' : '#d1d5db'}`, paddingLeft:'14px'}}>
                  <p style={{fontSize:'13px', fontWeight:'600', color:'#111827', marginBottom:'2px'}}>
                    Q{idx + 1}. {q.question_text}
                  </p>
                  {q.question_text_mr && (
                    <p style={{fontSize:'12px', color:'#6b7280', marginBottom:'8px'}}>{q.question_text_mr}</p>
                  )}
                  <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const text = q[`option_${opt.toLowerCase()}`]
                      const isCorrect = q.correct_option === opt
                      const isGiven = q.given_answer === opt
                      let bg = 'transparent'
                      let color = '#6b7280'
                      if (isCorrect) { bg = '#dcfce7'; color = '#166534' }
                      if (isGiven && !isCorrect) { bg = '#fee2e2'; color = '#991b1b' }
                      return (
                        <div key={opt} style={{fontSize:'12px', padding:'6px 10px', borderRadius:'6px', background:bg, color, fontWeight: (isCorrect || isGiven) ? '600' : '400'}}>
                          {opt}. {text} {isCorrect ? '✓ Correct Answer' : ''} {isGiven && !isCorrect ? '✗ Your Answer' : ''}
                        </div>
                      )
                    })}
                    {!q.given_answer && (
                      <div style={{fontSize:'11px', color:'#9ca3af', marginTop:'2px'}}>Not attempted</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}