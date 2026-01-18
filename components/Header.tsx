interface HeaderProps {
  metric: 'hours' | 'plays'
  setMetric: (metric: 'hours' | 'plays') => void
  lastUpdated?: string
  filterMode: 'all' | 'custom'
  setFilterMode: (mode: 'all' | 'custom') => void
  startDate: string
  setStartDate: (date: string) => void
  endDate: string
  setEndDate: (date: string) => void
  availableMonths: string[]
}

export default function Header({
  metric,
  setMetric,
  lastUpdated,
  filterMode,
  setFilterMode,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  availableMonths
}: HeaderProps) {
  // Format last updated date
  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return null

    try {
      const date = new Date(dateString)
      // Check if date is valid
      if (isNaN(date.getTime())) return null

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

  // Get min and max dates from available months
  const getDateBounds = () => {
    if (availableMonths.length === 0) return { min: '', max: '' }
    
    const minMonth = availableMonths[0] // First month (earliest)
    const maxMonth = availableMonths[availableMonths.length - 1] // Last month (latest)
    
    // Min date: first day of earliest month
    const min = `${minMonth}-01`
    
    // Max date: last day of latest month
    const [year, month] = maxMonth.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate() // 0 gets last day of previous month
    const max = `${maxMonth}-${String(lastDay).padStart(2, '0')}`
    
    return { min, max }
  }

  const { min: minDate, max: maxDate } = getDateBounds()

  // Handle start date change with validation
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate)
    // If end date is now invalid, update it
    if (endDate && newStartDate > endDate) {
      setEndDate(newStartDate)
    }
  }

  // Handle end date change with validation
  const handleEndDateChange = (newEndDate: string) => {
    // Only allow if it's >= start date
    if (!startDate || newEndDate >= startDate) {
      setEndDate(newEndDate)
    }
  }

  return (
    <header className="bg-spotify-black border-b border-gray-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 max-w-7xl">
        <div className="flex flex-col gap-5">
          {/* Title and subtitle */}
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

            {/* Metric toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 flex-shrink-0 self-start lg:self-auto">
              <button
                onClick={() => setMetric('hours')}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${metric === 'hours'
                  ? 'bg-spotify-green text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                Hours
              </button>
              <button
                onClick={() => setMetric('plays')}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${metric === 'plays'
                  ? 'bg-spotify-green text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                Plays
              </button>
            </div>
          </div>

          {/* Date range filter controls */}
          <div className="flex flex-col gap-3">
            {/* Toggle button for filter mode */}
            <div className="inline-flex bg-gray-800 rounded-lg p-1 border border-gray-700 self-start">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${filterMode === 'all'
                  ? 'bg-spotify-green text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                All Time
              </button>
              <button
                onClick={() => setFilterMode('custom')}
                className={`px-5 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${filterMode === 'custom'
                  ? 'bg-spotify-green text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                Custom Range
              </button>
            </div>

            {/* Custom date range inputs */}
            {filterMode === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center animate-fade-in">
                <div className="flex items-center gap-2">
                  <label htmlFor="start-date" className="text-gray-400 text-sm font-medium whitespace-nowrap">
                    From:
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    min={minDate}
                    max={maxDate}
                    className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-spotify-green focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-opacity-50 transition-all cursor-pointer hover:border-gray-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="end-date" className="text-gray-400 text-sm font-medium whitespace-nowrap">
                    To:
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    min={startDate || minDate}
                    max={maxDate}
                    disabled={!startDate}
                    className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-spotify-green focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-opacity-50 transition-all cursor-pointer hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

