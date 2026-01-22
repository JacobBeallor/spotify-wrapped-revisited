'use client'

import { useRef, useEffect } from 'react'
import KPICards from '@/components/KPICards'
import TopArtists from '@/components/TopArtists'
import TopTracks from '@/components/TopTracks'
import SpotifyEmbed from '@/components/SpotifyEmbed'
import PeriodFilter from '@/components/filters/PeriodFilter'
import MetricFilter from '@/components/filters/MetricFilter'
import type { SummaryData, MonthlyData, TopArtist, TopTrack } from '@/types'

interface OverviewPageProps {
  summary: SummaryData | null
  topArtists: TopArtist[]
  topTracks: TopTrack[]
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
  filteredMonthly: MonthlyData[]
  metric: 'hours' | 'plays'
  setMetric: (metric: 'hours' | 'plays') => void
  isFilterLoading: boolean
  availableMonths: string[]
}

export default function OverviewPage({
  summary,
  topArtists,
  topTracks,
  selectedPeriod,
  setSelectedPeriod,
  filteredMonthly,
  metric,
  setMetric,
  isFilterLoading,
  availableMonths
}: OverviewPageProps) {
  const embedControllerRef = useRef<any>(null)

  // Find the first track with a spotify_track_uri for initial embed
  const initialTrack = topTracks.find(track => track.spotify_track_uri)
  const initialUri = initialTrack?.spotify_track_uri

  const handleTrackClick = (trackUri: string, trackName: string) => {
    embedControllerRef.current?.loadUri(trackUri)
  }

  const handleArtistClick = (artistId: string, artistName: string) => {
    // Construct Spotify artist URI
    const artistUri = `spotify:artist:${artistId}`
    embedControllerRef.current?.loadUri(artistUri)
  }

  return (
    <main
      className="container mx-auto px-4 py-8 max-w-7xl"
      style={{ opacity: isFilterLoading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center mb-8">
        <PeriodFilter
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          availableMonths={availableMonths}
        />
        <MetricFilter
          metric={metric}
          setMetric={setMetric}
        />
      </div>

      {summary && (
        <div className="animate-fade-in">
          <KPICards
            summary={summary}
            selectedPeriod={selectedPeriod}
            monthly={filteredMonthly}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Left column: Top Artists + Spotify Embed */}
        <div className="flex flex-col gap-6">
          <div className="animate-fade-in animation-delay-600">
            <TopArtists
              data={topArtists}
              metric={metric}
              limit={10}
              onArtistClick={handleArtistClick}
            />
          </div>
          <div className="animate-fade-in animation-delay-700">
            <SpotifyEmbed
              initialUri={initialUri}
              onControllerReady={(controller) => {
                embedControllerRef.current = controller
              }}
            />
          </div>
        </div>

        {/* Right column: Top Tracks - stretch to full height */}
        <div className="animate-fade-in animation-delay-500 flex">
          <TopTracks
            data={topTracks}
            metric={metric}
            limit={10}
            onTrackClick={handleTrackClick}
          />
        </div>
      </div>
    </main>
  )
}

