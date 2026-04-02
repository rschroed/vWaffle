import { useEffect, useState } from 'react'

const getMatches = (query: string) =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia(query).matches

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => getMatches(query))

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    ) {
      return
    }

    const mediaQueryList = window.matchMedia(query)
    const update = () => {
      setMatches(mediaQueryList.matches)
    }

    update()
    mediaQueryList.addEventListener('change', update)

    return () => {
      mediaQueryList.removeEventListener('change', update)
    }
  }, [query])

  return matches
}
