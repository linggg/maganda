import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recoveryMode, setRecoveryMode] = useState(false)

  useEffect(() => {
    // Check synchronously before any async work — hash is cleared by Supabase after getSession resolves
    const isPasswordRecovery = window.location.hash.includes('type=recovery')

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isPasswordRecovery) {
        // Skip normal auth flow entirely — onAuthStateChange(PASSWORD_RECOVERY) owns this path
        return
      }
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setRecoveryMode(true)
          setUser(session?.user ?? null)
          setLoading(false)
          return
        }
        setUser(session?.user ?? null)
        if (session?.user) {
          setLoading(true)
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setProfile(data)
  } catch (err) {
    console.error('Profile fetch error:', err)
  } finally {
    setLoading(false)
  }
}

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  function clearRecoveryMode() {
    setRecoveryMode(false)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, recoveryMode, clearRecoveryMode, signUp, signIn, signOut, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}