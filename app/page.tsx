'use client'

import { useState, useEffect } from 'react'
import { useApiData } from './hooks/useSpotifyData'
import Header from '@/components/Header'
import OverviewPage from '@/components/pages/OverviewPage'
import ListeningPatternsPage from '@/components/pages/ListeningPatternsPage'
import TasteEvolutionPage from '@/components/pages/TasteEvolutionPage'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { SummaryData, MonthlyData, DowData, HourData, TopArtist, TopTrack, ArtistEvolution, GenreEvolution, DiscoveryRateData } from '@/types'

export default function Home() {
  // Tab and filter state
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'evolution'>('overview')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [metric, setMetric] = useState<'hours' | 'plays'>('hours')
  const [entity, setEntity] = useState<'artists' | 'genres'>('artists')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])

  // Fetch data using API
  const { data: summaryResponse, loading: summaryLoading, error: summaryError } = useApiData<SummaryData>('summary')

  // Fetch monthly trends data
  const { data: trendsResponse, loading: trendsLoading } = useApiData<{ data: MonthlyData[], granularity: string }>('trends')
  const { data: dowResponse, loading: dowLoading } = useApiData<{ data: DowData[] }>('dow')
  const { data: hourResponse, loading: hourLoading } = useApiData<{ data: HourData[] }>('hour')
  const { data: discoveryResponse, loading: discoveryLoading } = useApiData<{ data: DiscoveryRateData[] }>('discovery-rate')

  // Pass selected period to top artists/tracks APIs
  const artistsParams = selectedPeriod !== 'all' ? { start: selectedPeriod, end: selectedPeriod } : {}
  const tracksParams = selectedPeriod !== 'all' ? { start: selectedPeriod, end: selectedPeriod } : {}

  const { data: artistsResponse, loading: artistsLoading } = useApiData<{ data: TopArtist[] }>('top-artists', artistsParams)
  const { data: tracksResponse, loading: tracksLoading } = useApiData<{ data: TopTrack[] }>('top-tracks', tracksParams)
  
  // Evolution APIs now return data for both metrics (union of top 15 by hours OR plays)
  // So we only fetch once and switch between metrics client-side
  const { data: evolutionResponse, loading: evolutionLoading } = useApiData<{ data: ArtistEvolution[] }>('artist-evolution')
  const { data: genreEvolutionResponse, loading: genreEvolutionLoading } = useApiData<{ data: GenreEvolution[] }>('genre-evolution')

  const summary = summaryResponse
  const monthly = trendsResponse?.data || []
  const dow = dowResponse?.data || []
  const hour = hourResponse?.data || []
  const discoveryRate = discoveryResponse?.data || []
  const topArtists = artistsResponse?.data || []
  const topTracks = tracksResponse?.data || []
  const artistEvolution = evolutionResponse?.data || []
  const genreEvolution = genreEvolutionResponse?.data || []

  const loading = summaryLoading || trendsLoading || dowLoading || hourLoading || discoveryLoading || artistsLoading || tracksLoading || evolutionLoading || genreEvolutionLoading
  const error = summaryError

  // Distinguish between initial load and filter changes
  const isInitialLoad = summaryLoading && !summary
  const isFilterLoading = (artistsLoading || tracksLoading) && topArtists.length > 0

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
  // Top Artists and Top Tracks are filtered server-side via API params
  const filteredArtists = topArtists
  const filteredTracks = topTracks

  // Show initial loading state
  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-spotify-dark via-gray-900 to-black text-white">
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lastUpdated={undefined}
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
          activeTab={activeTab}
          onTabChange={setActiveTab}
          lastUpdated={undefined}
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
        activeTab={activeTab}
        onTabChange={setActiveTab}
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

      {/* Conditional page rendering based on active tab */}
      {activeTab === 'overview' && (
        <OverviewPage
          summary={summary}
          topArtists={filteredArtists}
          topTracks={filteredTracks}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          filteredMonthly={filteredMonthly}
          metric={metric}
          setMetric={setMetric}
          isFilterLoading={isFilterLoading}
          availableMonths={availableMonths}
        />
      )}
      {activeTab === 'patterns' && (
        <ListeningPatternsPage
          monthly={monthly}
          dow={dow}
          hour={hour}
          discovery={discoveryRate}
          metric={metric}
          setMetric={setMetric}
        />
      )}
      {activeTab === 'evolution' && (
        <TasteEvolutionPage
          artistEvolution={artistEvolution}
          genreEvolution={genreEvolution}
          metric={metric}
          setMetric={setMetric}
          entity={entity}
          setEntity={setEntity}
        />
      )}

      <Footer />
    </div>
  )
}
