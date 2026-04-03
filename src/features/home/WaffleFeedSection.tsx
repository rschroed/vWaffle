import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
} from 'motion/react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { type Waffle } from '../../domain/waffles'
import { formatFriendlyTimestamp } from '../../lib/time'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { Panel } from '../../ui/Panel'
import { SectionHeader } from '../../ui/SectionHeader'
import { Stack } from '../../ui/Stack'
import {
  ArcadeCelebrationBurst,
  ArcadeCountTicker,
} from './retroArcade'
import { getWaffleFlavorArtwork } from './waffleFlavorArtwork'

type WaffleFeedSectionProps = {
  highlightedWaffleId: string | null
  isLoading: boolean
  onCelebrate: (waffleId: string) => Promise<void>
  onOpenComposer: () => void
  shouldReduceMotion?: boolean
  waffles: Waffle[]
}

type PulseMap = Record<string, number>

export function WaffleFeedSection({
  highlightedWaffleId,
  isLoading,
  onCelebrate,
  onOpenComposer,
  shouldReduceMotion = false,
  waffles,
}: WaffleFeedSectionProps) {
  const [celebratingWaffleId, setCelebratingWaffleId] = useState<string | null>(
    null
  )
  const [pressedCelebrateId, setPressedCelebrateId] = useState<string | null>(
    null
  )
  const [arrivalPulseKeys, setArrivalPulseKeys] = useState<PulseMap>({})
  const [celebrationPulseKeys, setCelebrationPulseKeys] = useState<PulseMap>({})
  const [countPulseKeys, setCountPulseKeys] = useState<PulseMap>({})
  const previousCountsRef = useRef<Record<string, number>>({})
  const hasRecordedCountsRef = useRef(false)
  const timeoutIdsRef = useRef<number[]>([])

  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
    }
  }, [])

  const queueTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current = timeoutIdsRef.current.filter(
        (activeTimeoutId) => activeTimeoutId !== timeoutId
      )
      callback()
    }, delay)

    timeoutIdsRef.current.push(timeoutId)
  }, [])

  const activatePulse = useCallback((
    setter: Dispatch<SetStateAction<PulseMap>>,
    pulseId: string,
    duration: number
  ) => {
    const pulseKey = Date.now() + Math.random()

    setter((current) => ({ ...current, [pulseId]: pulseKey }))
    queueTimeout(() => {
      setter((current) => {
        if (current[pulseId] !== pulseKey) {
          return current
        }

        const next = { ...current }

        delete next[pulseId]

        return next
      })
    }, duration)
  }, [queueTimeout])

  useEffect(() => {
    if (!highlightedWaffleId) {
      return
    }

    activatePulse(
      setArrivalPulseKeys,
      highlightedWaffleId,
      shouldReduceMotion ? 540 : 1100
    )
  }, [activatePulse, highlightedWaffleId, shouldReduceMotion])

  useEffect(() => {
    const nextCounts = Object.fromEntries(
      waffles.map((waffle) => [waffle.id, waffle.celebrationCount])
    ) as Record<string, number>

    if (!hasRecordedCountsRef.current) {
      previousCountsRef.current = nextCounts
      hasRecordedCountsRef.current = true
      return
    }

    waffles.forEach((waffle) => {
      const previousCount = previousCountsRef.current[waffle.id]

      if (
        typeof previousCount === 'number' &&
        waffle.celebrationCount > previousCount
      ) {
        activatePulse(
          setCountPulseKeys,
          waffle.id,
          shouldReduceMotion ? 520 : 900
        )
      }
    })

    previousCountsRef.current = nextCounts
  }, [activatePulse, shouldReduceMotion, waffles])

  const handleCelebrate = async (waffleId: string) => {
    setPressedCelebrateId(waffleId)
    queueTimeout(() => {
      setPressedCelebrateId((currentId) =>
        currentId === waffleId ? null : currentId
      )
    }, shouldReduceMotion ? 120 : 180)
    setCelebratingWaffleId(waffleId)

    try {
      await onCelebrate(waffleId)
      activatePulse(
        setCelebrationPulseKeys,
        waffleId,
        shouldReduceMotion ? 360 : 780
      )
    } catch {
      // The app-level error banner already reflects the failure state.
    } finally {
      setCelebratingWaffleId((currentId) =>
        currentId === waffleId ? null : currentId
      )
    }
  }

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
                    const isArriving = Boolean(arrivalPulseKeys[waffle.id])
                    const isCelebrating = Boolean(celebrationPulseKeys[waffle.id])
                    const isCountPulsing = Boolean(countPulseKeys[waffle.id])
                    const isCelebratePressed =
                      pressedCelebrateId === waffle.id &&
                      celebratingWaffleId !== waffle.id

                    return (
                      <m.div
                        animate={
                          !shouldReduceMotion && isArriving
                            ? {
                                opacity: 1,
                                scaleY: [0.68, 1.04, 1],
                                scaleX: [0.94, 1.01, 1],
                                y: [-48, 10, 0],
                              }
                            : { opacity: 1, scaleX: 1, scaleY: 1, y: 0 }
                        }
                        initial={
                          shouldReduceMotion
                            ? false
                            : isArriving
                              ? { opacity: 0.18, scaleX: 0.94, scaleY: 0.58, y: -72 }
                              : { opacity: 0, scale: 0.985, y: 12 }
                        }
                        key={waffle.id}
                        layout
                        role="listitem"
                        transition={
                          !shouldReduceMotion && isArriving
                            ? {
                                duration: 0.68,
                                ease: [0.22, 1, 0.36, 1] as const,
                                times: [0, 0.54, 1] as const,
                              }
                            : shouldReduceMotion
                              ? { duration: 0 }
                              : {
                                  delay: Math.min(index * 0.03, 0.15),
                                  duration: 0.24,
                                  ease: [0.22, 1, 0.36, 1] as const,
                                }
                        }
                      >
                        <m.div
                          animate={
                            !shouldReduceMotion && isCelebrating
                              ? {
                                  rotate: [0, -0.9, 0.8, -0.5, 0.28, 0],
                                  scale: [1, 1.012, 0.996, 1.008, 1],
                                  x: [0, -11, 9, -6, 3, 0],
                                }
                              : { rotate: 0, scale: 1, x: 0 }
                          }
                          transition={
                            !shouldReduceMotion && isCelebrating
                              ? {
                                  duration: 0.4,
                                  ease: [0.22, 1, 0.36, 1] as const,
                                  times: [0, 0.18, 0.4, 0.62, 0.82, 1] as const,
                                }
                              : { duration: 0.16 }
                          }
                        >
                          <Panel
                            as="article"
                            className="feed-card"
                            data-arcade-arrival={isArriving ? 'active' : 'idle'}
                            data-arcade-celebration={isCelebrating ? 'active' : 'idle'}
                            tone="subtle"
                          >
                            <ArcadeCelebrationBurst
                              pulseKey={celebrationPulseKeys[waffle.id]}
                              shouldReduceMotion={shouldReduceMotion}
                            />
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
                                data-arcade-press={isCelebratePressed ? 'active' : 'idle'}
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
                                <ArcadeCountTicker
                                  count={waffle.celebrationCount}
                                  pulseKey={
                                    isCountPulsing
                                      ? countPulseKeys[waffle.id]
                                      : undefined
                                  }
                                  shouldReduceMotion={shouldReduceMotion}
                                />
                              </p>
                            </div>
                          </Panel>
                        </m.div>
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
