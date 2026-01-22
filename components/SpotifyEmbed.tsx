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
  const [isChanging, setIsChanging] = useState(false)
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

      const uri = initialUriRef.current || 'spotify:track:5gRCBF8BbbQA4M7wRFjqxg' // Sour Candy by Melt
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
            controllerRef.current = controller
            setIsLoading(false)

            // Listen for playback updates to detect when new content loads
            controller.addListener('playback_update', (e: any) => {
              // When we get playback update, content has loaded
              setIsChanging(false)
            })

            // Also listen for ready event
            controller.addListener('ready', () => {
              setIsChanging(false)
            })

            // Wrap loadUri to show loading state
            const originalLoadUri = controller.loadUri.bind(controller)
            controller.loadUri = (uri: string) => {
              setIsChanging(true)
              originalLoadUri(uri)
              // Fallback timeout in case events don't fire
              setTimeout(() => setIsChanging(false), 1500)
            }

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
        initController((window as any).SpotifyIframeApi)
      } else {
        // Set up callback for when API loads
        window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
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

      {/* Initial loading state */}
      {isLoading && !error && (
        <div className="h-[152px] flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green mx-auto mb-2"></div>
            <p>Loading Spotify player...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="h-[152px] flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p>{error}</p>
            <p className="text-sm mt-2">Check console for details</p>
          </div>
        </div>
      )}

      {/* Player container with loading overlay - always rendered but hidden when loading */}
      <div className={`relative ${isLoading || error ? 'hidden' : ''}`}>
        {/* Loading overlay during track changes */}
        <div
          className={`absolute inset-0 bg-gray-900/70 backdrop-blur-[2px] rounded-xl z-10 flex items-center justify-center transition-opacity duration-200 pointer-events-none ${isChanging ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green"></div>
        </div>
        <div
          ref={containerRef}
          className={`rounded-xl overflow-hidden transition-opacity duration-200 ${isChanging ? 'opacity-50' : 'opacity-100'
            }`}
        />
      </div>
    </div>
  )
}

