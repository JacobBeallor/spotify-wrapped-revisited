import type { SummaryData, MonthlyData } from '@/types'

interface KPICardsProps {
  summary: SummaryData
  selectedPeriod: string
  monthly: MonthlyData[]
}

export default function KPICards({ summary, selectedPeriod, monthly }: KPICardsProps) {
  // Calculate period-specific stats
  const stats = selectedPeriod === 'all' 
    ? {
        hours: summary.total_hours,
        plays: summary.total_plays,
        tracks: summary.unique_tracks,
        artists: summary.unique_artists
      }
    : monthly.length > 0
    ? {
        hours: monthly.reduce((sum, m) => sum + m.hours, 0),
        plays: monthly.reduce((sum, m) => sum + m.plays, 0),
        tracks: monthly[0]?.unique_tracks || 0,
        artists: monthly[0]?.unique_artists || 0
      }
    : {
        hours: 0,
        plays: 0,
        tracks: 0,
        artists: 0
      }

  const cards = [
    {
      label: 'Total Hours',
      value: stats.hours.toLocaleString(undefined, { maximumFractionDigits: 0 }),
      icon: '🎵',
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Total Plays',
      value: stats.plays.toLocaleString(),
      icon: '▶️',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      label: 'Unique Tracks',
      value: stats.tracks.toLocaleString(),
      icon: '🎼',
      color: 'from-purple-500 to-pink-600'
    },
    {
      label: 'Unique Artists',
      value: stats.artists.toLocaleString(),
      icon: '🎤',
      color: 'from-orange-500 to-red-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-spotify-green/50 transition-all duration-300 hover:transform hover:scale-[1.03] hover:shadow-xl hover:shadow-spotify-green/10 cursor-default"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-400 text-xs uppercase tracking-wider font-medium mb-2">{card.label}</p>
              <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{card.value}</p>
            </div>
            <div className="text-3xl ml-3 transition-transform duration-300 hover:scale-110">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

