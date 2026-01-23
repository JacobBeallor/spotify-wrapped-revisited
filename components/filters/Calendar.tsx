interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isDisabled: boolean
}

interface CalendarProps {
  month: number // 0-11
  year: number
  selectedStart: Date | null
  selectedEnd: Date | null
  minDate: Date
  maxDate: Date
  onDateClick: (date: Date) => void
  onDateHover: (date: Date | null) => void
  hoverDate: Date | null
}

export default function Calendar({
  month,
  year,
  selectedStart,
  selectedEnd,
  minDate,
  maxDate,
  onDateClick,
  onDateHover,
  hoverDate
}: CalendarProps) {
  // Generate calendar days for the month
  const generateCalendarDays = (): CalendarDay[] => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay()
    
    const days: CalendarDay[] = []
    
    // Add previous month's days to fill the grid
    const prevMonthLastDay = new Date(year, month, 0)
    const prevMonthDays = prevMonthLastDay.getDate()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i)
      days.push({
        date,
        isCurrentMonth: false,
        isDisabled: date < minDate || date > maxDate
      })
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        isDisabled: date < minDate || date > maxDate
      })
    }
    
    // Add next month's days to complete the grid (6 rows)
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        isDisabled: date < minDate || date > maxDate
      })
    }
    
    return days
  }

  const days = generateCalendarDays()

  // Helper functions for date comparison
  const isSameDay = (date1: Date, date2: Date | null): boolean => {
    if (!date2) return false
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const isDateInRange = (date: Date): boolean => {
    if (!selectedStart || !selectedEnd) return false
    const time = date.getTime()
    return time >= selectedStart.getTime() && time <= selectedEnd.getTime()
  }

  const isDateInHoverRange = (date: Date): boolean => {
    if (!selectedStart || !hoverDate || selectedEnd) return false
    const time = date.getTime()
    const start = Math.min(selectedStart.getTime(), hoverDate.getTime())
    const end = Math.max(selectedStart.getTime(), hoverDate.getTime())
    return time >= start && time <= end
  }

  const isStartOrEnd = (date: Date): boolean => {
    return isSameDay(date, selectedStart) || isSameDay(date, selectedEnd)
  }

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="calendar">
      {/* Week day headers */}
      <div className="calendar-header">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="calendar-grid">
        {days.map((dayInfo, index) => {
          const isSelected = isStartOrEnd(dayInfo.date)
          const isInRange = isDateInRange(dayInfo.date)
          const isInHover = isDateInHoverRange(dayInfo.date)
          const isStart = isSameDay(dayInfo.date, selectedStart)
          const isEnd = isSameDay(dayInfo.date, selectedEnd)

          return (
            <button
              key={index}
              className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${
                dayInfo.isDisabled ? 'disabled' : ''
              } ${isSelected ? 'selected' : ''} ${isInRange ? 'in-range' : ''} ${
                isInHover ? 'in-hover-range' : ''
              } ${isStart ? 'range-start' : ''} ${isEnd ? 'range-end' : ''}`}
              onClick={() => !dayInfo.isDisabled && onDateClick(dayInfo.date)}
              onMouseEnter={() => !dayInfo.isDisabled && onDateHover(dayInfo.date)}
              onMouseLeave={() => onDateHover(null)}
              disabled={dayInfo.isDisabled}
              type="button"
            >
              {dayInfo.date.getDate()}
            </button>
          )
        })}
      </div>

      <style jsx>{`
        .calendar {
          padding: 0.5rem;
        }

        .calendar-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          margin-bottom: 0.5rem;
        }

        .calendar-weekday {
          text-align: center;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          padding: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .calendar-day:hover:not(.disabled) {
          background-color: rgba(255, 255, 255, 0.08);
        }

        .calendar-day.other-month {
          color: rgba(255, 255, 255, 0.3);
        }

        .calendar-day.disabled {
          color: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
        }

        .calendar-day.in-range,
        .calendar-day.in-hover-range {
          background-color: rgba(29, 185, 84, 0.15);
        }

        .calendar-day.in-hover-range {
          background-color: rgba(29, 185, 84, 0.08);
        }

        .calendar-day.selected {
          background-color: #1db954;
          color: #000;
          font-weight: 700;
        }

        .calendar-day.selected:hover {
          background-color: #1ed760;
        }

        .calendar-day.range-start {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        .calendar-day.range-end {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        .calendar-day.range-start.range-end {
          border-radius: 6px;
        }
      `}</style>
    </div>
  )
}
