'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import KPICards from '@/components/KPICards'
import MonthlyChart from '@/components/MonthlyChart'
import DayOfWeekChart from '@/components/DayOfWeekChart'
import HourChart from '@/components/HourChart'
import TopArtists from '@/components/TopArtists'
import TopTracks from '@/components/TopTracks'
import ArtistEvolutionChart from '@/components/ArtistEvolutionChart'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'
import type { SummaryData, MonthlyData, DowData, HourData, TopArtist, TopTrack, ArtistEvolution } from '@/types'

export default function Home() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [dow, setDow] = useState<DowData[]>([])
  const [hour, setHour] = useState<HourData[]>([])
  const [topArtists, setTopArtists] = useState<TopArtist[]>([])
  const [topTracks, setTopTracks] = useState<TopTrack[]>([])
  const [artistEvolution, setArtistEvolution] = useState<ArtistEvolution[]>([])
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all')
  const [metric, setMetric] = useState<'hours' | 'plays'>('hours')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all data
  useEffect(() => {
    setLoading(true)
    setError(null)
    
    Promise.all([
      fetch('/data/summary.json').then(r => {
        if (!r.ok) throw new Error('Failed to load summary data')
        return r.json()
      }),
      fetch('/data/monthly.json').then(r => {
        if (!r.ok) throw new Error('Failed to load monthly data')
        return r.json()
      }),
      fetch('/data/dow.json').then(r => {
        if (!r.ok) throw new Error('Failed to load day-of-week data')
        return r.json()
      }),
      fetch('/data/hour.json').then(r => {
        if (!r.ok) throw new Error('Failed to load hour data')
        return r.json()
      }),
      fetch('/data/top_artists.json').then(r => {
        if (!r.ok) throw new Error('Failed to load artists data')
        return r.json()
      }),
      fetch('/data/top_tracks.json').then(r => {
        if (!r.ok) throw new Error('Failed to load tracks data')
        return r.json()
      }),
      fetch('/data/artist_evolution.json').then(r => {
        if (!r.ok) throw new Error('Failed to load artist evolution data')
        return r.json()
      }),
    ])
      .then(([summaryData, monthlyData, dowData, hourData, artistData, trackData, evolutionData]) => {
        setSummary(summaryData)
        setMonthly(monthlyData)
        setDow(dowData)
        setHour(hourData)
        setTopArtists(artistData)
        setTopTracks(trackData)
        setArtistEvolution(evolutionData)
        
        // Extract unique months
        const months = monthlyData.map((m: MonthlyData) => m.year_month).sort()
        setAvailableMonths(months)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading data:', err)
        setError('Failed to load data. Please ensure the data pipeline has been run.')
        setLoading(false)
      })
  }, [])

  // Filter data based on selected period
  const filterByPeriod = <T extends { year_month: string }>(data: T[]): T[] => {
    if (selectedPeriod === 'all') return data
    return data.filter(item => item.year_month === selectedPeriod)
  }

  const filteredMonthly = selectedPeriod === 'all' ? monthly : monthly.filter(m => m.year_month === selectedPeriod)
  const filteredDow = filterByPeriod(dow)
  const filteredHour = filterByPeriod(hour)
  const filteredArtists = filterByPeriod(topArtists)
  const filteredTracks = filterByPeriod(topTracks)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-spotify-dark via-gray-900 to-black text-white">
        <Header
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          metric={metric}
          setMetric={setMetric}
          availableMonths={[]}
        />
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-spotify-dark via-gray-900 to-black text-white">
        <Header
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
          metric={metric}
          setMetric={setMetric}
          availableMonths={[]}
        />
        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2 text-red-400">Error Loading Data</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <div className="text-sm text-gray-400">
              <p className="mb-2">Make sure you&apos;ve run the data pipeline:</p>
              <code className="bg-black/50 px-3 py-1 rounded">./scripts/run_pipeline.sh</code>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-dark via-gray-900 to-black text-white">
      <Header
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        metric={metric}
        setMetric={setMetric}
        availableMonths={availableMonths}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {summary && (
          <div className="animate-fade-in">
            <KPICards 
              summary={summary}
              selectedPeriod={selectedPeriod}
              monthly={filteredMonthly}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6 mt-8">
          <div className="animate-fade-in animation-delay-100">
            <MonthlyChart data={filteredMonthly} metric={metric} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-fade-in animation-delay-200">
              <DayOfWeekChart data={filteredDow} metric={metric} />
            </div>
            <div className="animate-fade-in animation-delay-300">
              <HourChart data={filteredHour} metric={metric} />
            </div>
          </div>
          
          <div className="animate-fade-in animation-delay-400">
            <ArtistEvolutionChart data={artistEvolution} topN={3} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="animate-fade-in animation-delay-500">
              <TopArtists data={filteredArtists} metric={metric} limit={10} />
            </div>
            <div className="animate-fade-in animation-delay-600">
              <TopTracks data={filteredTracks} metric={metric} limit={10} />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
