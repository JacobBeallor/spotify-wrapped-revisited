import { useState, useRef, useEffect } from 'react'

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [expandedYear, setExpandedYear] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Toggle year expansion (only one at a time)
  const toggleYear = (year: string) => {
    setExpandedYear(expandedYear === year ? null : year)
  }

  // Handle month selection
  const handleMonthSelect = (month: string) => {
    setSelectedPeriod(month)
    setIsDropdownOpen(false)
  }

  // Handle "All Time" selection - collapse all years
  const handleAllTimeSelect = () => {
    setSelectedPeriod('all')
    setExpandedYear(null)
    setIsDropdownOpen(false)
  }

  // Format display value
  const getDisplayValue = () => {
    if (selectedPeriod === 'all') return 'All Time'

    const [year, monthNum] = selectedPeriod.split('-').map(Number)
    const date = new Date(Date.UTC(year, monthNum - 1, 1))
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      timeZone: 'UTC'
    })
  }
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

  // Group months by year for better UX
  const groupMonthsByYear = () => {
    const grouped: { [year: string]: string[] } = {}

    availableMonths.forEach(month => {
      const year = month.split('-')[0]
      if (!grouped[year]) {
        grouped[year] = []
      }
      grouped[year].push(month)
    })

    // Sort years in descending order (newest first)
    return Object.keys(grouped)
      .sort((a, b) => parseInt(b) - parseInt(a))
      .map(year => ({
        year,
        months: grouped[year]
      }))
  }

  const yearGroups = groupMonthsByYear()

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
            {/* Period selector - Custom collapsible dropdown */}
            <div className="custom-dropdown" ref={dropdownRef}>
              <button
                className="glass-select"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{getDisplayValue()}</span>
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                >
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div
                    className={`dropdown-item ${selectedPeriod === 'all' ? 'selected' : ''}`}
                    onClick={handleAllTimeSelect}
                  >
                    All Time
                  </div>
                  <div className="dropdown-divider"></div>
                  {yearGroups.map(({ year, months }) => (
                    <div key={year}>
                      <div
                        className="year-header"
                        onClick={() => toggleYear(year)}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          className={`year-chevron ${expandedYear === year ? 'expanded' : ''}`}
                        >
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {year}
                      </div>
                      {expandedYear === year && (
                        <div className="year-months">
                          {months.map(month => {
                            const [, monthNum] = month.split('-').map(Number)
                            const date = new Date(Date.UTC(parseInt(year), monthNum - 1, 1))
                            const formattedMonth = date.toLocaleDateString('en-US', {
                              month: 'long',
                              timeZone: 'UTC'
                            })

                            return (
                              <div
                                key={month}
                                className={`dropdown-item month-item ${selectedPeriod === month ? 'selected' : ''}`}
                                onClick={() => handleMonthSelect(month)}
                              >
                                {formattedMonth}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

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
              .custom-dropdown {
                position: relative;
                min-width: 180px;
              }

              .glass-select {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                background-color: rgba(255, 255, 255, 0.06);
                backdrop-filter: blur(20px);
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.3px;
                padding: 0 1.2rem;
                height: 40px;
                border-radius: 25px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow:
                  0 8px 32px rgba(0, 0, 0, 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
                cursor: pointer;
                transition: all 0.3s ease;
              }

              .glass-select:hover {
                color: white;
                background-color: rgba(255, 255, 255, 0.08);
              }

              .dropdown-arrow {
                color: rgba(255, 255, 255, 0.6);
                transition: transform 0.3s ease, color 0.3s ease;
                flex-shrink: 0;
                margin-left: 0.5rem;
              }

              .dropdown-arrow.open {
                transform: rotate(180deg);
              }

              .glass-select:hover .dropdown-arrow {
                color: rgba(255, 255, 255, 0.9);
              }

              .dropdown-menu {
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                right: 0;
                max-height: 400px;
                overflow-y: auto;
                background-color: rgba(26, 26, 26, 0.98);
                backdrop-filter: blur(20px);
                border-radius: 16px;
                border: 1px solid rgba(255, 255, 255, 0.15);
                box-shadow:
                  0 8px 32px rgba(0, 0, 0, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1);
                z-index: 1000;
                animation: slideDown 0.2s ease-out;
              }

              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-8px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              .dropdown-menu::-webkit-scrollbar {
                width: 8px;
              }

              .dropdown-menu::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
              }

              .dropdown-menu::-webkit-scrollbar-thumb {
                background: rgba(30, 215, 96, 0.5);
                border-radius: 4px;
              }

              .dropdown-menu::-webkit-scrollbar-thumb:hover {
                background: rgba(30, 215, 96, 0.7);
              }

              .dropdown-item {
                padding: 0.5rem 1.2rem;
                color: rgba(255, 255, 255, 0.8);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
              }

              .dropdown-item:hover {
                background-color: rgba(255, 255, 255, 0.05);
                color: white;
              }

              .dropdown-item.selected {
                background-color: rgba(30, 215, 96, 0.15);
                color: #1db954;
                font-weight: 600;
              }

              .dropdown-divider {
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 0.25rem 0;
              }

              .year-header {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1.2rem;
                color: #1db954;
                font-size: 14px;
                font-weight: 700;
                letter-spacing: 0.5px;
                cursor: pointer;
                transition: all 0.2s ease;
              }

              .year-header:hover {
                background-color: rgba(255, 255, 255, 0.05);
              }

              .year-chevron {
                color: #1db954;
                transition: transform 0.3s ease;
                flex-shrink: 0;
              }

              .year-chevron.expanded {
                transform: rotate(0deg);
              }

              .year-chevron:not(.expanded) {
                transform: rotate(-90deg);
              }

              .year-months {
                animation: expandDown 0.2s ease-out;
              }

              @keyframes expandDown {
                from {
                  opacity: 0;
                  max-height: 0;
                }
                to {
                  opacity: 1;
                  max-height: 500px;
                }
              }

              .month-item {
                padding: 0.4rem 1.2rem 0.4rem 2.5rem;
                font-size: 13px;
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

