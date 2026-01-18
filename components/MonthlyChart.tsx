'use client'

import ReactECharts from 'echarts-for-react'
import type { MonthlyData, DailyData } from '@/types'

interface MonthlyChartProps {
  data: MonthlyData[] | DailyData[]
  metric: 'hours' | 'plays'
  granularity: 'monthly' | 'daily'
}

export default function MonthlyChart({ data, metric, granularity }: MonthlyChartProps) {
  // Format x-axis labels based on granularity
  const formatXAxisLabel = (item: MonthlyData | DailyData) => {
    if (granularity === 'daily') {
      const dailyItem = item as DailyData
      const date = new Date(dailyItem.date + 'T00:00:00Z')
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        timeZone: 'UTC'
      })
    } else {
      const monthlyItem = item as MonthlyData
      const [year, month] = monthlyItem.year_month.split('-').map(Number)
      const date = new Date(Date.UTC(year, month - 1, 1))
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit',
        timeZone: 'UTC'
      })
    }
  }

  // Get chart title based on granularity
  const chartTitle = granularity === 'daily' ? 'Daily Listening Trend' : 'Monthly Listening Trend'

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
      formatter: (params: any) => {
        const point = params[0]
        const value = metric === 'hours' 
          ? `${point.value.toLocaleString()} hours`
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
      data: data.map(d => formatXAxisLabel(d)),
      axisLine: {
        lineStyle: { color: '#535353' }
      },
      axisLabel: {
        color: '#B3B3B3',
        rotate: granularity === 'daily' || data.length > 12 ? 45 : 0
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
        data: data.map(d => metric === 'hours' ? d.hours : d.plays),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          color: '#1DB954',
          width: 3
        },
        itemStyle: {
          color: '#1DB954'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(29, 185, 84, 0.3)' },
              { offset: 1, color: 'rgba(29, 185, 84, 0)' }
            ]
          }
        }
      }
    ]
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">
        {chartTitle}
      </h2>
      <ReactECharts 
        option={option} 
        style={{ height: '350px' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}
