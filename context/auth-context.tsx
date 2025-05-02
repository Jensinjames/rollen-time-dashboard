"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import type {
  User,
  AuthState,
  SignUpFormData,
  LoginFormData,
  ResetPasswordFormData,
  NewPasswordFormData,
  UpdateProfileFormData,
  UpdatePasswordFormData,
  UpdatePreferencesFormData,
} from "@/types/auth"

// Add the import for cookie utilities at the top of the file
import { setCookie, deleteCookie } from "@/utils/cookie-utils"
// Add the import for auth utilities at the top of the file
import { isTokenValid } from "@/utils/auth-utils"

// Define the shape of our context
interface AuthContextType {
  authState: AuthState
  signUp: (data: SignUpFormData) => Promise<boolean>
  login: (data: LoginFormData) => Promise<boolean>
  logout: () => void
  requestPasswordReset: (data: ResetPasswordFormData) => Promise<boolean>
  resetPassword: (token: string, data: NewPasswordFormData) => Promise<boolean>
  updateProfile: (data: UpdateProfileFormData) => Promise<boolean>
  updatePassword: (data: UpdatePasswordFormData) => Promise<boolean>
  updatePreferences: (data: UpdatePreferencesFormData) => Promise<boolean>
  isAuthenticated: boolean
}

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Local storage keys
const USER_STORAGE_KEY = "wellness_user"
const TOKEN_STORAGE_KEY = "wellness_auth_token"

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  })
  const router = useRouter()
  const { toast } = useToast()

  // Check if user is authenticated
  const isAuthenticated = !!authState.user

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY)
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)

        if (storedUser && storedToken && isTokenValid(storedToken)) {
          const user = JSON.parse(storedUser)
          // Convert date strings back to Date objects
          user.createdAt = new Date(user.createdAt)
          user.updatedAt = new Date(user.updatedAt)

          setAuthState({
            user,
            isLoading: false,
            error: null,
          })
        } else {
          // Clear invalid tokens
          if (storedToken && !isTokenValid(storedToken)) {
            localStorage.removeItem(USER_STORAGE_KEY)
            localStorage.removeItem(TOKEN_STORAGE_KEY)
            deleteCookie("wellness_auth_token")
          }

          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          })
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setAuthState({
          user: null,
          isLoading: false,
          error: "Failed to initialize authentication",
        })
      }
    }

    initializeAuth()
  }, [])

  // Sign up function
  const signUp = async (data: SignUpFormData): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      // In a real app, this would be an API call
      // For now, we'll simulate a successful sign-up
      const newUser: User = {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          theme: "system",
          emailNotifications: true,
          weeklyReports: true,
        },
        profile: {
          displayName: data.name,
        },
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Store user in localStorage (in a real app, we'd store a token)
      const token = `mock-token-${newUser.id}`
      localStorage.setItem(TOKEN_STORAGE_KEY, token)

      // Set the cookie for middleware authentication with proper attributes
      setCookie("wellness_auth_token", token, { maxAge: 2592000 }) // 30 days

      setAuthState({
        user: newUser,
        isLoading: false,
        error: null,
      })

      toast({
        title: "Account created successfully",
        description: "Welcome to Wellness Dashboard!",
      })

      return true
    } catch (error) {
      console.error("Sign up error:", error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to create account. Please try again.",
      }))

      toast({
        title: "Sign up failed",
        description: "There was a problem creating your account.",
        variant: "destructive",
      })

      return false
    }
  }

  // Login function
  const login = async (data: LoginFormData): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      // In a real app, this would be an API call
      // For now, we'll simulate a successful login

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll create a mock user if the email contains "demo"
      // In a real app, we would validate credentials against a backend
      if (!data.email.includes("demo")) {
        throw new Error("Invalid credentials")
      }

      const user: User = {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.email.split("@")[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          theme: "system",
          emailNotifications: true,
          weeklyReports: true,
        },
        profile: {
          displayName: data.email.split("@")[0],
        },
      }

      // Store user in localStorage
      const token = `mock-token-${user.id}`
      localStorage.setItem(TOKEN_STORAGE_KEY, token)

      // Set the cookie for middleware authentication with proper attributes
      setCookie("wellness_auth_token", token, { maxAge: 2592000 }) // 30 days

      setAuthState({
        user,
        isLoading: false,
        error: null,
      })

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      })

      return true
    } catch (error) {
      console.error("Login error:", error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Invalid email or password. Please try again.",
      }))

      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })

      return false
    }
  }

  // Logout function
  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem(TOKEN_STORAGE_KEY)

    // Reset auth state
    setAuthState({
      user: null,
      isLoading: false,
      error: null,
    })

    // Redirect to login page
    router.push("/login")

    deleteCookie("wellness_auth_token")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }, [router, toast])

  // Request password reset function
  const requestPasswordReset = async (data: ResetPasswordFormData): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      // In a real app, this would be an API call to send a reset email
      // For now, we'll simulate a successful request

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAuthState((prev) => ({ ...prev, isLoading: false }))

      toast({
        title: "Password reset email sent",
        description: `If an account exists for ${data.email}, you will receive a password reset link.`,
      })

      return true
    } catch (error) {
      console.error("Password reset request error:", error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to request password reset. Please try again.",
      }))

      toast({
        title: "Request failed",
        description: "There was a problem sending the password reset email.",
        variant: "destructive",
      })

      return false
    }
  }

  // Reset password function
  const resetPassword = async (token: string, data: NewPasswordFormData): Promise<boolean> => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      // In a real app, this would be an API call to reset the password
      // For now, we'll simulate a successful reset

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAuthState((prev) => ({ ...prev, isLoading: false }))

      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
      })

      return true
    } catch (error) {
      console.error("Password reset error:", error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to reset password. Please try again.",
      }))

      toast({
        title: "Reset failed",
        description: "There was a problem resetting your password.",
        variant: "destructive",
      })

      return false
    }
  }

  // Update profile function
  const updateProfile = async (data: UpdateProfileFormData): Promise<boolean> => {
    try {
      if (!authState.user) {
        throw new Error("Not authenticated")
      }

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      // In a real app, this would be an API call
      // For now, we'll update the local user object

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedUser: User = {
        ...authState.user,
        name: data.name,
        email: data.email,
        updatedAt: new Date(),
        profile: {
          ...authState.user.profile,
          displayName: data.displayName || data.name,
          bio: data.bio,
          timezone: data.timezone,
          dateFormat: data.dateFormat,
          timeFormat: data.timeFormat,
        },
      }

      // Update localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))

      setAuthState({
        user: updatedUser,
        isLoading: false,
        error: null,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      return true
    } catch (error) {
      console.error("Update profile error:", error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to update profile. Please try again.",
      }))

      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      })

      return false
    }
  }

  // Update password function
  const updatePassword = async (data: UpdatePasswordFormData): Promise<boolean> => {
    try {
      if (!authState.user) {
        throw new Error("Not authenticated")
      }

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      // In a real app, this would be an API call
      // For now, we'll simulate a successful password update

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, we would verify the current password
      // For demo purposes, we'll just accept any non-empty current password
      if (!data.currentPassword) {
        throw new Error("Current password is required")
      }

      setAuthState((prev) => ({ ...prev, isLoading: false }))

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })

      return true
    } catch (error) {
      console.error("Update password error:", error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to update password. Please try again.",
      }))

      toast({
        title: "Update failed",
        description: "There was a problem updating your password.",
        variant: "destructive",
      })

      return false
    }
  }

  // Update preferences function
  const updatePreferences = async (data: UpdatePreferencesFormData): Promise<boolean> => {
    try {
      if (!authState.user) {
        throw new Error("Not authenticated")
      }

      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }))

      // In a real app, this would be an API call
      // For now, we'll update the local user object

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedUser: User = {
        ...authState.user,
        updatedAt: new Date(),
        preferences: {
          ...authState.user.preferences,
          ...data,
        },
      }

      // Update localStorage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser))

      setAuthState({
        user: updatedUser,
        isLoading: false,
        error: null,
      })

      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully.",
      })

      return true
    } catch (error) {
      console.error("Update preferences error:", error)
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to update preferences. Please try again.",
      }))

      toast({
        title: "Update failed",
        description: "There was a problem updating your preferences.",
        variant: "destructive",
      })

      return false
    }
  }

  // Context value
  const value = {
    authState,
    signUp,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    updatePassword,
    updatePreferences,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
