'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Leaderboard({ examId, highlightAttemptId, currentScore, currentTime }) {
  const [attempts, setAttempts] = useState([])
  const [myRank, setMyRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .not('user_id', 'is', null)
        .order('score', { ascending: false })
        .order('time_taken_seconds', { ascending: true })
        .limit(50)

      setAttempts(data || [])

      const inList = (data || []).some(a => a.id === highlightAttemptId)
      if (highlightAttemptId && !inList && currentScore != null) {
        const { count } = await supabase
          .from('exam_attempts')
          .select('id', { count: 'exact', head: true })
          .eq('exam_id', examId)
          .not('user_id', 'is', null)
          .or(`score.gt.${currentScore},and(score.eq.${currentScore},time_taken_seconds.lt.${currentTime || 999999})`)
        setMyRank((count || 0) + 1)
      }

      setLoading(false)
    }
    fetchLeaderboard()
  }, [examId, highlightAttemptId, currentScore, currentTime])

  if (loading) return <p style={{textAlign:'center', color:'var(--color-muted)', fontSize:'13px', padding:'20px 0'}}>Loading leaderboard...</p>
  if (attempts.length === 0) return <p style={{textAlign:'center', color:'var(--color-muted)', fontSize:'13px', padding:'20px 0'}}>No leaderboard entries yet. Sign in to be the first!</p>

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div style={{display:'flex', flexDirection:'column', gap:'8px', maxHeight:'420px', overflowY:'auto'}}>
        {attempts.map((a, idx) => {
          const isMe = a.id === highlightAttemptId
          return (
            <div key={a.id} style={{
              display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'10px',
              background: isMe ? '#eff6ff' : (idx < 3 ? '#fdf6ea' : 'var(--color-paper)'),
              border: isMe ? '2px solid var(--color-ink)' : '2px solid transparent'
            }}>
              <span style={{width:'28px', textAlign:'center', fontSize:'14px', fontWeight:'bold', color:'var(--color-muted)'}}>
                {medals[idx] || idx + 1}
              </span>
              {a.user_photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.user_photo} alt="" style={{width:'28px', height:'28px', borderRadius:'50%'}} />
              )}
              <span style={{flex:1, fontSize:'13px', fontWeight:isMe ? '700' : '500', color:'var(--color-ink)'}}>
                {a.candidate_name}{isMe ? ' (You)' : ''}
              </span>
              <span style={{fontSize:'13px', fontWeight:'bold', color:'var(--color-amber-dark)'}}>{Number(a.score).toFixed(2)}</span>
            </div>
          )
        })}
      </div>
      {myRank && (
        <div style={{marginTop:'12px', padding:'10px 14px', background:'var(--color-ink)', border:'none', borderRadius:'10px', fontSize:'13px', color:'var(--color-amber)', fontWeight:'700', textAlign:'center'}}>
          Your Rank: #{myRank}
        </div>
      )}
    </div>
  )
}