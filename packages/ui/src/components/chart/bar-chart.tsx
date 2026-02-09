import * as React from 'react'

import { cn } from '../../lib/utils'

type Datum = {
  label?: string
  value: number
}

export type BarChartProps = {
  color?: string
  data: Datum[]
  gap?: number
  gradientId?: string
  height?: number
  width?: number
} & React.HTMLAttributes<HTMLDivElement>

const DEFAULT_WIDTH = 320
const DEFAULT_HEIGHT = 140
const DEFAULT_GAP = 12

export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      className,
      color = 'currentColor',
      data,
      gap = DEFAULT_GAP,
      gradientId = 'bar-chart-gradient',
      height = DEFAULT_HEIGHT,
      width = DEFAULT_WIDTH,
      ...props
    },
    reference,
  ) => {
    if (data.length === 0) {
      return null
    }

    const values = data.map((point) => point.value)
    const maxValue = Math.max(...values, 0)
    const normalizedMax = maxValue || 1
    const totalGap = gap * Math.max(data.length - 1, 0)
    const barWidth = Math.max((width - totalGap) / data.length, 6)

    return (
      <div
        className={cn('rounded-lg border border-border bg-background/40 p-3', className)}
        ref={reference}
        {...props}
      >
        <svg
          aria-label="Bar chart"
          className="h-full w-full"
          height={height}
          role="img"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {data.map((point, index) => {
            const barHeight = (point.value / normalizedMax) * (height - 12)
            const x = index * (barWidth + gap)
            const y = height - barHeight
            return (
              <rect
                fill={`url(#${gradientId})`}
                height={barHeight}
                key={`${point.label ?? index}-${point.value}`}
                rx={4}
                width={barWidth}
                x={x}
                y={y}
              >
                <title>
                  {point.label ? `${point.label}: ` : ''}
                  {point.value.toLocaleString()}
                </title>
              </rect>
            )
          })}
        </svg>
      </div>
    )
  },
)

BarChart.displayName = 'BarChart'
