import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function isLocallyLoggedIn() {
  try {
    return localStorage.getItem('forma_logged_in') === 'true' &&
      Boolean(localStorage.getItem('forma_user'))
  } catch {
    return false
  }
}

export default function ProtectedRoute() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()

  // Use localStorage as fast fallback — prevents flicker redirect when
  // Supabase session hasn't resolved yet
  const locallyLoggedIn = isLocallyLoggedIn()
  const isAuthenticated = Boolean(user) || locallyLoggedIn

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      navigate('/', { replace: true })
      return
    }
    // If onboarding not complete, send them there
    if (profile && !profile.onboarding_complete) {
      navigate('/onboarding', { replace: true })
    }
  }, [loading, isAuthenticated, profile, navigate])

  if (loading || !isAuthenticated) {
    return (
      <div className="auth-guard-loading">
        <div className="auth-guard-spinner" />
      </div>
    )
  }

  return <Outlet />
}
