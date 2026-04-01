import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import { cn } from './cn'

type StackProps = {
  as?: 'div' | 'section'
  children: ReactNode
  className?: string
  gap?: 'sm' | 'md' | 'lg'
} & HTMLAttributes<HTMLElement>

export function Stack({
  as = 'div',
  children,
  className,
  gap = 'md',
  style,
  ...props
}: StackProps) {
  const Component = as
  const stackStyle = {
    ...style,
    ['--stack-gap' as string]: `var(--space-${gap})`,
  } as CSSProperties

  return (
    <Component className={cn('ui-stack', className)} style={stackStyle} {...props}>
      {children}
    </Component>
  )
}
