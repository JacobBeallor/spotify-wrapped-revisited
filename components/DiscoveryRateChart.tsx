'use client'

import ReactECharts from 'echarts-for-react'
import type { DiscoveryRateData } from '@/types'

interface DiscoveryRateChartProps {
  data: DiscoveryRateData[]
  metric: 'hours' | 'plays'
}

export default function DiscoveryRateChart({ data, metric }: DiscoveryRateChartProps) {
  // Format date labels as "MMM 'YY" for axis
  const formatDate = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, 1))
    const monthStr = date.toLocaleDateString('en-US', {
      month: 'short',
      timeZone: 'UTC'
    })
    const yearStr = date.toLocaleDateString('en-US', {
      year: '2-digit',
      timeZone: 'UTC'
    })
    return `${monthStr} '${yearStr}`
  }

  // Format date labels as "MMM YYYY" for tooltip
  const formatDateFull = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, 1))
    const monthStr = date.toLocaleDateString('en-US', {
      month: 'short',
      timeZone: 'UTC'
    })
    return `${monthStr} ${year}`
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
      formatter: (params: any) => {
        const point = params[0]
        const dataIndex = point.dataIndex
        const dateLabel = formatDateFull(data[dataIndex].year_month)
        const value = `${point.value.toFixed(2)}%`
        return `${dateLabel}<br/><strong>${value}</strong>`
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
      data: data.map(d => formatDate(d.year_month)),
      axisLine: {
        lineStyle: { color: '#535353' }
      },
      axisLabel: {
        color: '#B3B3B3',
        rotate: data.length > 12 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: { color: '#535353' }
      },
      axisLabel: {
        color: '#B3B3B3',
        formatter: (value: number) => `${value}%`
      },
      splitLine: {
        lineStyle: { color: '#2a2a2a' }
      }
    },
    series: [
      {
        data: data.map(d => metric === 'hours' ? d.discovery_rate_hours : d.discovery_rate_plays),
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
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">
          Discovery Rate Trend
        </h2>
        <p className="text-sm text-gray-400">
          % of listening from tracks heard for the first time that month
        </p>
      </div>
      <ReactECharts
        option={option}
        style={{ height: '350px' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}

