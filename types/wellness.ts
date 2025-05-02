// Define the structure for wellness categories and metrics
export type CategoryId = "faith" | "life" | "work" | "health" | "mindfulness" | "learning" | "relationships" | string // Allow for custom categories

// Define the structure for a metric within a category
export interface WellnessMetric {
  id: string
  name: string
  description: string
  unit: "minutes" | "hours" | "percent" | "count" | "level" | string
  min: number
  max: number
  step: number
  defaultValue: number
  defaultGoal: number
  type?: "time" | "value" | "boolean" // Added type for better categorization
}

// Define the structure for a subcategory
export interface WellnessSubcategory {
  id: string
  name: string
  description: string
  color: string
  icon?: string
  createdAt?: string
  lastUpdated?: string
  metrics?: WellnessMetric[]
}

// Define the structure for a wellness category
export interface WellnessCategory {
  id: CategoryId
  name: string
  description: string
  icon: string // Icon name from Lucide icons
  color: string // Tailwind color class
  metrics: WellnessMetric[]
  enabled: boolean
  subcategories?: WellnessSubcategory[]
  createdAt?: string
  lastUpdated?: string
}

// Define the structure for a wellness goal
export interface WellnessGoal {
  categoryId: CategoryId
  metricId: string
  value: number
  subcategoryId?: string // Optional subcategory ID
}

// Define the structure for a wellness entry metric value
export interface WellnessEntryMetric {
  categoryId: CategoryId
  metricId: string
  value: number
  subcategoryId?: string // Optional subcategory ID
}

// Define the structure for a wellness entry
export interface WellnessEntryData {
  id: string
  date: Date
  metrics: WellnessEntryMetric[]
}

// Define the default categories and metrics
export const DEFAULT_CATEGORIES: WellnessCategory[] = [
  {
    id: "faith",
    name: "Faith",
    description: "Spiritual practices and mindfulness activities",
    icon: "Leaf",
    color: "green",
    enabled: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metrics: [
      {
        id: "dailyPrayer",
        name: "Daily Prayer",
        description: "Time spent in prayer each day",
        unit: "minutes",
        min: 0,
        max: 120,
        step: 5,
        defaultValue: 0,
        defaultGoal: 30,
        type: "time",
      },
      {
        id: "meditation",
        name: "Meditation",
        description: "Time spent in meditation each day",
        unit: "minutes",
        min: 0,
        max: 120,
        step: 5,
        defaultValue: 0,
        defaultGoal: 20,
        type: "time",
      },
      {
        id: "scriptureStudy",
        name: "Scripture Study",
        description: "Time spent studying scripture each day",
        unit: "minutes",
        min: 0,
        max: 120,
        step: 5,
        defaultValue: 0,
        defaultGoal: 30,
        type: "time",
      },
    ],
    subcategories: [
      {
        id: "spiritual-practices",
        name: "Spiritual Practices",
        description: "Daily spiritual disciplines and practices",
        color: "emerald",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "community",
        name: "Faith Community",
        description: "Engagement with faith community",
        color: "teal",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: "life",
    name: "Life",
    description: "Work-life balance and relationships",
    icon: "Sun",
    color: "yellow",
    enabled: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metrics: [
      {
        id: "familyTime",
        name: "Family Time",
        description: "Time spent with family each day",
        unit: "hours",
        min: 0,
        max: 24,
        step: 0.5,
        defaultValue: 0,
        defaultGoal: 3,
        type: "time",
      },
      {
        id: "socialActivities",
        name: "Social Activities",
        description: "Time spent on social activities each week",
        unit: "hours",
        min: 0,
        max: 24,
        step: 0.5,
        defaultValue: 0,
        defaultGoal: 6,
        type: "time",
      },
      {
        id: "hobbies",
        name: "Hobbies",
        description: "Time spent on hobbies each week",
        unit: "hours",
        min: 0,
        max: 24,
        step: 0.5,
        defaultValue: 0,
        defaultGoal: 5,
        type: "time",
      },
    ],
    subcategories: [
      {
        id: "recreation",
        name: "Recreation",
        description: "Fun and leisure activities",
        color: "amber",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "personal-growth",
        name: "Personal Growth",
        description: "Self-improvement activities",
        color: "orange",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: "work",
    name: "Work",
    description: "Career and professional development",
    icon: "Briefcase",
    color: "red",
    enabled: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metrics: [
      {
        id: "productivity",
        name: "Productivity",
        description: "Self-assessed productivity level",
        unit: "percent",
        min: 0,
        max: 100,
        step: 5,
        defaultValue: 0,
        defaultGoal: 80,
        type: "value",
      },
      {
        id: "projectsCompleted",
        name: "Projects Completed",
        description: "Number of projects completed each week",
        unit: "count",
        min: 0,
        max: 10,
        step: 1,
        defaultValue: 0,
        defaultGoal: 3,
        type: "value",
      },
      {
        id: "learningHours",
        name: "Learning Hours",
        description: "Time spent on professional learning each week",
        unit: "hours",
        min: 0,
        max: 24,
        step: 0.5,
        defaultValue: 0,
        defaultGoal: 2,
        type: "time",
      },
    ],
    subcategories: [
      {
        id: "professional-development",
        name: "Professional Development",
        description: "Skills and career advancement",
        color: "rose",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "work-projects",
        name: "Work Projects",
        description: "Current work assignments and projects",
        color: "pink",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: "health",
    name: "Health",
    description: "Physical and mental wellbeing",
    icon: "Heart",
    color: "pink",
    enabled: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metrics: [
      {
        id: "exercise",
        name: "Exercise",
        description: "Time spent exercising each week",
        unit: "hours",
        min: 0,
        max: 24,
        step: 0.5,
        defaultValue: 0,
        defaultGoal: 5,
        type: "time",
      },
      {
        id: "sleep",
        name: "Sleep",
        description: "Hours of sleep each night",
        unit: "hours",
        min: 0,
        max: 24,
        step: 0.5,
        defaultValue: 0,
        defaultGoal: 8,
        type: "time",
      },
      {
        id: "stressLevel",
        name: "Stress Level",
        description: "Self-assessed stress level (lower is better)",
        unit: "level",
        min: 1,
        max: 10,
        step: 1,
        defaultValue: 5,
        defaultGoal: 3,
        type: "value",
      },
    ],
    subcategories: [
      {
        id: "physical-health",
        name: "Physical Health",
        description: "Exercise, nutrition, and physical wellness",
        color: "fuchsia",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "mental-health",
        name: "Mental Health",
        description: "Emotional and psychological wellbeing",
        color: "purple",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    description: "Awareness and presence practices",
    icon: "Brain",
    color: "green",
    enabled: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metrics: [
      {
        id: "mindfulnessMinutes",
        name: "Mindfulness Minutes",
        description: "Time spent practicing mindfulness each day",
        unit: "minutes",
        min: 0,
        max: 120,
        step: 5,
        defaultValue: 0,
        defaultGoal: 30,
        type: "time",
      },
    ],
    subcategories: [
      {
        id: "meditation-practices",
        name: "Meditation Practices",
        description: "Various meditation techniques",
        color: "lime",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: "learning",
    name: "Learning",
    description: "Personal growth and education",
    icon: "BookOpen",
    color: "blue",
    enabled: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metrics: [
      {
        id: "readingTime",
        name: "Reading Time",
        description: "Time spent reading each day",
        unit: "hours",
        min: 0,
        max: 24,
        step: 0.5,
        defaultValue: 0,
        defaultGoal: 1,
        type: "time",
      },
    ],
    subcategories: [
      {
        id: "books",
        name: "Books",
        description: "Reading and book-related learning",
        color: "sky",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "courses",
        name: "Courses",
        description: "Formal education and online courses",
        color: "indigo",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
  {
    id: "relationships",
    name: "Relationships",
    description: "Connections with others",
    icon: "Users",
    color: "purple",
    enabled: true,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metrics: [
      {
        id: "connectionTime",
        name: "Connection Time",
        description: "Time spent connecting with others each day",
        unit: "hours",
        min: 0,
        max: 24,
        step: 0.5,
        defaultValue: 0,
        defaultGoal: 2,
        type: "time",
      },
    ],
    subcategories: [
      {
        id: "family",
        name: "Family",
        description: "Family relationships",
        color: "violet",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "friends",
        name: "Friends",
        description: "Friendships and social connections",
        color: "fuchsia",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ],
  },
]

// Helper function to get unit label
export function getUnitLabel(unit: string, value: number): string {
  switch (unit) {
    case "minutes":
      return `${value} mins`
    case "hours":
      return `${value} hrs`
    case "percent":
      return `${value}%%`
    case "count":
      return value.toString()
    case "level":
      return value.toString()
    default:
      return value.toString()
  }
}

// Helper function to get stress level label
export function getStressLevelLabel(value: number): string {
  if (value <= 3) return "Low"
  if (value <= 7) return "Moderate"
  return "High"
}

// Add this helper function to get color class based on category
export function getCategoryColorClass(
  category: WellnessCategory,
  type: "bg" | "text" | "border" | "stroke" | "fill",
): string {
  return `${type}-${category.color}-600`
}

// Helper function to get subcategory color class
export function getSubcategoryColorClass(
  subcategory: WellnessSubcategory,
  type: "bg" | "text" | "border" | "stroke" | "fill",
): string {
  return `${type}-${subcategory.color}-600`
}
