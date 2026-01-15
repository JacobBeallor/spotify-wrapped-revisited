'use client'

import { ResponsiveBump } from '@nivo/bump'
import { useMemo } from 'react'

interface ArtistEvolutionData {
  year_quarter: string
  artist_name: string
  rank: number
  hours: number
}

interface ArtistEvolutionChartProps {
  data: ArtistEvolutionData[]
  topN?: number
}

export default function ArtistEvolutionChart({ 
  data, 
  topN = 3 
}: ArtistEvolutionChartProps) {
  // Transform data for Nivo bump chart
  const { bumpData, xAxisTicks } = useMemo(() => {
    // Filter data to only include 2018 onwards
    const filteredData = data.filter(d => d.year_quarter >= '2018-Q1')
    
    // Group by artist
    const artistMap = new Map<string, Array<{ x: string; y: number }>>()
    
    // Get all unique quarters (from filtered data)
    const allQuarters = Array.from(new Set(filteredData.map(d => d.year_quarter))).sort()
    
    // Calculate which quarters to show as x-axis ticks (every other year to reduce clutter)
    const tickQuarters = allQuarters.filter((quarter, idx) => {
      // Always show first and last
      if (idx === 0 || idx === allQuarters.length - 1) return true
      // Show Q1 of every other year (2018-Q1, 2020-Q1, 2022-Q1, etc)
      const year = parseInt(quarter.split('-')[0])
      const q = quarter.split('-')[1]
      if (year % 2 === 0 && q === 'Q1') return true
      return false
    })
    
    // Get artists who were in top N at least once (from filtered data)
    const topArtists = Array.from(
      new Set(filteredData.filter(d => d.rank <= topN).map(d => d.artist_name))
    )
    
    // Define "dropped out" rank (one below topN)
    const DROPPED_OUT_RANK = topN + 1
    
    // Build data structure - only for top N artists
    topArtists.forEach(artist => {
      let hasAppearedInTopN = false
      
      const artistData = allQuarters.map(quarter => {
        const record = filteredData.find(
          d => d.artist_name === artist && d.year_quarter === quarter
        )
        
        // If in top N, show actual rank
        if (record && record.rank <= topN) {
          hasAppearedInTopN = true
          return { x: quarter, y: record.rank }
        }
        
        // If artist hasn't appeared yet, don't show them (null)
        // If they've appeared before and dropped out, show "..." rank
        if (!hasAppearedInTopN) {
          return { x: quarter, y: null }
        }
        
        return { x: quarter, y: DROPPED_OUT_RANK }
      })
      
      artistMap.set(artist, artistData)
    })
    
    // Convert to Nivo format
    const chartData = Array.from(artistMap.entries()).map(([artist, points]) => ({
      id: artist,
      data: points
    }))
    
    return { bumpData: chartData, xAxisTicks: tickQuarters }
  }, [data, topN])
  
  // Check if we have data after filtering
  const hasFilteredData = data.some(d => d.year_quarter >= '2018-Q1')

  // Format quarter labels (e.g., "2024-Q1" -> "Q1 '24")
  const formatQuarter = (quarter: string) => {
    const [year, q] = quarter.split('-')
    return `${q} '${year.slice(2)}`
  }

  if (!hasFilteredData) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">Artist Evolution</h2>
        <p className="text-gray-400 text-center py-8">No quarterly data available from 2018 onwards</p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Artist Evolution</h2>
        <p className="text-gray-400 text-sm mt-1">
          Top {topN} artists since 2018 (quarterly, 4-quarter rolling) • "..." = dropped out
        </p>
      </div>
      
      <div style={{ height: '500px' }}>
        <ResponsiveBump
          data={bumpData}
          colors={{ scheme: 'category10' }}
          lineWidth={(serie) => {
            // Check if last point is in "..." row
            const lastPoint = serie.data[serie.data.length - 1]
            return lastPoint && lastPoint.y === topN + 1 ? 1 : 3
          }}
          activeLineWidth={6}
          inactiveLineWidth={1}
          inactiveOpacity={0.1}
          pointSize={10}
          activePointSize={16}
          inactivePointSize={0}
          pointComponent={({ node }) => {
            // Don't show points on the "..." row
            if (!node || node.data?.y === topN + 1) return null
            return (
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size / 2}
                fill={node.style?.fill}
                stroke={node.style?.borderColor}
                strokeWidth={node.style?.borderWidth}
              />
            )
          }}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={3}
          activePointBorderWidth={3}
          pointBorderColor={{ from: 'serie.color' }}
          axisTop={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: '',
            legendPosition: 'middle',
            legendOffset: 32,
            format: formatQuarter,
            tickValues: xAxisTicks
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Rank',
            legendPosition: 'middle',
            legendOffset: -40,
            format: (value) => value === topN + 1 ? '...' : value
          }}
          margin={{ top: 40, right: 120, bottom: 60, left: 60 }}
          enableGridX={false}
          enableGridY={true}
          gridYValues={[1, 2, 3, 4]}
          theme={{
            background: 'transparent',
            text: {
              fill: '#B3B3B3',
              fontSize: 11
            },
            axis: {
              domain: {
                line: {
                  stroke: '#535353',
                  strokeWidth: 1
                }
              },
              ticks: {
                line: {
                  stroke: '#535353',
                  strokeWidth: 1
                }
              }
            },
            grid: {
              line: {
                stroke: '#2a2a2a',
                strokeWidth: 1
              }
            },
            tooltip: {
              container: {
                background: 'rgba(0, 0, 0, 0.9)',
                color: '#fff',
                fontSize: '12px',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                padding: '8px 12px'
              }
            }
          }}
          startLabel={false}
          endLabel={(serie) => {
            // Don't show label if artist ends in the "..." row
            const lastPoint = serie.data[serie.data.length - 1]
            if (lastPoint && lastPoint.y === topN + 1) return ''
            return serie.id
          }}
          endLabelPadding={10}
          endLabelTextColor={{ from: 'color', modifiers: [] }}
        />
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>💡 Tip: Hover over lines to see artist names and rankings</p>
      </div>
    </div>
  )
}

