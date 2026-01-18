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
            {/* Period selector - Glass style */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="glass-select"
            >
              <option value="all">All Time</option>
              {availableMonths.map(month => {
                // Parse YYYY-MM format and create date in UTC to avoid timezone issues
                const [year, monthNum] = month.split('-').map(Number)
                const date = new Date(Date.UTC(year, monthNum - 1, 1))
                const formattedMonth = date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  timeZone: 'UTC'
                })

                return (
                  <option key={month} value={month}>
                    {formattedMonth}
                  </option>
                )
              })}
            </select>

            {/* Metric toggle - Slider style */}
            <div className="radio-group">
              <div className="slider"></div>
              <div className="radio-option">
                <input
                  type="radio"
                  name="metric"
                  id="metric-hours"
                  checked={metric === 'hours'}
                  onChange={() => setMetric('hours')}
                />
                <label htmlFor="metric-hours" className="radio-label">Hours</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  name="metric"
                  id="metric-plays"
                  checked={metric === 'plays'}
                  onChange={() => setMetric('plays')}
                />
                <label htmlFor="metric-plays" className="radio-label">Plays</label>
              </div>
            </div>

            <style jsx>{`
              .glass-select {
                background-color: rgba(255, 255, 255, 0.06);
                backdrop-filter: blur(20px);
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.3px;
                padding: 0 2.5rem 0 1.2rem;
                height: 40px;
                border-radius: 25px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow:
                  0 8px 32px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
                cursor: pointer;
                transition: all 0.3s ease;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='rgba(255,255,255,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 1rem center;
                min-width: 180px;
              }

              .glass-select:hover {
                color: white;
                background-color: rgba(255, 255, 255, 0.08);
                background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='rgba(255,255,255,0.9)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
              }

              .glass-select:focus {
                outline: none;
                box-shadow:
                  0 8px 32px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1),
                  0 0 0 2px rgba(30, 215, 96, 0.4);
              }

              .glass-select option {
                background: #1a1a1a;
                color: #e5e5e5;
                padding: 0.5rem;
              }

              .radio-group {
                display: flex;
                gap: 0;
                background: rgba(255, 255, 255, 0.06);
                backdrop-filter: blur(20px);
                padding: 4px;
                border-radius: 25px;
                box-shadow:
                  0 8px 32px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.15);
                position: relative;
                height: 40px;
                min-width: 180px;
              }

              .slider {
                position: absolute;
                top: 4px;
                bottom: 4px;
                background: linear-gradient(135deg, rgba(30, 215, 96, 0.9), #1db954);
                border-radius: 25px;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                box-shadow:
                  0 3px 12px rgba(30, 215, 96, 0.3),
                  0 1px 4px rgba(0, 0, 0, 0.1);
                z-index: 0;
              }

              .radio-option {
                position: relative;
                z-index: 1;
                flex: 1;
              }

              .radio-option input[type="radio"] {
                position: absolute;
                opacity: 0;
                cursor: pointer;
              }

              .radio-label {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                padding: 0 16px;
                color: rgba(255, 255, 255, 0.6);
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                user-select: none;
                border-radius: 25px;
                position: relative;
                white-space: nowrap;
                letter-spacing: 0.3px;
              }

              .radio-option input[type="radio"]:checked + .radio-label {
                color: #000;
                text-shadow: none;
              }

              .radio-label:hover {
                color: rgba(255, 255, 255, 0.9);
              }

              .radio-label::before {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: 25px;
                background: rgba(255, 255, 255, 0.05);
                opacity: 0;
                transition: opacity 0.3s ease;
              }

              .radio-label:hover::before {
                opacity: 1;
              }

              /* Slider positioning for 2 options */
              .radio-group:has(#metric-hours:checked) .slider {
                left: 4px;
                width: calc(50% - 4px);
              }

              .radio-group:has(#metric-plays:checked) .slider {
                left: calc(50% + 2px);
                width: calc(50% - 6px);
              }
            `}</style>
          </div>
        </div>
      </div>
    </header>
  )
}

