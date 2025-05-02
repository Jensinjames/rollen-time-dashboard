"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "lucide-react"
import { useTracking } from "@/context/tracking-context"
import { useWellness } from "@/context/wellness-context"
import { formatDuration } from "@/components/activity-timer"
import { getCategoryColorClass } from "@/types/wellness"
import { ValidateTrackingData } from "@/components/validate-tracking-data"
import { History } from "lucide-react"

export function TrackingHistory() {
  const { recentSessions = [] } = useTracking()
  const { categories } = useWellness()
  const [activeTab, setActiveTab] = useState("recent")

  // Group sessions by date
  const sessionsByDate = recentSessions.reduce<Record<string, typeof recentSessions>>((acc, session) => {
    if (!session.endTime) return acc

    const dateKey = format(session.endTime, "yyyy-MM-dd")
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(session)
    return acc
  }, {})

  // Sort dates in descending order
  const sortedDates = Object.keys(sessionsByDate).sort((a, b) => b.localeCompare(a))

  return (
    <Card className="col-span-full">
      <CardHeader>
        <h2 className="text-xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          <History className="h-5 w-5 text-blue-600" />
          Recent Tracking History
        </h2>
        <CardDescription>View your recent tracking activity</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent" value={activeTab} onValueChange={setActiveTab} id="tracking-history-tabs">
          <TabsList className="mb-4">
            <TabsTrigger value="recent" id="tracking-history-recent">
              Recent Activities
            </TabsTrigger>
            <TabsTrigger value="validate" id="tracking-history-validate">
              Validate Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            {recentSessions.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">No tracking history available</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map((dateKey) => (
                  <div key={dateKey}>
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                    </h3>
                    <div className="space-y-2">
                      {sessionsByDate[dateKey].map((session) => {
                        // Find category and metric
                        const category = categories.find((c) => c.id === session.categoryId)
                        const metric = category?.metrics.find((m) => m.id === session.metricId)

                        if (!category || !metric) {
                          return null // Skip invalid sessions
                        }

                        const colorClass = getCategoryColorClass(category, "bg")
                        const textColorClass = getCategoryColorClass(category, "text")

                        return (
                          <div key={session.id} className="flex items-center justify-between rounded-md border p-3">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-1 rounded-full ${colorClass}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={`font-medium ${textColorClass}`}>
                                    {category.name}
                                  </Badge>
                                  <span className="font-medium">{metric.name}</span>
                                </div>
                                {session.notes && <p className="mt-1 text-sm text-muted-foreground">{session.notes}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {session.endTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {format(session.endTime, "h:mm a")}
                                </div>
                              )}
                              <div className="font-mono font-medium">{formatDuration(session.duration)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="validate">
            <ValidateTrackingData />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
