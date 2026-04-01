import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

type PanelProps = {
  as?: 'article' | 'div' | 'section'
  children: ReactNode
  className?: string
  tone?: 'default' | 'subtle'
} & HTMLAttributes<HTMLElement>

export function Panel({
  as = 'div',
  children,
  className,
  tone = 'default',
  ...props
}: PanelProps) {
  const Component = as

  return (
    <Component className={cn('ui-panel', `ui-panel--${tone}`, className)} {...props}>
      {children}
    </Component>
  )
}
