'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 1. Move function inside useEffect to fix both ESLint bugs safely
    function checkPendingRedirect() {
      if (typeof window === 'undefined') return // Prevents Next.js server-side crashes
      
      const pending = sessionStorage.getItem('post_auth_redirect')
      if (pending) {
        sessionStorage.removeItem('post_auth_redirect')
        if (window.location.pathname !== pending) {
          router.replace(pending)
        }
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
  }, [router]) // Added router as a required safe Next.js dependency

  async function signInWithGoogle() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('post_auth_redirect', window.location.pathname)
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
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