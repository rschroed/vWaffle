import { useEffect, useMemo, useState } from 'react'
import { Hero } from './components/Hero'
import { WaffleComposer } from './components/WaffleComposer'
import { WaffleFeed } from './components/WaffleFeed'
import { type SendWaffleInput, type Waffle } from './domain/waffles'
import { createMockWaffleRepository, type WaffleRepository } from './lib/waffleRepository'

const DEFAULT_TAGLINE =
  import.meta.env.VITE_APP_TAGLINE ?? 'Send syrupy kudos across the team.'

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
    <main className="app-shell">
      <div className="background-orb orb-left" />
      <div className="background-orb orb-right" />

      <Hero
        figmaFileUrl={DEFAULT_FIGMA_FILE_URL}
        sentCount={waffles.length}
        tagline={DEFAULT_TAGLINE}
      />

      <section className="content-grid">
        <WaffleComposer onSend={handleSend} />
        <WaffleFeed waffles={waffles} />
      </section>
    </main>
  )
}
