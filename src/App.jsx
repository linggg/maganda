import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import AuthScreen from './screens/AuthScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen from './screens/HomeScreen'
import ScanScreen from './screens/ScanScreen'
import InsightsScreen from './screens/InsightsScreen'
import SavedScreen from './screens/SavedScreen'
import AssessmentScreen from './screens/AssessmentScreen'
import BottomNav from './components/BottomNav'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ color: '#49624d' }}>
        progress_activity
      </span>
    </div>
  )
  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ color: '#49624d' }}>
        progress_activity
      </span>
    </div>
  )

  return (
    <div className="max-w-md mx-auto min-h-dvh relative bg-background">
      <Routes>
        <Route path="/auth" element={
          user ? <Navigate to={profile?.onboarding_complete ? '/home' : '/onboarding'} replace /> : <AuthScreen />
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute><OnboardingScreen /></ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute><HomeScreen /><BottomNav /></ProtectedRoute>
        } />
        <Route path="/scan" element={
          <ProtectedRoute><ScanScreen /><BottomNav /></ProtectedRoute>
        } />
        <Route path="/insights" element={
          <ProtectedRoute><InsightsScreen /><BottomNav /></ProtectedRoute>
        } />
        <Route path="/saved" element={
          <ProtectedRoute><SavedScreen /><BottomNav /></ProtectedRoute>
        } />
        <Route path="/assessment/:productId" element={
          <ProtectedRoute><AssessmentScreen /></ProtectedRoute>
        } />
        <Route path="/" element={
          <Navigate to={user ? (profile?.onboarding_complete ? '/home' : '/onboarding') : '/auth'} replace />
        } />
      </Routes>
    </div>
  )
}