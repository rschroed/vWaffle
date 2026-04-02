import { useEffect, useMemo, useState } from 'react'
import { type SendWaffleInput, type Waffle } from './domain/waffles'
import { HomePage } from './features/home/HomePage'
import {
  createDefaultWaffleRepository,
  type WaffleRepository,
} from './lib/waffleRepository'

const DEFAULT_TAGLINE =
  import.meta.env.VITE_APP_TAGLINE ??
  'Lightweight recognition for small internal teams.'

const DEFAULT_FIGMA_FILE_URL =
  import.meta.env.VITE_FIGMA_FILE_URL ||
  'https://www.figma.com/design/AwFfD4RhxBCjE8OwR2htej/vWaffle-Demo?node-id=5-3'

type AppProps = {
  repository?: WaffleRepository
}

export default function App({ repository }: AppProps) {
  const repo = useMemo(
    () => repository ?? createDefaultWaffleRepository(),
    [repository]
  )
  const [waffles, setWaffles] = useState<Waffle[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        await repo.seedDemoData?.()
        const nextWaffles = await repo.listWaffles()
        setWaffles(nextWaffles)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load the team feed right now.'
        setErrorMessage(message)
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [repo])

  const handleSend = async (input: SendWaffleInput) => {
    setErrorMessage(null)

    try {
      await repo.sendWaffle(input)
      const nextWaffles = await repo.listWaffles()
      setWaffles(nextWaffles)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to send a waffle right now.'
      setErrorMessage(message)
      throw error
    }
  }

  return (
    <HomePage
      errorMessage={errorMessage}
      figmaFileUrl={DEFAULT_FIGMA_FILE_URL}
      isLoading={isLoading}
      onSend={handleSend}
      tagline={DEFAULT_TAGLINE}
      waffles={waffles}
    />
  )
}
