'use client'

import ReactECharts from 'echarts-for-react'
import type { MonthlyData } from '@/types'

interface MonthlyChartProps {
  data: MonthlyData[]
  metric: 'hours' | 'plays'
}

export default function MonthlyChart({ data, metric }: MonthlyChartProps) {
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
      data: data.map(d => {
        const date = new Date(d.year_month + '-01')
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      }),
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
        Monthly Listening Trend
      </h2>
      <ReactECharts 
        option={option} 
        style={{ height: '350px' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  )
}

