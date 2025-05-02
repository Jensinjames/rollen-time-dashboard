import {
  format,
  subDays,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns"

// Define activity types
export type ActivityType = "login" | "update" | "password" | "entry" | "goal" | "tracking"

// Define activity item structure
export interface ActivityItem {
  id: string
  date: string
  type: ActivityType
  details: string
  metadata?: Record<string, any>
}

// Define activity stats structure
export interface ActivityStats {
  totalActivities: number
  loginCount: number
  updateCount: number
  passwordCount: number
  entryCount: number
  goalCount: number
  trackingCount: number
  mostActiveDay: {
    date: string
    count: number
  }
  activityByDay: {
    date: string
    count: number
  }[]
  activityByType: {
    type: ActivityType
    count: number
  }[]
  activityByHour: {
    hour: number
    count: number
  }[]
  recentTrend: {
    date: string
    count: number
  }[]
}

// Define time range options
export type TimeRange = "7days" | "30days" | "90days" | "year" | "all"

// Process activity data to generate stats
export function processActivityData(activities: ActivityItem[], timeRange: TimeRange = "30days"): ActivityStats {
  const now = new Date()
  let startDate: Date

  // Determine date range based on selected time range
  switch (timeRange) {
    case "7days":
      startDate = subDays(now, 7)
      break
    case "30days":
      startDate = subDays(now, 30)
      break
    case "90days":
      startDate = subDays(now, 90)
      break
    case "year":
      startDate = subDays(now, 365)
      break
    case "all":
    default:
      startDate = new Date(0) // Beginning of time
      break
  }

  // Filter activities within the selected time range
  const filteredActivities = activities.filter((activity) => {
    const activityDate = parseISO(activity.date)
    return isWithinInterval(activityDate, { start: startDate, end: now })
  })

  // Count activities by type
  const loginCount = filteredActivities.filter((a) => a.type === "login").length
  const updateCount = filteredActivities.filter((a) => a.type === "update").length
  const passwordCount = filteredActivities.filter((a) => a.type === "password").length
  const entryCount = filteredActivities.filter((a) => a.type === "entry").length
  const goalCount = filteredActivities.filter((a) => a.type === "goal").length
  const trackingCount = filteredActivities.filter((a) => a.type === "tracking").length

  // Group activities by day
  const activityByDay = filteredActivities.reduce<Record<string, number>>((acc, activity) => {
    const date = format(parseISO(activity.date), "yyyy-MM-dd")
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {})

  // Find most active day
  let mostActiveDay = { date: "", count: 0 }
  Object.entries(activityByDay).forEach(([date, count]) => {
    if (count > mostActiveDay.count) {
      mostActiveDay = { date, count }
    }
  })

  // Format activity by day for charts
  const activityByDayArray = Object.entries(activityByDay)
    .map(([date, count]) => ({
      date,
      count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Group activities by type for charts
  const activityByType = [
    { type: "login" as ActivityType, count: loginCount },
    { type: "update" as ActivityType, count: updateCount },
    { type: "password" as ActivityType, count: passwordCount },
    { type: "entry" as ActivityType, count: entryCount },
    { type: "goal" as ActivityType, count: goalCount },
    { type: "tracking" as ActivityType, count: trackingCount },
  ].filter((item) => item.count > 0)

  // Group activities by hour
  const activityByHour = Array.from({ length: 24 }, (_, hour) => {
    const count = filteredActivities.filter((activity) => {
      const activityDate = parseISO(activity.date)
      return activityDate.getHours() === hour
    }).length
    return { hour, count }
  })

  // Generate recent trend data (last 14 days)
  const recentTrend = Array.from({ length: 14 }, (_, i) => {
    const date = format(subDays(now, 13 - i), "yyyy-MM-dd")
    return {
      date,
      count: activityByDay[date] || 0,
    }
  })

  return {
    totalActivities: filteredActivities.length,
    loginCount,
    updateCount,
    passwordCount,
    entryCount,
    goalCount,
    trackingCount,
    mostActiveDay,
    activityByDay: activityByDayArray,
    activityByType,
    activityByHour,
    recentTrend,
  }
}

// Get activity data for different time periods
export function getActivityPeriodData(activities: ActivityItem[]): {
  today: number
  thisWeek: number
  thisMonth: number
  total: number
} {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekStart = startOfWeek(now)
  const weekEnd = endOfWeek(now)
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const todayCount = activities.filter((activity) => {
    const date = parseISO(activity.date)
    return isWithinInterval(date, { start: todayStart, end: todayEnd })
  }).length

  const weekCount = activities.filter((activity) => {
    const date = parseISO(activity.date)
    return isWithinInterval(date, { start: weekStart, end: weekEnd })
  }).length

  const monthCount = activities.filter((activity) => {
    const date = parseISO(activity.date)
    return isWithinInterval(date, { start: monthStart, end: monthEnd })
  }).length

  return {
    today: todayCount,
    thisWeek: weekCount,
    thisMonth: monthCount,
    total: activities.length,
  }
}

// Get color for activity type
export function getActivityTypeColor(type: ActivityType): string {
  switch (type) {
    case "login":
      return "#3b82f6" // blue-500
    case "update":
      return "#10b981" // emerald-500
    case "password":
      return "#f59e0b" // amber-500
    case "entry":
      return "#8b5cf6" // violet-500
    case "goal":
      return "#ec4899" // pink-500
    case "tracking":
      return "#6366f1" // indigo-500
    default:
      return "#6b7280" // gray-500
  }
}

// Generate mock activity data for development
export function generateMockActivityData(days = 90): ActivityItem[] {
  const now = new Date()
  const activities: ActivityItem[] = []

  const activityTypes: ActivityType[] = ["login", "update", "password", "entry", "goal", "tracking"]

  // Generate random activities for the past 'days'
  for (let i = 0; i < days; i++) {
    const date = subDays(now, i)

    // Random number of activities per day (0-5)
    const numActivities = Math.floor(Math.random() * 6)

    for (let j = 0; j < numActivities; j++) {
      // Random hour of the day
      const hour = Math.floor(Math.random() * 24)
      const minute = Math.floor(Math.random() * 60)
      date.setHours(hour, minute)

      // Random activity type
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]

      // Generate details based on type
      let details = ""
      switch (type) {
        case "login":
          details = `Logged in from ${["Chrome", "Firefox", "Safari", "Edge"][Math.floor(Math.random() * 4)]} on ${["Windows", "MacOS", "iOS", "Android"][Math.floor(Math.random() * 4)]}`
          break
        case "update":
          details = `Updated ${["profile information", "preferences", "settings", "avatar"][Math.floor(Math.random() * 4)]}`
          break
        case "password":
          details = "Changed password"
          break
        case "entry":
          details = `Added new wellness entry for ${["Faith", "Life", "Work", "Health"][Math.floor(Math.random() * 4)]}`
          break
        case "goal":
          details = `${["Set", "Updated", "Achieved"][Math.floor(Math.random() * 3)]} a goal for ${["Faith", "Life", "Work", "Health"][Math.floor(Math.random() * 4)]}`
          break
        case "tracking":
          details = `${["Started", "Ended", "Paused", "Resumed"][Math.floor(Math.random() * 4)]} tracking session for ${["Faith", "Life", "Work", "Health"][Math.floor(Math.random() * 4)]}`
          break
      }

      activities.push({
        id: `activity-${i}-${j}`,
        date: date.toISOString(),
        type,
        details,
        metadata: {
          // Add random metadata based on type
          browser:
            type === "login" ? ["Chrome", "Firefox", "Safari", "Edge"][Math.floor(Math.random() * 4)] : undefined,
          platform:
            type === "login" ? ["Windows", "MacOS", "iOS", "Android"][Math.floor(Math.random() * 4)] : undefined,
          category: ["entry", "goal", "tracking"].includes(type)
            ? ["Faith", "Life", "Work", "Health"][Math.floor(Math.random() * 4)]
            : undefined,
        },
      })
    }
  }

  // Sort by date (newest first)
  return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
