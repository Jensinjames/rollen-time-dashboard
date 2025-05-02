"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DailyMetrics } from "@/components/daily-metrics"
import { CategoryOverview } from "@/components/category-overview"
import { CategoryDetails } from "@/components/category-details"
import { AddEntryForm } from "@/components/add-entry-form"
import { EntriesList } from "@/components/entries-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { WellnessTrends } from "@/components/wellness-trends"
import { ActiveTracking } from "@/components/active-tracking"
import { TrackingHistory } from "@/components/tracking-history"
import { TrackingStatistics } from "@/components/tracking-statistics"
import { WellnessProvider } from "@/context/wellness-context"
import { TrackingProvider } from "@/context/tracking-context"
import { useAuth } from "@/context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import type { WellnessEntryData } from "@/types/wellness"

export default function Dashboard() {
  const { authState, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
  const [entryToEdit, setEntryToEdit] = useState<WellnessEntryData | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)

  // Check authentication status
  useEffect(() => {
    // Short timeout to allow auth state to initialize
    const timer = setTimeout(() => {
      setIsLoading(false)
      if (!isAuthenticated && !authState.isLoading) {
        router.push("/login")
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [isAuthenticated, authState.isLoading, router])

  // Open the form for a new entry
  const handleAddNewEntry = () => {
    setEntryToEdit(null)
    setIsAddEntryOpen(true)
  }

  // Handle editing an entry
  const handleEditEntry = (entry: WellnessEntryData) => {
    setEntryToEdit(entry)
    setIsAddEntryOpen(true)
  }

  // Optional date range handler
  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range)
    // You can add additional logic here to filter data based on the date range
  }

  if (isLoading || authState.isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <WellnessProvider>
      <TrackingProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <DashboardHeader onAddEntry={handleAddNewEntry} />

              <div className="grid gap-6">
                <section>
                  <h2 className="mb-4 text-lg font-medium">Daily Overview</h2>
                  <DailyMetrics />
                </section>

                <section>
                  <h2 className="mb-4 text-lg font-medium">Category Performance</h2>
                  <div className="shadow-box p-6 rounded-xl">
                    <CategoryOverview />
                  </div>
                </section>

                <section className="shadow-box p-6 rounded-xl">
                  <ActiveTracking />
                </section>

                <section>
                  <TrackingStatistics />
                </section>

                <section>
                  <h2 className="mb-4 text-lg font-medium">Detailed Analysis</h2>
                  <CategoryDetails />
                </section>

                <section className="shadow-box p-6 rounded-xl">
                  <TrackingHistory />
                </section>

                <section>
                  <h2 className="mb-4 text-lg font-medium">Wellness Trends</h2>
                  <div className="shadow-box p-6 rounded-xl">
                    <WellnessTrends />
                  </div>
                </section>

                <section className="shadow-box p-6 rounded-xl">
                  <EntriesList onEdit={handleEditEntry} />
                </section>
              </div>
            </div>
          </div>

          <AddEntryForm open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen} entryToEdit={entryToEdit} />
        </div>
      </TrackingProvider>
    </WellnessProvider>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid gap-6">
            {/* Daily Overview skeleton */}
            <section>
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            </section>

            {/* Category Performance skeleton */}
            <section>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 rounded-xl" />
            </section>

            {/* Active Tracking skeleton */}
            <Skeleton className="h-48 rounded-xl" />

            {/* More sections */}
            {[1, 2, 3].map((i) => (
              <section key={i}>
                <Skeleton className="h-6 w-36 mb-4" />
                <Skeleton className="h-64 rounded-xl" />
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
