import { type SendWaffleInput, type Waffle } from '../../domain/waffles'
import { HeroSection } from './HeroSection'
import { WaffleComposerSection } from './WaffleComposerSection'
import { WaffleFeedSection } from './WaffleFeedSection'

type HomePageProps = {
  errorMessage: string | null
  figmaFileUrl?: string
  isLoading: boolean
  onSend: (input: SendWaffleInput) => Promise<void>
  sentCount: number
  tagline: string
  waffles: Waffle[]
}

export function HomePage({
  errorMessage,
  figmaFileUrl,
  isLoading,
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

      {errorMessage ? (
        <section className="status-banner" role="alert">
          <p className="status-banner-title">Shared feed unavailable</p>
          <p className="status-banner-copy">{errorMessage}</p>
        </section>
      ) : null}

      <section className="home-grid">
        <WaffleComposerSection onSend={onSend} />
        <WaffleFeedSection isLoading={isLoading} waffles={waffles} />
      </section>
    </main>
  )
}
