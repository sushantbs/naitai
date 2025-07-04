import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { api, type CreateHabitRequest } from '@/lib/api'

interface HabitFormProps {
  onSuccess?: () => void
}

export function HabitForm({ onSuccess }: HabitFormProps) {
  const [formData, setFormData] = useState<CreateHabitRequest>({
    name: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Habit name is required')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await api.habits.create({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      })

      // Show success animation
      setSuccess(true)

      // Reset form after brief delay
      setTimeout(() => {
        setFormData({ name: '', description: '' })
        setSuccess(false)
        onSuccess?.()
      }, 1500)
    } catch (err) {
      console.error('Failed to create habit:', err)
      setError(err instanceof Error ? err.message : 'Failed to create habit')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateHabitRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null) // Clear error when user starts typing
  }

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20,
      },
    },
  }

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Habit
        </CardTitle>
        <CardDescription>
          Create a new habit to track your progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div variants={formVariants} initial="hidden" animate="visible">
          {success ? (
            <motion.div
              variants={successVariants}
              initial="hidden"
              animate="visible"
              className="text-center py-8"
            >
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                Habit Created Successfully!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Your new habit has been added to your list
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Habit Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Morning Walk, Read for 30 minutes"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  disabled={loading}
                  className={error ? 'border-destructive' : ''}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                  <span className="text-muted-foreground font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <Textarea
                  id="description"
                  placeholder="Add more details about your habit..."
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md"
                >
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Habit
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormData({ name: '', description: '' })}
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}
