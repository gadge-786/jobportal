'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchJobs() }, [])

  async function fetchJobs() {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10)
    setJobs(data || [])
    setLoading(false)
  }

  async function handleSearch() {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .ilike('title', `%${search}%`)
      .eq('is_active', true)
    setJobs(data || [])
    setLoading(false)
  }

   // Find this array in your page.js and replace it with this:
  const categories = [
  { name: '🏛️ Govt Jobs', slug: 'government' },
  { name: '🏦 Banking',   slug: 'banking' },
  { name: '🏛️ DCC Bank', slug: 'dcc-bank' },
  { name: '🚂 Railway',   slug: 'railway' },
  { name: '💻 IT Jobs',   slug: 'it-software' },
  { name: '🛡️ Defence',  slug: 'defence' },
  { name: '📚 Teaching',  slug: 'teaching' },
  { name: '💼 Private',   slug: 'private' },
]

  async function filterByCategory(cat) {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('category', cat)
      .eq('is_active', true)
    setJobs(data || [])
    setLoading(false)
  }

  return (
    <div style={{maxWidth:'900px', margin:'0 auto', padding:'24px 16px'}}>

      {/* HERO SECTION */}
      <div style={{textAlign:'center', padding:'40px 20px', background:'linear-gradient(135deg,#1a56db,#0ea5e9)', borderRadius:'16px', marginBottom:'28px', color:'white'}}>
        <h1 style={{fontSize:'32px', fontWeight:'bold', margin:'0 0 8px'}}>Find Your Dream Job</h1>
        <p style={{fontSize:'16px', opacity:0.9, marginBottom:'24px'}}>Latest Govt, Banking, Railway & Private Jobs in India</p>
        <div style={{display:'flex', gap:'8px', maxWidth:'500px', margin:'0 auto'}}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key==='Enter' && handleSearch()}
            placeholder="Search jobs e.g. SSC, SBI, Railway..."
            style={{flex:1, padding:'12px 16px', borderRadius:'8px', border:'none', fontSize:'15px'}}
          />
          <button onClick={handleSearch} style={{padding:'12px 20px', background:'#f59e0b', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', fontSize:'15px'}}>
            Search
          </button>
        </div>
      </div>

      {/* CATEGORY BUTTONS */}
      <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'24px', justifyContent:'center'}}>
        {categories.map(c => (
          <button key={c.slug} onClick={() => filterByCategory(c.slug)}
            style={{padding:'8px 18px', borderRadius:'20px', border:'1.5px solid #1a56db', background:'white', color:'#1a56db', cursor:'pointer', fontWeight:'500', fontSize:'13px'}}>
            {c.name}
          </button>
        ))}
        <button onClick={fetchJobs}
          style={{padding:'8px 18px', borderRadius:'20px', border:'1.5px solid #6b7280', background:'white', color:'#6b7280', cursor:'pointer', fontSize:'13px'}}>
          Show All
        </button>
      </div>

      {/* JOB LISTINGS */}
      <h2 style={{fontSize:'20px', fontWeight:'bold', marginBottom:'16px', color:'#111827'}}>
        Latest Job Openings
      </h2>

      {loading ? (
        <p style={{textAlign:'center', color:'#6b7280', padding:'40px'}}>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p style={{textAlign:'center', color:'#6b7280', padding:'40px'}}>No jobs found.</p>
      ) : (
        jobs.map(job => (
          <div key={job.id} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px', marginBottom:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'8px'}}>
              <div>
                {job.is_featured && <span style={{background:'#fef3c7', color:'#92400e', fontSize:'11px', padding:'2px 8px', borderRadius:'20px', fontWeight:'500', marginBottom:'6px', display:'inline-block'}}>⭐ Featured</span>}
                <h3 style={{fontSize:'17px', fontWeight:'bold', color:'#111827', margin:'4px 0'}}>{job.title}</h3>
                <p style={{color:'#4b5563', fontSize:'14px', margin:'2px 0'}}>🏢 {job.company}</p>
                <p style={{color:'#6b7280', fontSize:'13px', margin:'2px 0'}}>📍 {job.location}  |  💰 {job.salary}</p>
              </div>
              <span style={{background:'#eff6ff', color:'#1d4ed8', fontSize:'12px', padding:'4px 10px', borderRadius:'20px', fontWeight:'500', whiteSpace:'nowrap'}}>
                {job.category}
              </span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'14px', flexWrap:'wrap', gap:'8px'}}>
              <span style={{fontSize:'12px', color:'#ef4444', fontWeight:'500'}}>⏰ Last Date: {job.last_date}</span>
              <Link href={`/jobs/${job.id}`} style={{background:'#1a56db', color:'white', padding:'8px 18px', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'500'}}>
                View Details →
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  )
}