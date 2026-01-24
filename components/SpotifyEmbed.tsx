'use client'

import { useEffect, useRef, useState } from 'react'

interface SpotifyEmbedProps {
  initialUri?: string
  onControllerReady?: (controller: any) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: any) => void
    SpotifyIframeApi?: any
  }
}

export default function SpotifyEmbed({ initialUri, onControllerReady }: SpotifyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<any>(null)
  const isInitialized = useRef(false)
  const isInitializing = useRef(false)
  const initialUriRef = useRef(initialUri)
  const onReadyRef = useRef(onControllerReady)
  const [isLoading, setIsLoading] = useState(true)
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update the callback ref when it changes
  useEffect(() => {
    onReadyRef.current = onControllerReady
  }, [onControllerReady])

  // Keep initialUriRef in sync with prop changes
  useEffect(() => {
    initialUriRef.current = initialUri
  }, [initialUri])

  // Main initialization effect
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    const initController = (IFrameAPI: any) => {
      // Check if already initialized/initializing or component unmounted
      if (isInitialized.current || isInitializing.current || !mounted || !containerRef.current) {
        return
      }

      // Verify API is available
      if (!IFrameAPI || typeof IFrameAPI.createController !== 'function') {
        console.error('[SpotifyEmbed] Invalid Spotify IFrame API')
        setError('Spotify player API not available')
        setIsLoading(false)
        return
      }

      const uri = initialUriRef.current || 'spotify:track:5gRCBF8BbbQA4M7wRFjqxg' // Sour Candy by Melt
      console.log('[SpotifyEmbed] Initializing controller with URI:', uri)
      isInitializing.current = true

      const options = {
        uri,
        height: 152,
      }

      try {
        IFrameAPI.createController(
          containerRef.current,
          options,
          (controller: any) => {
            if (!mounted) {
              console.log('[SpotifyEmbed] Component unmounted, destroying controller')
              controller?.destroy?.()
              return
            }

            console.log('[SpotifyEmbed] Controller created successfully')
            controllerRef.current = controller
            isInitialized.current = true
            setIsLoading(false)
            setError(null)
            isInitializing.current = false

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
        console.error('[SpotifyEmbed] Error creating Spotify controller:', err)
        setError('Failed to load Spotify player')
        setIsLoading(false)
        isInitialized.current = false
        isInitializing.current = false
      }
    }

    // Poll for API availability with retries
    let retryCount = 0
    const maxRetries = 50 // 50 * 200ms = 10 seconds total
    
    const checkAndInit = () => {
      // Stop polling if component unmounted or already initialized/initializing
      if (!mounted || isInitialized.current || isInitializing.current) {
        return
      }

      // Also check if container ref is ready
      if (!containerRef.current) {
        retryCount++
        if (retryCount < maxRetries) {
          if (retryCount % 10 === 0) {
            console.log(`[SpotifyEmbed] Waiting for container ref (attempt ${retryCount}/${maxRetries})`)
          }
          timeoutId = setTimeout(checkAndInit, 200)
        } else {
          console.error('[SpotifyEmbed] Container ref not available after max retries')
          setError('Player container not ready')
          setIsLoading(false)
        }
        return
      }

      const api = (window as any).SpotifyIframeApi
      if (api) {
        console.log('[SpotifyEmbed] Spotify API found in global, initializing controller')
        initController(api)
      } else {
        retryCount++
        if (retryCount < maxRetries) {
          if (retryCount % 10 === 0) {
            console.log(`[SpotifyEmbed] Waiting for Spotify API (attempt ${retryCount}/${maxRetries})`)
          }
          timeoutId = setTimeout(checkAndInit, 200)
        } else {
          console.error('[SpotifyEmbed] Spotify API not available after max retries')
          console.error('[SpotifyEmbed] window.SpotifyIframeApi:', window.SpotifyIframeApi)
          console.error('[SpotifyEmbed] window.onSpotifyIframeApiReady:', window.onSpotifyIframeApiReady)
          setError('Spotify player failed to load')
          setIsLoading(false)
        }
      }
    }

    // Set up callback as fallback (for first load)
    const existingCallback = window.onSpotifyIframeApiReady
    window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
      console.log('[SpotifyEmbed] onSpotifyIframeApiReady callback fired')
      // Store API globally so it persists across component remounts
      window.SpotifyIframeApi = IFrameAPI
      
      if (mounted && !isInitialized.current && !isInitializing.current) {
        initController(IFrameAPI)
      }
      // Call existing callback if there was one
      if (existingCallback && typeof existingCallback === 'function') {
        existingCallback(IFrameAPI)
      }
    }
    
    // Small delay to ensure DOM is ready, then start checking
    console.log('[SpotifyEmbed] Scheduling initialization check')
    timeoutId = setTimeout(() => {
      timeoutId = null
      checkAndInit()
    }, 100)

    return () => {
      console.log('[SpotifyEmbed] Cleanup: unmounting component')
      mounted = false

      // Clear timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }

      // Destroy controller BEFORE resetting flags
      if (controllerRef.current?.destroy) {
        try {
          console.log('[SpotifyEmbed] Cleanup: destroying controller')
          controllerRef.current.destroy()
        } catch (error) {
          console.error('[SpotifyEmbed] Error destroying controller:', error)
        }
      }

      // Clear the container DOM to ensure iframe is removed
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }

      // Reset all refs and state
      controllerRef.current = null
      isInitialized.current = false
      isInitializing.current = false

      // Reset loading state for next mount
      setIsLoading(true)
      setError(null)
      setIsChanging(false)

      // Don't clear window.onSpotifyIframeApiReady - let it persist for reinitialization
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

