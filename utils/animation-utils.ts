// Animation utility functions and constants
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
}

export const ANIMATION_EASING = {
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
}

// Helper function to generate CSS transition string
export function createTransition(
  properties: string[] = ["all"],
  duration: number = ANIMATION_DURATION.normal,
  easing: string = ANIMATION_EASING.easeInOut,
  delay = 0,
): string {
  return properties.map((property) => `${property} ${duration}ms ${easing} ${delay}ms`).join(", ")
}

// Animation class names for reuse
export const ANIMATION_CLASSES = {
  fadeIn: "animate-fade-in",
  fadeInUp: "animate-fade-in-up",
  fadeInDown: "animate-fade-in-down",
  scaleIn: "animate-scale-in",
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce",
  slideInRight: "animate-slide-in-right",
  slideInLeft: "animate-slide-in-left",
}
