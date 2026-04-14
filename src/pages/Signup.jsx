import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { signUp } from '../utils/auth'
import './Signup.css'

export default function Signup() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    const result = await signUp(email, password)
    setLoading(false)

    if (result.ok) {
      refreshProfile()
      navigate('/onboarding', { replace: true })
    } else {
      setMessage({ type: 'error', text: result.error || 'Something went wrong' })
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Logo & Tagline */}
        <header className="signup-header">
          <h1 className="signup-logo">FORMA Coach</h1>
          <p className="signup-tagline">The trainer you always deserved</p>
        </header>

        {/* Form Card */}
        <div className="signup-card">
          <form onSubmit={handleSignup} className="signup-form">
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
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {message.text && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="btn-continue"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Continue'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
