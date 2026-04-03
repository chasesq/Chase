import { useEffect } from 'react'
import { useGlobalLoading } from '@/lib/global-loading-context'

interface UseDataLoaderOptions {
  key: string
  delay?: number
  onComplete?: () => void
}

/**
 * Hook to manage global loading state for data fetching
 * Automatically starts and stops global loading spinner
 */
export function useDataLoader({
  key,
  delay = 300,
  onComplete,
}: UseDataLoaderOptions) {
  const { startLoading, stopLoading } = useGlobalLoading()

  const setLoading = (isLoading: boolean) => {
    if (isLoading) {
      startLoading(key)
    } else {
      stopLoading(key)
      onComplete?.()
    }
  }

  return { setLoading, startLoading: () => startLoading(key), stopLoading: () => stopLoading(key) }
}

/**
 * Hook to wait for multiple data sources to load before rendering
 */
export function useWaitForData(
  dataLoaded: Record<string, boolean>,
  key?: string
) {
  const { startLoading, stopLoading } = useGlobalLoading()
  const loadingKey = key || 'multi-data'

  useEffect(() => {
    const allLoaded = Object.values(dataLoaded).every((loaded) => loaded)

    if (!allLoaded) {
      startLoading(loadingKey)
    } else {
      stopLoading(loadingKey)
    }

    return () => {
      stopLoading(loadingKey)
    }
  }, [dataLoaded, startLoading, stopLoading, loadingKey])

  const allLoaded = Object.values(dataLoaded).every((loaded) => loaded)
  return allLoaded
}
