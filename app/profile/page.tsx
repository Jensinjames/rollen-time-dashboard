"use client"

import { useMemo } from "react"

import { useState, useEffect, lazy, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useColorTheme } from "@/context/theme-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Lock, Settings, Palette, Activity, Shield, BarChart3 } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { generateMockActivityData } from "@/utils/profile-activity-utils"

// Lazy load tab components
const ProfileTab = lazy(() => import("@/components/profile/profile-tab").then((mod) => ({ default: mod.ProfileTab })))
const SecurityTab = lazy(() =>
  import("@/components/profile/security-tab").then((mod) => ({ default: mod.SecurityTab })),
)
const ActivityTab = lazy(() =>
  import("@/components/profile/activity-tab").then((mod) => ({ default: mod.ActivityTab })),
)
const ActivityVisualizationTab = lazy(() =>
  import("@/components/profile/activity-visualization-tab").then((mod) => ({ default: mod.ActivityVisualizationTab })),
)

// Import other tabs as needed
// const PreferencesTab = lazy(() => import("@/components/profile/preferences-tab").then(mod => ({ default: mod.PreferencesTab })))
// const AppearanceTab = lazy(() => import("@/components/profile/appearance-tab").then(mod => ({ default: mod.AppearanceTab })))
// const PrivacyTab = lazy(() => import("@/components/profile/privacy-tab").then(mod => ({ default: mod.PrivacyTab })))

// Skeleton loaders for each tab
const TabSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 w-64 bg-gray-200 rounded"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 md:col-span-2 bg-gray-200 rounded"></div>
    </div>
  </div>
)

// Skeleton loader for visualization tab
const VisualizationSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex justify-between">
      <div className="h-8 w-64 bg-gray-200 rounded"></div>
      <div className="h-8 w-32 bg-gray-200 rounded"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="h-24 bg-gray-200 rounded"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
    </div>
    <div className="h-80 bg-gray-200 rounded"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  </div>
)

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "profile"
  const router = useRouter()

  const { authState } = useAuth()
  const { currentTheme } = useColorTheme()
  const { user } = authState

  const [activeTab, setActiveTab] = useState(initialTab)
  // Use debounce to prevent too many URL updates
  const debouncedActiveTab = useDebounce(activeTab, 300)

  // Generate mock activity data
  const mockActivityData = useMemo(() => generateMockActivityData(90), [])

  // Mock activity data - moved outside component to prevent recreation on render
  const activityData = [
    { date: "2023-05-01", type: "login", details: "Logged in from Chrome on Windows" },
    { date: "2023-05-01", type: "update", details: "Updated profile information" },
    { date: "2023-04-29", type: "login", details: "Logged in from Safari on iPhone" },
    { date: "2023-04-28", type: "password", details: "Changed password" },
    { date: "2023-04-25", type: "login", details: "Logged in from Firefox on MacOS" },
    // Add more items for virtualization testing
    ...Array.from({ length: 20 }, (_, i) => ({
      date: `2023-04-${20 - i}`,
      type: i % 3 === 0 ? "login" : i % 3 === 1 ? "update" : "password",
      details: `Auto-generated activity item ${i + 1}`,
    })),
  ]

  // Mock connected accounts - moved outside component to prevent recreation on render
  const connectedAccounts = [
    { id: 1, provider: "Google", connected: true, email: "user@gmail.com" },
    { id: 2, provider: "Apple", connected: false, email: null },
    { id: 3, provider: "Facebook", connected: false, email: null },
    { id: 4, provider: "Twitter", connected: false, email: null },
  ]

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href)
    if (debouncedActiveTab === "profile") {
      url.searchParams.delete("tab")
    } else {
      url.searchParams.set("tab", debouncedActiveTab)
    }
    window.history.replaceState({}, "", url.toString())
  }, [debouncedActiveTab])

  // Prepare initial form data for profile tab
  const profileFormData = user
    ? {
        name: user.name || "",
        displayName: user.profile.displayName || "",
        email: user.email || "",
        bio: user.profile.bio || "",
        timezone: user.profile.timezone || "UTC",
        dateFormat: user.profile.dateFormat || "MM/DD/YYYY",
        timeFormat: user.profile.timeFormat || "12h",
        phone: user.profile?.phone || "",
        location: user.profile?.location || "",
        occupation: user.profile?.occupation || "",
      }
    : {
        name: "",
        displayName: "",
        email: "",
        bio: "",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        phone: "",
        location: "",
        occupation: "",
      }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>You need to be logged in to view this page</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 flex flex-wrap">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-fadeIn">
          <Suspense fallback={<TabSkeleton />}>
            <ProfileTab initialData={profileFormData} />
          </Suspense>
        </TabsContent>

        <TabsContent value="security" className="animate-fadeIn">
          <Suspense fallback={<TabSkeleton />}>
            <SecurityTab connectedAccounts={connectedAccounts} />
          </Suspense>
        </TabsContent>

        <TabsContent value="activity" className="animate-fadeIn">
          <Suspense fallback={<TabSkeleton />}>
            <ActivityTab activityData={activityData} />
          </Suspense>
        </TabsContent>

        <TabsContent value="visualization" className="animate-fadeIn">
          <Suspense fallback={<VisualizationSkeleton />}>
            <ActivityVisualizationTab activityData={mockActivityData} />
          </Suspense>
        </TabsContent>

        {/* Placeholder for other tabs - implement similar pattern */}
        <TabsContent value="preferences" className="animate-fadeIn">
          <TabSkeleton />
        </TabsContent>

        <TabsContent value="appearance" className="animate-fadeIn">
          <TabSkeleton />
        </TabsContent>

        <TabsContent value="privacy" className="animate-fadeIn">
          <TabSkeleton />
        </TabsContent>
      </Tabs>
    </div>
  )
}
