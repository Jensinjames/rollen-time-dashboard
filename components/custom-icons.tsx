import type React from "react"
import {
  Leaf,
  Sun,
  Briefcase,
  Heart,
  Brain,
  BookOpen,
  Users,
  Activity,
  Dumbbell,
  Coffee,
  Music,
  Utensils,
  Zap,
  Smile,
  Moon,
  Droplet,
  Flame,
  Wind,
  Feather,
  Compass,
  Map,
  Mountain,
  Sunrise,
  Sunset,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudSun,
  CloudMoon,
  Umbrella,
  Star,
  Award,
  Gift,
  Sparkles,
  Lightbulb,
  Palette,
  PenToolIcon as Tool,
  Scissors,
  Camera,
  Film,
  Headphones,
  Mic,
  Book,
  Bookmark,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Video,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  ComputerIcon as Desktop,
  Server,
  Database,
  HardDrive,
  Cpu,
  Wifi,
  Bluetooth,
  Battery,
  BatteryCharging,
  Power,
  Settings,
  Wrench,
  Hammer,
  Key,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  AlertCircle,
  Bell,
  BellOff,
  Calendar,
  Clock,
  Timer,
  Watch,
  TimerIcon as Stopwatch,
  Hourglass,
  CompassIcon,
  Navigation,
  MapIcon,
  MapPin,
  Home,
  Building,
  Warehouse,
  School,
  Church,
  Landmark,
  Store,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown,
  BarChart,
  PieChart,
  LineChart,
  ActivityIcon,
  Eye,
  EyeOff,
  Search,
  Filter,
  ListOrderedIcon as Sort,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  X,
  Check,
  CheckCircle,
  XCircle,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Octagon,
  StarIcon,
  HeartIcon,
  ThumbsUp,
  ThumbsDown,
  User,
  UsersIcon,
  UserPlus,
  UserMinus,
  UserX,
  UserCheck,
  ZoomInIcon as Zoom,
  ZoomOutIcon,
} from "lucide-react"

// Define the props for the icon component
interface IconProps {
  className?: string
}

// Create a mapping of category IDs to custom SVG icons
export function getCategoryIcon(categoryId: string, className = "h-6 w-6") {
  // First check if it's a known category ID
  switch (categoryId.toLowerCase()) {
    case "faith":
      return <Leaf className={className} />
    case "life":
      return <Sun className={className} />
    case "work":
      return <Briefcase className={className} />
    case "health":
      return <Heart className={className} />
    case "mindfulness":
      return <Brain className={className} />
    case "learning":
      return <BookOpen className={className} />
    case "relationships":
      return <Users className={className} />
    case "exercise":
      return <Dumbbell className={className} />
    case "nutrition":
      return <Utensils className={className} />
    case "sleep":
      return <Moon className={className} />
    case "hydration":
      return <Droplet className={className} />
    case "energy":
      return <Zap className={className} />
    case "mood":
      return <Smile className={className} />
    case "meditation":
      return <Feather className={className} />
    case "nature":
      return <Mountain className={className} />
    case "creativity":
      return <Palette className={className} />
    case "reading":
      return <Book className={className} />
    case "music":
      return <Music className={className} />
    case "photography":
      return <Camera className={className} />
    case "cooking":
      return <Utensils className={className} />
    case "travel":
      return <Map className={className} />
    case "finance":
      return <DollarSign className={className} />
    case "shopping":
      return <ShoppingBag className={className} />
    case "home":
      return <Home className={className} />
    case "technology":
      return <Smartphone className={className} />
    case "education":
      return <School className={className} />
    case "spiritual-practices":
      return <Feather className={className} />
    case "community":
      return <Users className={className} />
    case "recreation":
      return <Smile className={className} />
    case "personal-growth":
      return <TrendingUp className={className} />
    case "professional-development":
      return <Award className={className} />
    case "work-projects":
      return <FileText className={className} />
    case "physical-health":
      return <Activity className={className} />
    case "mental-health":
      return <Brain className={className} />
    case "meditation-practices":
      return <Wind className={className} />
    case "books":
      return <Book className={className} />
    case "courses":
      return <Bookmark className={className} />
    case "family":
      return <Home className={className} />
    case "friends":
      return <Users className={className} />
  }

  // If it's not a known category ID, check if it's a Lucide icon name
  const LucideIcon = getLucideIcon(categoryId)
  if (LucideIcon) {
    return <LucideIcon className={className} />
  }

  // Default icon if nothing matches
  return <Activity className={className} />
}

// Helper function to get a Lucide icon by name
function getLucideIcon(iconName: string) {
  const iconMap: Record<string, React.ComponentType<IconProps>> = {
    Leaf,
    Sun,
    Briefcase,
    Heart,
    Brain,
    BookOpen,
    Users,
    Activity,
    Dumbbell,
    Coffee,
    Music,
    Utensils,
    Zap,
    Smile,
    Moon,
    Droplet,
    Flame,
    Wind,
    Feather,
    Compass,
    Map,
    Mountain,
    Sunrise,
    Sunset,
    CloudRain,
    CloudSnow,
    CloudLightning,
    CloudDrizzle,
    CloudSun,
    CloudMoon,
    Umbrella,
    Star,
    Award,
    Gift,
    Sparkles,
    Lightbulb,
    Palette,
    PenTool: Tool,
    Scissors,
    Camera,
    Film,
    Headphones,
    Mic,
    Book,
    Bookmark,
    FileText,
    Mail,
    MessageCircle,
    Phone,
    Video,
    Monitor,
    Smartphone,
    Tablet,
    Laptop,
    Desktop,
    Server,
    Database,
    HardDrive,
    Cpu,
    Wifi,
    Bluetooth,
    Battery,
    BatteryCharging,
    Power,
    Settings,
    Tool,
    Wrench,
    Hammer,
    Key,
    Lock,
    Unlock,
    Shield,
    AlertTriangle,
    AlertCircle,
    Bell,
    BellOff,
    Calendar,
    Clock,
    Timer,
    Watch,
    Stopwatch,
    Hourglass,
    CompassIcon,
    Navigation,
    MapIcon,
    MapPin,
    Home,
    Building,
    Warehouse,
    School,
    Church,
    Landmark,
    Store,
    ShoppingBag,
    ShoppingCart,
    CreditCard,
    DollarSign,
    Percent,
    TrendingUp,
    TrendingDown,
    BarChart,
    PieChart,
    LineChart,
    ActivityIcon,
    Eye,
    EyeOff,
    Search,
    Zoom,
    ZoomIn: Zoom,
    ZoomOut: ZoomOutIcon,
    Filter,
    Sort,
    SortAsc: Sort,
    SortDesc: Sort,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus,
    X,
    Check,
    CheckCircle,
    XCircle,
    Circle,
    Square,
    Triangle,
    Hexagon,
    Octagon,
    StarIcon,
    HeartIcon,
    ThumbsUp,
    ThumbsDown,
    User,
    UsersIcon,
    UserPlus,
    UserMinus,
    UserX,
    UserCheck,
  }

  return iconMap[iconName]
}

// Custom SVG icons for specific categories
export function FaithIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2L8 6H4v4l-2 4 2 4v4h4l4 2 4-2h4v-4l2-4-2-4V6h-4L12 2z" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  )
}

export function LifeIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15 15 0 0 0 0 20" />
      <path d="M2 12h20" />
    </svg>
  )
}

export function WorkIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

export function HealthIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      <path d="M12 7v6" />
      <path d="M9 10h6" />
    </svg>
  )
}

export function MindfulnessIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M12 8v-2" />
      <path d="M12 18v-2" />
      <path d="M16 12h2" />
      <path d="M6 12h2" />
    </svg>
  )
}

export function LearningIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

export function RelationshipsIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
