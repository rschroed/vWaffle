import { useEffect, useMemo, useState } from 'react'
import { type SendWaffleInput, type Waffle } from './domain/waffles'
import { HomePage } from './features/home/HomePage'
import { createMockWaffleRepository, type WaffleRepository } from './lib/waffleRepository'

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
    () => repository ?? createMockWaffleRepository(),
    [repository]
  )
  const [waffles, setWaffles] = useState<Waffle[]>([])

  useEffect(() => {
    const load = async () => {
      await repo.seedDemoData?.()
      const nextWaffles = await repo.listWaffles()
      setWaffles(nextWaffles)
    }

    void load()
  }, [repo])

  const handleSend = async (input: SendWaffleInput) => {
    await repo.sendWaffle(input)
    const nextWaffles = await repo.listWaffles()
    setWaffles(nextWaffles)
  }

  return (
    <HomePage
      figmaFileUrl={DEFAULT_FIGMA_FILE_URL}
      onSend={handleSend}
      sentCount={waffles.length}
      tagline={DEFAULT_TAGLINE}
      waffles={waffles}
    />
  )
}
