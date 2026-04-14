import { useState, useEffect } from 'react'
import { isWatchConnected, getLiveHeartRate } from '../utils/watchService'
import './LiveHeartRate.css'

export default function LiveHeartRate({ visible = true }) {
  const [hr, setHr] = useState(null)
  const connected = isWatchConnected()

  useEffect(() => {
    if (!connected || !visible) return
    const update = () => setHr(getLiveHeartRate())
    update()
    const id = setInterval(update, 2000)
    return () => clearInterval(id)
  }, [connected, visible])

  if (!connected || hr == null) return null

  return (
    <div className="live-hr" role="status" aria-label={`Heart rate ${hr} beats per minute`}>
      <span className="live-hr-icon" aria-hidden>❤️</span>
      <span className="live-hr-value">{hr}</span>
      <span className="live-hr-unit">bpm</span>
    </div>
  )
}
