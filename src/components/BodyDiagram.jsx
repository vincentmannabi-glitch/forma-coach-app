import { useState } from 'react'
import './BodyDiagram.css'

/** @type {{ id: string; label: string; x: number; y: number; w: number; h: number }[]} */
const FRONT = [
  { id: 'neck', label: 'Neck', x: 42, y: 6, w: 16, h: 8 },
  { id: 'shoulder', label: 'Shoulder', x: 22, y: 16, w: 18, h: 12 },
  { id: 'shoulder', label: 'Shoulder', x: 60, y: 16, w: 18, h: 12 },
  { id: 'chest', label: 'Chest', x: 38, y: 24, w: 24, h: 14 },
  { id: 'elbow', label: 'Elbow', x: 18, y: 34, w: 14, h: 10 },
  { id: 'elbow', label: 'Elbow', x: 68, y: 34, w: 14, h: 10 },
  { id: 'wrist', label: 'Wrist', x: 16, y: 46, w: 12, h: 8 },
  { id: 'wrist', label: 'Wrist', x: 72, y: 46, w: 12, h: 8 },
  { id: 'hip', label: 'Hip', x: 32, y: 48, w: 14, h: 10 },
  { id: 'hip', label: 'Hip', x: 54, y: 48, w: 14, h: 10 },
  { id: 'knee', label: 'Knee', x: 34, y: 62, w: 14, h: 12 },
  { id: 'knee', label: 'Knee', x: 52, y: 62, w: 14, h: 12 },
  { id: 'ankle', label: 'Ankle', x: 36, y: 78, w: 12, h: 10 },
  { id: 'ankle', label: 'Ankle', x: 52, y: 78, w: 12, h: 10 },
]

const BACK = [
  { id: 'neck', label: 'Neck', x: 42, y: 6, w: 16, h: 8 },
  { id: 'upper_back', label: 'Upper back', x: 34, y: 18, w: 32, h: 16 },
  { id: 'lower_back', label: 'Lower back', x: 36, y: 34, w: 28, h: 14 },
  { id: 'shoulder', label: 'Shoulder', x: 22, y: 18, w: 14, h: 12 },
  { id: 'shoulder', label: 'Shoulder', x: 64, y: 18, w: 14, h: 12 },
  { id: 'elbow', label: 'Elbow', x: 18, y: 32, w: 12, h: 10 },
  { id: 'elbow', label: 'Elbow', x: 70, y: 32, w: 12, h: 10 },
  { id: 'glute', label: 'Glutes', x: 36, y: 46, w: 28, h: 12 },
  { id: 'hamstring', label: 'Hamstring', x: 34, y: 56, w: 14, h: 18 },
  { id: 'hamstring', label: 'Hamstring', x: 52, y: 56, w: 14, h: 18 },
  { id: 'knee', label: 'Knee', x: 34, y: 72, w: 14, h: 10 },
  { id: 'knee', label: 'Knee', x: 52, y: 72, w: 14, h: 10 },
  { id: 'calf', label: 'Calf', x: 36, y: 82, w: 12, h: 10 },
  { id: 'calf', label: 'Calf', x: 52, y: 82, w: 12, h: 10 },
]

/**
 * @param {{ face: 'front'|'back'; selectedId: string | null; onSelect: (id: string) => void }}
 */
export default function BodyDiagram({ face, selectedId, onSelect }) {
  const zones = face === 'front' ? FRONT : BACK
  return (
    <div className="body-diagram" role="group" aria-label={`Body map ${face}`}>
      <svg className="body-diagram__svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {face === 'front' ? <FrontSilhouette /> : <BackSilhouette />}
        {zones.map((z, i) => (
          <rect
            key={`${face}-${z.id}-${i}`}
            className={`body-diagram__hit ${selectedId === z.id ? 'body-diagram__hit--on' : ''}`}
            x={z.x}
            y={z.y}
            width={z.w}
            height={z.h}
            rx={2}
            onClick={() => onSelect(z.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(z.id)
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${z.label} — tap to select`}
          />
        ))}
        {selectedId &&
          zones
            .filter((z) => z.id === selectedId)
            .map((z, i) => (
              <circle
                key={`gold-${face}-${i}`}
                className="body-diagram__gold-dot"
                cx={z.x + z.w / 2}
                cy={z.y + z.h / 2}
                r={3}
              />
            ))}
      </svg>
    </div>
  )
}

function FrontSilhouette() {
  return (
    <g className="body-diagram__silhouette" aria-hidden>
      <ellipse cx="50" cy="10" rx="9" ry="10" />
      <path d="M 50 20 L 50 52 M 38 24 L 62 24 M 38 24 L 32 42 L 28 52 M 62 24 L 68 42 L 72 52 M 42 52 L 38 78 L 36 92 M 58 52 L 62 78 L 64 92" fill="none" strokeWidth="1.2" />
    </g>
  )
}

function BackSilhouette() {
  return (
    <g className="body-diagram__silhouette" aria-hidden>
      <ellipse cx="50" cy="10" rx="9" ry="10" />
      <path
        d="M 50 20 L 50 52 M 38 24 L 62 24 M 38 24 L 34 40 L 32 52 M 62 24 L 66 40 L 68 52 M 42 52 L 40 78 L 38 92 M 58 52 L 60 78 L 62 92"
        fill="none"
        strokeWidth="1.2"
      />
    </g>
  )
}

export function BodyFaceToggle({ face, onFace }) {
  return (
    <div className="body-diagram-toggle">
      <button type="button" className={face === 'front' ? 'is-active' : ''} onClick={() => onFace('front')}>
        Front
      </button>
      <button type="button" className={face === 'back' ? 'is-active' : ''} onClick={() => onFace('back')}>
        Back
      </button>
    </div>
  )
}
