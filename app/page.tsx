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
import type { SummaryData, MonthlyData, DowData, HourData, TopArtist, TopTrack, ArtistEvolution } from '@/types'

export default function Home() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [metric, setMetric] = useState<'hours' | 'plays'>('hours')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])

  // Fetch data using API
  const { data: summaryResponse, loading: summaryLoading, error: summaryError } = useApiData<SummaryData>('summary')
  const { data: trendsResponse, loading: trendsLoading } = useApiData<{ data: MonthlyData[], granularity: string }>('trends', {
    granularity: 'monthly'
  })
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
  const monthly = trendsResponse?.data || []
  const dow = dowResponse?.data || []
  const hour = hourResponse?.data || []
  const topArtists = artistsResponse?.data || []
  const topTracks = tracksResponse?.data || []
  const artistEvolution = evolutionResponse?.data || []

  const loading = summaryLoading || trendsLoading || dowLoading || hourLoading || artistsLoading || tracksLoading || evolutionLoading
  const error = summaryError

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

  const filteredMonthly = selectedPeriod === 'all' ? monthly : monthly.filter(m => m.year_month === selectedPeriod)
  const filteredDow = filterByPeriod(dow)
  const filteredHour = filterByPeriod(hour)
  // Top Artists and Top Tracks are filtered server-side via API params
  const filteredArtists = topArtists
  const filteredTracks = topTracks

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-spotify-dark via-gray-900 to-black text-white">
        <Header
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          metric={metric}
          setMetric={setMetric}
          availableMonths={[]}
          lastUpdated={summary?.last_played_at}
        />
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-spotify-dark via-gray-900 to-black text-white">
        <Header
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
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
        setSelectedPeriod={setSelectedPeriod}
        metric={metric}
        setMetric={setMetric}
        availableMonths={availableMonths}
        lastUpdated={summary?.last_played_at}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
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
            <MonthlyChart data={filteredMonthly} metric={metric} />
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
