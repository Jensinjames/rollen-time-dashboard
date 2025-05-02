"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Loader2, Camera, Upload, CheckCircle2 } from "lucide-react"
import { validateName, validateEmail, validateBio } from "@/utils/form-validation"
import { useAuth } from "@/context/auth-context"
import { memo } from "react"

interface ProfileFormData {
  name: string
  displayName: string
  email: string
  bio: string
  timezone: string
  dateFormat: string
  timeFormat: string
  phone: string
  location: string
  occupation: string
}

interface ProfileTabProps {
  initialData: ProfileFormData
}

export const ProfileTab = memo(function ProfileTab({ initialData }: ProfileTabProps) {
  const { authState, updateProfile } = useAuth()
  const { user } = authState

  const [profileForm, setProfileForm] = useState<ProfileFormData>(initialData)
  const [profileErrors, setProfileErrors] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
  })
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000))

    clearInterval(interval)
    setUploadProgress(100)

    // Update user profile with new avatar URL
    // In a real app, this would be the URL returned from your file upload API
    const mockAvatarUrl = avatarPreview

    // Update profile with new avatar
    if (user) {
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          avatarUrl: mockAvatarUrl,
        },
      }

      // In a real app, you would call an API to update the user profile
      // For now, we'll just update the local state
      localStorage.setItem("wellness_user", JSON.stringify(updatedUser))
    }

    setIsUploading(false)
    setShowSuccessMessage(true)

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 3000)
  }

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (profileErrors[name as keyof typeof profileErrors]) {
      setProfileErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  // Validate profile form
  const validateProfileForm = () => {
    const nameValidation = validateName(profileForm.name)
    const emailValidation = validateEmail(profileForm.email)
    const bioValidation = validateBio(profileForm.bio)

    const newErrors = {
      name: nameValidation.message || "",
      email: emailValidation.message || "",
      bio: bioValidation.message || "",
      phone: "",
    }

    setProfileErrors(newErrors)

    return !Object.values(newErrors).some((error) => error)
  }

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateProfileForm()) {
      return
    }

    setIsProfileSubmitting(true)

    try {
      await updateProfile(profileForm)
    } finally {
      setIsProfileSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Update your profile picture</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg transition-all hover:scale-105">
              <AvatarImage src={avatarPreview || user?.profile.avatarUrl || undefined} />
              <AvatarFallback className="text-3xl">{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white shadow-md">
              <Camera className="h-4 w-4" />
            </div>
          </div>

          <div className="w-full space-y-4">
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <div className="flex items-center justify-center space-x-2 rounded-md border border-dashed border-gray-300 p-4 transition-colors hover:border-primary hover:bg-primary/5">
                <Upload className="h-5 w-5" />
                <span>Upload new picture</span>
              </div>
              <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </Label>

            {avatarFile && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  {avatarFile.name} ({Math.round(avatarFile.size / 1024)} KB)
                </p>

                {isUploading && <Progress value={uploadProgress} className="h-2 w-full" />}

                <div className="flex space-x-2">
                  <Button onClick={handleAvatarUpload} disabled={isUploading} size="sm" className="w-full">
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAvatarFile(null)
                      setAvatarPreview(null)
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>

                {showSuccessMessage && (
                  <div className="flex items-center rounded-md bg-green-50 p-2 text-sm text-green-600">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Profile picture updated successfully!
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {authState.error && (
              <Alert variant="destructive">
                <AlertDescription>{authState.error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  aria-invalid={!!profileErrors.name}
                  aria-describedby={profileErrors.name ? "name-error" : undefined}
                />
                {profileErrors.name && (
                  <p id="name-error" className="text-sm text-red-500">
                    {profileErrors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name (optional)</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={profileForm.displayName}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  aria-invalid={!!profileErrors.email}
                  aria-describedby={profileErrors.email ? "email-error" : undefined}
                />
                {profileErrors.email && (
                  <p id="email-error" className="text-sm text-red-500">
                    {profileErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (optional)</Label>
                <Input id="phone" name="phone" type="tel" value={profileForm.phone} onChange={handleProfileChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input id="location" name="location" value={profileForm.location} onChange={handleProfileChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation (optional)</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={profileForm.occupation}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={profileForm.timezone} onValueChange={(value) => handleSelectChange("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={profileForm.dateFormat}
                  onValueChange={(value) => handleSelectChange("dateFormat", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select
                  value={profileForm.timeFormat}
                  onValueChange={(value) => handleSelectChange("timeFormat", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profileForm.bio}
                  onChange={handleProfileChange}
                  rows={4}
                  aria-invalid={!!profileErrors.bio}
                  aria-describedby={profileErrors.bio ? "bio-error" : undefined}
                />
                {profileErrors.bio && (
                  <p id="bio-error" className="text-sm text-red-500">
                    {profileErrors.bio}
                  </p>
                )}
                <p className="text-sm text-gray-500">Brief description for your profile. Max 500 characters.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isProfileSubmitting || authState.isLoading}
                className="transition-all hover:scale-105"
              >
                {(isProfileSubmitting || authState.isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
})
