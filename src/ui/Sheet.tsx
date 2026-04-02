import { useEffect, type ReactNode } from 'react'
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

  return (
    <div
      aria-hidden={!isOpen}
      className={cn('ui-sheet', isOpen && 'ui-sheet--open', className)}
    >
      <button
        aria-hidden="true"
        className="ui-sheet-backdrop"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-label={ariaLabel}
        aria-modal="true"
        className="ui-sheet-dialog"
        role="dialog"
      >
        {children}
      </div>
    </div>
  )
}
