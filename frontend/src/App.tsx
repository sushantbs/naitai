import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Toaster } from 'sonner'
import HomePage from './pages/HomePage'
import HabitsPage from './pages/HabitsPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import AuthCallbackPage from './pages/auth/AuthCallbackPage'
import { ThemeProvider } from './components/ThemeProvider'
import { AuthProvider } from './components/AuthProvider'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Navigation from './components/Navigation'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="naitai-ui-theme">
      <AuthProvider>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Navigation />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              {/* Public routes */}
              <Route path="/welcome" element={<HomePage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/signup" element={<SignupPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HabitsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/habits"
                element={
                  <ProtectedRoute>
                    <HabitsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </motion.div>
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
