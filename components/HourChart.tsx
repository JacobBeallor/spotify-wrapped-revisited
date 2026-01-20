'use client'

import ReactECharts from 'echarts-for-react'
import type { HourData } from '@/types'

interface HourChartProps {
  data: HourData[]
  metric: 'hours' | 'plays'
}

export default function HourChart({ data, metric }: HourChartProps) {
  // Aggregate by hour
  const allHoursData = Array.from({ length: 24 }, (_, hour) => {
    const hourData = data.filter(d => d.hour === hour)
    const sum = hourData.reduce((acc, d) => acc + (metric === 'hours' ? d.hours : d.plays), 0)
    return { hour, value: sum }
  })

  // Reorder to start at 6am
  const hourlyData = [
    ...allHoursData.slice(6, 24),  // 6am to 11pm
    ...allHoursData.slice(0, 6)    // 12am to 5am
  ]

  const formatHour = (hour: number) => {
    if (hour === 0) return '12am'
    if (hour === 12) return '12pm'
    if (hour < 12) return `${hour}am`
    return `${hour - 12}pm`
  }

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderColor: '#1DB954',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const point = params[0]
        const value = metric === 'hours'
          ? `${point.value.toLocaleString(undefined, { maximumFractionDigits: 0 })} hours`
          : `${point.value.toLocaleString()} plays`
        return `${point.name}<br/><strong>${value}</strong>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hourlyData.map(d => formatHour(d.hour)),
      axisLine: {
        lineStyle: { color: '#535353' }
      },
      axisLabel: {
        color: '#B3B3B3',
        interval: 2
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: { color: '#535353' }
      },
      axisLabel: {
        color: '#B3B3B3',
        formatter: (value: number) => metric === 'hours'
          ? `${value}h`
          : value.toLocaleString()
      },
      splitLine: {
        lineStyle: { color: '#2a2a2a' }
      }
    },
    series: [
      {
        data: hourlyData.map(d => d.value),
        type: 'bar',
        barWidth: '80%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#1DB954' },
              { offset: 1, color: '#148A3C' }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">
        Time of Day
      </h2>
      <ReactECharts
        option={option}
        style={{ height: '300px' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}

