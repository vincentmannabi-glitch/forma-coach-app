import { useLocation } from 'react-router-dom'
import './Placeholder.css'

const LABELS = {
  '/train': 'Train',
  '/cookbook': 'Cookbook',
  '/progress': 'Progress',
}

export default function Placeholder() {
  const { pathname } = useLocation()
  const label = LABELS[pathname] || 'Coming soon'

  return (
    <div className="placeholder-page">
      <h2 className="placeholder-title">{label}</h2>
      <p className="placeholder-text">Coming soon</p>
    </div>
  )
}
