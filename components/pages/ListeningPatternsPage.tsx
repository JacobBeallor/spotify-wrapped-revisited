import MonthlyChart from '@/components/MonthlyChart'
import DayOfWeekChart from '@/components/DayOfWeekChart'
import HourChart from '@/components/HourChart'
import MetricFilter from '@/components/filters/MetricFilter'
import type { MonthlyData, DowData, HourData } from '@/types'

interface ListeningPatternsPageProps {
  monthly: MonthlyData[]
  dow: DowData[]
  hour: HourData[]
  metric: 'hours' | 'plays'
  setMetric: (metric: 'hours' | 'plays') => void
}

export default function ListeningPatternsPage({
  monthly,
  dow,
  hour,
  metric,
  setMetric
}: ListeningPatternsPageProps) {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center mb-8">
        <MetricFilter
          metric={metric}
          setMetric={setMetric}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="animate-fade-in animation-delay-100">
          <MonthlyChart data={monthly} metric={metric} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-fade-in animation-delay-200">
            <DayOfWeekChart data={dow} metric={metric} />
          </div>
          <div className="animate-fade-in animation-delay-300">
            <HourChart data={hour} metric={metric} />
          </div>
        </div>
      </div>
    </main>
  )
}

