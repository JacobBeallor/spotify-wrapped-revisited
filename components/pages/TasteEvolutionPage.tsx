import ArtistEvolutionChart from '@/components/ArtistEvolutionChart'
import type { ArtistEvolution } from '@/types'

interface TasteEvolutionPageProps {
  artistEvolution: ArtistEvolution[]
}

export default function TasteEvolutionPage({
  artistEvolution
}: TasteEvolutionPageProps) {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 gap-6">
        <div className="animate-fade-in animation-delay-400">
          <ArtistEvolutionChart data={artistEvolution} topN={3} />
        </div>
      </div>
    </main>
  )
}

