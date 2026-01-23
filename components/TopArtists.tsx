import type { TopArtist } from '@/types'

interface TopArtistsProps {
  data: TopArtist[]
  metric: 'hours' | 'plays'
  limit?: number
  onArtistClick?: (artistId: string, artistName: string) => void
}

export default function TopArtists({ data, metric, limit = 10, onArtistClick }: TopArtistsProps) {
  // Aggregate by artist and sort
  const artistMap = new Map<string, { hours: number, plays: number, spotify_artist_id?: string, image_url?: string }>()

  data.forEach(item => {
    const existing = artistMap.get(item.artist_name) || { hours: 0, plays: 0 }
    artistMap.set(item.artist_name, {
      hours: existing.hours + item.hours,
      plays: existing.plays + item.plays,
      spotify_artist_id: existing.spotify_artist_id || item.spotify_artist_id,
      image_url: existing.image_url || item.image_url
    })
  })

  const sortedArtists = Array.from(artistMap.entries())
    .map(([name, stats]) => ({ artist_name: name, ...stats }))
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
      // Tiebreaker 2: alphabetical by artist name
      return a.artist_name.localeCompare(b.artist_name)
    })
    .slice(0, limit)

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4">
        Top Artists
      </h2>

      <div className="space-y-3">
        {sortedArtists.map((artist, index) => {
          const value = metric === 'hours' ? artist.hours : artist.plays
          const maxValue = metric === 'hours' ? sortedArtists[0].hours : sortedArtists[0].plays
          const percentage = (value / maxValue) * 100
          const isClickable = !!artist.spotify_artist_id && !!onArtistClick

          return (
            <div
              key={artist.artist_name}
              className={`group px-3 pb-1 -mx-3 rounded-lg transition-colors duration-300 ${isClickable ? 'cursor-pointer hover:bg-gray-700/40' : ''
                }`}
              onClick={() => {
                if (artist.spotify_artist_id && onArtistClick) {
                  onArtistClick(artist.spotify_artist_id, artist.artist_name)
                }
              }}
            >
              <div className="flex items-center gap-3">
                {/* Column 1: Number */}
                <span className="text-gray-500 font-mono text-sm w-6 flex-shrink-0">
                  {(index + 1).toString().padStart(2, '0')}
                </span>

                {/* Column 2: Image */}
                {artist.image_url && (
                  <img
                    src={artist.image_url}
                    alt={`${artist.artist_name}`}
                    className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
                  />
                )}

                {/* Column 3: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium truncate flex-1">
                      {artist.artist_name}
                    </span>
                    <span className="text-spotify-green font-bold text-sm ml-3 flex-shrink-0">
                      {metric === 'hours'
                        ? value < 1
                          ? `${Math.round(value * 60)}m`
                          : `${value.toFixed(1)}h`
                        : value.toLocaleString()
                      }
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sortedArtists.length === 0 && (
        <p className="text-gray-500 text-center py-8">No data available</p>
      )}
    </div>
  )
}

