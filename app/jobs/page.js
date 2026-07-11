'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function AllJobs({ searchParams }) {
  const resolvedParams = use(searchParams)
  const categoryFromUrl = resolvedParams?.category || null

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl)

useEffect(() => {
  fetchJobs(categoryFromUrl)
}, [categoryFromUrl])

  async function fetchJobs(categoryFilter) {
    setLoading(true)
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (categoryFilter) {
      query = query.eq('category', categoryFilter)
    }

    const { data, error } = await query
    if (error) console.error(error)
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

  const categories = [
  { name: '🏛️ Govt Jobs', slug: 'government' },
  { name: '🏦 Banking',   slug: 'banking' },
  { name: '🚂 Railway',   slug: 'railway' },
  { name: '💻 IT Jobs',   slug: 'it-software' },
  { name: '🛡️ Defence',  slug: 'defence' },
  { name: '📚 Teaching',  slug: 'teaching' },
  { name: '💼 Private',   slug: 'private' },
]

  return (
    <div style={{maxWidth:'900px', margin:'0 auto', padding:'24px 16px'}}>
      <h1 style={{fontSize:'26px', fontWeight:'bold', color:'#111827', marginBottom:'6px'}}>All Job Openings</h1>
      <p style={{color:'#6b7280', fontSize:'14px', marginBottom:'20px'}}>Browse latest govt and private jobs across India</p>

      {/* SEARCH */}
      <div style={{display:'flex', gap:'8px', marginBottom:'20px'}}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search by job title..."
          style={{flex:1, padding:'10px 14px', borderRadius:'8px', border:'1.5px solid #e5e7eb', fontSize:'14px'}}
        />
        <button onClick={handleSearch}
          style={{padding:'10px 20px', background:'#1a56db', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500'}}>
          Search
        </button>
      </div>

      {/* CATEGORY BUTTONS */}
      <div style={{display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'24px'}}>
        <button onClick={() => { setActiveCategory(null); fetchJobs(null) }}
          style={{padding:'7px 16px', borderRadius:'20px', border:'1.5px solid #6b7280', background: activeCategory===null ? '#6b7280' : 'white', color: activeCategory===null ? 'white' : '#374151', cursor:'pointer', fontSize:'13px'}}>
          All Jobs
        </button>
        {categories.map(c => (
          <button key={c.slug} onClick={() => { setActiveCategory(c.slug); fetchJobs(c.slug) }}
            style={{padding:'7px 16px', borderRadius:'20px', border:'1.5px solid #1a56db', background: activeCategory===c.slug ? '#1a56db' : 'white', color: activeCategory===c.slug ? 'white' : '#1a56db', cursor:'pointer', fontSize:'13px', fontWeight:'500'}}>
            {c.name}
          </button>
        ))}
      </div>

      {!loading && <p style={{fontSize:'13px', color:'#6b7280', marginBottom:'12px'}}>Showing {jobs.length} jobs</p>}

      {/* JOB CARDS */}
      {loading ? (
        <p style={{textAlign:'center', color:'#6b7280', padding:'60px'}}>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p style={{textAlign:'center', color:'#6b7280', padding:'60px'}}>No jobs found in this category yet.</p>
      ) : (
        jobs.map(job => (
          <div key={job.id} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'12px', padding:'20px', marginBottom:'12px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'8px'}}>
              <div>
                {job.is_featured && (
                  <span style={{background:'#fef3c7', color:'#92400e', fontSize:'11px', padding:'2px 8px', borderRadius:'20px', fontWeight:'500', marginBottom:'6px', display:'inline-block'}}>⭐ Featured</span>
                )}
                <h3 style={{fontSize:'16px', fontWeight:'bold', color:'#111827', margin:'4px 0'}}>{job.title}</h3>
                <p style={{color:'#4b5563', fontSize:'14px', margin:'2px 0'}}>🏢 {job.company}</p>
                <p style={{color:'#6b7280', fontSize:'13px', margin:'2px 0'}}>📍 {job.location} &nbsp;|&nbsp; 💰 {job.salary}</p>
              </div>
              <span style={{background:'#eff6ff', color:'#1d4ed8', fontSize:'12px', padding:'4px 10px', borderRadius:'20px', fontWeight:'500', whiteSpace:'nowrap'}}>
                {job.category}
              </span>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'14px', flexWrap:'wrap', gap:'8px'}}>
              <span style={{fontSize:'12px', color:'#ef4444', fontWeight:'500'}}>⏰ Last Date: {job.last_date}</span>
              <Link href={`/jobs/${job.id}`}
                style={{background:'#1a56db', color:'white', padding:'8px 18px', borderRadius:'8px', textDecoration:'none', fontSize:'13px', fontWeight:'500'}}>
                View Details →
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  )
}