import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import HomeErrorBoundary from './components/HomeErrorBoundary'
import TrainLayout from './components/TrainLayout'
import WorkoutHub from './pages/WorkoutHub'
import AuthGuard from './components/AuthGuard'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './components/MainLayout'
import InstallPromptBanner from './components/InstallPromptBanner'

const TrainSession = lazy(() => import('./pages/TrainSession'))
const CardioTrain = lazy(() => import('./pages/CardioTrain'))
const ReconnectTrain = lazy(() => import('./pages/ReconnectTrain'))
const Progress = lazy(() => import('./pages/Progress'))
const Cookbook = lazy(() => import('./pages/Cookbook'))
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'))
const GroceryList = lazy(() => import('./pages/GroceryList'))
const FoodLogger = lazy(() => import('./pages/FoodLogger'))
const Settings = lazy(() => import('./pages/Settings'))
const Chat = lazy(() => import('./pages/Chat'))

function App() {
  return (
    <>
      <InstallPromptBanner />
      <Suspense fallback={<div className="app-loading" aria-busy="true"><div className="auth-guard-spinner" /></div>}>
        <Routes>
        <Route path="/" element={<AuthGuard><Signup /></AuthGuard>} />
        <Route path="/login" element={<AuthGuard><Login /></AuthGuard>} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route
              path="/home"
              element={
                <HomeErrorBoundary>
                  <Home />
                </HomeErrorBoundary>
              }
            />
            <Route path="/train" element={<TrainLayout />}>
              <Route index element={<WorkoutHub />} />
              <Route path="session" element={<TrainSession />} />
              <Route path="gym" element={<Navigate to="/train/session" replace />} />
              <Route path="calisthenics" element={<Navigate to="/train/session" replace />} />
              <Route path="both" element={<Navigate to="/train/session" replace />} />
              <Route path="home" element={<Navigate to="/train/session" replace />} />
              <Route path="cardio" element={<CardioTrain />} />
              <Route path="reconnect" element={<ReconnectTrain />} />
              <Route path="*" element={<Navigate to="/train/session" replace />} />
            </Route>
            <Route path="/cookbook" element={<Cookbook />} />
            <Route path="/cookbook/:recipeId" element={<RecipeDetail />} />
            <Route path="/grocery" element={<GroceryList />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/food-log" element={<FoodLogger />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
