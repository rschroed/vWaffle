import { type SendWaffleInput, type Waffle } from '../../domain/waffles'
import { HeroSection } from './HeroSection'
import { WaffleComposerSection } from './WaffleComposerSection'
import { WaffleFeedSection } from './WaffleFeedSection'

type HomePageProps = {
  figmaFileUrl?: string
  onSend: (input: SendWaffleInput) => Promise<void>
  sentCount: number
  tagline: string
  waffles: Waffle[]
}

export function HomePage({
  figmaFileUrl,
  onSend,
  sentCount,
  tagline,
  waffles,
}: HomePageProps) {
  return (
    <main className="page-shell">
      <HeroSection
        figmaFileUrl={figmaFileUrl}
        sentCount={sentCount}
        tagline={tagline}
      />

      <section className="home-grid">
        <WaffleComposerSection onSend={onSend} />
        <WaffleFeedSection waffles={waffles} />
      </section>
    </main>
  )
}
