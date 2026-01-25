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
      icon: (
        <svg height="48" width="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
          <path d="M128,40a96,96,0,1,0,96,96A96.11,96.11,0,0,0,128,40Zm0,176a80,80,0,1,1,80-80A80.09,80.09,0,0,1,128,216ZM173.66,90.34a8,8,0,0,1,0,11.32l-40,40a8,8,0,0,1-11.32-11.32l40-40A8,8,0,0,1,173.66,90.34ZM96,16a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H104A8,8,0,0,1,96,16Z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Total Plays',
      value: stats.plays.toLocaleString(),
      icon: (
        <svg height="48" width="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
          <path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm47.18-95.09-64-40A6,6,0,0,0,102,88v80a6,6,0,0,0,9.18,5.09l64-40a6,6,0,0,0,0-10.18ZM114,157.17V98.83L160.68,128Z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-600'
    },
    {
      label: 'Unique Tracks',
      value: stats.tracks.toLocaleString(),
      icon: (
        <svg height="48" width="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
          <path d="M212.92,17.69a8,8,0,0,0-6.86-1.45l-128,32A8,8,0,0,0,72,56V166.08A36,36,0,1,0,88,196V62.25l112-28v99.83A36,36,0,1,0,216,164V24A8,8,0,0,0,212.92,17.69ZM52,216a20,20,0,1,1,20-20A20,20,0,0,1,52,216Zm128-32a20,20,0,1,1,20-20A20,20,0,0,1,180,184Z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-600'
    },
    {
      label: 'Unique Artists',
      value: stats.artists.toLocaleString(),
      icon: (
        <svg height="48" width="48" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor">
          <path d="M168,16A72.07,72.07,0,0,0,96,88a73.29,73.29,0,0,0,.63,9.42L27.12,192.22A15.93,15.93,0,0,0,28.71,213L43,227.29a15.93,15.93,0,0,0,20.78,1.59l94.81-69.53A73.29,73.29,0,0,0,168,160a72,72,0,1,0,0-144Zm56,72a55.72,55.72,0,0,1-11.16,33.52L134.49,43.16A56,56,0,0,1,224,88ZM54.32,216,40,201.68,102.14,117A72.37,72.37,0,0,0,139,153.86ZM112,88a55.67,55.67,0,0,1,11.16-33.51l78.34,78.34A56,56,0,0,1,112,88Zm-2.35,58.34a8,8,0,0,1,0,11.31l-8,8a8,8,0,1,1-11.31-11.31l8-8A8,8,0,0,1,109.67,146.33Z" />
        </svg>
      ),
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
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">{card.value}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">{card.label}</p>
            </div>
            <div className="ml-4 transition-transform duration-300">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

