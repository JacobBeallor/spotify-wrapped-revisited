# Date Range Filter Architecture

Documentation for the flexible date range picker component and date-based filtering system.

## Overview

The date range filter provides a user-friendly interface for filtering listening data by custom date ranges. It features a dual-calendar view, quick preset filters, and integrates with all API endpoints that support date-based filtering.

**Location:** `components/filters/DateRangePicker.tsx`

**Design:** Glassmorphism dropdown matching Spotify's dark theme aesthetic

**Key Features:**
- Dual calendar view showing two consecutive months
- Quick filter presets (This month, Last month, This year, Last year, All time)
- Date range selection with visual feedback
- Responsive and accessible design
- Matches existing filter components' glassmorphism style

---

## Component Architecture

### Component Hierarchy

```
DateRangePicker (main component)
├── Quick Filters Sidebar
│   ├── This month
│   ├── Last month
│   ├── This year
│   ├── Last year
│   └── All time
├── Dual Calendar View
│   ├── Calendar (first month)
│   └── Calendar (second month)
└── Action Buttons
    ├── Cancel
    └── Apply
```

### Component Files

**1. DateRangePicker.tsx**
- Main container component
- Manages state for temporary date selection
- Handles quick filter logic
- Controls dropdown open/close
- Applies date range on user confirmation

**2. Calendar.tsx**
- Reusable calendar grid component
- Generates calendar days with proper padding
- Handles date selection logic
- Provides visual feedback for selected ranges
- Disables dates outside available range

---

## Props Interface

### DateRangePicker Props

```typescript
interface DateRangePickerProps {
  startDate: Date | null
  endDate: Date | null
  onApply: (start: Date | null, end: Date | null) => void
  minDate: Date
  maxDate: Date
}
```

**Parameters:**
- `startDate`: Currently selected start date (null for "All time")
- `endDate`: Currently selected end date (null for "All time")
- `onApply`: Callback triggered when user clicks "Apply"
- `minDate`: Earliest date with available data
- `maxDate`: Latest date with available data

### Calendar Props

```typescript
interface CalendarProps {
  month: number // 0-11
  year: number
  selectedStart: Date | null
  selectedEnd: Date | null
  minDate: Date
  maxDate: Date
  onDateClick: (date: Date) => void
  hoverDate: Date | null
}
```

---

## Date Selection Behavior

### User Flow

1. **Click dropdown button** → Opens date picker panel
2. **Select start date** → Highlights date, shows green background
3. **Select end date** → Completes range, fills in-between dates
4. **Click Apply** → Applies selection, closes dropdown
5. **Click Cancel** → Reverts to previous selection, closes dropdown

### Selection Rules

- **First click:** Sets start date, clears end date
- **Second click:** Sets end date
- **Auto-swap:** If second click is before start, dates are automatically swapped
- **Range highlight:** All dates between start and end show green background
- **Disabled dates:** Dates outside min/max range cannot be selected

### Quick Filters

Quick filter presets automatically calculate date ranges:

| Filter | Start Date | End Date |
|--------|-----------|----------|
| This month | First day of current month | Last day of current month |
| Last month | First day of last month | Last day of last month |
| This year | January 1 of current year | December 31 of current year |
| Last year | January 1 of last year | December 31 of last year |
| All time | null | null |

**Implementation:**
```typescript
case 'this_month':
  setTempStart(new Date(now.getFullYear(), now.getMonth(), 1))
  setTempEnd(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  break
```

---

## State Management

### Local State (DateRangePicker)

```typescript
const [isOpen, setIsOpen] = useState(false)
const [tempStart, setTempStart] = useState<Date | null>(startDate)
const [tempEnd, setTempEnd] = useState<Date | null>(endDate)
const [hoverDate, setHoverDate] = useState<Date | null>(null)
const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter | null>(null)
const [viewMonth, setViewMonth] = useState(new Date().getMonth())
const [viewYear, setViewYear] = useState(new Date().getFullYear())
```

**Why temporary state?**
- Changes aren't applied until user clicks "Apply"
- Allows users to explore different ranges without triggering API calls
- "Cancel" button can revert to previous selection

### Global State (app/page.tsx)

```typescript
const [dateRange, setDateRange] = useState<{
  start: Date | null
  end: Date | null
}>({
  start: null,
  end: null
})

const [availableDateRange, setAvailableDateRange] = useState<{
  min: Date
  max: Date
} | null>(null)
```

**Available date range:**
- Fetched from `/api/summary` response (`min_date`, `max_date`)
- Represents the actual date range of data in the database
- Used to disable dates outside this range in the calendar

---

## Styling Approach

### Theme Colors (Spotify Brand)

```css
/* Primary accent */
--spotify-green: #1DB954

/* Backgrounds */
--panel-bg: rgba(26, 26, 26, 0.98)
--hover-bg: rgba(255, 255, 255, 0.05)
--selected-bg: rgba(29, 185, 84, 0.15)

/* Borders */
--border-color: rgba(255, 255, 255, 0.15)

/* Text */
--text-primary: rgba(255, 255, 255, 0.9)
--text-secondary: rgba(255, 255, 255, 0.6)
--text-disabled: rgba(255, 255, 255, 0.2)
```

### Glassmorphism Effects

**Button:**
```css
background-color: rgba(255, 255, 255, 0.06);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.15);
box-shadow: 
  0 8px 32px rgba(0, 0, 0, 0.15),
  inset 0 1px 0 rgba(255, 255, 255, 0.1);
```

**Dropdown panel:**
```css
background-color: rgba(26, 26, 26, 0.98);
backdrop-filter: blur(20px);
border-radius: 16px;
border: 1px solid rgba(255, 255, 255, 0.15);
```

### Visual States

**Selected date:**
- Background: `#1DB954` (Spotify green)
- Text color: `#000` (black for contrast)
- Font weight: `700` (bold)

**Date in range:**
- Background: `rgba(29, 185, 84, 0.15)` (15% opacity green)

**Hover state:**
- Background: `rgba(255, 255, 255, 0.08)`

**Disabled date:**
- Color: `rgba(255, 255, 255, 0.2)`
- Cursor: `not-allowed`

---

## Calendar Logic

### Day Grid Generation

The calendar generates a 6×7 grid (42 cells) to ensure consistent height:

1. **Previous month padding:** Fill days before first day of month
2. **Current month days:** Generate all days 1-31 (or 28-30)
3. **Next month padding:** Fill remaining cells to reach 42

**Implementation:**
```typescript
const generateCalendarDays = (): CalendarDay[] => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDay.getDay() // 0-6
  
  // Previous month padding
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
      isDisabled: date < minDate || date > maxDate
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(year, month, day),
      isCurrentMonth: true,
      isDisabled: date < minDate || date > maxDate
    })
  }
  
  // Next month padding to fill 42 cells
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
      isDisabled: date < minDate || date > maxDate
    })
  }
  
  return days
}
```

### Date Comparison Utilities

```typescript
// Check if date is the selected start or end
const isSameDay = (date1: Date, date2: Date | null): boolean => {
  if (!date2) return false
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// Check if date falls within selected range
const isDateInRange = (date: Date): boolean => {
  if (!selectedStart || !selectedEnd) return false
  const time = date.getTime()
  return time >= selectedStart.getTime() && time <= selectedEnd.getTime()
}
```

### Month Navigation

Users can navigate between months using arrow buttons:

```typescript
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
```

---

## API Integration

### Date Format

All API endpoints expect dates in **ISO 8601 format** (YYYY-MM-DD):

```typescript
const formatDateForAPI = (date: Date | null): string | undefined => {
  if (!date) return undefined
  return date.toISOString().split('T')[0] // "2024-01-15"
}
```

### API Parameters

**Before (month-based):**
```typescript
?start=2024-01&end=2024-12  // year_month format
```

**After (date-based):**
```typescript
?startDate=2024-01-01&endDate=2024-12-31  // YYYY-MM-DD format
```

### Affected Endpoints

All these endpoints now accept `startDate` and `endDate` parameters:

- `/api/summary` - Summary statistics with date filtering
- `/api/top-artists` - Top artists within date range
- `/api/top-tracks` - Top tracks within date range

**SQL queries updated:**
```sql
-- Old
WHERE p.year_month >= ? AND p.year_month <= ?

-- New
WHERE p.date >= ? AND p.date <= ?
```

### Fetching Available Date Range

The available date range is fetched from the summary endpoint:

```typescript
useEffect(() => {
  if (summary?.min_date && summary?.max_date) {
    setAvailableDateRange({
      min: new Date(summary.min_date),
      max: new Date(summary.max_date)
    })
  }
}, [summary])
```

---

## Monthly Data Filtering

For components that display monthly aggregated data (like the KPI cards chart), client-side filtering is used:

```typescript
const filterMonthlyByDateRange = (data: MonthlyData[]): MonthlyData[] => {
  if (!dateRange.start || !dateRange.end) return data
  
  return data.filter(item => {
    const [year, monthNum] = item.year_month.split('-').map(Number)
    const monthDate = new Date(year, monthNum - 1, 1)
    const monthEnd = new Date(year, monthNum, 0)
    
    // Include month if it overlaps with the date range
    return monthEnd >= dateRange.start! && monthDate <= dateRange.end!
  })
}
```

**Logic:**
- Include months that overlap with the selected date range
- A month overlaps if: `month_end >= range_start AND month_start <= range_end`

---

## Display Value

The dropdown button displays the current selection in a user-friendly format:

```typescript
const getDisplayValue = () => {
  if (!startDate && !endDate) return 'All Time'
  
  if (startDate && endDate) {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }
  
  if (startDate) {
    return startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }
  
  return 'Select dates'
}
```

**Examples:**
- `All Time` - No date range selected
- `Jan 1, 2024 - Dec 31, 2024` - Full year range
- `Mar 15, 2024 - Apr 20, 2024` - Custom range

---

## Accessibility

### Keyboard Support

- **Arrow keys:** Navigate between months (when focused on nav buttons)
- **Enter/Space:** Select date, toggle quick filters
- **Escape:** Close dropdown
- **Tab:** Navigate through focusable elements

### ARIA Labels

```typescript
<button
  aria-label="Select date range"
  aria-expanded={isOpen}
  aria-haspopup="dialog"
>
```

### Focus Management

- Focus returns to trigger button when dropdown closes
- Trap focus within dropdown when open
- Clear focus indicators on interactive elements

---

## Performance Considerations

### Optimization Strategies

1. **Temporary state:** Changes don't trigger API calls until "Apply" is clicked
2. **Date comparison caching:** Use memoization for expensive date calculations
3. **Minimal re-renders:** Only update calendar when month/year changes
4. **Efficient grid generation:** Generate calendar days once per month view

### API Call Prevention

The component prevents unnecessary API calls by:
- Using temporary state that doesn't propagate until "Apply"
- Only calling `onApply` when user explicitly confirms selection
- Debouncing quick filter clicks (if multiple pressed quickly)

---

## Edge Cases & Validation

### Date Range Validation

1. **Start > End:** Automatically swap dates
2. **Out of bounds:** Disable dates outside min/max range
3. **Same date:** Allow start and end to be the same (single day)
4. **Null dates:** Represent "All time" filter

### Quick Filter Edge Cases

1. **"This month" when current month has no data:** Still selectable, returns empty results
2. **"Last year" for new users:** May return no data if account is recent
3. **Partial data months:** Include entire month even if only partial data exists

### Calendar Edge Cases

1. **Leap years:** Correctly handles February 29th
2. **Month boundaries:** Proper padding for months starting on different weekdays
3. **Year transitions:** Navigating from December to January increments year

---

## Testing Checklist

### Visual Testing

- [ ] Glassmorphism effects match MetricFilter style
- [ ] Spotify green accents on selected dates
- [ ] Dropdown positioning doesn't overflow viewport
- [ ] Dual calendar months display correctly
- [ ] Date range highlighting shows correctly
- [ ] Quick filter active states work

### Functional Testing

- [ ] Date selection completes range properly
- [ ] Dates auto-swap when end < start
- [ ] Quick filters calculate correct ranges
- [ ] "Apply" triggers API calls with correct params
- [ ] "Cancel" reverts to previous selection
- [ ] "All time" clears date range
- [ ] Month navigation works forward/backward

### Data Validation

- [ ] API returns correct data for date ranges
- [ ] Monthly chart filters correctly
- [ ] Summary stats update for selected range
- [ ] Top artists/tracks filter correctly
- [ ] Edge dates (min/max) work properly

---

## Migration from PeriodFilter

### What Changed

**Before:**
- Month-based dropdown (YYYY-MM format)
- Single month selection
- "All Time" or specific month only
- API params: `start` and `end` as year_month

**After:**
- Date range picker with dual calendars
- Custom date range selection
- Quick filter presets + custom ranges
- API params: `startDate` and `endDate` as dates

### Breaking Changes

1. **State shape changed:**
   ```typescript
   // Old
   const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
   
   // New
   const [dateRange, setDateRange] = useState<{
     start: Date | null
     end: Date | null
   }>({ start: null, end: null })
   ```

2. **API parameter names changed:**
   - `start` → `startDate`
   - `end` → `endDate`

3. **SQL WHERE clauses updated:**
   - `year_month >= ?` → `date >= ?`
   - `year_month <= ?` → `date <= ?`

### Migration Steps

1. Update state in `app/page.tsx`
2. Replace `PeriodFilter` with `DateRangePicker` in `OverviewPage.tsx`
3. Update API routes to accept `startDate`/`endDate`
4. Update SQL queries to filter by `date` instead of `year_month`
5. Update monthly data filtering logic
6. Test all date range scenarios

---

## See Also

- [API Routes Documentation](./api-routes.md) - API endpoint updates for date filtering
- [Navigation Architecture](./navigation.md) - Filter state management
- [Component Library](../STRUCTURE.md) - Filter component patterns
