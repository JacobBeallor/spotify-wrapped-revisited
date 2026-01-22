import type { TopTrack } from '@/types'

interface TopTracksProps {
  data: TopTrack[]
  metric: 'hours' | 'plays'
  limit?: number
  onTrackClick?: (trackUri: string, trackName: string) => void
}

export default function TopTracks({ data, metric, limit = 10, onTrackClick }: TopTracksProps) {
  // Aggregate by track and sort
  const trackMap = new Map<string, { artist: string, hours: number, plays: number, spotify_track_uri?: string }>()

  data.forEach(item => {
    const key = `${item.track_name}|${item.artist_name}`
    const existing = trackMap.get(key) || { artist: item.artist_name, hours: 0, plays: 0 }
    trackMap.set(key, {
      artist: item.artist_name,
      hours: existing.hours + item.hours,
      plays: existing.plays + item.plays,
      spotify_track_uri: existing.spotify_track_uri || item.spotify_track_uri
    })
  })

  const sortedTracks = Array.from(trackMap.entries())
    .map(([key, stats]) => {
      const [track_name, artist_name] = key.split('|')
      return { track_name, artist_name, ...stats }
    })
    .sort((a, b) => {
      // Primary sort by selected metric
      if (metric === 'hours') {
        if (b.hours !== a.hours) return b.hours - a.hours
        // Tiebreaker 1: plays
        if (b.plays !== a.plays) return b.plays - a.plays
      } else {
        if (b.plays !== a.plays) return b.plays - a.plays
        // Tiebreaker 1: hours
        if (b.hours !== a.hours) return b.hours - a.hours
      }
      // Tiebreaker 2: alphabetical by track name
      return a.track_name.localeCompare(b.track_name)
    })
    .slice(0, limit)

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 h-full flex flex-col w-full">
      <h2 className="text-xl font-bold mb-4">
        Top Tracks
      </h2>

      <div className="space-y-3 flex-1">
        {sortedTracks.map((track, index) => {
          const value = metric === 'hours' ? track.hours : track.plays
          const maxValue = metric === 'hours' ? sortedTracks[0].hours : sortedTracks[0].plays
          const percentage = (value / maxValue) * 100
          const isClickable = !!track.spotify_track_uri && !!onTrackClick

          return (
            <div
              key={`${track.track_name}-${track.artist_name}`}
              className={`group px-3 pb-1 -mx-3 rounded-lg transition-colors duration-200 ${isClickable ? 'cursor-pointer hover:bg-gray-700/40' : ''
                }`}
              onClick={() => {
                if (track.spotify_track_uri && onTrackClick) {
                  onTrackClick(track.spotify_track_uri, track.track_name)
                }
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-gray-500 font-mono text-sm w-6 flex-shrink-0">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-medium truncate">
                      {track.track_name}
                    </div>
                    <div className="text-gray-400 text-sm truncate">
                      {track.artist_name}
                    </div>
                  </div>
                </div>
                <span className="text-spotify-green font-bold text-sm ml-3 flex-shrink-0">
                  {metric === 'hours'
                    ? value < 1
                      ? `${Math.round(value * 60)}m`
                      : `${value.toFixed(1)}h`
                    : value.toLocaleString()
                  }
                </span>
              </div>
              <div className="ml-9">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sortedTracks.length === 0 && (
        <p className="text-gray-500 text-center py-8">No data available</p>
      )}
    </div>
  )
}

