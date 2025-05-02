export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
  preferences: UserPreferences
  profile: UserProfile
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  emailNotifications: boolean
  weeklyReports: boolean
  reminderTime?: string // Format: "HH:MM"
  pushNotifications?: boolean
  dataSharing?: boolean
  activityReminders?: boolean
  goalAlerts?: boolean
}

export interface UserProfile {
  displayName?: string
  bio?: string
  avatarUrl?: string
  timezone?: string
  dateFormat?: string
  timeFormat?: string
  phone?: string
  location?: string
  occupation?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

export interface ResetPasswordFormData {
  email: string
}

export interface NewPasswordFormData {
  password: string
  confirmPassword: string
}

export interface UpdateProfileFormData {
  name: string
  displayName?: string
  bio?: string
  email: string
  timezone?: string
  dateFormat?: string
  timeFormat?: string
  phone?: string
  location?: string
  occupation?: string
}

export interface UpdatePasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdatePreferencesFormData {
  theme: "light" | "dark" | "system"
  emailNotifications: boolean
  weeklyReports: boolean
  reminderTime?: string
  pushNotifications?: boolean
  dataSharing?: boolean
  activityReminders?: boolean
  goalAlerts?: boolean
}
