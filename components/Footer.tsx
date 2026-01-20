import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-spotify-black border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-sm">
              Built with Next.js, Tailwind CSS, and ECharts
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Data sourced from Spotify Extended Streaming History
            </p>
          </div>

          <div className="flex gap-6">
            <a
              href="https://github.com/JacobBeallor/spotify-wrapped-revisited"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-spotify-green transition-colors text-sm"
            >
              GitHub
            </a>
            <Link
              href="https://jacob-beallor.vercel.app/"
              className="text-gray-400 hover:text-spotify-green transition-colors text-sm"
            >
              Portfolio
            </Link>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs text-center">
            <strong>Privacy:</strong> All data is aggregated and anonymized.
            Raw streaming history is never shared or uploaded.
          </p>
        </div>
      </div>
    </footer>
  )
}

