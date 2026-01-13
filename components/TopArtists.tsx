import type { TopArtist } from '@/types'

interface TopArtistsProps {
  data: TopArtist[]
  metric: 'hours' | 'plays'
  limit?: number
}

export default function TopArtists({ data, metric, limit = 10 }: TopArtistsProps) {
  // Aggregate by artist and sort
  const artistMap = new Map<string, { hours: number, plays: number }>()
  
  data.forEach(item => {
    const existing = artistMap.get(item.artist_name) || { hours: 0, plays: 0 }
    artistMap.set(item.artist_name, {
      hours: existing.hours + item.hours,
      plays: existing.plays + item.plays
    })
  })
  
  const sortedArtists = Array.from(artistMap.entries())
    .map(([name, stats]) => ({ artist_name: name, ...stats }))
    .sort((a, b) => (metric === 'hours' ? b.hours - a.hours : b.plays - a.plays))
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
          
          return (
            <div key={artist.artist_name} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-gray-500 font-mono text-sm w-6 flex-shrink-0">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="text-white font-medium truncate">
                    {artist.artist_name}
                  </span>
                </div>
                <span className="text-spotify-green font-bold text-sm ml-3 flex-shrink-0">
                  {metric === 'hours' 
                    ? `${Math.round(value)}h`
                    : value.toLocaleString()
                  }
                </span>
              </div>
              <div className="ml-9">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
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

