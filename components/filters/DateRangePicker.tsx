import { useState, useRef, useEffect } from 'react'
import Calendar from './Calendar'

interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onApply: (start: Date | null, end: Date | null) => void
  minDate: Date
  maxDate: Date
}

type QuickFilter = 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'all_time'

export default function DateRangePicker({
  startDate,
  endDate,
  onApply,
  minDate,
  maxDate
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStart, setTempStart] = useState<Date | null>(startDate)
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Current calendar view (single month)
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [viewYear, setViewYear] = useState(new Date().getFullYear())

  // Month and year selector states
  const [showMonthSelector, setShowMonthSelector] = useState(false)
  const [showYearSelector, setShowYearSelector] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset temp values when opening
  const handleToggle = () => {
    if (!isOpen) {
      setTempStart(startDate)
      setTempEnd(endDate)

      // Determine active quick filter
      if (!startDate && !endDate) {
        setActiveQuickFilter('all_time')
      } else {
        setActiveQuickFilter(null)
      }
    }
    setIsOpen(!isOpen)
  }

  // Handle date click in calendar
  const handleDateClick = (date: Date) => {
    setActiveQuickFilter(null)

    if (!tempStart || (tempStart && tempEnd)) {
      // Start new selection
      setTempStart(date)
      setTempEnd(null)
    } else {
      // Complete the range
      if (date < tempStart) {
        // Swap if end is before start
        setTempEnd(tempStart)
        setTempStart(date)
      } else {
        setTempEnd(date)
      }
    }
  }

  // Quick filter calculations
  const handleQuickFilter = (filter: QuickFilter) => {
    setActiveQuickFilter(filter)
    const now = new Date()

    switch (filter) {
      case 'this_month':
        setTempStart(new Date(now.getFullYear(), now.getMonth(), 1))
        setTempEnd(new Date(now.getFullYear(), now.getMonth() + 1, 0))
        break
      case 'last_month':
        setTempStart(new Date(now.getFullYear(), now.getMonth() - 1, 1))
        setTempEnd(new Date(now.getFullYear(), now.getMonth(), 0))
        break
      case 'this_year':
        setTempStart(new Date(now.getFullYear(), 0, 1))
        setTempEnd(new Date(now.getFullYear(), 11, 31))
        break
      case 'last_year':
        setTempStart(new Date(now.getFullYear() - 1, 0, 1))
        setTempEnd(new Date(now.getFullYear() - 1, 11, 31))
        break
      case 'all_time':
        setTempStart(null)
        setTempEnd(null)
        break
    }
  }

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (viewMonth === 0) {
        setViewMonth(11)
        setViewYear(viewYear - 1)
      } else {
        setViewMonth(viewMonth - 1)
      }
    } else {
      if (viewMonth === 11) {
        setViewMonth(0)
        setViewYear(viewYear + 1)
      } else {
        setViewMonth(viewMonth + 1)
      }
    }
  }

  // Apply the selection
  const handleApply = () => {
    onApply(tempStart, tempEnd)
    setIsOpen(false)
  }

  // Cancel and close
  const handleCancel = () => {
    setTempStart(startDate)
    setTempEnd(endDate)
    setIsOpen(false)
  }

  // Format display value
  const getDisplayValue = () => {
    if (!startDate && !endDate) return 'All Time'

    if (startDate && endDate) {
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    }

    if (startDate) {
      return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return 'Select dates'
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Generate available years for selector
  const availableYears = Array.from(
    { length: maxDate.getFullYear() - minDate.getFullYear() + 1 },
    (_, i) => minDate.getFullYear() + i
  )

  // Handle month selector
  const handleMonthSelect = (monthIndex: number) => {
    setViewMonth(monthIndex)
    setShowMonthSelector(false)
  }

  // Handle year selector
  const handleYearSelect = (year: number) => {
    setViewYear(year)
    setShowYearSelector(false)
  }

  // Handle date hover
  const handleDateHover = (date: Date | null) => {
    setHoverDate(date)
  }

  // Get selected range display
  const getSelectedRangeDisplay = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    if (!tempStart && !tempEnd) return 'All Time'

    if (tempStart && tempEnd) {
      return `${formatDate(tempStart)} - ${formatDate(tempEnd)}`
    }

    if (tempStart) {
      return `${formatDate(tempStart)} - ?`
    }

    return 'Select dates'
  }

  return (
    <div className="date-range-picker" ref={dropdownRef}>
      <button
        className="glass-select"
        onClick={handleToggle}
        type="button"
      >
        <span>{getDisplayValue()}</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
        >
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-panel">
          <div className="panel-content">
            {/* Quick Filters Sidebar */}
            <div className="quick-filters">
              <button
                className={`quick-filter-item ${activeQuickFilter === 'this_month' ? 'active' : ''}`}
                onClick={() => handleQuickFilter('this_month')}
                type="button"
              >
                This month
              </button>
              <button
                className={`quick-filter-item ${activeQuickFilter === 'last_month' ? 'active' : ''}`}
                onClick={() => handleQuickFilter('last_month')}
                type="button"
              >
                Last month
              </button>
              <button
                className={`quick-filter-item ${activeQuickFilter === 'this_year' ? 'active' : ''}`}
                onClick={() => handleQuickFilter('this_year')}
                type="button"
              >
                This year
              </button>
              <button
                className={`quick-filter-item ${activeQuickFilter === 'last_year' ? 'active' : ''}`}
                onClick={() => handleQuickFilter('last_year')}
                type="button"
              >
                Last year
              </button>
              <button
                className={`quick-filter-item ${activeQuickFilter === 'all_time' ? 'active' : ''}`}
                onClick={() => handleQuickFilter('all_time')}
                type="button"
              >
                All time
              </button>
            </div>

            {/* Single Calendar View */}
            <div className="calendars-container">
              {/* Navigation and Month Header */}
              <div className="calendar-header">
                <button
                  className="nav-button"
                  onClick={() => navigateMonth('prev')}
                  type="button"
                >
                  <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                    <path d="M6.5 1L1.5 6L6.5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className="month-year-selector">
                  <button
                    className="month-button"
                    onClick={() => setShowMonthSelector(!showMonthSelector)}
                    type="button"
                  >
                    {monthNames[viewMonth]}
                  </button>
                  <button
                    className="year-button"
                    onClick={() => setShowYearSelector(!showYearSelector)}
                    type="button"
                  >
                    {viewYear}
                  </button>

                  {/* Month Selector Dropdown */}
                  {showMonthSelector && (
                    <div className="selector-dropdown month-dropdown">
                      {monthNames.map((month, index) => (
                        <button
                          key={month}
                          className={`selector-item ${index === viewMonth ? 'active' : ''}`}
                          onClick={() => handleMonthSelect(index)}
                          type="button"
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Year Selector Dropdown */}
                  {showYearSelector && (
                    <div className="selector-dropdown year-dropdown">
                      {availableYears.map((year) => (
                        <button
                          key={year}
                          className={`selector-item ${year === viewYear ? 'active' : ''}`}
                          onClick={() => handleYearSelect(year)}
                          type="button"
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="nav-button"
                  onClick={() => navigateMonth('next')}
                  type="button"
                >
                  <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                    <path d="M1.5 1L6.5 6L1.5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Single Calendar */}
              <Calendar
                month={viewMonth}
                year={viewYear}
                selectedStart={tempStart}
                selectedEnd={tempEnd}
                minDate={minDate}
                maxDate={maxDate}
                onDateClick={handleDateClick}
                onDateHover={handleDateHover}
                hoverDate={hoverDate}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <span className="selected-range">
              {getSelectedRangeDisplay()}
            </span>
            <div className="button-group">
              <button className="btn-cancel" onClick={handleCancel} type="button">
                Cancel
              </button>
              <button className="btn-apply" onClick={handleApply} type="button">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .date-range-picker {
          position: relative;
          min-width: 240px;
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

        .dropdown-panel {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(26, 26, 26, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          z-index: 1000;
          animation: slideDown 0.2s ease-out;
          min-width: 450px;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .panel-content {
          display: flex;
          padding: 1rem;
          gap: 1rem;
        }

        .quick-filters {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding-right: 1rem;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          min-width: 140px;
        }

        .quick-filter-item {
          padding: 0.5rem 0.75rem;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          background: transparent;
          border: none;
          border-radius: 8px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .quick-filter-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .quick-filter-item.active {
          background-color: rgba(29, 185, 84, 0.15);
          color: #1db954;
          font-weight: 600;
        }

        .calendars-container {
          flex: 1;
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0.5rem;
          margin-bottom: 0.5rem;
        }

        .month-year-selector {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          position: relative;
        }

        .month-button,
        .year-button {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .month-button:hover,
        .year-button:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .selector-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          background-color: rgba(26, 26, 26, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
          z-index: 1001;
          max-height: 240px;
          overflow-y: auto;
          min-width: 140px;
        }

        .month-dropdown {
          left: 0;
        }

        .year-dropdown {
          left: auto;
          right: 0;
        }

        .selector-item {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .selector-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .selector-item.active {
          background-color: rgba(29, 185, 84, 0.15);
          color: #1db954;
          font-weight: 600;
        }

        .nav-button {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-button:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
        }


        .action-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .selected-range {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        .button-group {
          display: flex;
          gap: 0.75rem;
        }

        .btn-cancel,
        .btn-apply {
          padding: 0.5rem 1.5rem;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel {
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-cancel:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .btn-apply {
          background-color: #1db954;
          color: #000;
        }

        .btn-apply:hover {
          background-color: #1ed760;
        }
      `}</style>
    </div>
  )
}
