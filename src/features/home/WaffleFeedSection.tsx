import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from 'motion/react'
import { type Waffle } from '../../domain/waffles'
import { formatFriendlyTimestamp } from '../../lib/time'
import { Badge } from '../../ui/Badge'
import { Button } from '../../ui/Button'
import { Panel } from '../../ui/Panel'
import { SectionHeader } from '../../ui/SectionHeader'
import { Stack } from '../../ui/Stack'

type WaffleFeedSectionProps = {
  isLoading: boolean
  onOpenComposer: () => void
  waffles: Waffle[]
}

export function WaffleFeedSection({
  isLoading,
  onOpenComposer,
  waffles,
}: WaffleFeedSectionProps) {
  const shouldReduceMotion = useReducedMotion()

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
                  {waffles.map((waffle, index) => (
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
                      </Panel>
                    </m.div>
                  ))}
                </m.div>
              )}
            </AnimatePresence>
          </LazyMotion>
        </Stack>
      </Panel>
    </section>
  )
}
