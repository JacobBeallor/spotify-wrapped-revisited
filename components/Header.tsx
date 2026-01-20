interface HeaderProps {
  activeTab: 'overview' | 'patterns' | 'evolution'
  onTabChange: (tab: 'overview' | 'patterns' | 'evolution') => void
  lastUpdated?: string
}

export default function Header({
  activeTab,
  onTabChange,
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

          <nav className="flex flex-col sm:flex-row gap-6 items-stretch sm:items-center">
            <button
              className={`tab-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => onTabChange('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-link ${activeTab === 'patterns' ? 'active' : ''}`}
              onClick={() => onTabChange('patterns')}
            >
              Listening Habits
            </button>
            <button
              className={`tab-link ${activeTab === 'evolution' ? 'active' : ''}`}
              onClick={() => onTabChange('evolution')}
            >
              Taste Evolution
            </button>
          </nav>

          <style jsx>{`
            .tab-link {
              padding: 0.5rem 0;
              font-size: 14px;
              font-weight: 500;
              letter-spacing: 0.2px;
              background: none;
              border: none;
              border-bottom: 2px solid transparent;
              color: rgba(255, 255, 255, 0.6);
              cursor: pointer;
              transition: all 0.2s ease;
              white-space: nowrap;
              position: relative;
            }

            .tab-link:hover {
              color: rgba(255, 255, 255, 0.9);
            }

            .tab-link.active {
              color: #1db954;
              border-bottom-color: #1db954;
              font-weight: 600;
            }
          `}</style>
        </div>
      </div>
    </header>
  )
}
