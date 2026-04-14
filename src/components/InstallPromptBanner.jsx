import { useEffect, useState } from 'react'
import './InstallPromptBanner.css'

const STORAGE_KEY = 'forma_pwa_install_banner_dismissed'

function isStandalone() {
  if (typeof window === 'undefined') return true
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isMobile() {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export default function InstallPromptBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isMobile() || isStandalone()) return
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch {
      return
    }

    const id = window.setTimeout(() => {
      setVisible(true)
    }, 30000)

    return () => window.clearTimeout(id)
  }, [])

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="install-pwa-banner" role="status" aria-live="polite">
      <button type="button" className="install-pwa-banner__dismiss" onClick={dismiss} aria-label="Dismiss">
        ×
      </button>
      <p className="install-pwa-banner__text">
        Add FORMA Coach to your home screen for the full experience.
      </p>
      <span className="install-pwa-banner__arrow" aria-hidden>
        ↓
      </span>
    </div>
  )
}
