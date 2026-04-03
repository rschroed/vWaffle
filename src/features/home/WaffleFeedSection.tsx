import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from 'motion/react'
import { useState } from 'react'
import { type Waffle } from '../../domain/waffles'
import { formatFriendlyTimestamp } from '../../lib/time'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Panel'
import { SectionHeader } from '../../ui/SectionHeader'
import { Stack } from '../../ui/Stack'
import { getWaffleFlavorArtwork } from './waffleFlavorArtwork'

type WaffleFeedSectionProps = {
  isLoading: boolean
  onCelebrate: (waffleId: string) => Promise<void>
  onOpenComposer: () => void
  waffles: Waffle[]
}

export function WaffleFeedSection({
  isLoading,
  onCelebrate,
  onOpenComposer,
  waffles,
}: WaffleFeedSectionProps) {
  const shouldReduceMotion = useReducedMotion()
  const [celebratingWaffleId, setCelebratingWaffleId] = useState<string | null>(null)

  const handleCelebrate = async (waffleId: string) => {
    setCelebratingWaffleId(waffleId)

    try {
      await onCelebrate(waffleId)
    } finally {
      setCelebratingWaffleId((currentId) =>
        currentId === waffleId ? null : currentId
      )
    }
  }

  const formatCelebrationCount = (count: number) =>
    `${count} ${count === 1 ? 'cheer' : 'cheers'}`

  return (
    <section>
      <Panel as="section" className="feature-panel">
        <Stack gap="lg">
          <SectionHeader
            actions={
              <Button className="feed-mobile-trigger" onClick={onOpenComposer}>
                New waffle
              </Button>
            }
            title="VVAFFLE FEED"
            description="A lightweight stream of appreciation across the team, visible to everyone."
          />

          <LazyMotion features={domAnimation}>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <m.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  key="feed-loading"
                >
                  <Panel className="feed-state" tone="subtle">
                    Loading the shared feed...
                  </Panel>
                </m.div>
              ) : waffles.length === 0 ? (
                <m.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  key="feed-empty"
                >
                  <Panel className="feed-state" tone="subtle">
                    No waffles yet. Send the first one to start the feed.
                  </Panel>
                </m.div>
              ) : (
                <m.div className="feed-list" key="feed-list" layout role="list">
                  {waffles.map((waffle, index) => {
                    const artwork = getWaffleFlavorArtwork(waffle.flavor)

                    return (
                      <m.div
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        initial={
                          shouldReduceMotion
                            ? false
                            : { opacity: 0, scale: 0.985, y: 12 }
                        }
                        key={waffle.id}
                        layout
                        role="listitem"
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : {
                                delay: Math.min(index * 0.03, 0.15),
                                duration: 0.24,
                                ease: [0.22, 1, 0.36, 1],
                              }
                        }
                      >
                        <Panel as="article" className="feed-card" tone="subtle">
                          <div className="feed-card-artwork">
                            <img
                              alt={artwork.alt}
                              className="feed-card-artwork-image"
                              decoding="async"
                              loading="lazy"
                              src={artwork.src}
                            />
                          </div>
                          <div className="feed-card-top">
                            <Badge>{waffle.flavor}</Badge>
                            <time className="feed-card-time" dateTime={waffle.createdAt}>
                              {formatFriendlyTimestamp(waffle.createdAt)}
                            </time>
                          </div>
                          <Stack gap="sm">
                            <h3 className="feed-card-title">
                              {waffle.sender.name}
                              {' '}
                              sent a waffle to
                              {' '}
                              {waffle.recipient.name}
                            </h3>
                            <p className="feed-card-message">{waffle.message}</p>
                          </Stack>
                          <div className="feed-card-footer">
                            <button
                              className="feed-card-celebrate-button"
                              disabled={
                                waffle.viewerHasCelebrated ||
                                celebratingWaffleId === waffle.id
                              }
                              onClick={() => void handleCelebrate(waffle.id)}
                              type="button"
                            >
                              {celebratingWaffleId === waffle.id
                                ? 'Celebrating...'
                                : waffle.viewerHasCelebrated
                                  ? 'Celebrated'
                                  : 'Celebrate'}
                            </button>
                            <p className="feed-card-celebration-count" aria-live="polite">
                              {formatCelebrationCount(waffle.celebrationCount)}
                            </p>
                          </div>
                        </Panel>
                      </m.div>
                    )
                  })}
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>
        </Stack>
      </Panel>
    </section>
  )
}
