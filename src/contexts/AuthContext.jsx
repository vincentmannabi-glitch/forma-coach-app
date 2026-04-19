import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getSessionSync, getSession, onAuthChanged } from '../utils/auth'

/** Normalize profile to app user shape — never null when a session exists. */
function normalizeProfile(profile, email, id) {
  const base = profile && typeof profile === 'object' ? { ...profile } : {}
  const pid = base.id ?? id ?? 'forma_local_user'
  const dem = base.email ?? email ?? ''
  const name =
    typeof base.name === 'string' && base.name.trim() ? base.name.trim() : 'Friend'
  const goal =
    base.goal != null && String(base.goal).trim()
      ? String(base.goal).trim()
      : 'general fitness'
  const dpw = Number(base.days_per_week)
  const days_per_week = Number.isFinite(dpw) && dpw > 0 ? dpw : 3
  return {
    ...base,
    id: pid,
    email: dem,
    name,
    goal,
    days_per_week,
    body_weight: base.bodyweight ?? base.body_weight,
  }
}

const AuthContext = createContext({ user: null, profile: null, loading: false })

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    const session = getSessionSync()
    return {
      user: session?.user ?? null,
      profile: session ? normalizeProfile(session.profile, session.user?.email, session.user?.id) : null,
      loading: false,
    }
  })

  const refreshProfile = useCallback(() => {
    const session = getSessionSync()
    setState({
      user: session?.user ?? null,
      profile: session ? normalizeProfile(session.profile, session.user?.email, session.user?.id) : null,
      loading: false,
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const session = await getSession()
      if (cancelled) return
      setState({
        user: session?.user ?? null,
        profile: session ? normalizeProfile(session.profile, session.user?.email, session.user?.id) : null,
        loading: false,
      })
    })()

    const unsubscribe = onAuthChanged(() => {
      const session = getSessionSync()
      setState({
        user: session?.user ?? null,
        profile: session ? normalizeProfile(session.profile, session.user?.email, session.user?.id) : null,
        loading: false,
      })
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Current user (profile) for use in components. Same as useAuth().profile */
export function useCurrentUser() {
  return useAuth().profile
}
