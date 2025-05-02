// Utility functions for accessibility improvements

/**
 * Returns a darker shade of a color to ensure better contrast on light backgrounds
 * These colors meet WCAG 2 AA contrast requirements (4.5:1 for normal text)
 */
export const accessibleColors = {
  // Darker shades for better contrast on light backgrounds
  green: {
    light: "text-green-700", // Instead of text-green-500
    medium: "text-green-800",
    dark: "text-green-900",
    background: "bg-green-700", // For backgrounds
    border: "border-green-700",
  },
  red: {
    light: "text-red-700", // Instead of text-red-500
    medium: "text-red-800",
    dark: "text-red-900",
    background: "bg-red-700",
    border: "border-red-700",
  },
  yellow: {
    light: "text-yellow-700", // Instead of text-yellow-500
    medium: "text-yellow-800",
    dark: "text-yellow-900",
    background: "bg-yellow-700",
    border: "border-yellow-700",
  },
  blue: {
    light: "text-blue-700",
    medium: "text-blue-800",
    dark: "text-blue-900",
    background: "bg-blue-700",
    border: "border-blue-700",
  },
  pink: {
    light: "text-pink-700",
    medium: "text-pink-800",
    dark: "text-pink-900",
    background: "bg-pink-700",
    border: "border-pink-700",
  },
  gray: {
    light: "text-gray-700",
    medium: "text-gray-800",
    dark: "text-gray-900",
    background: "bg-gray-700",
    border: "border-gray-700",
  },
}

/**
 * Returns high-contrast text color for a given background color
 * @param bgColor The background color
 * @returns A text color with sufficient contrast
 */
export function getContrastText(bgColor: string): string {
  // For dark backgrounds, use white text
  if (
    bgColor.includes("bg-green-700") ||
    bgColor.includes("bg-red-700") ||
    bgColor.includes("bg-blue-700") ||
    bgColor.includes("bg-pink-700") ||
    bgColor.includes("bg-yellow-800") || // Yellow needs to be darker for sufficient contrast with white
    bgColor.includes("bg-gray-700")
  ) {
    return "text-white"
  }

  // For light backgrounds, use dark text
  return "text-gray-900"
}

/**
 * Returns accessible background and text color combination
 * @param color Base color name
 * @param intensity Light or dark variant
 * @returns Object with background and text classes
 */
export function getAccessibleColorPair(
  color: "green" | "red" | "yellow" | "blue" | "pink" | "gray",
  intensity: "light" | "medium" | "dark" = "medium",
): { bg: string; text: string } {
  // For backgrounds, we need to ensure text has enough contrast
  const bgClass = `bg-${color}-${intensity === "light" ? "100" : intensity === "medium" ? "500" : "700"}`

  // For light backgrounds, use darker text; for dark backgrounds, use white text
  const textClass = intensity === "light" ? `text-${color}-900` : "text-white"

  return { bg: bgClass, text: textClass }
}
