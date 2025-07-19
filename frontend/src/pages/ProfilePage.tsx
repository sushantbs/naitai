import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Lock } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { useAuthStore } from '../stores/authStore'
import { authApi, AuthError } from '../lib/auth'

interface UpdatePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuthStore()
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordForm>()

  const newPassword = watch('newPassword')

  const onUpdatePassword = async (data: UpdatePasswordForm) => {
    setIsUpdatingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(null)

    try {
      await authApi.updatePassword(data.newPassword)
      setPasswordSuccess('Password updated successfully!')
      reset()
    } catch (err) {
      if (err instanceof AuthError) {
        setPasswordError(err.message)
      } else {
        setPasswordError('Failed to update password. Please try again.')
      }
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account settings</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{user.email}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  User ID
                </label>
                <p className="mt-1 text-sm text-gray-500 font-mono">
                  {user.id}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Account Created
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {passwordSuccess}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onUpdatePassword)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <Input
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  placeholder="Enter new password"
                  disabled={isUpdatingPassword}
                />
                {errors.newPassword && (
                  <p className="text-sm text-red-600">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === newPassword || 'Passwords do not match',
                  })}
                  type="password"
                  placeholder="Confirm new password"
                  disabled={isUpdatingPassword}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full sm:w-auto"
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-full sm:w-auto"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProfilePage
