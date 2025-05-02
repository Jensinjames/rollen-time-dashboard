"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { Calendar, Clock, Activity, BarChart3, PieChartIcon, LineChartIcon } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  type ActivityItem,
  type TimeRange,
  processActivityData,
  getActivityPeriodData,
  getActivityTypeColor,
} from "@/utils/profile-activity-utils"

interface ActivityVisualizationProps {
  activityData: ActivityItem[]
}

export function ActivityVisualization({ activityData }: ActivityVisualizationProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("30days")
  const [chartType, setChartType] = useState<"overview" | "daily" | "hourly" | "types">("overview")
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Process activity data based on selected time range
  const stats = useMemo(() => processActivityData(activityData, timeRange), [activityData, timeRange])

  // Get period data (today, this week, this month)
  const periodData = useMemo(() => getActivityPeriodData(activityData), [activityData])

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.stroke }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Activity Insights</h2>
          <p className="text-muted-foreground">Visualize your account activity patterns</p>
        </div>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{periodData.today}</p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{periodData.thisWeek}</p>
              </div>
              <div className="p-2 bg-green-100 text-green-700 rounded-full">
                <Activity className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{periodData.thisMonth}</p>
              </div>
              <div className="p-2 bg-purple-100 text-purple-700 rounded-full">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">{periodData.total}</p>
              </div>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-full">
                <PieChartIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Activity Trends</CardTitle>
          <CardDescription>Visualize your activity patterns over time</CardDescription>

          <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)} className="mt-2">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <LineChartIcon className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="daily" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="hourly" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Hourly
              </TabsTrigger>
              <TabsTrigger value="types" className="flex items-center gap-1">
                <PieChartIcon className="h-4 w-4" />
                By Type
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <TabsContent value="overview" className="mt-0">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.recentTrend}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                    interval={isMobile ? 2 : 1}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Activities"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorActivity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="daily" className="mt-0">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.activityByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                    interval={
                      isMobile
                        ? Math.floor(stats.activityByDay.length / 5)
                        : Math.floor(stats.activityByDay.length / 10)
                    }
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Activities" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="hourly" className="mt-0">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.activityByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}:00`}
                    interval={isMobile ? 3 : 1}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Activities" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="types" className="mt-0">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.activityByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={isMobile ? 80 : 120}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="type"
                    label={({ type, percent }) => (percent > 0.05 ? `${type} (${(percent * 100).toFixed(0)}%)` : "")}
                  >
                    {stats.activityByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getActivityTypeColor(entry.type)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
            <CardDescription>Breakdown of your activities by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.activityByType.map((item) => (
                <div key={item.type} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getActivityTypeColor(item.type) }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{item.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} ({((item.count / stats.totalActivities) * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(item.count / stats.totalActivities) * 100}%`,
                          backgroundColor: getActivityTypeColor(item.type),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Heatmap</CardTitle>
            <CardDescription>When you're most active during the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 24 }).map((_, hour) => {
                const hourData = stats.activityByHour.find((h) => h.hour === hour)
                const count = hourData?.count || 0
                const maxCount = Math.max(...stats.activityByHour.map((h) => h.count))
                const intensity = maxCount > 0 ? Math.min(Math.ceil((count / maxCount) * 5), 5) : 0

                return (
                  <div
                    key={hour}
                    className={`aspect-square rounded-sm flex items-center justify-center text-xs ${
                      intensity === 0
                        ? "bg-gray-100"
                        : intensity === 1
                          ? "bg-blue-100"
                          : intensity === 2
                            ? "bg-blue-200"
                            : intensity === 3
                              ? "bg-blue-300"
                              : intensity === 4
                                ? "bg-blue-400"
                                : "bg-blue-500 text-white"
                    }`}
                    title={`${hour}:00 - ${count} activities`}
                  >
                    {hour}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-between mt-4 text-xs text-muted-foreground">
              <div>Less active</div>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-gray-100 rounded-sm"></div>
                <div className="w-4 h-4 bg-blue-100 rounded-sm"></div>
                <div className="w-4 h-4 bg-blue-200 rounded-sm"></div>
                <div className="w-4 h-4 bg-blue-300 rounded-sm"></div>
                <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              </div>
              <div>More active</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
