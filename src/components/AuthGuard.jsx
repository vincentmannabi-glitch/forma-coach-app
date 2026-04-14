import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Wraps Signup/Login. Logged-in users always go to /home so login and this guard stay aligned.
 */
export default function AuthGuard({ children }) {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) return
    navigate('/home', { replace: true })
  }, [loading, user, navigate])

  if (loading) {
    return (
      <div className="auth-guard-loading">
        <div className="auth-guard-spinner" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="auth-guard-loading">
        <div className="auth-guard-spinner" />
      </div>
    )
  }

  return children
}
