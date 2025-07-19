import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, LogOut, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { useAuthStore } from '../stores/authStore'

export const Navigation: React.FC = () => {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleSignIn = () => {
    navigate('/auth/login')
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Naitai
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/habits"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Habits
                </Link>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{user.email}</span>

                  <Link
                    to="/profile"
                    className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4" />
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={handleSignIn}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
