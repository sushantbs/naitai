import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Toaster } from 'sonner'
import HomePage from './pages/HomePage'
import HabitsPage from './pages/HabitsPage'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="naitai-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<HabitsPage />} />
            <Route path="/welcome" element={<HomePage />} />
          </Routes>
        </motion.div>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App
