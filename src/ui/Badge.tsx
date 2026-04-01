import type { ReactNode } from 'react'
import { cn } from './cn'

type BadgeProps = {
  children: ReactNode
  className?: string
  tone?: 'default' | 'muted'
}

export function Badge({
  children,
  className,
  tone = 'default',
}: BadgeProps) {
  return <span className={cn('ui-badge', `ui-badge--${tone}`, className)}>{children}</span>
}
