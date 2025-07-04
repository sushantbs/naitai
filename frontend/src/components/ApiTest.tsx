import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'

export function ApiTest() {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testApiConnection = async () => {
    setStatus('loading')
    setError(null)

    try {
      // Test health endpoint first
      const healthResponse = await api.health.check()
      setApiResponse(healthResponse)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  const testHabitsApi = async () => {
    setStatus('loading')
    setError(null)

    try {
      // Test habits endpoint
      const habitsResponse = await api.habits.getAll()
      setApiResponse(habitsResponse)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }

  useEffect(() => {
    // Auto-test health endpoint on mount
    testApiConnection()
  }, [])

  const getStatusBadge = () => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">🔄 Loading...</Badge>
      case 'success':
        return <Badge variant="default">✅ Connected</Badge>
      case 'error':
        return <Badge variant="destructive">❌ Error</Badge>
      default:
        return <Badge variant="outline">⏸️ Idle</Badge>
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">API Connection Test</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={testApiConnection}
            disabled={status === 'loading'}
            variant="outline"
            size="sm"
          >
            Test Health
          </Button>
          <Button
            onClick={testHabitsApi}
            disabled={status === 'loading'}
            variant="outline"
            size="sm"
          >
            Test Habits API
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-medium">Error:</p>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        )}

        {apiResponse && status === 'success' && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
              API Response:
            </p>
            <pre className="text-xs text-green-700 dark:text-green-300 overflow-auto">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>API URL:</strong>{' '}
            {import.meta.env.VITE_API_URL || 'http://localhost:3001'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
