import KPICards from '@/components/KPICards'
import TopArtists from '@/components/TopArtists'
import TopTracks from '@/components/TopTracks'
import PeriodFilter from '@/components/filters/PeriodFilter'
import MetricFilter from '@/components/filters/MetricFilter'
import type { SummaryData, MonthlyData, TopArtist, TopTrack } from '@/types'

interface OverviewPageProps {
  summary: SummaryData | null
  topArtists: TopArtist[]
  topTracks: TopTrack[]
  selectedPeriod: string
  setSelectedPeriod: (period: string) => void
  filteredMonthly: MonthlyData[]
  metric: 'hours' | 'plays'
  setMetric: (metric: 'hours' | 'plays') => void
  isFilterLoading: boolean
  availableMonths: string[]
}

export default function OverviewPage({
  summary,
  topArtists,
  topTracks,
  selectedPeriod,
  setSelectedPeriod,
  filteredMonthly,
  metric,
  setMetric,
  isFilterLoading,
  availableMonths
}: OverviewPageProps) {
  return (
    <main 
      className="container mx-auto px-4 py-8 max-w-7xl"
      style={{ opacity: isFilterLoading ? 0.6 : 1, transition: 'opacity 0.3s ease' }}
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center mb-8">
        <PeriodFilter
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          availableMonths={availableMonths}
        />
        <MetricFilter
          metric={metric}
          setMetric={setMetric}
        />
      </div>

      {summary && (
        <div className="animate-fade-in">
          <KPICards
            summary={summary}
            selectedPeriod={selectedPeriod}
            monthly={filteredMonthly}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="animate-fade-in animation-delay-500">
          <TopArtists data={topArtists} metric={metric} limit={10} />
        </div>
        <div className="animate-fade-in animation-delay-600">
          <TopTracks data={topTracks} metric={metric} limit={10} />
        </div>
      </div>
    </main>
  )
}

