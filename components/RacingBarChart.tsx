'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'

interface ArtistData {
  year_month: string
  artist_name: string
  hours: number
  plays: number
}

interface RacingBarChartProps {
  data: ArtistData[]
  metric: 'hours' | 'plays'
  topN?: number
}

interface BarData {
  artist_name: string
  value: number
  rank: number
}

export default function RacingBarChart({
  data,
  metric = 'hours',
  topN = 10
}: RacingBarChartProps) {
  // Animation timing constants
  const FRAME_DURATION = 600 // ms between frames
  const TRANSITION_DURATION = 450 // ms for D3 transitions

  const svgRef = useRef<SVGSVGElement>(null)
  const [isPlaying, setIsPlaying] = useState(false) // Start paused
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0)
  const timerRef = useRef<NodeJS.Timeout>()

  // Group data by month and get unique months
  const { monthlyData, months } = useMemo(() => {
    const grouped = new Map<string, ArtistData[]>()

    data.forEach(d => {
      if (!grouped.has(d.year_month)) {
        grouped.set(d.year_month, [])
      }
      grouped.get(d.year_month)!.push(d)
    })

    const monthsList = Array.from(grouped.keys()).sort()

    return { monthlyData: grouped, months: monthsList }
  }, [data])

  // Get top N artists for current month
  const currentData = useMemo(() => {
    if (months.length === 0) return []

    const currentMonth = months[currentMonthIndex]
    const artistsThisMonth = monthlyData.get(currentMonth) || []

    return artistsThisMonth
      .sort((a, b) => (metric === 'hours' ? b.hours - a.hours : b.plays - a.plays))
      .slice(0, topN)
      .map((d, i) => ({
        artist_name: d.artist_name,
        value: metric === 'hours' ? d.hours : d.plays,
        rank: i
      }))
  }, [monthlyData, months, currentMonthIndex, metric, topN])

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && months.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentMonthIndex(prev => (prev + 1) % months.length)
      }, FRAME_DURATION)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, months.length, FRAME_DURATION])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentMonthIndex(prev => prev > 0 ? prev - 1 : months.length - 1)
      } else if (e.key === 'ArrowRight') {
        setCurrentMonthIndex(prev => (prev + 1) % months.length)
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [months.length])

  const handlePrevious = () => {
    setCurrentMonthIndex(prev => prev > 0 ? prev - 1 : months.length - 1)
  }

  const handleNext = () => {
    setCurrentMonthIndex(prev => (prev + 1) % months.length)
  }

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current || currentData.length === 0) return

    const svg = d3.select(svgRef.current)
    const margin = { top: 20, right: 120, bottom: 20, left: 200 }
    const width = svgRef.current.clientWidth - margin.left - margin.right
    const height = 400

    // Clear previous content on first render only
    if (svg.select('.chart-group').empty()) {
      svg.selectAll('*').remove()
      svg.append('g').attr('class', 'chart-group')
        .attr('transform', `translate(${margin.left},${margin.top})`)
    }

    const g = svg.select<SVGGElement>('.chart-group')

    // Scales
    const maxValue = d3.max(currentData, d => d.value) || 1
    const xScale = d3.scaleLinear()
      .domain([0, maxValue * 1.1])
      .range([0, width])

    const yScale = d3.scaleBand()
      .domain(d3.range(0, topN).map(String))
      .range([0, height])
      .padding(0.15) // Reduced padding for thinner bars

    // Data join
    const barGroups = g.selectAll<SVGGElement, BarData>('.bar-group')
      .data(currentData, d => d.artist_name)

    // Enter
    const barGroupsEnter = barGroups.enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', `translate(0, ${height})`)
      .style('opacity', 0)

    // Add rectangles
    barGroupsEnter.append('rect')
      .attr('class', 'bar')
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('fill', '#1db954')

    // Add artist labels (left side)
    barGroupsEnter.append('text')
      .attr('class', 'artist-label')
      .attr('x', -10)
      .attr('y', yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#fff')

    // Add value labels (right side)
    barGroupsEnter.append('text')
      .attr('class', 'value-label')
      .attr('y', yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('dx', 8)
      .attr('text-anchor', 'start')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#b3b3b3')

    // Update (merge enter + update)
    const barGroupsMerged = barGroups.merge(barGroupsEnter)

    barGroupsMerged
      .transition()
      .duration(TRANSITION_DURATION)
      .ease(d3.easeCubicInOut)
      .attr('transform', d => `translate(0, ${yScale(String(d.rank))})`)
      .style('opacity', 1)

    barGroupsMerged.select('.bar')
      .transition()
      .duration(TRANSITION_DURATION)
      .ease(d3.easeCubicInOut)
      .attr('width', d => xScale(d.value))

    barGroupsMerged.select('.artist-label')
      .text(d => d.artist_name)

    barGroupsMerged.select('.value-label')
      .transition()
      .duration(TRANSITION_DURATION)
      .ease(d3.easeCubicInOut)
      .attr('x', d => xScale(d.value))
      .tween('text', function (d) {
        const i = d3.interpolateNumber(
          parseFloat(d3.select(this).text()) || 0,
          d.value
        )
        return function (t) {
          d3.select(this).text(
            metric === 'hours'
              ? i(t).toFixed(1) + ' hrs'
              : Math.round(i(t)).toLocaleString()
          )
        }
      })

    // Exit
    barGroups.exit()
      .transition()
      .duration(TRANSITION_DURATION)
      .ease(d3.easeCubicInOut)
      .style('opacity', 0)
      .attr('transform', `translate(0, ${height})`)
      .remove()

  }, [currentData, metric, topN, TRANSITION_DURATION])

  if (months.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Artist Evolution</h2>
        <p className="text-gray-400 text-center py-8">No data available</p>
      </div>
    )
  }

  const currentMonth = months[currentMonthIndex]
  const [year, month] = currentMonth.split('-')
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const formattedMonth = `${monthNames[parseInt(month) - 1]} ${year}`
  const progress = ((currentMonthIndex + 1) / months.length) * 100

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Artist Evolution</h2>
        <p className="text-gray-400 text-sm mt-1">
          Top {topN} artists (all-time cumulative by {metric})
        </p>
      </div>

      {/* Current month display */}
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-spotify-green mb-2">
          {formattedMonth}
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          ref={svgRef}
          width="100%"
          height={450}
          style={{ overflow: 'visible' }}
        />
      </div>

      {/* Controls */}
      <div className="mt-6 space-y-4">
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-spotify-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Play/Pause button */}
        <div className="flex justify-center gap-4 items-center">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 transition-colors"
            title="Previous month (←)"
          >
            ←
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-6 py-2 bg-spotify-green text-black font-semibold rounded-full hover:bg-green-400 transition-colors"
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 transition-colors"
            title="Next month (→)"
          >
            →
          </button>
          <button
            onClick={() => setCurrentMonthIndex(0)}
            className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 transition-colors"
          >
            ↺
          </button>
        </div>

        {/* Progress text */}
        <div className="text-center text-sm text-gray-400">
          Month {currentMonthIndex + 1} of {months.length} • Use arrow keys ← → to navigate
        </div>
      </div>
    </div>
  )
}

