import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  RefreshCw,
  CheckCircle,
  Circle,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { api, type Habit } from '@/lib/api'

interface HabitListProps {
  onRefresh?: () => void
  refreshTrigger?: number
}

export function HabitList({ onRefresh, refreshTrigger = 0 }: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchHabits = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await api.habits.getAll()
      setHabits(response.data)
    } catch (err) {
      console.error('Failed to fetch habits:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch habits')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const toggleHabit = async (habitId: string) => {
    try {
      const response = await api.habits.toggle(habitId)
      setHabits(prev =>
        prev.map(habit => (habit.id === habitId ? response.data : habit))
      )
    } catch (err) {
      console.error('Failed to toggle habit:', err)
      setError(err instanceof Error ? err.message : 'Failed to update habit')
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchHabits(true)
    }
  }, [refreshTrigger])

  const handleRefresh = () => {
    fetchHabits(true)
    onRefresh?.()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Habits</CardTitle>
            <CardDescription>
              {habits.length === 0
                ? 'No habits yet'
                : `${habits.length} habit${habits.length > 1 ? 's' : ''}`}
            </CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {habits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-8"
            >
              <div className="text-muted-foreground">
                <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No habits yet</p>
                <p className="text-sm">Add your first habit to get started!</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {habits.map(habit => (
                <motion.div
                  key={habit.id}
                  variants={itemVariants}
                  layout
                  className="group"
                >
                  <Card className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-6 w-6 rounded-full"
                            onClick={() => toggleHabit(habit.id)}
                          >
                            {habit.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <h3
                              className={`font-medium ${habit.completed ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {habit.name}
                            </h3>
                            {habit.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {habit.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(habit.createdAt)}
                              </Badge>
                              <Badge
                                variant={
                                  habit.completed ? 'default' : 'outline'
                                }
                                className="text-xs"
                              >
                                {habit.completed ? 'Completed' : 'In Progress'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
