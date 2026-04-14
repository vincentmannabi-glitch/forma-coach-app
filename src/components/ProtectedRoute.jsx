import { useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) navigate('/', { replace: true })
  }, [loading, user, navigate])

  if (loading || !user) {
    return (
      <div className="auth-guard-loading">
        <div className="auth-guard-spinner" />
      </div>
    )
  }

  return <Outlet />
}
