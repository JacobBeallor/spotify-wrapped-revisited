'use client'

import { useRef, useEffect } from 'react'
import KPICards from '@/components/KPICards'
import TopArtists from '@/components/TopArtists'
import TopTracks from '@/components/TopTracks'
import SpotifyEmbed from '@/components/SpotifyEmbed'
import DateRangePicker from '@/components/filters/DateRangePicker'
import MetricFilter from '@/components/filters/MetricFilter'
import type { SummaryData, MonthlyData, TopArtist, TopTrack, AvailableDateRange } from '@/types'

interface OverviewPageProps {
  summary: SummaryData | null
  topArtists: TopArtist[]
  topTracks: TopTrack[]
  dateRange: { start: Date | null; end: Date | null }
  setDateRange: (range: { start: Date | null; end: Date | null }) => void
  filteredMonthly: MonthlyData[]
  metric: 'hours' | 'plays'
  setMetric: (metric: 'hours' | 'plays') => void
  isFilterLoading: boolean
  availableDateRange: AvailableDateRange
}

export default function OverviewPage({
  summary,
  topArtists,
  topTracks,
  dateRange,
  setDateRange,
  filteredMonthly,
  metric,
  setMetric,
  isFilterLoading,
  availableDateRange
}: OverviewPageProps) {
  const embedControllerRef = useRef<any>(null)
  const hasInitialLoadedRef = useRef(false)

  // Find the first track with a spotify_track_uri for initial embed
  const initialTrack = topTracks.find(track => track.spotify_track_uri)
  const initialUri = initialTrack?.spotify_track_uri

  const handleTrackClick = (trackUri: string, trackName: string) => {
    if (embedControllerRef.current) {
      embedControllerRef.current.loadUri(trackUri)
      // Small delay to ensure content loads before playing
      setTimeout(() => {
        embedControllerRef.current?.play()
      }, 100)
    }
  }

  const handleArtistClick = (artistId: string, artistName: string, topTrackUri?: string) => {
    if (embedControllerRef.current) {
      // Use the artist's #1 track from their listening history if available
      // Otherwise fall back to the artist page
      const uri = topTrackUri || `spotify:artist:${artistId}`
      
      embedControllerRef.current.loadUri(uri)
      // Small delay to ensure content loads before playing
      setTimeout(() => {
        embedControllerRef.current?.play()
      }, 100)
    }
  }

  return (
    <main
      className="container mx-auto px-4 py-8 max-w-7xl"
      style={{ opacity: isFilterLoading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center mb-8">
        <DateRangePicker
          startDate={dateRange.start}
          endDate={dateRange.end}
          onApply={(start, end) => setDateRange({ start, end })}
          minDate={availableDateRange.min}
          maxDate={availableDateRange.max}
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
            selectedPeriod={dateRange.start && dateRange.end ? 'custom' : 'all'}
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
                // Only load initial track on first mount, not on filter changes
                if (initialUri && !hasInitialLoadedRef.current) {
                  controller.loadUri(initialUri)
                  hasInitialLoadedRef.current = true
                }
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

