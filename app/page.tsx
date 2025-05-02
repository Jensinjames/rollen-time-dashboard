"use client"

import { useState } from "react"
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
import type { WellnessEntryData } from "@/types/wellness"

export default function Dashboard() {
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
  const [entryToEdit, setEntryToEdit] = useState<WellnessEntryData | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)

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
