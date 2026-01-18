'use client'

import { useState, useEffect } from 'react'
import { useApiData } from './hooks/useSpotifyData'
import Header from '@/components/Header'
import KPICards from '@/components/KPICards'
import MonthlyChart from '@/components/MonthlyChart'
import DayOfWeekChart from '@/components/DayOfWeekChart'
import HourChart from '@/components/HourChart'
import TopArtists from '@/components/TopArtists'
import TopTracks from '@/components/TopTracks'
import ArtistEvolutionChart from '@/components/ArtistEvolutionChart'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { SummaryData, MonthlyData, DailyData, DowData, HourData, TopArtist, TopTrack, ArtistEvolution } from '@/types'

export default function Home() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [metric, setMetric] = useState<'hours' | 'plays'>('hours')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])

  // Determine granularity and date range based on selected period
  const isMonthSelected = selectedPeriod !== 'all'
  const granularity = isMonthSelected ? 'daily' : 'monthly'
  
  // Calculate date range for daily view
  const getDateRange = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0) // Last day of month
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    }
  }

  const trendsParams = isMonthSelected 
    ? { granularity: 'daily', ...getDateRange(selectedPeriod) }
    : { granularity: 'monthly' }

  // Fetch data using API
  const { data: summaryResponse, loading: summaryLoading, error: summaryError } = useApiData<SummaryData>('summary')
  
  // Always fetch monthly data for the dropdown
  const { data: monthlyResponse, loading: monthlyLoading } = useApiData<{ data: MonthlyData[], granularity: string }>('trends', { granularity: 'monthly' })
  
  // Fetch trends data based on selected period (daily or monthly)
  const { data: trendsResponse, loading: trendsLoading } = useApiData<{ data: (MonthlyData | DailyData)[], granularity: string }>('trends', trendsParams)
  const { data: dowResponse, loading: dowLoading } = useApiData<{ data: DowData[] }>('dow')
  const { data: hourResponse, loading: hourLoading } = useApiData<{ data: HourData[] }>('hour')

  // Pass selected period to top artists/tracks APIs
  const artistsParams = selectedPeriod !== 'all' ? { start: selectedPeriod, end: selectedPeriod } : {}
  const tracksParams = selectedPeriod !== 'all' ? { start: selectedPeriod, end: selectedPeriod } : {}

  const { data: artistsResponse, loading: artistsLoading } = useApiData<{ data: TopArtist[] }>('top-artists', artistsParams)
  const { data: tracksResponse, loading: tracksLoading } = useApiData<{ data: TopTrack[] }>('top-tracks', tracksParams)
  const { data: evolutionResponse, loading: evolutionLoading } = useApiData<{ data: ArtistEvolution[] }>('artist-evolution', {
    topN: 3
  })

  const summary = summaryResponse
  const monthly = monthlyResponse?.data || []
  const trendsData = trendsResponse?.data || []
  
  // Debug: Check if we're getting the right data
  useEffect(() => {
    if (trendsData.length > 0) {
      console.log('🔄 trendsData updated:', {
        length: trendsData.length,
        granularity,
        firstItem: trendsData[0],
        hasDateField: 'date' in trendsData[0],
        hasYearMonthField: 'year_month' in trendsData[0]
      })
    }
  }, [trendsData, granularity])
  
  const dow = dowResponse?.data || []
  const hour = hourResponse?.data || []
  const topArtists = artistsResponse?.data || []
  const topTracks = tracksResponse?.data || []
  const artistEvolution = evolutionResponse?.data || []

  // Fill gaps in daily data to ensure all days are shown
  const fillDailyGaps = (data: (MonthlyData | DailyData)[], yearMonth: string): DailyData[] => {
    // If no data or data is monthly format, return empty array to wait for daily data
    if (data.length === 0 || !('date' in data[0])) {
      console.log('⚠️ fillDailyGaps: No data or wrong format', { length: data.length, hasData: data.length > 0, firstItem: data[0] })
      return []
    }
    
    const [year, month] = yearMonth.split('-').map(Number)
    const daysInMonth = new Date(year, month, 0).getDate()
    
    console.log(`📅 fillDailyGaps: Processing ${data.length} daily records for ${yearMonth} (${daysInMonth} days)`)
    
    const dataMap = new Map<string, DailyData>()
    data.forEach((item, index) => {
      const dailyItem = item as DailyData
      if (dailyItem.date) {
        if (index < 3) {
          console.log(`  Sample ${index}: date="${dailyItem.date}" hours=${dailyItem.hours}`)
        }
        dataMap.set(dailyItem.date, dailyItem)
      }
    })
    
    console.log(`📊 fillDailyGaps: Built map with ${dataMap.size} entries`)
    
    const filledData: DailyData[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const existingData = dataMap.get(date)
      if (day <= 3) {
        console.log(`  Day ${day}: Looking for "${date}", found:`, existingData ? `YES (${existingData.hours}h)` : 'NO')
      }
      filledData.push(
        existingData || {
          date,
          hours: 0,
          plays: 0,
          unique_tracks: 0,
          unique_artists: 0
        }
      )
    }
    
    const totalHours = filledData.reduce((sum, d) => sum + d.hours, 0)
    console.log(`✅ fillDailyGaps: Returning ${filledData.length} days, total ${totalHours} hours`)
    
    return filledData
  }

  const trendsChartData = isMonthSelected 
    ? fillDailyGaps(trendsData, selectedPeriod)
    : trendsData

  // Check if chart data matches expected granularity
  const isChartDataValid = trendsChartData.length === 0 || 
    (isMonthSelected ? ('date' in trendsChartData[0]) : ('year_month' in trendsChartData[0]))

  // Debug: Log what we're sending to the chart
  useEffect(() => {
    if (trendsChartData.length > 0) {
      console.log('📊 Chart data:', {
        count: trendsChartData.length,
        granularity,
        isValid: isChartDataValid,
        sample: trendsChartData[0],
        totalHours: trendsChartData.reduce((sum, d) => sum + (d.hours || 0), 0)
      })
    }
  }, [trendsChartData, granularity, isChartDataValid])

  // For backwards compatibility, keep monthly variable for other components
  // (monthly is now always fetched separately for the dropdown)

  const loading = summaryLoading || monthlyLoading || trendsLoading || dowLoading || hourLoading || artistsLoading || tracksLoading || evolutionLoading
  const error = summaryError

  // Distinguish between initial load and filter changes
  const isInitialLoad = summaryLoading && !summary
  const isFilterLoading = (artistsLoading || tracksLoading) && topArtists.length > 0

  // Handle period change - no longer need scroll position tracking!
  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod)
  }

  // Extract unique months when monthly data is loaded
  useEffect(() => {
    if (monthly.length > 0) {
      const months = monthly.map((m: MonthlyData) => m.year_month).sort()
      setAvailableMonths(months)
    }
  }, [monthly])

  // Filter data based on selected period
  const filterByPeriod = <T extends { year_month: string }>(data: T[]): T[] => {
    if (selectedPeriod === 'all') return data
    return data.filter(item => item.year_month === selectedPeriod)
  }

  const filteredMonthly = filterByPeriod(monthly) // Filter monthly data for KPICards
  const filteredDow = filterByPeriod(dow)
  const filteredHour = filterByPeriod(hour)
  // Top Artists and Top Tracks are filtered server-side via API params
  const filteredArtists = topArtists
  const filteredTracks = topTracks

  // Show initial loading state
  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-spotify-dark via-gray-900 to-black text-white">
        <Header
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={handlePeriodChange}
          metric={metric}
          setMetric={setMetric}
          availableMonths={[]}
          lastUpdated={summary?.last_played_at}
        />
        <LoadingSpinner />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-spotify-dark via-gray-900 to-black text-white">
        <Header
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={handlePeriodChange}
          metric={metric}
          setMetric={setMetric}
          availableMonths={[]}
          lastUpdated={summary?.last_played_at}
        />
        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2 text-red-400">Error Loading Data</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <div className="text-sm text-gray-400">
              <p className="mb-2">Make sure you&apos;ve run the data pipeline:</p>
              <code className="bg-black/50 px-3 py-1 rounded">./scripts/run_pipeline.sh</code>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-dark via-gray-900 to-black text-white">
      <Header
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={handlePeriodChange}
        metric={metric}
        setMetric={setMetric}
        availableMonths={availableMonths}
        lastUpdated={summary?.last_played_at}
      />

      {/* Loading indicator for filter changes */}
      {isFilterLoading && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className="bg-spotify-green text-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-semibold">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 max-w-7xl"
        style={{ opacity: isFilterLoading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}
      >
        {summary && (
          <div className="animate-fade-in">
            <KPICards
              summary={summary}
              selectedPeriod={selectedPeriod}
              monthly={filteredMonthly}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 mt-8">
          <div className="animate-fade-in animation-delay-100">
            {isChartDataValid && trendsChartData.length > 0 ? (
              <MonthlyChart data={trendsChartData} metric={metric} granularity={granularity} />
            ) : (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 h-[430px] flex items-center justify-center">
                <div className="text-gray-400">Loading chart data...</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-fade-in animation-delay-200">
              <DayOfWeekChart data={filteredDow} metric={metric} />
            </div>
            <div className="animate-fade-in animation-delay-300">
              <HourChart data={filteredHour} metric={metric} />
            </div>
          </div>

          <div className="animate-fade-in animation-delay-400">
            <ArtistEvolutionChart data={artistEvolution} topN={3} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-fade-in animation-delay-500">
              <TopArtists data={filteredArtists} metric={metric} limit={10} />
            </div>
            <div className="animate-fade-in animation-delay-600">
              <TopTracks data={filteredTracks} metric={metric} limit={10} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
