import { format, isWithinInterval, subDays, startOfDay, endOfDay, differenceInDays, parseISO } from "date-fns"
import type { TrackingSession } from "@/context/tracking-context"
import type { CategoryId } from "@/types/wellness"

export interface TimeDistribution {
  categoryId: CategoryId
  categoryName: string
  color: string
  totalTime: number // in milliseconds
  percentage: number
  metrics: {
    metricId: string
    metricName: string
    totalTime: number // in milliseconds
    percentage: number
  }[]
}

export interface DailyActivity {
  date: Date
  totalTime: number // in milliseconds
  sessions: number
  categories: {
    categoryId: CategoryId
    totalTime: number // in milliseconds
  }[]
}

export interface WeekdayDistribution {
  day: string
  totalTime: number // in milliseconds
  sessions: number
}

export interface HourlyDistribution {
  hour: number
  totalTime: number // in milliseconds
  sessions: number
}

export interface TrackingStatsSummary {
  totalTrackedTime: number // in milliseconds
  totalSessions: number
  averageSessionDuration: number // in milliseconds
  longestSession: {
    duration: number // in milliseconds
    categoryName: string
    metricName: string
    date: Date
  }
  mostTrackedCategory: {
    categoryId: CategoryId
    categoryName: string
    totalTime: number // in milliseconds
    percentage: number
  }
  timeDistribution: TimeDistribution[]
  dailyActivity: DailyActivity[]
  weekdayDistribution: WeekdayDistribution[]
  hourlyDistribution: HourlyDistribution[]
  streakData: {
    currentStreak: number
    longestStreak: number
    totalDaysTracked: number
  }
}

export interface CategoryInfo {
  id: CategoryId
  name: string
  color: string
  metrics: {
    id: string
    name: string
  }[]
}

/**
 * Calculate statistics from tracking sessions
 */
export function calculateTrackingStats(
  sessions: TrackingSession[],
  categories: CategoryInfo[],
  dateRange: { from: Date; to: Date },
): TrackingStatsSummary {
  // Filter sessions within date range
  const filteredSessions = sessions.filter((session) => {
    const sessionDate = session.endTime || session.startTime
    return isWithinInterval(sessionDate, { start: dateRange.from, end: dateRange.to })
  })

  if (filteredSessions.length === 0) {
    return getEmptyStats()
  }

  // Calculate total tracked time
  const totalTrackedTime = filteredSessions.reduce((total, session) => total + session.duration, 0)

  // Calculate total sessions
  const totalSessions = filteredSessions.length

  // Calculate average session duration
  const averageSessionDuration = totalTrackedTime / totalSessions

  // Find longest session
  const longestSession = filteredSessions.reduce(
    (longest, session) => (session.duration > longest.duration ? session : longest),
    filteredSessions[0],
  )

  const longestSessionCategory = categories.find((c) => c.id === longestSession.categoryId)
  const longestSessionMetric = longestSessionCategory?.metrics.find((m) => m.id === longestSession.metricId)

  // Calculate time distribution by category
  const categoryTimes: Record<CategoryId, number> = {}
  const metricTimes: Record<string, Record<string, number>> = {}

  filteredSessions.forEach((session) => {
    // Add to category total
    if (!categoryTimes[session.categoryId]) {
      categoryTimes[session.categoryId] = 0
    }
    categoryTimes[session.categoryId] += session.duration

    // Add to metric total
    if (!metricTimes[session.categoryId]) {
      metricTimes[session.categoryId] = {}
    }
    if (!metricTimes[session.categoryId][session.metricId]) {
      metricTimes[session.categoryId][session.metricId] = 0
    }
    metricTimes[session.categoryId][session.metricId] += session.duration
  })

  // Create time distribution array
  const timeDistribution: TimeDistribution[] = []

  categories.forEach((category) => {
    if (categoryTimes[category.id]) {
      const categoryTotalTime = categoryTimes[category.id]
      const categoryPercentage = (categoryTotalTime / totalTrackedTime) * 100

      const metricDistribution = category.metrics
        .filter((metric) => metricTimes[category.id]?.[metric.id])
        .map((metric) => ({
          metricId: metric.id,
          metricName: metric.name,
          totalTime: metricTimes[category.id][metric.id],
          percentage: (metricTimes[category.id][metric.id] / categoryTotalTime) * 100,
        }))

      timeDistribution.push({
        categoryId: category.id,
        categoryName: category.name,
        color: category.color,
        totalTime: categoryTotalTime,
        percentage: categoryPercentage,
        metrics: metricDistribution,
      })
    }
  })

  // Sort time distribution by total time (descending)
  timeDistribution.sort((a, b) => b.totalTime - a.totalTime)

  // Find most tracked category
  const mostTrackedCategory = timeDistribution[0] || {
    categoryId: "unknown" as CategoryId,
    categoryName: "Unknown",
    totalTime: 0,
    percentage: 0,
  }

  // Calculate daily activity
  const dailyActivity: DailyActivity[] = []
  const dayCount = differenceInDays(dateRange.to, dateRange.from) + 1

  // Create array of days in range
  const daysInRange = Array.from({ length: dayCount }, (_, i) => {
    const date = new Date(dateRange.from)
    date.setDate(date.getDate() + i)
    return startOfDay(date)
  })

  // Calculate activity for each day
  daysInRange.forEach((day) => {
    const dayEnd = endOfDay(day)

    const daySessions = filteredSessions.filter((session) => {
      const sessionDate = session.endTime || session.startTime
      return isWithinInterval(sessionDate, { start: day, end: dayEnd })
    })

    const dayTotalTime = daySessions.reduce((total, session) => total + session.duration, 0)

    // Calculate category distribution for the day
    const dayCategoryTimes: Record<CategoryId, number> = {}

    daySessions.forEach((session) => {
      if (!dayCategoryTimes[session.categoryId]) {
        dayCategoryTimes[session.categoryId] = 0
      }
      dayCategoryTimes[session.categoryId] += session.duration
    })

    const dayCategoryDistribution = Object.entries(dayCategoryTimes).map(([categoryId, totalTime]) => ({
      categoryId: categoryId as CategoryId,
      totalTime,
    }))

    dailyActivity.push({
      date: day,
      totalTime: dayTotalTime,
      sessions: daySessions.length,
      categories: dayCategoryDistribution,
    })
  })

  // Calculate weekday distribution
  const weekdayTotals: Record<string, { time: number; sessions: number }> = {
    Sunday: { time: 0, sessions: 0 },
    Monday: { time: 0, sessions: 0 },
    Tuesday: { time: 0, sessions: 0 },
    Wednesday: { time: 0, sessions: 0 },
    Thursday: { time: 0, sessions: 0 },
    Friday: { time: 0, sessions: 0 },
    Saturday: { time: 0, sessions: 0 },
  }

  filteredSessions.forEach((session) => {
    const sessionDate = session.endTime || session.startTime
    const weekday = format(sessionDate, "EEEE")
    weekdayTotals[weekday].time += session.duration
    weekdayTotals[weekday].sessions += 1
  })

  const weekdayDistribution: WeekdayDistribution[] = [
    { day: "Sunday", totalTime: weekdayTotals["Sunday"].time, sessions: weekdayTotals["Sunday"].sessions },
    { day: "Monday", totalTime: weekdayTotals["Monday"].time, sessions: weekdayTotals["Monday"].sessions },
    { day: "Tuesday", totalTime: weekdayTotals["Tuesday"].time, sessions: weekdayTotals["Tuesday"].sessions },
    { day: "Wednesday", totalTime: weekdayTotals["Wednesday"].time, sessions: weekdayTotals["Wednesday"].sessions },
    { day: "Thursday", totalTime: weekdayTotals["Thursday"].time, sessions: weekdayTotals["Thursday"].sessions },
    { day: "Friday", totalTime: weekdayTotals["Friday"].time, sessions: weekdayTotals["Friday"].sessions },
    { day: "Saturday", totalTime: weekdayTotals["Saturday"].time, sessions: weekdayTotals["Saturday"].sessions },
  ]

  // Calculate hourly distribution
  const hourlyTotals: Record<number, { time: number; sessions: number }> = {}

  // Initialize all hours
  for (let i = 0; i < 24; i++) {
    hourlyTotals[i] = { time: 0, sessions: 0 }
  }

  filteredSessions.forEach((session) => {
    const sessionDate = session.endTime || session.startTime
    const hour = sessionDate.getHours()
    hourlyTotals[hour].time += session.duration
    hourlyTotals[hour].sessions += 1
  })

  const hourlyDistribution: HourlyDistribution[] = Object.entries(hourlyTotals).map(([hour, data]) => ({
    hour: Number.parseInt(hour),
    totalTime: data.time,
    sessions: data.sessions,
  }))

  // Calculate streak data
  const trackedDays = new Set<string>()

  filteredSessions.forEach((session) => {
    const sessionDate = session.endTime || session.startTime
    trackedDays.add(format(sessionDate, "yyyy-MM-dd"))
  })

  // Calculate current streak
  let currentStreak = 0
  let today = new Date()

  // Check backwards from today
  while (trackedDays.has(format(today, "yyyy-MM-dd"))) {
    currentStreak++
    today = subDays(today, 1)
  }

  // Calculate longest streak
  let longestStreak = 0
  let currentLongestStreak = 0
  const sortedDays = Array.from(trackedDays).sort()

  for (let i = 0; i < sortedDays.length; i++) {
    if (i === 0) {
      currentLongestStreak = 1
    } else {
      const currentDate = parseISO(sortedDays[i])
      const prevDate = parseISO(sortedDays[i - 1])
      const dayDiff = differenceInDays(currentDate, prevDate)

      if (dayDiff === 1) {
        currentLongestStreak++
      } else {
        if (currentLongestStreak > longestStreak) {
          longestStreak = currentLongestStreak
        }
        currentLongestStreak = 1
      }
    }
  }

  // Check if the last streak is the longest
  if (currentLongestStreak > longestStreak) {
    longestStreak = currentLongestStreak
  }

  return {
    totalTrackedTime,
    totalSessions,
    averageSessionDuration,
    longestSession: {
      duration: longestSession.duration,
      categoryName: longestSessionCategory?.name || "Unknown",
      metricName: longestSessionMetric?.name || "Unknown",
      date: longestSession.endTime || longestSession.startTime,
    },
    mostTrackedCategory,
    timeDistribution,
    dailyActivity,
    weekdayDistribution,
    hourlyDistribution,
    streakData: {
      currentStreak,
      longestStreak,
      totalDaysTracked: trackedDays.size,
    },
  }
}

/**
 * Get empty statistics object for when no data is available
 */
function getEmptyStats(): TrackingStatsSummary {
  return {
    totalTrackedTime: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
    longestSession: {
      duration: 0,
      categoryName: "N/A",
      metricName: "N/A",
      date: new Date(),
    },
    mostTrackedCategory: {
      categoryId: "unknown" as CategoryId,
      categoryName: "N/A",
      totalTime: 0,
      percentage: 0,
    },
    timeDistribution: [],
    dailyActivity: [],
    weekdayDistribution: [
      { day: "Sunday", totalTime: 0, sessions: 0 },
      { day: "Monday", totalTime: 0, sessions: 0 },
      { day: "Tuesday", totalTime: 0, sessions: 0 },
      { day: "Wednesday", totalTime: 0, sessions: 0 },
      { day: "Thursday", totalTime: 0, sessions: 0 },
      { day: "Friday", totalTime: 0, sessions: 0 },
      { day: "Saturday", totalTime: 0, sessions: 0 },
    ],
    hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      totalTime: 0,
      sessions: 0,
    })),
    streakData: {
      currentStreak: 0,
      longestStreak: 0,
      totalDaysTracked: 0,
    },
  }
}

/**
 * Format duration in milliseconds to a human-readable string
 */
export function formatDurationHumanReadable(ms: number): string {
  if (ms < 1000) return "0s"

  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / (1000 * 60)) % 60)
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))

  const parts = []

  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 && parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(" ")
}

/**
 * Format hours to 12-hour format with AM/PM
 */
export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour === 12) return "12 PM"
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

/**
 * Get color for a category
 */
export function getCategoryColor(color: string): string {
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
    case "indigo":
      return "#6366f1"
    case "orange":
      return "#f97316"
    case "teal":
      return "#14b8a6"
    case "cyan":
      return "#06b6d4"
    default:
      return "#6366f1"
  }
}
