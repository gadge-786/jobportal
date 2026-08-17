'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Leaderboard({ examId }) {
  const [attempts, setAttempts] = useState([])
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
        .limit(20)
      setAttempts(data || [])
      setLoading(false)
    }
    fetchLeaderboard()
  }, [examId])

  if (loading) return null
  if (attempts.length === 0) return null

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'16px', padding:'24px', marginTop:'20px'}}>
      <h2 style={{fontSize:'17px', fontWeight:'bold', color:'#111827', marginBottom:'16px'}}>🏆 Leaderboard</h2>
      <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
        {attempts.map((a, idx) => (
          <div key={a.id} style={{display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', borderRadius:'10px', background: idx < 3 ? '#fffbeb' : '#f9fafb'}}>
            <span style={{width:'28px', textAlign:'center', fontSize:'14px', fontWeight:'bold', color:'#6b7280'}}>
              {medals[idx] || idx + 1}
            </span>
            {a.user_photo && (
              <img src={a.user_photo} alt="" style={{width:'28px', height:'28px', borderRadius:'50%'}} />
            )}
            <span style={{flex:1, fontSize:'13px', fontWeight:'500', color:'#111827'}}>{a.candidate_name}</span>
            <span style={{fontSize:'13px', fontWeight:'bold', color:'#1a56db'}}>{Number(a.score).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}