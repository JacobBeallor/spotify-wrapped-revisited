// Data types
export interface SummaryData {
  total_hours: number
  total_plays: number
  unique_tracks: number
  unique_artists: number
  first_played_at: string
  last_played_at: string
}

export interface MonthlyData {
  year_month: string
  year: number
  month: number
  hours: number
  plays: number
  unique_tracks: number
  unique_artists: number
}

export interface DailyData {
  date: string
  hours: number
  plays: number
  unique_tracks: number
  unique_artists: number
}

export interface DowData {
  dow: number
  dow_name: string
  hours: number
  plays: number
}

export interface HourData {
  hour: number
  hours: number
  plays: number
}

export interface TopArtist {
  year_month: string
  artist_name: string
  hours: number
  plays: number
  spotify_artist_id?: string
}

export interface TopTrack {
  year_month: string
  track_name: string
  artist_name: string
  hours: number
  plays: number
  spotify_track_uri?: string
}

export interface ArtistEvolution {
  year_month: string
  artist_name: string
  rank: number
  hours: number
  plays: number
}

export interface DiscoveryRateData {
  year_month: string
  discovery_rate_hours: number
  discovery_rate_plays: number
}

export interface GenreEvolution {
  year_month: string
  genre: string
  hours: number
  plays: number
}

