import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute() {
  const navigate = useNavigate()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/', { replace: true })
      return
    }
    // If onboarding not complete, send them there
    if (profile && !profile.onboarding_complete) {
      navigate('/onboarding', { replace: true })
    }
  }, [loading, user, profile, navigate])

  if (loading || !user) {
    return (
      <div className="auth-guard-loading">
        <div className="auth-guard-spinner" />
      </div>
    )
  }

  return <Outlet />
}
