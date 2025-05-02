"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useTheme } from "next-themes"

export type ColorTheme = {
  primary: string
  secondary: string
  accent: string
  background: string
  card: string
  muted: string
  categoryColors: {
    faith: string
    work: string
    life: string
    health: string
    mindfulness: string
    learning: string
    relationships: string
  }
}

// Default themes
export const defaultLightTheme: ColorTheme = {
  primary: "#1e293b", // slate-800
  secondary: "#f1f5f9", // slate-100
  accent: "#3b82f6", // blue-500
  background: "#ffffff", // white
  card: "#ffffff", // white
  muted: "#f8fafc", // slate-50
  categoryColors: {
    faith: "#10b981", // emerald-500
    work: "#ef4444", // red-500
    life: "#f59e0b", // amber-500
    health: "#ec4899", // pink-500
    mindfulness: "#3b82f6", // blue-500
    learning: "#8b5cf6", // violet-500
    relationships: "#6366f1", // indigo-500
  },
}

export const defaultDarkTheme: ColorTheme = {
  primary: "#f8fafc", // slate-50
  secondary: "#334155", // slate-700
  accent: "#60a5fa", // blue-400
  background: "#0f172a", // slate-900
  card: "#1e293b", // slate-800
  muted: "#1e293b", // slate-800
  categoryColors: {
    faith: "#34d399", // emerald-400
    work: "#f87171", // red-400
    life: "#fbbf24", // amber-400
    health: "#f472b6", // pink-400
    mindfulness: "#60a5fa", // blue-400
    learning: "#a78bfa", // violet-400
    relationships: "#818cf8", // indigo-400
  },
}

type ThemeContextType = {
  currentTheme: ColorTheme
  updateThemeColor: (key: keyof ColorTheme | string, value: string) => void
  updateCategoryColor: (category: keyof ColorTheme["categoryColors"], color: string) => void
  resetTheme: () => void
  saveTheme: (name: string) => void
  savedThemes: { name: string; theme: ColorTheme }[]
  loadTheme: (name: string) => void
  deleteTheme: (name: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(defaultLightTheme)
  const [savedThemes, setSavedThemes] = useState<{ name: string; theme: ColorTheme }[]>([])

  // Load saved themes from localStorage on mount
  useEffect(() => {
    const storedThemes = localStorage.getItem("wellness_saved_themes")
    if (storedThemes) {
      setSavedThemes(JSON.parse(storedThemes))
    }

    // Load last used theme if available
    const lastUsedTheme = localStorage.getItem("wellness_current_theme")
    if (lastUsedTheme) {
      setCurrentTheme(JSON.parse(lastUsedTheme))
    } else {
      // Set default theme based on system preference
      setCurrentTheme(theme === "dark" ? defaultDarkTheme : defaultLightTheme)
    }
  }, [theme])

  // Update theme when system theme changes
  useEffect(() => {
    if (theme === "dark") {
      setCurrentTheme((prev) => {
        // Only update if using default theme
        const isUsingDefault =
          JSON.stringify(prev) === JSON.stringify(defaultLightTheme) ||
          JSON.stringify(prev) === JSON.stringify(defaultDarkTheme)
        return isUsingDefault ? defaultDarkTheme : prev
      })
    } else if (theme === "light") {
      setCurrentTheme((prev) => {
        // Only update if using default theme
        const isUsingDefault =
          JSON.stringify(prev) === JSON.stringify(defaultLightTheme) ||
          JSON.stringify(prev) === JSON.stringify(defaultDarkTheme)
        return isUsingDefault ? defaultLightTheme : prev
      })
    }
  }, [theme])

  // Save current theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wellness_current_theme", JSON.stringify(currentTheme))

    // Apply CSS variables
    const root = document.documentElement

    // Convert hex to hsl for CSS variables
    const hexToHSL = (hex: string) => {
      // Remove the # if present
      hex = hex.replace(/^#/, "")

      // Parse the hex values
      const r = Number.parseInt(hex.substring(0, 2), 16) / 255
      const g = Number.parseInt(hex.substring(2, 4), 16) / 255
      const b = Number.parseInt(hex.substring(4, 6), 16) / 255

      // Find the min and max values to calculate the lightness
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0,
        s = 0,
        l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }

        h /= 6
      }

      // Convert to degrees, percentage, percentage
      h = Math.round(h * 360)
      s = Math.round(s * 100)
      l = Math.round(l * 100)

      return `${h} ${s}% ${l}%`
    }

    // Set CSS variables
    root.style.setProperty("--primary", hexToHSL(currentTheme.primary))
    root.style.setProperty("--primary-foreground", theme === "dark" ? "0 0% 100%" : "0 0% 0%")

    root.style.setProperty("--secondary", hexToHSL(currentTheme.secondary))
    root.style.setProperty("--secondary-foreground", theme === "dark" ? "0 0% 100%" : "0 0% 0%")

    root.style.setProperty("--accent", hexToHSL(currentTheme.accent))
    root.style.setProperty("--accent-foreground", theme === "dark" ? "0 0% 100%" : "0 0% 0%")

    root.style.setProperty("--background", hexToHSL(currentTheme.background))
    root.style.setProperty("--foreground", theme === "dark" ? "0 0% 100%" : "0 0% 0%")

    root.style.setProperty("--card", hexToHSL(currentTheme.card))
    root.style.setProperty("--card-foreground", theme === "dark" ? "0 0% 100%" : "0 0% 0%")

    root.style.setProperty("--muted", hexToHSL(currentTheme.muted))
    root.style.setProperty("--muted-foreground", theme === "dark" ? "0 0% 70%" : "0 0% 45%")

    // Set category colors
    Object.entries(currentTheme.categoryColors).forEach(([category, color]) => {
      root.style.setProperty(`--category-${category}`, hexToHSL(color))
    })
  }, [currentTheme, theme])

  // Update a specific color in the theme
  const updateThemeColor = (key: keyof ColorTheme | string, value: string) => {
    setCurrentTheme((prev) => {
      if (key in prev) {
        return {
          ...prev,
          [key]: value,
        }
      }
      return prev
    })
  }

  // Update a category color
  const updateCategoryColor = (category: keyof ColorTheme["categoryColors"], color: string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      categoryColors: {
        ...prev.categoryColors,
        [category]: color,
      },
    }))
  }

  // Reset to default theme
  const resetTheme = () => {
    setCurrentTheme(theme === "dark" ? defaultDarkTheme : defaultLightTheme)
  }

  // Save current theme
  const saveTheme = (name: string) => {
    const newTheme = { name, theme: currentTheme }
    const updatedThemes = [...savedThemes.filter((t) => t.name !== name), newTheme]
    setSavedThemes(updatedThemes)
    localStorage.setItem("wellness_saved_themes", JSON.stringify(updatedThemes))
  }

  // Load a saved theme
  const loadTheme = (name: string) => {
    const themeToLoad = savedThemes.find((t) => t.name === name)
    if (themeToLoad) {
      setCurrentTheme(themeToLoad.theme)
    }
  }

  // Delete a saved theme
  const deleteTheme = (name: string) => {
    const updatedThemes = savedThemes.filter((t) => t.name !== name)
    setSavedThemes(updatedThemes)
    localStorage.setItem("wellness_saved_themes", JSON.stringify(updatedThemes))
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        updateThemeColor,
        updateCategoryColor,
        resetTheme,
        saveTheme,
        savedThemes,
        loadTheme,
        deleteTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useColorTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ThemeProvider")
  }
  return context
}
