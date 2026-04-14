import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { login } from '../utils/auth'
import './Signup.css'

export default function Login() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    const result = await login(email, password)
    setLoading(false)

    if (result.ok) {
      refreshProfile()
      if (result.onboarding_complete) navigate('/home', { replace: true })
      else navigate('/onboarding', { replace: true })
    } else {
      setMessage({ type: 'error', text: result.error || 'Something went wrong' })
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <header className="signup-header">
          <h1 className="signup-logo">FORMA Coach</h1>
          <p className="signup-tagline">The trainer you always deserved</p>
        </header>

        <div className="signup-card">
          <form onSubmit={handleLogin} className="signup-form">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {message.text && (
              <div className={`form-message ${message.type}`}>{message.text}</div>
            )}

            <button type="submit" className="btn-continue" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
