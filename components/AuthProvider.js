'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

const REDIRECT_KEY = 'post_auth_redirect'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // After Google sign-in the browser comes back to the home page; send the user back to the
    // page (including its ?query) where they pressed Sign in / Save.
    function checkPendingRedirect() {
      if (typeof window === 'undefined') return
      let pending = null
      try {
        pending = sessionStorage.getItem(REDIRECT_KEY)
        if (pending) sessionStorage.removeItem(REDIRECT_KEY)
      } catch {}
      // only ever go to a path on this site
      if (pending && pending.startsWith('/') && !pending.startsWith('//')) {
        const here = window.location.pathname + window.location.search
        if (here !== pending) router.replace(pending)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
      setLoading(false)
      checkPendingRedirect()
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (event === 'SIGNED_IN') {
        checkPendingRedirect()
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [router])

  async function signInWithGoogle() {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.setItem(REDIRECT_KEY, window.location.pathname + window.location.search)
    } catch {}
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) console.error('[auth] Google sign-in failed:', error.message)
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}