import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import AuthScreen from './screens/AuthScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen from './screens/HomeScreen'
import CheckScreen from './screens/CheckScreen'
import SavedScreen from './screens/SavedScreen'
import AssessmentScreen from './screens/AssessmentScreen'
import StandaloneNotesScreen from './screens/StandaloneNotesScreen'
import StandaloneExtendedScreen from './screens/StandaloneExtendedScreen'
import ProfileScreen from './screens/ProfileScreen'
import StandaloneFaceScreen from './screens/StandaloneFaceScreen'
import ResetPasswordScreen from './screens/ResetPasswordScreen'
import HistoryScreen from './screens/HistoryScreen'
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
  const { user, profile, loading, recoveryMode } = useAuth()

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ color: '#49624d' }}>
        progress_activity
      </span>
    </div>
  )

  // Recovery mode must win before any route evaluation — prevents onboarding redirect
  if (recoveryMode) {
    return (
      <div className="max-w-md mx-auto min-h-dvh relative bg-background">
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route path="*" element={<Navigate to="/reset-password" replace />} />
        </Routes>
      </div>
    )
  }

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
        <Route path="/check" element={
          <ProtectedRoute><CheckScreen /><BottomNav /></ProtectedRoute>
        } />
        <Route path="/saved" element={
          <ProtectedRoute><SavedScreen /><BottomNav /></ProtectedRoute>
        } />
        <Route path="/assessment/:productId" element={
          <ProtectedRoute><AssessmentScreen /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfileScreen /><BottomNav /></ProtectedRoute>
        } />
        <Route path="/profile/face" element={
          <ProtectedRoute><StandaloneFaceScreen /></ProtectedRoute>
        } />
        <Route path="/profile/notes" element={
          <ProtectedRoute><StandaloneNotesScreen /></ProtectedRoute>
        } />
        <Route path="/profile/extended" element={
          <ProtectedRoute><StandaloneExtendedScreen /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><HistoryScreen /></ProtectedRoute>
        } />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        <Route path="/" element={
          <Navigate to={user ? (profile?.onboarding_complete ? '/home' : '/onboarding') : '/auth'} replace />
        } />
      </Routes>
    </div>
  )
}