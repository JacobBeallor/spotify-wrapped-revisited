'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import * as d3 from 'd3'

interface DecadeEvolution {
  year_month: string
  decade: string
  hours: number
  plays: number
}

interface DecadeStreamgraphProps {
  data: DecadeEvolution[]
  metric: 'hours' | 'plays'
}

export default function DecadeStreamgraph({ data, metric }: DecadeStreamgraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 520 })

  // Process data into format for D3 stack
  const { stackData, decades, months } = useMemo(() => {
    if (!data || data.length === 0) {
      return { stackData: [], decades: [], months: [] }
    }

    // Get unique decades and months
    const decadesSet = new Set<string>()
    const monthsSet = new Set<string>()
    
    data.forEach(d => {
      decadesSet.add(d.decade)
      monthsSet.add(d.year_month)
    })

    const sortedDecades = Array.from(decadesSet).sort()
    const sortedMonths = Array.from(monthsSet).sort()

    // Create a map for quick lookup
    const dataMap = new Map<string, number>()
    data.forEach(d => {
      const key = `${d.year_month}_${d.decade}`
      dataMap.set(key, metric === 'hours' ? d.hours : d.plays)
    })

    // Transform into array of objects with month and all decade values
    const transformed = sortedMonths.map(month => {
      const obj: any = { month }
      sortedDecades.forEach(decade => {
        const key = `${month}_${decade}`
        obj[decade] = dataMap.get(key) || 0
      })
      return obj
    })

    return {
      stackData: transformed,
      decades: sortedDecades,
      months: sortedMonths
    }
  }, [data, metric])

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: 520
        })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || stackData.length === 0 || decades.length === 0 || dimensions.width === 0) return

    const svg = d3.select(svgRef.current)
    const margin = { top: 20, right: 20, bottom: 80, left: 60 }
    const width = dimensions.width - margin.left - margin.right
    const height = 400

    // Clear previous content
    svg.selectAll('*').remove()

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create tooltip div if it doesn't exist
    let tooltip = d3.select('body').select('.decade-tooltip')
    if (tooltip.empty()) {
      tooltip = d3.select('body')
        .append('div')
        .attr('class', 'decade-tooltip')
        .style('position', 'absolute')
        .style('display', 'none')
        .style('background-color', 'rgba(0, 0, 0, 0.9)')
        .style('color', '#fff')
        .style('padding', '8px 12px')
        .style('border-radius', '6px')
        .style('border', '1px solid #1DB954')
        .style('font-size', '14px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
    }

    // Color scale with distinct colors for each decade
    const colorScale = d3.scaleOrdinal<string>()
      .domain(decades)
      .range([
        '#FF6B35', // 1950s - Orange
        '#F7931E', // 1960s - Yellow-Orange
        '#4ECDC4', // 1970s - Teal
        '#5D69B1', // 1980s - Blue
        '#52BCA3', // 1990s - Green
        '#1DB954', // 2000s - Spotify Green
        '#99C24D', // 2010s - Light Green
        '#E8C547', // 2020s - Yellow
      ])

    // Stack generator
    const stack = d3.stack<any, string>()
      .keys(decades)
      .offset(d3.stackOffsetWiggle)
      .order(d3.stackOrderInsideOut)

    const series = stack(stackData)

    // X scale - time
    const xScale = d3.scalePoint()
      .domain(months)
      .range([0, width])
      .padding(0.5)

    // Y scale - values
    const yExtent = d3.extent(series.flat(2)) as [number, number]
    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .range([height, 0])
      .nice()

    // Area generator
    const area = d3.area<any>()
      .x((d, i) => xScale(months[i]) || 0)
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveBasis)

    // Draw layers
    const layers = g.selectAll('.layer')
      .data(series)
      .join('path')
      .attr('class', 'layer')
      .attr('d', area)
      .attr('fill', d => colorScale(d.key))
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
        
        tooltip.style('display', 'block')
      })
      .on('mousemove', function(event, d) {
        const [mouseX] = d3.pointer(event, svg.node())
        const adjustedX = mouseX - margin.left
        
        // Find closest month
        let closestIndex = 0
        let minDistance = Infinity
        months.forEach((month, i) => {
          const xPos = xScale(month) || 0
          const distance = Math.abs(xPos - adjustedX)
          if (distance < minDistance) {
            minDistance = distance
            closestIndex = i
          }
        })

        const month = months[closestIndex]
        const dataPoint = d[closestIndex]
        const value = dataPoint[1] - dataPoint[0]
        
        // Format month for display
        const [year, monthNum] = month.split('-')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const formattedMonth = `${monthNames[parseInt(monthNum) - 1]} ${year}`

        tooltip.html(`
          <div style="font-weight: bold; margin-bottom: 4px;">${d.key}</div>
          <div style="font-size: 12px; color: #b3b3b3;">${formattedMonth}</div>
          <div style="margin-top: 4px;">
            ${metric === 'hours' 
              ? `${value.toFixed(1)} hours` 
              : `${Math.round(value).toLocaleString()} plays`
            }
          </div>
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
      })
      .on('mouseleave', function() {
        d3.select(this)
          .attr('opacity', 0.85)
          .attr('stroke', 'none')
        
        tooltip.style('display', 'none')
      })

    // X axis - show every 6 months to avoid crowding
    const xAxis = d3.axisBottom(xScale)
      .tickValues(months.filter((_, i) => i % 6 === 0))
      .tickFormat(d => {
        const [year, month] = (d as string).split('-')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${monthNames[parseInt(month) - 1]} ${year}`
      })

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .style('fill', '#b3b3b3')
      .style('font-size', '11px')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')

    // Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#b3b3b3')
      .style('font-size', '12px')
      .text(metric === 'hours' ? 'Hours' : 'Plays')

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left},${height + margin.top + 60})`)

    const legendItems = legend.selectAll('.legend-item')
      .data(decades)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => {
        const itemsPerRow = Math.ceil(decades.length / 2)
        const row = Math.floor(i / itemsPerRow)
        const col = i % itemsPerRow
        return `translate(${col * 100}, ${row * 20})`
      })
      .style('cursor', 'pointer')

    legendItems.append('rect')
      .attr('width', 14)
      .attr('height', 14)
      .attr('rx', 2)
      .attr('fill', d => colorScale(d))
      .attr('opacity', 0.85)

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 7)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', '#fff')
      .text(d => d)

    // Legend hover effects
    legendItems
      .on('mouseenter', function(event, decade) {
        // Highlight the corresponding layer
        layers.each(function(d) {
          if (d.key === decade) {
            d3.select(this)
              .attr('opacity', 1)
              .attr('stroke', '#fff')
              .attr('stroke-width', 2)
          } else {
            d3.select(this).attr('opacity', 0.2)
          }
        })
      })
      .on('mouseleave', function() {
        layers
          .attr('opacity', 0.85)
          .attr('stroke', 'none')
      })

    // Cleanup on unmount
    return () => {
      d3.select('body').select('.decade-tooltip').remove()
    }

  }, [stackData, decades, months, metric, dimensions.width])

  if (data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Decade Evolution</h2>
        <p className="text-gray-400 text-center py-8">
          No data available. Run enrichment script to populate release decade metadata.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Decade Evolution</h2>
        <p className="text-gray-400 text-sm mt-1">
          Listening trends by release decade over time
        </p>
      </div>

      <div ref={containerRef} className="relative w-full">
        <svg
          ref={svgRef}
          width="100%"
          height={520}
          style={{ overflow: 'visible' }}
        />
      </div>
    </div>
  )
}
