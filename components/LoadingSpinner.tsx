export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-spotify-green rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="text-gray-400 text-lg">Loading your music data...</p>
      <p className="text-gray-600 text-sm mt-2">This might take a moment</p>
    </div>
  )
}

