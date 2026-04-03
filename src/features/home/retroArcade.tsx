import { AnimatePresence, LazyMotion, domAnimation, m } from 'motion/react'

type ArcadeCelebrationBurstProps = {
  pulseKey?: number
  shouldReduceMotion?: boolean
}

type ArcadeCountTickerProps = {
  count: number
  pulseKey?: number
  shouldReduceMotion?: boolean
}

const BURST_PARTICLES = [
  { x: -72, y: -28, rotate: -24, scale: 0.9 },
  { x: 58, y: -46, rotate: 18, scale: 1.05 },
  { x: 74, y: 4, rotate: 32, scale: 0.8 },
  { x: -54, y: 42, rotate: -28, scale: 1.1 },
  { x: 0, y: -68, rotate: 0, scale: 0.95 },
  { x: 14, y: 62, rotate: 20, scale: 0.78 },
]

const getCheerLabel = (count: number) =>
  `${count} ${count === 1 ? 'cheer' : 'cheers'}`

export function ArcadeCelebrationBurst({
  pulseKey,
  shouldReduceMotion = false,
}: ArcadeCelebrationBurstProps) {
  if (!pulseKey || shouldReduceMotion) {
    return null
  }

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        <m.div
          aria-hidden="true"
          className="arcade-burst"
          data-arcade-burst="active"
          initial={{ opacity: 1 }}
          key={pulseKey}
        >
          <m.span
            className="arcade-burst-core"
            initial={{ opacity: 0.9, scale: 0.25 }}
            animate={{ opacity: 0, scale: 2.3 }}
            transition={{ duration: 0.52, ease: 'easeOut' }}
          />
          <m.span
            className="arcade-burst-ring"
            initial={{ opacity: 0.7, scale: 0.3 }}
            animate={{ opacity: 0, scale: 1.9 }}
            transition={{ duration: 0.56, ease: 'easeOut' }}
          />

          {BURST_PARTICLES.map((particle, index) => (
            <m.span
              className="arcade-burst-spark"
              initial={{ opacity: 0.95, scale: 0.2, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                rotate: particle.rotate,
                scale: particle.scale,
                x: particle.x,
                y: particle.y,
              }}
              key={`${pulseKey}-${index}`}
              transition={{
                delay: index * 0.02,
                duration: 0.44,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
            />
          ))}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  )
}

export function ArcadeCountTicker({
  count,
  pulseKey,
  shouldReduceMotion = false,
}: ArcadeCountTickerProps) {
  const label = getCheerLabel(count)
  const isAnimated = Boolean(pulseKey) && !shouldReduceMotion

  return (
    <span
      className="arcade-count-shell"
      data-arcade-count={pulseKey ? 'active' : 'idle'}
    >
      <AnimatePresence initial={false} mode="wait">
        {isAnimated ? (
          <m.span
            className="arcade-count-value"
            initial={{ opacity: 0, y: 18, scale: 0.76 }}
            animate={{ opacity: 1, y: 0, scale: [0.76, 1.12, 1] }}
            exit={{ opacity: 0, y: -14, scale: 0.82 }}
            key={`${count}-${pulseKey}`}
            transition={{
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          >
            {label}
          </m.span>
        ) : (
          <span className="arcade-count-value" key={count}>
            {label}
          </span>
        )}
      </AnimatePresence>
    </span>
  )
}
