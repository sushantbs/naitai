import { useState } from 'react'
import { motion } from 'framer-motion'
import { HabitForm } from '@/components/HabitForm'
import { HabitList } from '@/components/HabitList'

export default function HabitsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleHabitCreated = () => {
    // Trigger refresh of the habit list
    setRefreshTrigger(prev => prev + 1)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold">Habit Tracker</h1>
            <p className="text-muted-foreground mt-2">
              Build better habits and track your progress
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Add Habit Form */}
          <motion.div variants={itemVariants}>
            <HabitForm onSuccess={handleHabitCreated} />
          </motion.div>

          {/* Habits List */}
          <motion.div variants={itemVariants}>
            <HabitList
              refreshTrigger={refreshTrigger}
              onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            />
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
