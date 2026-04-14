import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import ReengagementOverlay from './ReengagementOverlay'
import {
  evaluateReengagement,
  recordNormalAppVisit,
  setReengagementSessionPending,
} from '../utils/reengagement'
import './MainLayout.css'

const TABS = [
  { path: '/home', label: 'Home', icon: '⌂' },
  { path: '/train', label: 'Train', icon: '⚡' },
  { path: '/cookbook', label: 'Cookbook', icon: '🍳' },
  { path: '/progress', label: 'Progress', icon: '📈' },
  { path: '/chat', label: 'Chat', icon: '💬' },
]

export default function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [reengagementOpen, setReengagementOpen] = useState(false)
  const [reengagementDays, setReengagementDays] = useState(3)
  const [reengagementTier, setReengagementTier] = useState('3')
  const tier7Navigated = useRef(false)

  useEffect(() => {
    const r = evaluateReengagement()
    if (r.show && r.tier) {
      setReengagementDays(Math.max(3, r.daysAbsent))
      setReengagementTier(r.tier)
      setReengagementSessionPending({ tier: r.tier, daysAbsent: r.daysAbsent })
      setReengagementOpen(true)
      if (r.tier === '7' && !tier7Navigated.current) {
        tier7Navigated.current = true
        navigate('/chat', { replace: true, state: { reengagementWeek: true } })
      }
      return
    }
    recordNormalAppVisit()
  }, [navigate])

  const hideNav = /^\/cookbook\/[^/]+$/.test(location.pathname)

  return (
    <div className={`main-layout ${hideNav ? 'main-layout--no-nav' : ''}`}>
      <main className="main-layout-content">
        <div className="main-layout-route" key={location.pathname}>
          <Outlet />
        </div>
      </main>
      {!hideNav && (
      <nav className="bottom-nav">
        {TABS.map(({ path, label, icon }) => (
          <button
            key={path}
            type="button"
            className={`bottom-nav-item ${
              path === '/cookbook'
                ? location.pathname.startsWith('/cookbook')
                  ? 'active'
                  : ''
                : path === '/train'
                  ? location.pathname.startsWith('/train')
                    ? 'active'
                    : ''
                : location.pathname === path
                  ? 'active'
                  : ''
            }`}
            onClick={() => navigate(path)}
          >
            <span className="bottom-nav-icon">{icon}</span>
            <span className="bottom-nav-label">{label}</span>
          </button>
        ))}
      </nav>
      )}
      {reengagementOpen && (
        <ReengagementOverlay
          tier={reengagementTier}
          daysAbsent={reengagementDays}
          onClose={() => setReengagementOpen(false)}
        />
      )}
    </div>
  )
}
