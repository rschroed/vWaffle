import { useEffect, type ReactNode } from 'react'
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useReducedMotion,
} from 'motion/react'
import { cn } from './cn'

type SheetProps = {
  ariaLabel: string
  children: ReactNode
  className?: string
  isOpen: boolean
  onClose: () => void
}

export function Sheet({
  ariaLabel,
  children,
  className,
  isOpen,
  onClose,
}: SheetProps) {
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return
    }

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const backdropAnimation = shouldReduceMotion
    ? { opacity: 1, transition: { duration: 0 } }
    : {
        opacity: 1,
        transition: { duration: 0.18, ease: 'easeOut' as const },
      }
  const dialogAnimation = shouldReduceMotion
    ? { opacity: 1, y: 0, transition: { duration: 0 } }
    : {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.22,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      }

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        {isOpen ? (
          <m.div
            className={cn('ui-sheet', className)}
            exit={{ opacity: 1, transition: { duration: 0 } }}
          >
            <m.button
              aria-hidden="true"
              animate={backdropAnimation}
              className="ui-sheet-backdrop"
              exit={{
                opacity: 0,
                transition: { duration: 0.14, ease: 'easeIn' as const },
              }}
              initial={{ opacity: 0 }}
              onClick={onClose}
              tabIndex={-1}
              type="button"
            />
            <m.div
              animate={dialogAnimation}
              aria-label={ariaLabel}
              aria-modal="true"
              className="ui-sheet-dialog"
              exit={
                shouldReduceMotion
                  ? { opacity: 1, y: 0, transition: { duration: 0 } }
                  : {
                      opacity: 0,
                      y: 24,
                      transition: { duration: 0.16, ease: 'easeIn' as const },
                    }
              }
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              role="dialog"
            >
              {children}
            </m.div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  )
}
