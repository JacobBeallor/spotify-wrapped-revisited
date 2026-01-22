'use client'

import { useEffect, useRef, useState } from 'react'

interface SpotifyEmbedProps {
  initialUri?: string
  onControllerReady?: (controller: any) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: any) => void
  }
}

export default function SpotifyEmbed({ initialUri, onControllerReady }: SpotifyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<any>(null)
  const isInitialized = useRef(false)
  const initialUriRef = useRef(initialUri)
  const onReadyRef = useRef(onControllerReady)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Update the callback ref when it changes
  useEffect(() => {
    onReadyRef.current = onControllerReady
  }, [onControllerReady])

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized.current) return

    const initController = (IFrameAPI: any) => {
      if (!containerRef.current || isInitialized.current) return

      const uri = initialUriRef.current || 'spotify:track:6rqhFgbbKwnb9MLmUQDhG6'
      console.log('Initializing Spotify embed with URI:', uri)
      isInitialized.current = true

      const options = {
        uri,
        height: 152,
      }

      try {
        IFrameAPI.createController(
          containerRef.current,
          options,
          (controller: any) => {
            console.log('Spotify controller ready:', controller)
            controllerRef.current = controller
            setIsLoading(false)
            onReadyRef.current?.(controller)
          }
        )
      } catch (err) {
        console.error('Error creating Spotify controller:', err)
        setError('Failed to load Spotify player')
        setIsLoading(false)
      }
    }

    // Retry checking for API with a small delay
    const checkAndInit = () => {
      if ((window as any).SpotifyIframeApi) {
        console.log('Spotify API found, initializing...')
        initController((window as any).SpotifyIframeApi)
      } else {
        console.log('Waiting for Spotify API to load...')
        // Set up callback for when API loads
        window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
          console.log('Spotify API ready callback triggered')
          initController(IFrameAPI)
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(checkAndInit, 100)

    return () => {
      clearTimeout(timeout)
      // Cleanup
      if (controllerRef.current?.destroy) {
        try {
          controllerRef.current.destroy()
        } catch (error) {
          console.error('Error destroying controller:', error)
        }
      }
    }
  }, []) // Empty deps - only run once on mount

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
      {/* <h2 className="text-xl font-bold mb-4">Now Playing</h2> */}
      {isLoading && !error && (
        <div className="h-[152px] flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green mx-auto mb-2"></div>
            <p>Loading Spotify player...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="h-[152px] flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p>{error}</p>
            <p className="text-sm mt-2">Check console for details</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`rounded-xl overflow-hidden ${isLoading || error ? 'hidden' : ''}`}
      />
    </div>
  )
}

