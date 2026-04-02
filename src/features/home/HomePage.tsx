import { useState } from 'react'
import { type SendWaffleInput, type Waffle } from '../../domain/waffles'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { Sheet } from '../../ui/Sheet'
import { HeroSection } from './HeroSection'
import { WaffleComposerSection } from './WaffleComposerSection'
import { WaffleFeedSection } from './WaffleFeedSection'

const MOBILE_LAYOUT_QUERY = '(max-width: 640px)'

type HomePageProps = {
  errorMessage: string | null
  figmaFileUrl?: string
  isLoading: boolean
  onSend: (input: SendWaffleInput) => Promise<void>
  tagline: string
  waffles: Waffle[]
}

export function HomePage({
  errorMessage,
  figmaFileUrl,
  isLoading,
  onSend,
  tagline,
  waffles,
}: HomePageProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const isMobileLayout = useMediaQuery(MOBILE_LAYOUT_QUERY)

  const handleOpenComposer = () => {
    if (isMobileLayout) {
      setIsComposerOpen(true)
      return
    }

    document
      .getElementById('composer')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCloseComposer = () => {
    setIsComposerOpen(false)
  }

  const handleSendFromComposer = async (input: SendWaffleInput) => {
    await onSend(input)
    handleCloseComposer()
  }

  return (
    <main className="page-shell">
      {errorMessage ? (
        <section className="status-banner" role="alert">
          <p className="status-banner-title">Shared feed unavailable</p>
          <p className="status-banner-copy">{errorMessage}</p>
        </section>
      ) : null}

      <section className="home-layout">
        <div className="home-sidebar">
          <HeroSection
            figmaFileUrl={figmaFileUrl}
            onOpenComposer={handleOpenComposer}
            tagline={tagline}
          />

          {!isMobileLayout ? (
            <div className="composer-shell">
              <WaffleComposerSection onSend={handleSendFromComposer} />
            </div>
          ) : null}
        </div>

        <div className="home-feed-column">
          <WaffleFeedSection
            isLoading={isLoading}
            onOpenComposer={handleOpenComposer}
            waffles={waffles}
          />
        </div>
      </section>

      {isMobileLayout ? (
        <Sheet
          ariaLabel="Send a waffle"
          isOpen={isComposerOpen}
          onClose={handleCloseComposer}
        >
          <WaffleComposerSection
            onDismiss={handleCloseComposer}
            onSend={handleSendFromComposer}
          />
        </Sheet>
      ) : null}
    </main>
  )
}
