import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUserSync } from '../utils/auth'
import { getCurrentStreak } from '../utils/workouts'
import { dismissReengagement, recordReengagementDeferAndVisit } from '../utils/reengagement'
import { buildReengagementOverlayMessage } from '../utils/reengagementCopy'
import './ReengagementOverlay.css'

/**
 * @param {{ tier: '3'|'7'|'14'; daysAbsent: number; onClose: () => void }}
 */
export default function ReengagementOverlay({ tier, daysAbsent, onClose }) {
  const navigate = useNavigate()
  const user = getCurrentUserSync()
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    getCurrentStreak().then(setStreak)
  }, [])

  const copy = useMemo(() => {
    return buildReengagementOverlayMessage({
      tier,
      daysAbsent,
      streak,
      user,
    })
  }, [tier, daysAbsent, streak, user])

  const handleLetsGo = () => {
    dismissReengagement()
    onClose()
    navigate('/train/reconnect')
  }

  const handleNeedTime = () => {
    if (tier === '7') {
      recordReengagementDeferAndVisit()
      onClose()
      return
    }
    recordReengagementDeferAndVisit()
    onClose()
    navigate('/chat', { replace: true, state: { reengagementSoft: true } })
  }

  return (
    <div className="reengagement-overlay" role="dialog" aria-modal="true" aria-labelledby="reengagement-headline">
      <div className="reengagement-overlay__glow" aria-hidden />
      <div className="reengagement-overlay__panel">
        <h1 id="reengagement-headline" className="reengagement-overlay__headline">
          {copy.headline}
        </h1>
        <p className="reengagement-overlay__body">{copy.body}</p>
        {copy.meta && <p className="reengagement-overlay__meta">{copy.meta}</p>}
        <button type="button" className="reengagement-overlay__cta" onClick={handleLetsGo}>
          Let&apos;s go
        </button>
        <button type="button" className="reengagement-overlay__secondary" onClick={handleNeedTime}>
          I need more time
        </button>
      </div>
    </div>
  )
}
