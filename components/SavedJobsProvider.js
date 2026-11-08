'use client'
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

const Ctx = createContext({ savedIds: new Set(), count: 0, ready: false, isSaved: () => false, toggle: async () => {} })

const PENDING_KEY = 'pending_save_job'

export function SavedJobsProvider({ children }) {
  const { user, signInWithGoogle } = useAuth()
  const [savedIds, setSavedIds] = useState(() => new Set())
  const [ready, setReady] = useState(false)
  const userId = user?.id || null
  const busy = useRef(new Set())

  // Load this user's saved ids; finish a save that was started before sign-in.
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!userId) { setSavedIds(new Set()); setReady(true); return }
      let pending = null
      try { pending = sessionStorage.getItem(PENDING_KEY); sessionStorage.removeItem(PENDING_KEY) } catch {}
      if (pending) {
        await supabase.from('saved_jobs').upsert({ user_id: userId, job_id: pending }, { onConflict: 'user_id,job_id', ignoreDuplicates: true })
      }
      const { data, error } = await supabase.from('saved_jobs').select('job_id').eq('user_id', userId)
      if (cancelled) return
      if (!error) setSavedIds(new Set((data || []).map(r => r.job_id)))
      setReady(true)
    }
    load()
    return () => { cancelled = true }
  }, [userId])

  const toggle = useCallback(async (jobId) => {
    if (!jobId) return { ok: false }
    if (!userId) {
      try { sessionStorage.setItem(PENDING_KEY, String(jobId)) } catch {}
      await signInWithGoogle()
      return { ok: false, needsLogin: true }
    }
    if (busy.current.has(jobId)) return { ok: false }
    busy.current.add(jobId)
    const wasSaved = savedIds.has(jobId)
    // optimistic update, rolled back if the database refuses
    setSavedIds(prev => { const n = new Set(prev); wasSaved ? n.delete(jobId) : n.add(jobId); return n })
    const { error } = wasSaved
      ? await supabase.from('saved_jobs').delete().eq('user_id', userId).eq('job_id', jobId)
      : await supabase.from('saved_jobs').upsert({ user_id: userId, job_id: jobId }, { onConflict: 'user_id,job_id', ignoreDuplicates: true })
    busy.current.delete(jobId)
    if (error) {
      setSavedIds(prev => { const n = new Set(prev); wasSaved ? n.add(jobId) : n.delete(jobId); return n })
      return { ok: false, error }
    }
    return { ok: true, saved: !wasSaved }
  }, [userId, savedIds, signInWithGoogle])

  const isSaved = useCallback((id) => savedIds.has(id), [savedIds])

  return <Ctx.Provider value={{ savedIds, count: savedIds.size, ready, isSaved, toggle }}>{children}</Ctx.Provider>
}

export const useSavedJobs = () => useContext(Ctx)