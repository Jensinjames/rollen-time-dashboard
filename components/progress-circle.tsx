interface ProgressCircleProps {
  percentage: number
  size: number
  color: string
}

export function ProgressCircle({ percentage, size, color }: ProgressCircleProps) {
  const radius = size / 2 - 10
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 3D effect base */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-3 bg-gray-200 rounded-full opacity-30 blur-sm"></div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <defs>
          <linearGradient id={`circleGradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`var(--${color}-400)`} />
            <stop offset="100%" stopColor={`var(--${color}-600)`} />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f0f0f0" strokeWidth="10" />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#circleGradient-${color})`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter="drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))"
        />

        {/* Percentage text */}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="bold" fill="#333">
          {percentage}%
        </text>
      </svg>

      {/* Arrows pointing to the circle (simplified) */}
      <div className="absolute inset-0 pointer-events-none">
        {[45, 135, 225, 315].map((angle, i) => (
          <div
            key={i}
            className="absolute w-16 h-0.5 bg-gray-200"
            style={{
              top: `${size / 2}px`,
              left: `${size / 2}px`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: "left center",
            }}
          />
        ))}
      </div>
    </div>
  )
}
