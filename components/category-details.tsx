"use client"

import type React from "react"
import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector, RadialBarChart, RadialBar, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  type TimePeriodData,
  type CategoryTimeData,
  type MetricTimeData,
  getSampleTimeData,
  getTimePeriodData,
  formatTime,
  getProgressColorClass,
  DAILY_HOUR_CAP,
} from "@/utils/time-allocation"
import { useTracking } from "@/context/tracking-context"
import { useWellness } from "@/context/wellness-context"
import type { CategoryId } from "@/types/wellness"
import { useMediaQuery } from "@/hooks/use-media-query"
import { accessibleColors } from "@/utils/accessibility"
import { getCategoryIcon } from "@/components/custom-icons"

export function CategoryDetails() {
  const { categories, filteredEntries } = useWellness()
  const { trackingHistory = [], activeSessions } = useTracking() // Provide default empty array
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewType, setViewType] = useState<"pie" | "radial">("pie")
  const [refreshKey, setRefreshKey] = useState(0)
  const [timeFilter, setTimeFilter] = useState<"daily" | "weekly" | "monthly">("daily")
  const [timePeriodData, setTimePeriodData] = useState<TimePeriodData>(getSampleTimeData())
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([])
  const [autoRefresh, setAutoRefresh] = useState(true)
  const { getTotalTrackedTimeToday } = useTracking()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isSmallMobile = useMediaQuery("(max-width: 480px)")

  // Auto-refresh when tracking history changes
  useEffect(() => {
    if (trackingHistory && trackingHistory.length > 0) {
      setRefreshKey((prev) => prev + 1)
    }
  }, [trackingHistory])

  // Calculate total time spent for each category based on entries and tracking history
  const calculateCategoryData = useCallback(() => {
    const categoryData: Record<string, { name: string; value: number; color: string; children?: any[] }> = {}

    // Initialize categories
    categories.forEach((category) => {
      categoryData[category.id] = {
        name: category.name,
        value: 0,
        color: category.color,
        children: [],
      }
    })

    // Add data from entries
    if (filteredEntries && filteredEntries.length > 0) {
      filteredEntries.forEach((entry) => {
        entry.metrics.forEach((metric) => {
          const category = categories.find((c) => c.id === metric.categoryId)
          if (category) {
            const metricDef = category.metrics.find((m) => m.id === metric.metricId)
            if (metricDef && metricDef.type === "time") {
              // For time metrics, add the value (assumed to be in hours)
              categoryData[category.id].value += Math.min(metric.value, 7) // Cap at 7 hours per day

              // Add to children
              const existingChild = categoryData[category.id].children?.find((child) => child.name === metricDef.name)

              if (existingChild) {
                existingChild.value += Math.min(metric.value, 7)
              } else {
                categoryData[category.id].children?.push({
                  name: metricDef.name,
                  value: Math.min(metric.value, 7),
                  color: category.color,
                })
              }
            }
          }
        })
      })
    }

    // Add data from tracking history
    if (trackingHistory && trackingHistory.length > 0) {
      trackingHistory.forEach((item) => {
        const category = categories.find((c) => c.id === item.categoryId)
        if (category) {
          const metricDef = category.metrics.find((m) => m.id === item.metricId)
          if (metricDef) {
            const hours = item.duration / 60 / 60 // Convert seconds to hours
            categoryData[category.id].value += Math.min(hours, 7) // Cap at 7 hours

            // Add to children
            const existingChild = categoryData[category.id].children?.find((child) => child.name === metricDef.name)

            if (existingChild) {
              existingChild.value += Math.min(hours, 7)
            } else {
              categoryData[category.id].children?.push({
                name: metricDef.name,
                value: Math.min(hours, 7),
                color: category.color,
              })
            }
          }
        }
      })
    }

    return Object.values(categoryData)
  }, [categories, filteredEntries, trackingHistory])

  const categoryData = useMemo(() => calculateCategoryData(), [calculateCategoryData])

  // Get data for the selected category or all categories if none selected
  const getChartData = useCallback(() => {
    if (selectedCategory) {
      const category = categoryData.find((c) => c.name === selectedCategory)
      return category?.children || []
    }
    return categoryData
  }, [categoryData, selectedCategory])

  const chartData = useMemo(() => getChartData(), [getChartData])

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-2 shadow rounded border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{`${data.value.toFixed(1)} hours`}</p>
        </div>
      )
    }
    return null
  }

  // Get data for the selected time period
  const { categories: timeCategories, total } = useMemo(() => {
    return getTimePeriodData(timePeriodData, timeFilter)
  }, [timePeriodData, timeFilter])

  // Update time data with real-time tracking information
  const updateRealTimeData = useCallback(() => {
    const updatedCategories = timeCategories.map((category) => {
      // Find the corresponding wellness category
      const wellnessCategory = categories.find((c) => c.id === category.id)
      if (!wellnessCategory) return category

      // Update metrics with real-time tracking data
      const updatedMetrics = category.metrics.map((metric) => {
        const wellnessMetric = wellnessCategory.metrics.find((m) => m.name === metric.name)
        if (!wellnessMetric) return metric

        // Get tracked time for this metric today (in milliseconds)
        const trackedTimeMs = getTotalTrackedTimeToday(category.id as CategoryId, wellnessMetric.id)
        const trackedTimeHours = trackedTimeMs / (1000 * 60 * 60)

        // Add tracked time to current time
        const updatedCurrentHours = metric.currentHours + trackedTimeHours
        const updatedProgressPercent = Math.min(100, Math.round((updatedCurrentHours / metric.goalHours) * 100))

        return {
          ...metric,
          currentHours: updatedCurrentHours,
          progressPercent: updatedProgressPercent,
        }
      })

      // Recalculate category totals
      const totalGoalHours = updatedMetrics.reduce((sum, m) => sum + m.goalHours, 0)
      const totalCurrentHours = updatedMetrics.reduce((sum, m) => sum + m.currentHours, 0)
      const categoryProgressPercent =
        totalGoalHours > 0 ? Math.min(100, Math.round((totalCurrentHours / totalGoalHours) * 100)) : 0

      return {
        ...category,
        metrics: updatedMetrics,
        goalHours: totalGoalHours,
        currentHours: totalCurrentHours,
        progressPercent: categoryProgressPercent,
      }
    })

    // Recalculate total
    const totalGoalHours = updatedCategories.reduce((sum, c) => sum + c.goalHours, 0)
    const totalCurrentHours = updatedCategories.reduce((sum, c) => sum + c.currentHours, 0)
    const cappedGoalHours = Math.min(totalGoalHours, DAILY_HOUR_CAP)
    const progressPercent = Math.round((totalCurrentHours / DAILY_HOUR_CAP) * 100)
    const overCapacity = totalCurrentHours > DAILY_HOUR_CAP

    return {
      categories: updatedCategories,
      total: {
        goalHours: cappedGoalHours,
        currentHours: totalCurrentHours,
        progressPercent,
        overCapacity,
      },
    }
  }, [timeCategories, categories, getTotalTrackedTimeToday])

  // Real-time data with active sessions
  const realTimeData = useMemo(() => {
    return updateRealTimeData()
  }, [updateRealTimeData, activeSessions])

  // Auto-refresh data every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      const updated = updateRealTimeData()
      setTimePeriodData((prev) => ({
        ...prev,
        [timeFilter]: updated.categories,
        total: updated.total,
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh, updateRealTimeData, timeFilter])

  // Toggle category visibility
  const toggleCategoryVisibility = (categoryId: string) => {
    setHiddenCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Filter visible categories
  const visibleCategories = realTimeData.categories.filter((category) => !hiddenCategories.includes(category.id))

  return (
    <Card key={refreshKey} className="shadow-box overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Time Allocation</CardTitle>
            <CardDescription className="text-blue-100">How you spend your time across categories</CardDescription>
          </div>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Tabs defaultValue="pie" onValueChange={(value) => setViewType(value as "pie" | "radial")}>
              <TabsList className="bg-white/20">
                <TabsTrigger value="pie" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
                  Pie Chart
                </TabsTrigger>
                <TabsTrigger value="radial" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">
                  Radial
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                selectedCategory === category.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
              style={{
                backgroundColor: selectedCategory === category.name ? category.color : undefined,
                color: selectedCategory === category.name ? "#fff" : undefined,
              }}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="h-[300px]">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available for the selected date range</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={viewType === "pie" ? 100 : 80}
                  innerRadius={viewType === "radial" ? 40 : 0}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => (percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : "")}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface CategoryCardProps {
  category: CategoryTimeData
  timeFilter: string
  icon: React.ReactNode
}

function CategoryCard({ category, timeFilter, icon }: CategoryCardProps) {
  const [expandedMetrics, setExpandedMetrics] = useState<string[]>([])
  const { activeSessions } = useTracking()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Find active sessions for this category
  const categoryActiveSessions = useMemo(() => {
    return activeSessions.filter((session) => session.categoryId === category.id)
  }, [activeSessions, category.id])

  // Toggle metric expansion
  const toggleMetric = (metricName: string) => {
    setExpandedMetrics((prev) =>
      prev.includes(metricName) ? prev.filter((name) => name !== metricName) : [...prev, metricName],
    )
  }

  // Check if a metric is expanded
  const isMetricExpanded = (metricName: string) => {
    return expandedMetrics.includes(metricName)
  }

  // Get color class based on the color prop
  const getColorClass = (shade = 500) => {
    return `${category.color}-${shade}`
  }

  // Get the time period label
  const getTimePeriodLabel = () => {
    switch (timeFilter) {
      case "daily":
        return "Today"
      case "weekly":
        return "This Week"
      case "monthly":
        return "This Month"
      default:
        return "Today"
    }
  }

  return (
    <Card className="shadow-box overflow-hidden card-3d-effect">
      <div
        className={`${
          category.color === "green"
            ? "card-header-faith"
            : category.color === "red"
              ? "card-header-work"
              : category.color === "yellow"
                ? "card-header-life"
                : category.color === "pink"
                  ? "card-header-health"
                  : `bg-${getColorClass()}`
        } flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          <div className={`bg-${getColorClass(400)} p-2 rounded-md`}>{icon}</div>
          <h3 className="font-medium text-white text-lg font-semibold">{category.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {categoryActiveSessions.length > 0 && (
            <Badge variant="outline" className="bg-white/30 text-white border-white/50 font-medium animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              {categoryActiveSessions.length} Active
            </Badge>
          )}
          <Badge variant="outline" className="bg-white/30 text-white border-white/50 font-medium">
            {getTimePeriodLabel()}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Donut Chart - Responsive sizing */}
          <div className={`relative ${isMobile ? "w-32 h-32" : "w-40 h-40"} flex-shrink-0 mx-auto md:mx-0`}>
            <CategoryDonutChart
              metrics={category.metrics}
              overallPercentage={category.progressPercent}
              color={category.color}
            />
          </div>

          {/* Metrics List */}
          <div className="flex-1 w-full space-y-4">
            {category.metrics.map((metric, index) => {
              // Find active session for this metric
              const activeSession = categoryActiveSessions.find((session) => {
                const metricName = metric.name.toLowerCase().replace(/\s+/g, "")
                const sessionMetricId = session.metricId.toLowerCase()
                return sessionMetricId.includes(metricName) || metricName.includes(sessionMetricId)
              })

              return (
                <div
                  key={index}
                  className={cn(
                    "border rounded-md overflow-hidden transition-all duration-200",
                    isMetricExpanded(metric.name) ? `border-${getColorClass()} shadow-sm` : "border-gray-200",
                    activeSession ? `border-${getColorClass()} shadow-md` : "",
                  )}
                >
                  {/* Metric Header */}
                  <div
                    className={cn(
                      "flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50",
                      isMetricExpanded(metric.name) ? `bg-${getColorClass(100)}` : "",
                      activeSession ? `bg-${getColorClass(50)}` : "",
                    )}
                    onClick={() => toggleMetric(metric.name)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${getColorClass()}`}></div>
                      <span className="font-medium">{metric.name}</span>
                      {activeSession && (
                        <Badge
                          variant="outline"
                          className={`ml-1 ${
                            category.color === "green"
                              ? accessibleColors.green.light
                              : category.color === "red"
                                ? accessibleColors.red.light
                                : category.color === "yellow"
                                  ? accessibleColors.yellow.light
                                  : category.color === "pink"
                                    ? accessibleColors.pink.light
                                    : `text-${getColorClass()}`
                          } border-${getColorClass(200)} bg-${getColorClass(50)} animate-pulse`}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Tracking
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm flex items-center gap-1">
                        <span
                          className={`${
                            category.color === "green"
                              ? accessibleColors.green.light
                              : category.color === "red"
                                ? accessibleColors.red.light
                                : category.color === "yellow"
                                  ? accessibleColors.yellow.light
                                  : category.color === "pink"
                                    ? accessibleColors.pink.light
                                    : `text-${getColorClass()}`
                          }`}
                        >
                          {formatTime(metric.currentHours, metric.unit)}
                        </span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span>{metric.progressPercent}%</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {isMetricExpanded(metric.name) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Metric Details */}
                  {isMetricExpanded(metric.name) && (
                    <div className="p-4 bg-gray-50 space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{metric.progressPercent}%</span>
                        </div>
                        <Progress
                          value={metric.progressPercent}
                          className="h-2"
                          indicatorClassName={getProgressColorClass(metric.progressPercent)}
                        />
                      </div>

                      {/* Detailed Metrics - Responsive grid */}
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-gray-100">
                            <Target className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Goal</div>
                            <div className="text-sm font-medium">{formatTime(metric.goalHours, metric.unit)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-gray-100">
                            <Clock className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Current</div>
                            <div className="text-sm font-medium">{formatTime(metric.currentHours, metric.unit)}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-gray-100">
                            <Calendar className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Last Updated</div>
                            <div className="text-sm font-medium">
                              {activeSession ? <span className="text-green-500">Now (tracking)</span> : "Today"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-gray-100">
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Trend</div>
                            <div className="text-sm font-medium text-green-500 flex items-center gap-1">
                              Improving
                              <TrendingUp className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CategoryDonutChartProps {
  metrics: MetricTimeData[]
  overallPercentage: number
  color: string
}

function CategoryDonutChart({ metrics, overallPercentage, color }: CategoryDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const chartRef = useRef<HTMLDivElement>(null)

  // Prepare data for the chart
  const chartData = useMemo(() => {
    return metrics.map((metric) => ({
      name: metric.name,
      value: metric.currentHours,
      goal: metric.goalHours,
      percentage: metric.progressPercent,
      unit: metric.unit,
    }))
  }, [metrics])

  // Generate gradient IDs for each segment
  const gradientIds = useMemo(() => {
    return metrics.map((_, index) => `${color}Gradient${index}`)
  }, [metrics, color])

  // Handle mouse/touch events
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const onPieLeave = () => {
    setActiveIndex(null)
  }

  // Custom active shape - simplified for mobile
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
    const isMobileView = isMobile

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + (isMobileView ? 4 : 6)}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.8}
        />
        {!isMobileView && (
          <>
            <text x={cx} y={cy - 15} textAnchor="middle" fill={`var(--${color}-700)`} className="text-xs font-medium">
              {payload.name}
            </text>
            <text x={cx} y={cy + 15} textAnchor="middle" fill={`var(--${color}-700)`} className="text-xs">
              {formatTime(payload.value, payload.unit)}/{formatTime(payload.goal, payload.unit)} (
              {Math.round(percent * 100)}%)
            </text>
          </>
        )}
      </g>
    )
  }

  return (
    <div className="relative w-full h-full" ref={chartRef}>
      {/* SVG Gradients */}
      <svg width="0" height="0">
        <defs>
          {chartData.map((_, index) => (
            <linearGradient key={gradientIds[index]} id={gradientIds[index]} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`var(--${color}-${400 + index * 100})`} />
              <stop offset="100%" stopColor={`var(--${color}-${600 + index * 100})`} />
            </linearGradient>
          ))}
        </defs>
      </svg>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={isMobile ? { top: 0, right: 0, bottom: 0, left: 0 } : undefined}>
          <Pie
            activeIndex={activeIndex !== null ? activeIndex : undefined}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 35 : 50}
            outerRadius={isMobile ? 50 : 70}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            // Add touch events for mobile
            onClick={(_, index) => setActiveIndex(index === activeIndex ? null : index)}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#${gradientIds[index]})`}
                stroke={`var(--${color}-${500 + index * 100})`}
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => {
              const entry = props.payload
              return [
                `${formatTime(entry.value, entry.unit)}/${formatTime(entry.goal, entry.unit)} (${entry.percentage}%)`,
                entry.name,
              ]
            }}
            contentStyle={{
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              border: "none",
              fontSize: isMobile ? "12px" : "14px",
            }}
            // Optimize tooltip position for mobile
            position={isMobile ? { x: 0, y: 0 } : undefined}
            wrapperStyle={isMobile ? { zIndex: 1000 } : undefined}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center percentage - responsive font size */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`${isMobile ? "text-3xl" : "text-4xl"} font-bold text-${color}-600`}>{overallPercentage}%</div>
      </div>

      {/* 3D effect base - scaled for mobile */}
      <div
        className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${
          isMobile ? "w-2/3 h-1.5" : "w-3/4 h-2"
        } bg-gray-200 rounded-full opacity-50 blur-sm`}
      ></div>
    </div>
  )
}

interface EnhancedCompositeChartProps {
  categories: CategoryTimeData[]
  total: {
    goalHours: number
    currentHours: number
    progressPercent: number
    overCapacity: boolean
  }
  timeFilter: string
  getIconByName: (name: string) => React.ReactNode
  hiddenCategories: string[]
  onToggleCategory: (categoryId: string) => void
}

function EnhancedCompositeChart({
  categories,
  total,
  timeFilter,
  getIconByName,
  hiddenCategories,
  onToggleCategory,
}: EnhancedCompositeChartProps) {
  // State for the selected category to highlight
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null)
  const [showRadialView, setShowRadialView] = useState<boolean>(false)
  const { activeSessions } = useTracking()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isSmallMobile = useMediaQuery("(max-width: 480px)")

  // Prepare data for the chart
  const categoryDataForChart = useMemo(() => {
    return categories.map((category) => {
      // Find active sessions for this category
      const categoryActiveSessions = activeSessions.filter((session) => session.categoryId === category.id)
      const isTracking = categoryActiveSessions.length > 0

      return {
        id: category.id,
        name: category.name,
        value: category.currentHours,
        goalValue: category.goalHours,
        percentage: category.progressPercent,
        color: getCategoryColor(category.color),
        icon: getCategoryIcon(category.id, "h-5 w-5 text-white"),
        isTracking,
        metrics: category.metrics.map((metric) => ({
          name: metric.name,
          value: metric.currentHours,
          goalValue: metric.goalHours,
          percentage: metric.progressPercent,
        })),
      }
    })
  }, [categories, activeSessions])

  // Generate gradient IDs for each category
  const gradientIds = useMemo(() => {
    return categoryDataForChart.map((item) => `${item.name.toLowerCase()}Gradient`)
  }, [categoryDataForChart])

  // Generate parent-child gradient IDs
  const parentChildGradientIds = useMemo(() => {
    const ids: string[] = []
    categoryDataForChart.forEach((category) => {
      category.metrics.forEach((metric, index) => {
        ids.push(`${category.id}-${index}-gradient`)
      })
    })
    return ids
  }, [categoryDataForChart])

  // Handle category hover/click
  const handleCategoryFocus = (name: string) => {
    setHighlightedCategory(name)
  }

  const handleCategoryBlur = () => {
    setHighlightedCategory(null)
  }

  // Get color for a category
  function getCategoryColor(color: string): string {
    switch (color) {
      case "green":
        return "#22c55e"
      case "yellow":
        return "#eab308"
      case "red":
        return "#ef4444"
      case "pink":
        return "#ec4899"
      case "blue":
        return "#3b82f6"
      case "purple":
        return "#a855f7"
      default:
        return "#6366f1"
    }
  }

  // Get time period label
  const getTimePeriodLabel = () => {
    switch (timeFilter) {
      case "daily":
        return "Today"
      case "weekly":
        return "This Week"
      case "monthly":
        return "This Month"
      default:
        return "Today"
    }
  }

  // Custom active shape for the pie chart - simplified for mobile
  const renderActiveShape = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, value, name, goalValue } = props
    const percentage = Math.round((value / goalValue) * 100)

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + (isMobile ? 4 : 6)}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          opacity={0.8}
        />
        {!isSmallMobile && (
          <>
            <text
              x={cx}
              y={cy - 10}
              dy={8}
              textAnchor="middle"
              fill={fill}
              className={`${isMobile ? "text-xs" : "text-sm"} font-medium`}
            >
              {name}
            </text>
            <text
              x={cx}
              y={cy + 10}
              dy={8}
              textAnchor="middle"
              fill={fill}
              className={`${isMobile ? "text-[10px]" : "text-xs"}`}
            >
              {formatTime(value)}/{formatTime(goalValue)} ({percentage}%)
            </text>
          </>
        )}
      </g>
    )
  }

  // Prepare data for radial bar chart - simplified for mobile
  const radialData = useMemo(() => {
    // For mobile, limit the number of items to avoid clutter
    const filteredCategories = isMobile
      ? categoryDataForChart.filter((c) => !hiddenCategories.includes(c.id))
      : categoryDataForChart

    return filteredCategories
      .flatMap((category) => {
        // Parent category
        const parentItem = {
          name: category.name,
          value: category.percentage,
          fill: category.color,
          isParent: true,
          id: category.id,
        }

        // Child metrics - on mobile, only include if not too many
        const childItems =
          isMobile && category.metrics.length > 2
            ? category.metrics.slice(0, 2).map((metric, index) => ({
                name: `${category.name} - ${metric.name}`,
                value: metric.percentage,
                fill: category.color,
                opacity: 0.7 - index * 0.1,
                isParent: false,
                parentId: category.id,
                id: `${category.id}-${index}`,
              }))
            : category.metrics.map((metric, index) => ({
                name: `${category.name} - ${metric.name}`,
                value: metric.percentage,
                fill: category.color,
                opacity: 0.7 - index * 0.1,
                isParent: false,
                parentId: category.id,
                id: `${category.id}-${index}`,
              }))

        return [parentItem, ...childItems]
      })
      .filter((item) => {
        if (item.isParent) {
          return !hiddenCategories.includes(item.id)
        } else {
          return !hiddenCategories.includes(item.parentId)
        }
      })
  }, [categoryDataForChart, hiddenCategories, isMobile])

  // Calculate capped progress for display
  const displayProgress = total.overCapacity ? 100 : total.progressPercent

  return (
    <div className="w-full flex flex-col items-center">
      {/* Overall progress indicator */}
      <div className="mb-6 flex flex-col items-center">
        <div className="relative">
          <div className="text-4xl sm:text-5xl font-bold">{displayProgress}%</div>
          <div className="absolute -top-2 right-0 text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            {getTimePeriodLabel()}
          </div>
        </div>
        <div className="text-sm text-muted-foreground mt-1">Goal Completion</div>
        <div className="text-xs mt-1">
          <span className="font-medium">{formatTime(total.currentHours)}</span> of{" "}
          <span className="font-medium">{formatTime(total.goalHours)}</span>
          {total.overCapacity && <span className="ml-1 text-yellow-600">(exceeds {DAILY_HOUR_CAP}h daily cap)</span>}
        </div>

        {/* View toggle - with device indicators */}
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant={showRadialView ? "outline" : "default"}
            size="sm"
            onClick={() => setShowRadialView(false)}
            className="text-xs"
          >
            {!isMobile && <Monitor className="h-3 w-3 mr-1" />}
            Pie Chart
          </Button>
          <Button
            variant={!showRadialView ? "outline" : "default"}
            size="sm"
            onClick={() => setShowRadialView(true)}
            className="text-xs"
          >
            {!isMobile && <Smartphone className="h-3 w-3 mr-1" />}
            Radial View
          </Button>
        </div>
      </div>

      {/* SVG Gradients */}
      <svg width="0" height="0">
        <defs>
          {categoryDataForChart.map((item, index) => (
            <linearGradient key={gradientIds[index]} id={gradientIds[index]} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={item.color} stopOpacity={0.8} />
              <stop offset="100%" stopColor={item.color} stopOpacity={1} />
            </linearGradient>
          ))}

          {/* Parent-child relationship gradients */}
          {parentChildGradientIds.map((id, index) => {
            const categoryIndex = Math.floor(index / 3) // Assuming each category has ~3 metrics
            const baseColor = categoryDataForChart[categoryIndex]?.color || "#6366f1"
            return (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={baseColor} stopOpacity={0.9} />
                <stop offset="100%" stopColor={baseColor} stopOpacity={0.6} />
              </linearGradient>
            )
          })}
        </defs>
      </svg>

      {/* Responsive chart container - adjust height based on device */}
      <div
        className={`relative ${isSmallMobile ? "h-[250px]" : isMobile ? "h-[280px]" : "h-[300px]"} w-full max-w-[350px]`}
      >
        <ResponsiveContainer width="100%" height="100%">
          {showRadialView ? (
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius={isSmallMobile ? "15%" : "20%"}
              outerRadius={isSmallMobile ? "80%" : "90%"}
              barSize={isMobile ? 8 : 10}
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                background
                dataKey="value"
                label={isSmallMobile ? false : { position: "insideStart", fill: "#fff", fontSize: isMobile ? 8 : 10 }}
                cornerRadius={isMobile ? 6 : 10}
                onMouseEnter={(data) => {
                  if (data.isParent) {
                    handleCategoryFocus(data.name)
                  }
                }}
                onMouseLeave={handleCategoryBlur}
                // Add touch events for mobile
                onClick={(data) => {
                  if (data.isParent) {
                    handleCategoryFocus(data.name === highlightedCategory ? null : data.name)
                  }
                }}
              />
              <Tooltip
                formatter={(value, name) => {
                  const nameParts = name.split(" - ")
                  const displayName = nameParts.length > 1 ? nameParts[1] : nameParts[0]
                  return [`${value}%`, displayName]
                }}
                contentStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "none",
                  fontSize: isMobile ? "12px" : "14px",
                }}
                // Optimize tooltip position for mobile
                position={isMobile ? { x: 0, y: 0 } : undefined}
                wrapperStyle={isMobile ? { zIndex: 1000 } : undefined}
              />
            </RadialBarChart>
          ) : (
            <PieChart margin={isMobile ? { top: 0, right: 0, bottom: 0, left: 0 } : undefined}>
              <Pie
                data={categoryDataForChart}
                cx="50%"
                cy="50%"
                outerRadius={isSmallMobile ? 90 : isMobile ? 100 : 120}
                innerRadius={isSmallMobile ? 40 : isMobile ? 50 : 60}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => {
                  // Only show labels for segments that are large enough and not on small mobile
                  return !isSmallMobile && percent > 0.05 ? `${name}` : ""
                }}
                activeIndex={
                  highlightedCategory
                    ? categoryDataForChart.findIndex((item) => item.name === highlightedCategory)
                    : undefined
                }
                activeShape={renderActiveShape}
                onClick={(data) => handleCategoryFocus(data.name === highlightedCategory ? null : data.name)}
                onMouseEnter={(data) => handleCategoryFocus(data.name)}
                onMouseLeave={handleCategoryBlur}
              >
                {categoryDataForChart.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#${gradientIds[index]})`}
                    opacity={highlightedCategory && highlightedCategory !== entry.name ? 0.5 : 1}
                    stroke={highlightedCategory === entry.name ? "#fff" : "none"}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => {
                  const entry = categoryDataForChart.find((item) => item.name === name)
                  if (entry) {
                    const percentage = Math.round((entry.value / entry.goalValue) * 100)
                    return [`${formatTime(value)} / ${formatTime(entry.goalValue)} (${percentage}% of goal)`, name]
                  }
                  return [formatTime(value), name]
                }}
                contentStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  border: "none",
                  fontSize: isMobile ? "12px" : "14px",
                }}
                // Optimize tooltip position for mobile
                position={isMobile ? { x: 0, y: 0 } : undefined}
                wrapperStyle={isMobile ? { zIndex: 1000 } : undefined}
              />
            </PieChart>
          )}
        </ResponsiveContainer>

        {/* 3D effect base - scaled for mobile */}
        <div
          className={`absolute -bottom-4 left-1/2 transform -translate-x-1/2 ${
            isMobile ? "w-2/3 h-3" : "w-3/4 h-4"
          } bg-gray-200 rounded-full opacity-30 blur-sm`}
        ></div>

        {/* Legend with interactive progress bars - responsive grid */}
        <div className={`mt-8 grid ${isSmallMobile ? "grid-cols-1" : "grid-cols-2"} gap-x-4 gap-y-3 text-xs`}>
          {categoryDataForChart.map((entry, index) => (
            <TooltipProvider key={`legend-${index}`}>
              <UITooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex flex-col transition-opacity duration-200 cursor-pointer ${
                      highlightedCategory && highlightedCategory !== entry.name ? "opacity-50" : "opacity-100"
                    } ${hiddenCategories.includes(entry.id) ? "opacity-30" : ""}`}
                    onMouseEnter={() => handleCategoryFocus(entry.name)}
                    onMouseLeave={handleCategoryBlur}
                    onClick={() => handleCategoryFocus(entry.name === highlightedCategory ? null : entry.name)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div
                          className="h-5 w-5 mr-1 rounded-sm flex items-center justify-center"
                          style={{ backgroundColor: entry.color }}
                        >
                          {entry.icon}
                        </div>
                        <span className="font-medium">{entry.name}</span>
                        {entry.isTracking && (
                          <span className="ml-1 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{entry.percentage}%</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleCategory(entry.id)
                          }}
                        >
                          {hiddenCategories.includes(entry.id) ? (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-300 ease-in-out"
                        style={{
                          width: `${Math.min(entry.percentage, 100)}%`,
                          backgroundColor: entry.color,
                        }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex justify-between">
                      <span>{formatTime(entry.value)}</span>
                      <span className="text-muted-foreground">Goal: {formatTime(entry.goalValue)}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side={isMobile ? "bottom" : "right"} align={isMobile ? "center" : "start"}>
                  <div className="text-xs">
                    <div className="font-medium">{entry.name}</div>
                    <div className="mt-1">
                      Progress: {formatTime(entry.value)}/{formatTime(entry.goalValue)} ({entry.percentage}%)
                    </div>
                    {!isSmallMobile && (
                      <div className="mt-2 space-y-1">
                        {entry.metrics.map((metric, idx) => (
                          <div key={idx} className="flex justify-between gap-2">
                            <span>{metric.name}:</span>
                            <span className="font-medium">{metric.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  )
}
