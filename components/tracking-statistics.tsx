"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { format, subDays, startOfDay, endOfDay } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { CalendarIcon, Clock, Activity, Award, Flame, Filter } from "lucide-react"
import { useTracking } from "@/context/tracking-context"
import { useWellness } from "@/context/wellness-context"
import { cn } from "@/lib/utils"
import {
  calculateTrackingStats,
  formatDurationHumanReadable,
  formatHour,
  getCategoryColor,
  type CategoryInfo,
} from "@/utils/statistics-utils"
import { useMediaQuery } from "@/hooks/use-media-query"

export function TrackingStatistics() {
  const { recentSessions } = useTracking()
  const { categories } = useWellness()
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "custom">("30days")
  const [customDateRange, setCustomDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedTab, setSelectedTab] = useState("overview")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Convert categories to the format expected by the statistics utils
  const categoryInfo: CategoryInfo[] = useMemo(() => {
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      metrics: category.metrics.map((metric) => ({
        id: metric.id,
        name: metric.name,
      })),
    }))
  }, [categories])

  // Calculate date range based on selected time range
  const dateRange = useMemo(() => {
    const today = new Date()

    switch (timeRange) {
      case "7days":
        return {
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today),
        }
      case "30days":
        return {
          from: startOfDay(subDays(today, 29)),
          to: endOfDay(today),
        }
      case "90days":
        return {
          from: startOfDay(subDays(today, 89)),
          to: endOfDay(today),
        }
      case "custom":
        return {
          from: startOfDay(customDateRange.from),
          to: endOfDay(customDateRange.to),
        }
      default:
        return {
          from: startOfDay(subDays(today, 29)),
          to: endOfDay(today),
        }
    }
  }, [timeRange, customDateRange])

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateTrackingStats(recentSessions, categoryInfo, dateRange)
  }, [recentSessions, categoryInfo, dateRange])

  // Filter statistics by category if needed
  const filteredStats = useMemo(() => {
    if (!categoryFilter) return stats

    return {
      ...stats,
      timeDistribution: stats.timeDistribution.filter((item) => item.categoryId === categoryFilter),
      dailyActivity: stats.dailyActivity.map((day) => ({
        ...day,
        categories: day.categories.filter((cat) => cat.categoryId === categoryFilter),
      })),
    }
  }, [stats, categoryFilter])

  // Format date range for display
  const dateRangeDisplay = useMemo(() => {
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
  }, [dateRange])

  // Prepare data for charts
  const dailyActivityData = useMemo(() => {
    return filteredStats.dailyActivity.map((day) => ({
      date: format(day.date, "MMM d"),
      fullDate: day.date,
      time: day.totalTime / (1000 * 60 * 60), // Convert to hours
      sessions: day.sessions,
      ...day.categories.reduce(
        (acc, cat) => {
          const category = categories.find((c) => c.id === cat.categoryId)
          if (category) {
            acc[category.name] = cat.totalTime / (1000 * 60 * 60) // Convert to hours
          }
          return acc
        },
        {} as Record<string, number>,
      ),
    }))
  }, [filteredStats.dailyActivity, categories])

  const weekdayData = useMemo(() => {
    return filteredStats.weekdayDistribution.map((day) => ({
      day: day.day.substring(0, 3), // Abbreviate day names
      time: day.totalTime / (1000 * 60 * 60), // Convert to hours
      sessions: day.sessions,
    }))
  }, [filteredStats.weekdayDistribution])

  const hourlyData = useMemo(() => {
    return filteredStats.hourlyDistribution.map((hour) => ({
      hour: formatHour(hour.hour),
      hourNum: hour.hour,
      time: hour.totalTime / (1000 * 60 * 60), // Convert to hours
      sessions: hour.sessions,
    }))
  }, [filteredStats.hourlyDistribution])

  const categoryData = useMemo(() => {
    return filteredStats.timeDistribution.map((cat) => ({
      name: cat.categoryName,
      value: cat.totalTime / (1000 * 60 * 60), // Convert to hours
      color: getCategoryColor(cat.color),
    }))
  }, [filteredStats.timeDistribution])

  const metricData = useMemo(() => {
    if (!categoryFilter) return []

    const selectedCategory = filteredStats.timeDistribution.find((cat) => cat.categoryId === categoryFilter)
    if (!selectedCategory) return []

    return selectedCategory.metrics.map((metric) => ({
      name: metric.metricName,
      value: metric.totalTime / (1000 * 60 * 60), // Convert to hours
      color: getCategoryColor(selectedCategory.color),
    }))
  }, [filteredStats.timeDistribution, categoryFilter])

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.stroke }}>
              {entry.name}: {entry.value.toFixed(2)} hours
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="col-span-full shadow-box overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Tracking Statistics</CardTitle>
            <CardDescription className="text-blue-100">
              Analyze your time tracking patterns and productivity
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {timeRange === "custom"
                    ? dateRangeDisplay
                    : `Last ${timeRange === "7days" ? "7 days" : timeRange === "30days" ? "30 days" : "90 days"}`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-2 border-b">
                  <div className="flex gap-2">
                    <Button
                      variant={timeRange === "7days" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange("7days")}
                    >
                      7 days
                    </Button>
                    <Button
                      variant={timeRange === "30days" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange("30days")}
                    >
                      30 days
                    </Button>
                    <Button
                      variant={timeRange === "90days" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange("90days")}
                    >
                      90 days
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <div className="text-sm font-medium mb-2">Custom Range</div>
                  <Calendar
                    mode="range"
                    selected={{
                      from: customDateRange.from,
                      to: customDateRange.to,
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setCustomDateRange(range)
                        setTimeRange("custom")
                      }
                    }}
                    initialFocus
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Select
              value={categoryFilter || "all"}
              onValueChange={(value) => setCategoryFilter(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} id="tracking-stats-tabs">
          <TabsList className="mb-4">
            <TabsTrigger value="overview" id="tracking-stats-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="daily" id="tracking-stats-daily">
              Daily Activity
            </TabsTrigger>
            <TabsTrigger value="patterns" id="tracking-stats-patterns">
              Activity Patterns
            </TabsTrigger>
            <TabsTrigger value="categories" id="tracking-stats-categories">
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Tracked Time"
                value={formatDurationHumanReadable(filteredStats.totalTrackedTime)}
                icon={<Clock className="h-5 w-5 text-blue-700" />}
                description={`${(filteredStats.totalTrackedTime / (1000 * 60 * 60)).toFixed(1)} hours`}
              />

              <StatCard
                title="Total Sessions"
                value={filteredStats.totalSessions.toString()}
                icon={<Activity className="h-5 w-5 text-green-700" />}
                description={`Avg ${formatDurationHumanReadable(filteredStats.averageSessionDuration)} per session`}
              />

              <StatCard
                title="Current Streak"
                value={filteredStats.streakData.currentStreak.toString()}
                icon={<Flame className="h-5 w-5 text-orange-700" />}
                description={`Longest: ${filteredStats.streakData.longestStreak} days`}
              />

              <StatCard
                title="Most Tracked"
                value={filteredStats.mostTrackedCategory.categoryName}
                icon={<Award className="h-5 w-5 text-purple-700" />}
                description={`${filteredStats.mostTrackedCategory.percentage.toFixed(0)}% of total time`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Daily Activity</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={isMobile ? 6 : 2} />
                        <YAxis
                          label={{
                            value: "Hours",
                            angle: -90,
                            position: "insideLeft",

                            angle: -90,
                            position: "insideLeft",
                            fontSize: 12,
                          }}
                          tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="time"
                          name="Total Hours"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Longest Session</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-muted-foreground">Duration</div>
                          <div className="text-xl font-bold">
                            {formatDurationHumanReadable(filteredStats.longestSession.duration)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Date</div>
                          <div className="text-right">{format(filteredStats.longestSession.date, "MMM d, yyyy")}</div>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-muted-foreground">Category</div>
                          <div>{filteredStats.longestSession.categoryName}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Metric</div>
                          <div className="text-right">{filteredStats.longestSession.metricName}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Time Distribution</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={isMobile ? 80 : 100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) =>
                            percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ""
                          }
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value.toFixed(2)} hours`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Activity by Day of Week</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekdayData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis
                          label={{
                            value: "Hours",
                            angle: -90,
                            position: "insideLeft",
                            fontSize: 12,
                          }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="time" name="Hours" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="daily">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Daily Activity Breakdown</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyActivityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={isMobile ? 6 : 2} />
                      <YAxis
                        label={{
                          value: "Hours",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 12,
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {categories
                        .filter((cat) => !categoryFilter || cat.id === categoryFilter)
                        .map((category, index) => (
                          <Bar
                            key={category.id}
                            dataKey={category.name}
                            stackId="a"
                            fill={getCategoryColor(category.color)}
                          />
                        ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Sessions per Day</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} interval={isMobile ? 6 : 2} />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="sessions"
                          name="Sessions"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Daily Activity Calendar</h3>
                  <div className="border rounded-md p-4">
                    <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="font-medium">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {dailyActivityData.map((day, index) => {
                        const intensity = day.time > 0 ? Math.min(Math.ceil(day.time / 2), 4) : 0

                        return (
                          <div
                            key={index}
                            className={cn(
                              "aspect-square rounded-md flex items-center justify-center text-xs",
                              intensity === 0 && "bg-gray-100",
                              intensity === 1 && "bg-blue-100",
                              intensity === 2 && "bg-blue-200",
                              intensity === 3 && "bg-blue-300",
                              intensity === 4 && "bg-blue-400",
                            )}
                            title={`${format(day.fullDate, "MMM d")}: ${day.time.toFixed(1)} hours`}
                          >
                            {format(day.fullDate, "d")}
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                      <div>Less</div>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 bg-gray-100 rounded-sm"></div>
                        <div className="w-4 h-4 bg-blue-100 rounded-sm"></div>
                        <div className="w-4 h-4 bg-blue-200 rounded-sm"></div>
                        <div className="w-4 h-4 bg-blue-300 rounded-sm"></div>
                        <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
                      </div>
                      <div>More</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="patterns">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Activity by Hour of Day</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} interval={isMobile ? 3 : 1} />
                      <YAxis
                        label={{
                          value: "Hours",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 12,
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="time" name="Hours" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Peak Activity Times</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {hourlyData
                      .sort((a, b) => b.time - a.time)
                      .slice(0, 4)
                      .map((hour, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{hour.hour}</div>
                            <div className="text-xs text-muted-foreground">{hour.time.toFixed(1)} hours</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Activity by Day of Week</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekdayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis
                        yAxisId="left"
                        label={{
                          value: "Hours",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 12,
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{
                          value: "Sessions",
                          angle: 90,
                          position: "insideRight",
                          fontSize: 12,
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="time" name="Hours" fill="#3b82f6" />
                      <Bar yAxisId="right" dataKey="sessions" name="Sessions" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">Streak Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 border rounded-md">
                      <div className="text-xs text-muted-foreground">Current Streak</div>
                      <div className="text-2xl font-bold flex items-center gap-1">
                        {filteredStats.streakData.currentStreak}
                        <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="text-xs text-muted-foreground">days</div>
                    </div>

                    <div className="p-3 border rounded-md">
                      <div className="text-xs text-muted-foreground">Longest Streak</div>
                      <div className="text-2xl font-bold flex items-center gap-1">
                        {filteredStats.streakData.longestStreak}
                        <Award className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="text-xs text-muted-foreground">days</div>
                    </div>

                    <div className="p-3 border rounded-md">
                      <div className="text-xs text-muted-foreground">Days Tracked</div>
                      <div className="text-2xl font-bold flex items-center gap-1">
                        {filteredStats.streakData.totalDaysTracked}
                        <Calendar className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-xs text-muted-foreground">total</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Category Distribution</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={isMobile ? 80 : 100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ""
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value.toFixed(2)} hours`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Category Breakdown</h4>
                  <div className="space-y-3">
                    {filteredStats.timeDistribution.map((category, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getCategoryColor(category.color) }}
                            ></div>
                            <span className="font-medium">{category.categoryName}</span>
                          </div>
                          <div className="text-sm">
                            {formatDurationHumanReadable(category.totalTime)} ({category.percentage.toFixed(0)}%)
                          </div>
                        </div>
                        <Progress
                          value={category.percentage}
                          className="h-2"
                          indicatorClassName={`bg-${category.color}-500`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                {categoryFilter ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">Metric Distribution</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={metricData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={isMobile ? 80 : 100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ""
                            }
                          >
                            {metricData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`${entry.color}${80 + index * 10}`} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value.toFixed(2)} hours`, ""]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Metric Breakdown</h4>
                      <div className="space-y-3">
                        {metricData.map((metric, index) => {
                          const percentage = (metric.value / metricData.reduce((sum, m) => sum + m.value, 0)) * 100

                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: `${metric.color}${80 + index * 10}` }}
                                  ></div>
                                  <span className="font-medium">{metric.name}</span>
                                </div>
                                <div className="text-sm">
                                  {metric.value.toFixed(1)} hours ({percentage.toFixed(0)}%)
                                </div>
                              </div>
                              <Progress
                                value={percentage}
                                className="h-2"
                                indicatorClassName="bg-blue-500"
                                style={
                                  {
                                    "--tw-bg-opacity": 1,
                                    backgroundColor: `${metric.color}${80 + index * 10}`,
                                  } as React.CSSProperties
                                }
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 border rounded-md">
                    <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Select a Category</h3>
                    <p className="text-center text-muted-foreground mt-2">
                      Select a specific category from the filter dropdown to view detailed metric distribution.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      {categories.map((category) => (
                        <Button key={category.id} variant="outline" onClick={() => setCategoryFilter(category.id)}>
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  description: string
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card className="shadow-box card-3d-effect">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              {value}
            </h3>
          </div>
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-md">
            {icon}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}
