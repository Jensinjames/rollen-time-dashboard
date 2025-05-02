"use client"

import { AnimatedCard } from "@/components/ui/animated-card"
import { CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useWellness } from "@/context/wellness-context"
import { getCategoryScore, getOverallScore } from "@/utils/chart-utils"
import { Leaf, Home, Briefcase, Heart, Activity } from "lucide-react"
import { useState, useEffect } from "react"

export function DailyMetrics() {
  const { filteredEntries } = useWellness()
  const [animatedScores, setAnimatedScores] = useState({
    overall: 0,
    faith: 0,
    life: 0,
    work: 0,
    health: 0,
  })
  const [animationComplete, setAnimationComplete] = useState(false)

  // Get the most recent entry
  const sortedEntries = [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const latestEntry = sortedEntries[0]

  // Calculate scores for each category
  const faithScore = latestEntry ? getCategoryScore(latestEntry, "faith") : 0
  const lifeScore = latestEntry ? getCategoryScore(latestEntry, "life") : 0
  const workScore = latestEntry ? getCategoryScore(latestEntry, "work") : 0
  const healthScore = latestEntry ? getCategoryScore(latestEntry, "health") : 0
  const overallScore = latestEntry ? getOverallScore(latestEntry) : 0

  // Animate scores
  useEffect(() => {
    if (!latestEntry) return

    const duration = 1500 // Animation duration in ms
    const steps = 60 // Number of steps in the animation
    const interval = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps

      setAnimatedScores({
        overall: Math.round(progress * overallScore),
        faith: Math.round(progress * faithScore),
        life: Math.round(progress * lifeScore),
        work: Math.round(progress * workScore),
        health: Math.round(progress * healthScore),
      })

      if (step >= steps) {
        clearInterval(timer)
        setAnimationComplete(true)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [latestEntry, faithScore, lifeScore, workScore, healthScore, overallScore])

  // If no entries, show empty state
  if (!latestEntry) {
    return (
      <div className="grid gap-4 md:grid-cols-5 stagger-animation">
        {/* Overall card */}
        <AnimatedCard animationVariant="fade-in-up" animationDelay={0} className="shadow-box card-3d-effect">
          <CardContent className="pt-6 pb-4 px-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Overall</p>
              </div>
            </div>
            <Progress value={0} className="mt-2 h-2" />
          </CardContent>
        </AnimatedCard>

        {/* Faith card */}
        <AnimatedCard animationVariant="fade-in-up" animationDelay={100} className="shadow-box card-3d-effect">
          <CardContent className="pt-6 pb-4 px-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="category-icon-faith">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Faith</p>
              </div>
            </div>
            <Progress value={0} className="mt-2 h-2" />
          </CardContent>
        </AnimatedCard>

        {/* Life card */}
        <AnimatedCard animationVariant="fade-in-up" animationDelay={200} className="shadow-box card-3d-effect">
          <CardContent className="pt-6 pb-4 px-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="category-icon-life">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Life</p>
              </div>
            </div>
            <Progress value={0} className="mt-2 h-2" />
          </CardContent>
        </AnimatedCard>

        {/* Work card */}
        <AnimatedCard animationVariant="fade-in-up" animationDelay={300} className="shadow-box card-3d-effect">
          <CardContent className="pt-6 pb-4 px-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="category-icon-work">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Work</p>
              </div>
            </div>
            <Progress value={0} className="mt-2 h-2" />
          </CardContent>
        </AnimatedCard>

        {/* Health card */}
        <AnimatedCard animationVariant="fade-in-up" animationDelay={400} className="shadow-box card-3d-effect">
          <CardContent className="pt-6 pb-4 px-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="category-icon-health">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Health</p>
              </div>
            </div>
            <Progress value={0} className="mt-2 h-2" />
          </CardContent>
        </AnimatedCard>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-5 stagger-animation">
      <AnimatedCard animationVariant="fade-in-up" animationDelay={0} className="shadow-box card-3d-effect">
        <CardContent className="pt-6 pb-4 px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold animate-number-change">{animatedScores.overall}</div>
              <p className="text-xs text-muted-foreground">Overall</p>
            </div>
          </div>
          <Progress
            value={animationComplete ? overallScore : animatedScores.overall}
            className="mt-2 h-2 bg-gray-100 transition-all duration-1000"
            indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000"
          />
        </CardContent>
      </AnimatedCard>

      <AnimatedCard animationVariant="fade-in-up" animationDelay={100} className="shadow-box card-3d-effect">
        <CardContent className="pt-6 pb-4 px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="category-icon-faith">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold animate-number-change">{animatedScores.faith}</div>
              <p className="text-xs text-muted-foreground">Faith</p>
            </div>
          </div>
          <Progress
            value={animationComplete ? faithScore : animatedScores.faith}
            className="mt-2 h-2 bg-gray-100 transition-all duration-1000"
            indicatorClassName="progress-faith transition-all duration-1000"
          />
        </CardContent>
      </AnimatedCard>

      <AnimatedCard animationVariant="fade-in-up" animationDelay={200} className="shadow-box card-3d-effect">
        <CardContent className="pt-6 pb-4 px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="category-icon-life">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold animate-number-change">{animatedScores.life}</div>
              <p className="text-xs text-muted-foreground">Life</p>
            </div>
          </div>
          <Progress
            value={animationComplete ? lifeScore : animatedScores.life}
            className="mt-2 h-2 bg-gray-100 transition-all duration-1000"
            indicatorClassName="progress-life transition-all duration-1000"
          />
        </CardContent>
      </AnimatedCard>

      <AnimatedCard animationVariant="fade-in-up" animationDelay={300} className="shadow-box card-3d-effect">
        <CardContent className="pt-6 pb-4 px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="category-icon-work">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold animate-number-change">{animatedScores.work}</div>
              <p className="text-xs text-muted-foreground">Work</p>
            </div>
          </div>
          <Progress
            value={animationComplete ? workScore : animatedScores.work}
            className="mt-2 h-2 bg-gray-100 transition-all duration-1000"
            indicatorClassName="progress-work transition-all duration-1000"
          />
        </CardContent>
      </AnimatedCard>

      <AnimatedCard animationVariant="fade-in-up" animationDelay={400} className="shadow-box card-3d-effect">
        <CardContent className="pt-6 pb-4 px-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="category-icon-health">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold animate-number-change">{animatedScores.health}</div>
              <p className="text-xs text-muted-foreground">Health</p>
            </div>
          </div>
          <Progress
            value={animationComplete ? healthScore : animatedScores.health}
            className="mt-2 h-2 bg-gray-100 transition-all duration-1000"
            indicatorClassName="progress-health transition-all duration-1000"
          />
        </CardContent>
      </AnimatedCard>
    </div>
  )
}
