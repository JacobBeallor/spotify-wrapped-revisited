import RacingBarChart from '@/components/RacingBarChart'
import MetricFilter from '@/components/filters/MetricFilter'
import type { ArtistEvolution } from '@/types'

interface TasteEvolutionPageProps {
  artistEvolution: ArtistEvolution[]
  metric: 'hours' | 'plays'
  setMetric: (metric: 'hours' | 'plays') => void
}

export default function TasteEvolutionPage({
  artistEvolution,
  metric,
  setMetric
}: TasteEvolutionPageProps) {
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
        <div className="animate-fade-in animation-delay-400">
          <RacingBarChart data={artistEvolution} metric={metric} topN={10} />
        </div>
      </div>
    </main>
  )
}

