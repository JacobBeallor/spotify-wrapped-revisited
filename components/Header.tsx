interface HeaderProps {
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
  metric: 'hours' | 'plays'
  setMetric: (metric: 'hours' | 'plays') => void
  availableMonths: string[]
  lastUpdated?: string
}

export default function Header({ 
  selectedPeriod, 
  setSelectedPeriod, 
  metric, 
  setMetric,
  availableMonths,
  lastUpdated
}: HeaderProps) {
  // Format last updated date
  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return null
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return null
    }
  }

  const formattedDate = formatLastUpdated(lastUpdated)

  return (
    <header className="bg-spotify-black border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-spotify-green tracking-tight">
              Spotify Wrapped 2.0
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1.5">
              Personal streaming history dashboard
              {formattedDate && (
                <span className="text-gray-500 ml-2">
                  • Data through {formattedDate}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Period selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-spotify-green focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-opacity-50 transition-all cursor-pointer hover:border-gray-600"
            >
              <option value="all">All Time</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </option>
              ))}
            </select>
            
            {/* Metric toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 flex-shrink-0">
              <button
                onClick={() => setMetric('hours')}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  metric === 'hours'
                    ? 'bg-spotify-green text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Hours
              </button>
              <button
                onClick={() => setMetric('plays')}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                  metric === 'plays'
                    ? 'bg-spotify-green text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Plays
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

