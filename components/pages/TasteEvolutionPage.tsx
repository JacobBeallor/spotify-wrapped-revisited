import RacingBarChart from '@/components/RacingBarChart'
import MetricFilter from '@/components/filters/MetricFilter'
import EntityFilter from '@/components/filters/EntityFilter'
import type { ArtistEvolution, GenreEvolution } from '@/types'

interface TasteEvolutionPageProps {
  artistEvolution: ArtistEvolution[]
  genreEvolution: GenreEvolution[]
  metric: 'hours' | 'plays'
  setMetric: (metric: 'hours' | 'plays') => void
  entity: 'artists' | 'genres'
  setEntity: (entity: 'artists' | 'genres') => void
}

export default function TasteEvolutionPage({
  artistEvolution,
  genreEvolution,
  metric,
  setMetric,
  entity,
  setEntity
}: TasteEvolutionPageProps) {
  // Normalize data structure for RacingBarChart
  const data = entity === 'artists' 
    ? artistEvolution.map(d => ({
        year_month: d.year_month,
        name: d.artist_name,
        hours: d.hours,
        plays: d.plays
      }))
    : genreEvolution.map(d => ({
        year_month: d.year_month,
        name: d.genre,
        hours: d.hours,
        plays: d.plays
      }))

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center mb-8">
        <EntityFilter
          entity={entity}
          setEntity={setEntity}
        />
        <MetricFilter
          metric={metric}
          setMetric={setMetric}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="animate-fade-in animation-delay-400">
          <RacingBarChart 
            data={data} 
            metric={metric} 
            topN={10}
            entityType={entity}
          />
        </div>
      </div>
    </main>
  )
}

