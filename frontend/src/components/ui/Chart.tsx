import React from 'react'

interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: ChartDataPoint[]
  maxVal?: number
  height?: number
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  maxVal,
  height = 200
}) => {
  const values = data.map((d) => d.value)
  const computedMax = maxVal || Math.max(...values, 1)

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Chart Grid */}
      <div
        className="flex items-end justify-between gap-2 pt-4 border-b border-slate-200/50 w-full"
        style={{ height: `${height}px` }}
      >
        {data.map((item, idx) => {
          const percentage = (item.value / computedMax) * 100
          return (
            <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              {/* Tooltip */}
              <div className="absolute -top-8 scale-0 group-hover:scale-100 transition-all duration-200 px-2 py-1 bg-slate-800 text-white text-xs rounded-md shadow-xs pointer-events-none z-10 font-medium">
                {item.value}
              </div>

              {/* Bar */}
              <div
                className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ease-out ${
                  item.color || 'bg-gradient-to-t from-sky-400 to-purple-400'
                }`}
                style={{ height: `${percentage}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between gap-2 w-full">
        {data.map((item, idx) => (
          <span key={idx} className="flex-1 text-center text-xs font-semibold text-slate-500 truncate">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

interface LineChartProps {
  data: ChartDataPoint[]
  height?: number
  color?: string
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 180,
  color = '#0ea5e9' // sky-500
}) => {
  const values = data.map((d) => d.value)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min

  // SVG Coordinates calculation
  const width = 500
  const points = data
    .map((item, idx) => {
      const x = (idx / (data.length - 1)) * width
      const y = height - ((item.value - min) / range) * (height - 20) - 10
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1={height - 5} x2={width} y2={height - 5} stroke="#e2e8f0" strokeWidth="1" />

          {/* Area Fill */}
          {points && (
            <polyline
              fill={`${color}15`} // 10% opacity fill
              stroke="none"
              points={`0,${height - 5} ${points} ${width},${height - 5}`}
            />
          )}

          {/* Line Path */}
          {points && (
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          )}

          {/* Circles at nodes */}
          {data.map((item, idx) => {
            const x = (idx / (data.length - 1)) * width
            const y = height - ((item.value - min) / range) * (height - 20) - 10
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="5"
                fill="white"
                stroke={color}
                strokeWidth="3"
                className="cursor-pointer hover:r-[7px] transition-all"
              />
            )
          })}
        </svg>
      </div>

      {/* Axis labels */}
      <div className="flex justify-between w-full">
        {data.map((item, idx) => (
          <span key={idx} className="text-xs font-semibold text-slate-500">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
