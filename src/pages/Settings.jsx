import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { updateUserProfile, logout } from '../utils/auth'
import './Settings.css'

const KG_TO_LB = 2.2046226218

export default function Settings() {
  const navigate = useNavigate()
  const { profile: user } = useAuth()
  const [email, setEmail] = useState('')
  const [notificationsOn, setNotificationsOn] = useState(true)
  const [calorieTrackerOn, setCalorieTrackerOn] = useState(true)
  const [unit, setUnit] = useState('lb')
  const [deviceNotices, setDeviceNotices] = useState({})

  useEffect(() => {
    if (!user) return
    setEmail(user.email || '')
    setNotificationsOn(user.notifications_enabled !== false)
    setCalorieTrackerOn(user.nutrition_tracker_enabled !== false)
    setUnit((user.body_weight_unit || 'lb').toLowerCase() === 'kg' ? 'kg' : 'lb')
  }, [user])

  const persistNotifications = (on) => {
    setNotificationsOn(on)
    updateUserProfile({ notifications_enabled: on })
  }

  const persistCalorieTracker = (on) => {
    setCalorieTrackerOn(on)
    updateUserProfile({ nutrition_tracker_enabled: on })
  }

  const persistUnit = (newUnit) => {
    if (!user) return
    const u = user
    const prev = (u.body_weight_unit || 'lb').toLowerCase() === 'kg' ? 'kg' : 'lb'
    if (newUnit === prev) {
      setUnit(newUnit)
      return
    }
    let bodyWeight = u.body_weight
    if (bodyWeight != null && Number.isFinite(Number(bodyWeight))) {
      const n = parseFloat(String(bodyWeight))
      if (prev === 'lb' && newUnit === 'kg') {
        bodyWeight = Math.round((n / KG_TO_LB) * 10) / 10
      } else if (prev === 'kg' && newUnit === 'lb') {
        bodyWeight = Math.round(n * KG_TO_LB * 10) / 10
      }
    }
    setUnit(newUnit)
    updateUserProfile({
      body_weight_unit: newUnit,
      ...(bodyWeight != null ? { body_weight: bodyWeight } : {}),
    })
  }

  const signOut = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const deleteAccount = async () => {
    const ok = window.confirm(
      'Delete your account? This will permanently remove all your data and cannot be undone.',
    )
    if (!ok) return

    try {
      const userId = user?.id
      if (userId) {
        Object.keys(localStorage).forEach((key) => {
          if (key.includes(userId)) localStorage.removeItem(key)
        })
      }
      localStorage.clear()
      await signOut()
    } catch (err) {
      alert('Error deleting account. Please contact support.')
      console.error(err)
    }
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <button type="button" className="settings-back" onClick={() => navigate(-1)} aria-label="Back">
          ←
        </button>
        <h1 className="settings-title">Settings</h1>
      </header>

      <section className="settings-section settings-card">
        <h2 className="settings-h2">Account</h2>
        <p className="settings-email">{email || '—'}</p>
      </section>

      <section className="settings-section settings-card">
        <div className="settings-row">
          <div>
            <h2 className="settings-h2">Notifications</h2>
            <p className="settings-row-sub">In-app reminders and coaching nudges</p>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={notificationsOn}
              onChange={(e) => persistNotifications(e.target.checked)}
            />
            <span className="settings-switch-ui" aria-hidden />
          </label>
        </div>
      </section>

      <section className="settings-section settings-card">
        <div className="settings-row">
          <div>
            <h2 className="settings-h2">Calorie tracker</h2>
            <p className="settings-row-sub">Show calories and macros on Home and use the food logger</p>
          </div>
          <label className="settings-switch">
            <input
              type="checkbox"
              checked={calorieTrackerOn}
              onChange={(e) => persistCalorieTracker(e.target.checked)}
            />
            <span className="settings-switch-ui" aria-hidden />
          </label>
        </div>
      </section>

      <section className="settings-section settings-card settings-connected-devices">
        <h2 className="settings-h2">Connected Devices</h2>
        <p className="settings-row-sub settings-connected-devices-intro">
          Connecting your device syncs your heart rate, sleep data, and activity automatically with FORMA Coach.
        </p>
        <div className="settings-device-cards">
          {[
            {
              id: 'apple',
              label: 'Apple Watch',
              icon: (
                <svg className="settings-device-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="5" y="3" width="14" height="18" rx="3" />
                  <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
                </svg>
              ),
            },
            {
              id: 'garmin',
              label: 'Garmin',
              icon: (
                <svg className="settings-device-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2L2 12l10 10 10-10L12 2z" />
                </svg>
              ),
            },
            {
              id: 'fitbit',
              label: 'Fitbit',
              icon: (
                <svg className="settings-device-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <circle cx="6" cy="12" r="2.5" />
                  <circle cx="12" cy="12" r="2.5" />
                  <circle cx="18" cy="12" r="2.5" />
                </svg>
              ),
            },
          ].map((device) => (
            <div key={device.id} className="settings-device-card">
              <span className="settings-device-icon-wrap" aria-hidden>{device.icon}</span>
              <span className="settings-device-label">{device.label}</span>
              <span className="settings-device-coming-soon">Coming Soon</span>
              <button
                type="button"
                className="settings-device-connect-btn"
                onClick={() => setDeviceNotices((prev) => ({ ...prev, [device.id]: `${device.label} integration is coming soon. Device sync lands in version 2.` }))}
              >
                Connect
              </button>
              {deviceNotices[device.id] && (
                <p className="settings-connected-notice" role="status">{deviceNotices[device.id]}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="settings-section settings-card">
        <h2 className="settings-h2">Units</h2>
        <p className="settings-row-sub">Body weight for targets and displays</p>
        <div className="settings-unit-toggle" role="group" aria-label="Weight units">
          <button
            type="button"
            className={`settings-unit-btn ${unit === 'lb' ? 'active' : ''}`}
            onClick={() => persistUnit('lb')}
          >
            Pounds
          </button>
          <button
            type="button"
            className={`settings-unit-btn ${unit === 'kg' ? 'active' : ''}`}
            onClick={() => persistUnit('kg')}
          >
            Kilograms
          </button>
        </div>
      </section>

      <div className="settings-actions">
        <button type="button" className="settings-btn settings-btn--secondary" onClick={signOut}>
          Sign out
        </button>
        <button type="button" className="settings-btn settings-btn--danger" onClick={deleteAccount}>
          Delete account
        </button>
      </div>
    </div>
  )
}
