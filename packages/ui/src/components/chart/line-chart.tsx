import * as React from 'react'

import { cn } from '../../lib/utils'

type Datum = {
  label?: string
  value: number
}

export type LineChartProps = {
  color?: string
  data: Datum[]
  gradientId?: string
  height?: number
  strokeWidth?: number
  width?: number
} & React.HTMLAttributes<HTMLDivElement>

const DEFAULT_WIDTH = 320
const DEFAULT_HEIGHT = 140
const DEFAULT_STROKE_WIDTH = 2

type ChartDimensions = { height: number; strokeWidth: number; width: number }

function buildCoordinates(data: Datum[], dimensions: ChartDimensions) {
  if (data.length === 0) return []

  const { height, strokeWidth, width } = dimensions
  const values = data.map((point) => point.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = maxValue - minValue || 1
  const safeWidth = Math.max(width - strokeWidth * 2, 0)
  const safeHeight = Math.max(height - strokeWidth * 2, 0)

  return data.map((point, index) => {
    const x =
      data.length === 1
        ? strokeWidth + safeWidth / 2
        : strokeWidth + (index / (data.length - 1)) * safeWidth
    const ratio = (point.value - minValue) / range
    const y = safeHeight - ratio * safeHeight + strokeWidth
    return { x, y }
  })
}

export const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  (
    {
      className,
      color = 'currentColor',
      data,
      gradientId = 'line-chart-gradient',
      height = DEFAULT_HEIGHT,
      strokeWidth = DEFAULT_STROKE_WIDTH,
      width = DEFAULT_WIDTH,
      ...props
    },
    reference,
  ) => {
    const canvasData = React.useMemo(
      () => buildCoordinates(data, { height, strokeWidth, width }),
      [data, width, height, strokeWidth],
    )

    if (canvasData.length === 0) {
      return null
    }

    const linePath = canvasData
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
      .join(' ')

    const areaPath =
      canvasData.length === 0
        ? ''
        : `M${canvasData[0]?.x ?? 0},${height} ${linePath} L${canvasData.at(-1)?.x ?? 0},${height}Z`

    return (
      <div
        className={cn('rounded-lg border border-border bg-background/40 p-3', className)}
        ref={reference}
        {...props}
      >
        <svg
          aria-label="Line chart"
          className="h-full w-full"
          height={height}
          role="img"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
            stroke="none"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    )
  },
)

LineChart.displayName = 'LineChart'
