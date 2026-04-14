import { useMemo } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buildSafeHomeUser } from '../utils/homeSafeUser'
import {
  getAllowedTrainingStyleIds,
  resolveDefaultTrainingStyleId,
  trainPathForStyleId,
} from '../utils/trainingStyles'

const PATH_TO_STYLE = {
  '/train/gym': 'gym',
  '/train/calisthenics': 'calisthenics',
  '/train/both': 'both',
  '/train/home': 'home',
}

export default function TrainLayout() {
  const location = useLocation()
  const { profile } = useAuth()
  const user = useMemo(() => buildSafeHomeUser(profile), [profile])
  const allowed = useMemo(() => getAllowedTrainingStyleIds(user), [user])
  const styleId = PATH_TO_STYLE[location.pathname]

  if (styleId && !allowed.includes(styleId)) {
    return <Navigate to={trainPathForStyleId(resolveDefaultTrainingStyleId(user))} replace />
  }

  return <Outlet />
}
