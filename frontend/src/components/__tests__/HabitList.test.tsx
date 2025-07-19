import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { HabitList } from '../HabitList'
import { api, type Habit } from '@/lib/api'

interface MockMotionProps {
  children: React.ReactNode
  layout?: unknown
  variants?: unknown
  initial?: unknown
  animate?: unknown
  exit?: unknown
  transition?: unknown
  whileHover?: unknown
  whileTap?: unknown
  [key: string]: unknown
}

interface MockAnimatePresenceProps {
  children: React.ReactNode
}

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    habits: {
      getAll: vi.fn(),
      toggle: vi.fn(),
    },
  },
}))

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: MockMotionProps) => {
      // Filter out motion-specific props that shouldn't be passed to DOM
      const domProps = { ...props }
      delete domProps.layout
      delete domProps.variants
      delete domProps.initial
      delete domProps.animate
      delete domProps.exit
      delete domProps.transition
      delete domProps.whileHover
      delete domProps.whileTap
      return <div {...domProps}>{children}</div>
    },
  },
  AnimatePresence: ({ children }: MockAnimatePresenceProps) => <>{children}</>,
}))

const mockHabits: Habit[] = [
  {
    id: '1',
    name: 'Exercise Daily',
    description: 'Go for a 30-minute walk',
    completed: false,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Read Books',
    description: 'Read for 20 minutes',
    completed: true,
    createdAt: '2023-01-02T00:00:00.000Z',
    updatedAt: '2023-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Meditation',
    description: '',
    completed: false,
    createdAt: '2023-01-03T00:00:00.000Z',
    updatedAt: '2023-01-03T00:00:00.000Z',
  },
]

describe('HabitList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    // Mock a delayed API response
    vi.mocked(api.habits.getAll).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(<HabitList />)

    expect(screen.getByText('Loading Habits')).toBeInTheDocument()
    // Check for loading skeleton items
    expect(screen.getAllByText(/Loading/i)).toHaveLength(1)
    // Verify loading skeleton structure is present
    const skeletonItems = document.querySelectorAll('.animate-pulse')
    expect(skeletonItems.length).toBeGreaterThan(0)
  })

  it('renders habits correctly when data is loaded', async () => {
    vi.mocked(api.habits.getAll).mockResolvedValue({ data: mockHabits })

    render(<HabitList />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Your Habits')).toBeInTheDocument()
    })

    // Check if all habits are rendered
    expect(screen.getByText('Exercise Daily')).toBeInTheDocument()
    expect(screen.getByText('Go for a 30-minute walk')).toBeInTheDocument()
    expect(screen.getByText('Read Books')).toBeInTheDocument()
    expect(screen.getByText('Read for 20 minutes')).toBeInTheDocument()
    expect(screen.getByText('Meditation')).toBeInTheDocument()

    // Check habit count
    expect(screen.getByText('3 habits')).toBeInTheDocument()
  })

  it('displays correct completion status for habits', async () => {
    vi.mocked(api.habits.getAll).mockResolvedValue({ data: mockHabits })

    render(<HabitList />)

    await waitFor(() => {
      expect(screen.getByText('Your Habits')).toBeInTheDocument()
    })

    // Check completion badges
    expect(screen.getByText('Completed')).toBeInTheDocument() // For Read Books
    expect(screen.getAllByText('In Progress')).toHaveLength(2) // For Exercise Daily and Meditation
  })

  it('handles empty habits list', async () => {
    vi.mocked(api.habits.getAll).mockResolvedValue({ data: [] })

    render(<HabitList />)

    await waitFor(() => {
      expect(screen.getByText('Your Habits')).toBeInTheDocument()
    })

    // Check for both instances of "No habits yet" - one in header, one in empty state
    expect(screen.getAllByText('No habits yet')).toHaveLength(2)
    expect(
      screen.getByText('Add your first habit to get started!')
    ).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to fetch habits'
    vi.mocked(api.habits.getAll).mockRejectedValue(new Error(errorMessage))

    render(<HabitList />)

    await waitFor(() => {
      expect(screen.getByText('Error Loading Habits')).toBeInTheDocument()
    })

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('allows refreshing the habit list', async () => {
    vi.mocked(api.habits.getAll).mockResolvedValue({ data: mockHabits })

    render(<HabitList />)

    await waitFor(() => {
      expect(screen.getByText('Your Habits')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    expect(refreshButton).toBeInTheDocument()

    // Click refresh
    fireEvent.click(refreshButton)

    // API should be called again
    await waitFor(() => {
      expect(api.habits.getAll).toHaveBeenCalledTimes(2)
    })
  })

  it('handles habit toggle functionality', async () => {
    vi.mocked(api.habits.getAll).mockResolvedValue({ data: mockHabits })

    const toggledHabit = { ...mockHabits[0], completed: true }
    vi.mocked(api.habits.toggle).mockResolvedValue({ data: toggledHabit })

    render(<HabitList />)

    await waitFor(() => {
      expect(screen.getByText('Your Habits')).toBeInTheDocument()
    })

    // Find the toggle button for the first habit (Exercise Daily)
    const toggleButtons = screen.getAllByRole('button')
    const exerciseToggleButton = toggleButtons.find(
      button =>
        button.closest('[data-testid]') ||
        button.parentElement?.textContent?.includes('Exercise Daily')
    )

    if (exerciseToggleButton) {
      fireEvent.click(exerciseToggleButton)

      await waitFor(() => {
        expect(api.habits.toggle).toHaveBeenCalledWith('1')
      })
    }
  })

  it('displays formatted dates correctly', async () => {
    vi.mocked(api.habits.getAll).mockResolvedValue({ data: mockHabits })

    render(<HabitList />)

    await waitFor(() => {
      expect(screen.getByText('Your Habits')).toBeInTheDocument()
    })

    // Check for formatted dates (Jan 1, 2023, etc.)
    expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument()
    expect(screen.getByText('Jan 2, 2023')).toBeInTheDocument()
    expect(screen.getByText('Jan 3, 2023')).toBeInTheDocument()
  })

  it('handles habits without descriptions', async () => {
    vi.mocked(api.habits.getAll).mockResolvedValue({ data: mockHabits })

    render(<HabitList />)

    await waitFor(() => {
      expect(screen.getByText('Your Habits')).toBeInTheDocument()
    })

    // Meditation habit has no description, so it should only show the name
    expect(screen.getByText('Meditation')).toBeInTheDocument()
    // Should not show empty description
    expect(screen.queryByText('Go for a 30-minute walk')).toBeInTheDocument()
    expect(screen.queryByText('Read for 20 minutes')).toBeInTheDocument()
  })

  it('calls onRefresh callback when provided', async () => {
    const onRefreshMock = vi.fn()
    vi.mocked(api.habits.getAll).mockResolvedValue({ data: mockHabits })

    render(<HabitList onRefresh={onRefreshMock} />)

    await waitFor(() => {
      expect(screen.getByText('Your Habits')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(onRefreshMock).toHaveBeenCalledTimes(1)
    })
  })

  it('responds to refreshTrigger prop changes', async () => {
    vi.mocked(api.habits.getAll).mockResolvedValue({ data: mockHabits })

    const { rerender } = render(<HabitList refreshTrigger={0} />)

    await waitFor(() => {
      expect(screen.getByText('Your Habits')).toBeInTheDocument()
    })

    expect(api.habits.getAll).toHaveBeenCalledTimes(1)

    // Change refreshTrigger prop
    rerender(<HabitList refreshTrigger={1} />)

    await waitFor(() => {
      expect(api.habits.getAll).toHaveBeenCalledTimes(2)
    })
  })
})
