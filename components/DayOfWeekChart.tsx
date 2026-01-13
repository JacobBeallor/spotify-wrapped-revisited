'use client'

import ReactECharts from 'echarts-for-react'
import type { DowData } from '@/types'

interface DayOfWeekChartProps {
  data: DowData[]
  metric: 'hours' | 'plays'
}

export default function DayOfWeekChart({ data, metric }: DayOfWeekChartProps) {
  // Aggregate by day of week
  const dowOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const aggregated = dowOrder.map(day => {
    const dayData = data.filter(d => d.dow_name === day)
    const sum = dayData.reduce((acc, d) => acc + (metric === 'hours' ? d.hours : d.plays), 0)
    return { day, value: sum }
  })

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
      data: aggregated.map(d => d.day.substring(0, 3)),
      axisLine: {
        lineStyle: { color: '#535353' }
      },
      axisLabel: {
        color: '#B3B3B3'
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
        data: aggregated.map(d => d.value),
        type: 'bar',
        barWidth: '60%',
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
        Day of Week
      </h2>
      <ReactECharts 
        option={option} 
        style={{ height: '300px' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}

